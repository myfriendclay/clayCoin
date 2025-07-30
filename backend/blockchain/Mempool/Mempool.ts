import Block from "../Block/Block";
import Transaction from "../Transaction/Transaction";
import Wallet from "../Wallet/Wallet";
import CoinbaseTransaction from "../Transaction/CoinbaseTransaction";
import createError, { isHttpError } from 'http-errors';

import {
  BLOCK_SUBSIDY,
  NUM_OF_BLOCKS_TO_HALF_MINING_REWARD,
} from "../utils/config";
import "reflect-metadata";
import Blockchain from "../Blockchain/Blockchain";
import DatabaseService from "../../database/DatabaseService";

class Mempool {
  pendingTransactions: Transaction[];
  blockchain: Blockchain;
  private dbService: DatabaseService;
  
  constructor(blockchain: Blockchain, dbService?: DatabaseService) {
    this.pendingTransactions = [];
    this.blockchain = blockchain;
    this.dbService = dbService || new DatabaseService();
  }

  async initialize(): Promise<void> {
    await this.dbService.initialize();
    await this.loadPendingTransactions();
  }

  private async loadPendingTransactions(): Promise<void> {
    try {
      const transactions = await this.dbService.getPendingTransactions();
      this.pendingTransactions = transactions;
      console.log(`Loaded ${transactions.length} pending transactions from database`);
    } catch (error) {
      console.error('Failed to load pending transactions:', error);
      throw error;
    }
  }

  private async savePendingTransactions(): Promise<void> {
    try {
      await this.dbService.savePendingTransactions(this.pendingTransactions);
    } catch (error) {
      console.error('Failed to save pending transactions:', error);
      throw error;
    }
  }

  getCurrentBlockSubsidy() {
    const currentNumOfBlocks = this.blockchain.chain.length;
    if (currentNumOfBlocks < NUM_OF_BLOCKS_TO_HALF_MINING_REWARD) {
      return BLOCK_SUBSIDY;
    } else {
      let numOfHalvings =
        currentNumOfBlocks / NUM_OF_BLOCKS_TO_HALF_MINING_REWARD;
      let currentBlockSubsidy = BLOCK_SUBSIDY;
      for (let i = 0; i < numOfHalvings; i++) {
        currentBlockSubsidy /= 2;
      }
      return currentBlockSubsidy;
    }
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transaction to chain");
    }

    if (
      !Wallet.walletHasSufficientFunds(
        transaction.fromAddress,
        transaction,
        this.blockchain.chain,
        this.pendingTransactions
      )
    ) {
      throw new Error(
        "not enough funds for transactions in mempool or this transaction itself"
      );
    }

    if (
      this.pendingTransactions.some(
        (tx) => tx.signature === transaction.signature
      )
    ) {
      throw new Error("Transaction already in mempool");
    }

    this.pendingTransactions.push(transaction);
    await this.savePendingTransactions();
  }

  //Transaction helpers:
  async addCoinbaseTxToMempool(miningRewardAddress: string): Promise<Transaction[]> {
    if (!Wallet.isValidPublicKey(miningRewardAddress)) {
      throw createError(400, 'Invalid mining reward address: Must be a valid public key');
    }
    
    const coinbaseTx = new CoinbaseTransaction(
      miningRewardAddress,
      this.getMiningReward()
    );
    this.pendingTransactions.push(coinbaseTx);
    await this.savePendingTransactions();
    return this.pendingTransactions;
  }

  getTotalTransactionFees(): number {
    return this.pendingTransactions
      .map((tx) => tx.fee)
      .reduce((prev, curr) => prev + curr, 0);
  }

  getMiningReward(): number {
    return this.getTotalTransactionFees() + this.getCurrentBlockSubsidy();
  }

  addPendingTransactionsToBlock(): Block {
    const block = new Block(
      this.pendingTransactions,
      this.getNewMiningDifficulty(),
      this.blockchain.getLatestBlock().hash,
      this.blockchain.chain.length
    );
    return block;
  }

  getNewMiningDifficulty(): number {
    return this.blockchain.getExpectedDifficulty(this.blockchain.chain.length);
  }

  async minePendingTransactions(miningRewardAddress: string): Promise<Block> {
    try {
      await this.addCoinbaseTxToMempool(miningRewardAddress);
      const block = this.addPendingTransactionsToBlock();
      block.mineBlock();
      await this.blockchain.addBlockToChain(block);
      await this.resetMempool();
      return block;
    } catch (error) {
      // Re-throw http-errors as is, wrap other errors as 500
      if (isHttpError(error)) {
        throw error;
      }
      throw createError(500, error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }

  async resetMempool(): Promise<void> {
    this.pendingTransactions = [];
    await this.dbService.clearPendingTransactions();
  }

  async close(): Promise<void> {
    await this.dbService.close();
  }
}

export default Mempool;
