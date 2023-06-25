import Block from "../Block/Block";
import Transaction from "../Transaction/Transaction";
import Wallet from "../Wallet/Wallet";
import CoinbaseTransaction from "../Transaction/CoinbaseTransaction";

import {
  TARGET_MINE_RATE_MS,
  INITIAL_DIFFICULTY,
  BLOCK_SUBSIDY,
} from "../utils/config";
import "reflect-metadata";
import Blockchain from "../Blockchain/Blockchain";

class Mempool {
  difficulty: number;
  pendingTransactions: Transaction[];
  blockSubsidy: number;
  blockchain: Blockchain;

  constructor(blockchain: Blockchain) {
    this.difficulty = INITIAL_DIFFICULTY;
    this.pendingTransactions = [];
    this.blockSubsidy = BLOCK_SUBSIDY;
    this.blockchain = blockchain
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
    return this.getTotalTransactionFees() + this.blockSubsidy;
  }

  addPendingTransactionsToBlock(): Block {
    this.difficulty = this.getNewMiningDifficulty();
    const block = new Block(
      this.pendingTransactions,
      this.difficulty,
      this.blockchain.getLatestBlock().hash,
      this.blockchain.chain.length
    );
    return block;
  }

  getNewMiningDifficulty(): number {
    //More secure would be to use a moving average of the last difference in timestamps of last 10 blocks or so. But requires enough nodes so there are constantly new blocks being mined back to back
    const lastMiningTime = this.blockchain.getLatestBlock().miningDurationMs;

    let difficulty = this.difficulty;
    if (lastMiningTime < TARGET_MINE_RATE_MS) {
      difficulty++;
    } else if (this.difficulty > 1) {
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