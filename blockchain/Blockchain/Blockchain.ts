import Block from '../Block/Block'
import Transaction from '../Transaction/Transaction'
import EC from "elliptic"
const ec = new EC.ec('secp256k1')
import { MINE_RATE_MS, INITIAL_DIFFICULTY, MINING_REWARD } from "../../config"
import { Type } from 'class-transformer';
import 'reflect-metadata';


export default class Blockchain {
  @Type(() => Block)
  chain: Block[]
  difficulty: number
  pendingTransactions: Transaction[]
  miningReward: number

  constructor() {
    this.chain = [Block.createGenesisBlock()]
    this.difficulty = INITIAL_DIFFICULTY
    this.pendingTransactions = []
    this.miningReward = MINING_REWARD
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  addTransaction(transaction: Transaction) {
    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transaction to chain")
    }

    if (!this.walletHasSufficientFunds(transaction)) {
      throw new Error("not enough funds for transactions in mempool or this transaction itself")
    }
    
    this.pendingTransactions.push(transaction)
  }
  //Validity methods:

  //Wallet helpers

  getBalanceOfAddress(address: string): number | null {
    if (this.getAllTransactionsForWallet(address).length === 0) {
      return null
    }
    let balance = 0
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount
        }

        if (transaction.toAddress === address) {
          balance += transaction.amount
        }
      }
    }
    return balance
  }

  getTotalPendingOwedByWallet(address: string): number {
    const pendingTransactionsForWallet = this.pendingTransactions.filter(tx => tx.fromAddress === address)
    const totalPendingAmount = pendingTransactionsForWallet.map(tx => tx.amount).reduce((prev, curr) => prev + curr, 0)
    return totalPendingAmount
  }

  walletHasSufficientFunds(transaction: Transaction): boolean {
    const walletBalance = this.getBalanceOfAddress(transaction.fromAddress)
    const totalPendingOwed = this.getTotalPendingOwedByWallet(transaction.fromAddress)
    return walletBalance >= totalPendingOwed + transaction.amount
  }
  
  //For possible API use:
  getAllTransactionsForWallet(address: string): Transaction[] {
    const transactions = []
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address || transaction.toAddress === address) {
          transactions.push(transaction)
        }
      }
    }
    return transactions
  }

   //Transaction helpers:
  addCoinbaseTxToMempool(miningRewardAddress: string): Transaction {
     //Mining reward:
     const coinbaseTx = new Transaction("Coinbase Tx", miningRewardAddress, this.miningReward, "Mining reward transaction")
     this.pendingTransactions.push(coinbaseTx)
     return coinbaseTx
  }

  addPendingTransactionsToBlock(): Block {
    this.difficulty = this.getNewMiningDifficulty()
    const block = new Block(this.pendingTransactions, this.difficulty, this.getLatestBlock().calculateHash(), this.chain.length)
    return block
  }

  getNewMiningDifficulty(): number {
    const lastMiningTime = this.getLatestBlock().timeSpentMiningInMilliSecs || MINE_RATE_MS
    
    if (lastMiningTime < MINE_RATE_MS) {
      this.difficulty++
    } else if (this.difficulty > 1){
      this.difficulty--
    }
    return this.difficulty
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
    //The issue is newBlockchain is just a json object not a blockchain instance so it can't access .isChainValid
    console.log("inside replace chain:", newBlockchain.chain[0].isValidGenesisBlock())
    if (newBlockchain.chain.length > this.chain.length && Blockchain.isChainValid(newBlockchain.chain)) {
      this.chain = newBlockchain.chain
    } else {
      return false
    }
  }

  resetMempool() {
    this.pendingTransactions = []
  }

  static isChainValid(chain: Block[]) {
    // Check if the Genesis block hasn't been tampered with:
    if (!chain[0].isValidGenesisBlock()) {
      return false
    }

    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i]
      const previousBlock = chain[i - 1]
      const difficultyJump = currentBlock.difficulty - previousBlock.difficulty
      if (!currentBlock.isValidBlock() && i > 1) {
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