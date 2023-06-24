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
      property: "type",
      subTypes: [
        { value: Block, name: "default" },
        { value: GenesisBlock, name: "genesisBlock" },
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
        !Blockchain.areBlocksValidlyConnected(previousBlock, currentBlock)
      ) {
        return false;
      }
    }
    return true;
  }

  static areBlocksValidlyConnected(block1: Block, block2: Block): boolean {
    return (
      this.blocksHashesAreConnected(block1, block2) &&
      this.block2ComesAfterBlock1(block1, block2) &&
      this.difficultyJumpIsValid(block1, block2) &&
      this.block1HasPlausibleMiningDuration(block1, block2)
    );
  }

  static blocksHashesAreConnected(block1: Block, block2: Block): boolean {
    return block2.previousHash === block1.hash;
  }

  static block2ComesAfterBlock1(block1: Block, block2: Block): boolean {
    const timestampDifference = block2.timestamp - block1.timestamp;
    //Allow 10 min of buffer in case one node publishes block with newer timestamp first and older block gets added after
    const timeCushion = -1000 * 60 * 10;
    return timestampDifference > timeCushion;
  }

  static difficultyJumpIsValid(block1: Block, block2: Block): boolean {
    const difficultyJump = block2.difficulty - block1.difficulty;
    //Difficulty should never jump down more than one level
    if (difficultyJump < -1) {
      return false;
    }

    //Difficulty increases by at least 1 when below target mine rate
    //Ultimately for a truly secure blockchain network since miningDurationMs can be faked by bad actor, this should be calculated based on average difference between timestamps of last X blocks. Only works when you have a large enough network of nodes that there is constant block mining one after the other.
    if (block1.miningDurationMs < TARGET_MINE_RATE_MS) {
      return block2.difficulty >= block1.difficulty + 1;
    }
    return true;
  }

  static block1HasPlausibleMiningDuration(
    block1: Block,
    block2: Block
  ): boolean {
    //Allow up to 2 minutes cushion, in case of discrepancies between nodes
    const timeCushionMs = 1000 * 60 * 2;
    const timeBetweenBlocks = block2.timestamp - block1.timestamp;
    return block1.miningDurationMs < timeBetweenBlocks + timeCushionMs;
  }
}
