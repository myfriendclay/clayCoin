import Block from '../Block/Block'
import { GenesisBlock } from '../Block/Block'
import Transaction from '../Transaction/Transaction'
import { CoinbaseTransaction } from '../Transaction/Transaction'
import { MINE_RATE_MS, INITIAL_DIFFICULTY, BLOCK_SUBSIDY, COINBASE_TX } from "../../config"
import { Type } from 'class-transformer';
import Wallet from '../Wallet/Wallet'
import 'reflect-metadata';

export default class Blockchain {
  @Type(() => Block)
  chain: Block[]
  difficulty: number
  pendingTransactions: Transaction[]
  blockSubsidy: number

  constructor() {
    this.chain = [new GenesisBlock()]
    this.difficulty = INITIAL_DIFFICULTY
    this.pendingTransactions = []
    this.blockSubsidy = BLOCK_SUBSIDY
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  addTransaction(transaction: Transaction) {
    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transaction to chain")
    }

    if (!Wallet.walletHasSufficientFunds(transaction.fromAddress, transaction, this.chain, this.pendingTransactions)) {
      throw new Error("not enough funds for transactions in mempool or this transaction itself")
    }
    
    this.pendingTransactions.push(transaction)
  }

   //Transaction helpers:
  addCoinbaseTxToMempool(miningRewardAddress: string): Transaction[] {
    const coinbaseTx = new CoinbaseTransaction(miningRewardAddress, this.getMiningReward())
    this.pendingTransactions.push(coinbaseTx)
    return this.pendingTransactions
  }

  getTotalTransactionFees(): number {
    return this.pendingTransactions.map(tx => tx.fee).reduce((prev, curr) => prev + curr, 0)
  }

  getMiningReward(): number {
    return this.getTotalTransactionFees() + this.blockSubsidy
  }

  addPendingTransactionsToBlock(): Block {
    this.difficulty = this.getNewMiningDifficulty()
    const block = new Block(this.pendingTransactions, this.difficulty, this.getLatestBlock().hash, this.chain.length)
    return block
  }

  getNewMiningDifficulty(): number {
    const lastMiningTime = this.getLatestBlock().miningDurationMs || MINE_RATE_MS
    let difficulty = this.difficulty

    if (lastMiningTime < MINE_RATE_MS) {
      difficulty++
    } else if (this.difficulty > 1){
      difficulty--
    }
    return difficulty
  }

  minePendingTransactions(miningRewardAddress: string): Block {
    this.addCoinbaseTxToMempool(miningRewardAddress)
    const block = this.addPendingTransactionsToBlock()
    block.mineBlock()
    this.addBlockToChain(block)
    this.resetMempool()
    return block
  }

  addBlockToChain(block: Block) {
    this.chain.push(block)
    return this.chain
  }

  replaceChain(newBlockchain: Blockchain): undefined | boolean {
    if (newBlockchain.chain.length > this.chain.length && Blockchain.isChainValid(newBlockchain.chain)) {
      this.chain = newBlockchain.chain
    } else {
      return false
    }
  }

  resetMempool() {
    this.pendingTransactions = []
  }

  replaceMempool() {

  }

  static isChainValid(chain: Block[]) {
    // Check if the Genesis block hasn't been tampered with:
    if (!chain[0].isValid()) {
      return false
    }

    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i]
      const previousBlock = chain[i - 1]
      const difficultyJump = currentBlock.difficulty - previousBlock.difficulty
      if (!currentBlock.isValid()) {
        return false
      }
    
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }

      //Detect negative difficulty jump greater than 1
      if (difficultyJump < -1) {
        return false
      }
    }
    return true
  }
  
}