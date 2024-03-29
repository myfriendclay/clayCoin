import Block from "../Block/Block";
import Transaction from "../Transaction/Transaction";
import Wallet from "../Wallet/Wallet";
import CoinbaseTransaction from "../Transaction/CoinbaseTransaction";

import {
  TARGET_MINE_RATE_MS,
  BLOCK_SUBSIDY,
  NUM_OF_BLOCKS_TO_HALF_MINING_REWARD,
} from "../utils/config";
import "reflect-metadata";
import Blockchain from "../Blockchain/Blockchain";

class Mempool {
  pendingTransactions: Transaction[];
  blockchain: Blockchain;
  //need to pick one source of truth for difficulty and blocksubsidy between this and blockchain- prob here
  constructor(blockchain: Blockchain) {
    this.pendingTransactions = [];
    this.blockchain = blockchain;
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

  addTransaction(transaction: Transaction) {
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
  }

  //Transaction helpers:
  addCoinbaseTxToMempool(miningRewardAddress: string): Transaction[] {
    const coinbaseTx = new CoinbaseTransaction(
      miningRewardAddress,
      this.getMiningReward()
    );
    this.pendingTransactions.push(coinbaseTx);
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
    //More secure would be to use a moving average of the last difference in timestamps of last 10 blocks or so. But requires enough nodes so there are constantly new blocks being mined back to back
    const lastMiningTime = this.blockchain.getLatestBlock().miningDurationMs;

    let difficulty = this.blockchain.getLatestBlock().difficulty;
    if (lastMiningTime < TARGET_MINE_RATE_MS) {
      difficulty++;
    } else if (difficulty > 1) {
      difficulty--;
    }
    return difficulty;
  }

  minePendingTransactions(miningRewardAddress: string): Block {
    this.addCoinbaseTxToMempool(miningRewardAddress);
    const block = this.addPendingTransactionsToBlock();
    block.mineBlock();
    this.blockchain.addBlockToChain(block);
    this.resetMempool();
    return block;
  }

  resetMempool() {
    this.pendingTransactions = [];
  }
}

export default Mempool;
