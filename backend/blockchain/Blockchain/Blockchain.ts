import Block from "../Block/Block";
import GenesisBlock from "../Block/GenesisBlock";
import Transaction from "../Transaction/Transaction";
import Wallet from "../Wallet/Wallet";
import CoinbaseTransaction from "../Transaction/CoinbaseTransaction";

import {
  TARGET_MINE_RATE_MS,
  INITIAL_DIFFICULTY,
  BLOCK_SUBSIDY,
} from "../utils/config";
import { Type } from "class-transformer";
import "reflect-metadata";

export default class Blockchain {
  @Type(() => Block, {
    discriminator: {
      property: "__type",
      subTypes: [
        { value: Block, name: "default" },
        { value: GenesisBlock, name: "GenesisBlock" },
      ],
    },
  })
  chain: Block[];
  difficulty: number;
  pendingTransactions: Transaction[];
  blockSubsidy: number;

  constructor() {
    this.chain = [new GenesisBlock()];
    this.difficulty = INITIAL_DIFFICULTY;
    this.pendingTransactions = [];
    this.blockSubsidy = BLOCK_SUBSIDY;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction: Transaction) {
    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transaction to chain");
    }

    if (
      !Wallet.walletHasSufficientFunds(
        transaction.fromAddress,
        transaction,
        this.chain,
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
      this.getLatestBlock().hash,
      this.chain.length
    );
    return block;
  }

  getNewMiningDifficulty(): number {
    //More secure would be to use a moving average of the last difference in timestamps of last 10 blocks or so. But requires enough nodes so there are constantly new blocks being mined back to back
    const lastMiningTime = this.getLatestBlock().miningDurationMs;

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
    this.addBlockToChain(block);
    this.resetMempool();
    return block;
  }

  addBlockToChain(block: Block) {
    this.chain.push(block);
    return this.chain;
  }

  replaceChain(newBlockchain: Blockchain): undefined | boolean {
    if (
      newBlockchain.chain.length > this.chain.length &&
      newBlockchain.isChainValid()
    ) {
      this.chain = newBlockchain.chain;
      this.difficulty = newBlockchain.difficulty;
      return true;
    } else {
      return false;
    }
  }

  resetMempool() {
    this.pendingTransactions = [];
  }

  isChainValid() {
    // Check if the Genesis block hasn't been tampered with:
    if (!this.chain[0].isValid()) {
      return false;
    }

    for (let i = 1; i < this.chain.length; i++) {
      const previousBlock = this.chain[i - 1];
      const currentBlock = this.chain[i];

      if (
        !currentBlock.isValid() ||
        !Block.areBlocksValidlyConnected(previousBlock, currentBlock)
      ) {
        return false;
      }
    }
    return true;
  }

}
