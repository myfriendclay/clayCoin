import Block from '../Block/Block.js'
import Transaction from '../Transaction/Transaction.js'
import EC from "elliptic"
import { MINE_RATE_MS, INITIAL_DIFFICULTY, MINING_REWARD } from "../../config.js"
const ec = new EC.ec('secp256k1')

export default class Blockchain {
  constructor() {
    this.chain = [Block.createGenesisBlock()]
    this.difficulty = INITIAL_DIFFICULTY
    this.pendingTransactions = []
    this.miningReward = MINING_REWARD
    this.nodes = new Set()
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  addTransaction(transaction) {
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

  getBalanceOfAddress(address) {
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

  getTotalPendingOwedByWallet(address) {
    const pendingTransactionsForWallet = this.pendingTransactions.filter(tx => tx.fromAddress === address)
    const totalPendingAmount = pendingTransactionsForWallet.map(tx => tx.amount).reduce((prev, curr) => prev + curr, 0)
    return totalPendingAmount
  }

  walletHasSufficientFunds(transaction) {
    const walletBalance = this.getBalanceOfAddress(transaction.fromAddress)
    const totalPendingOwed = this.getTotalPendingOwedByWallet(transaction.fromAddress)
    return walletBalance >= totalPendingOwed + transaction.amount
  }
  
  //For possible API use:
  getAllTransactionsForWallet(address) {
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
  addCoinbaseTxToMempool(miningRewardAddress) {
     //Mining reward:
     const coinbaseTx = new Transaction("Coinbase Tx", miningRewardAddress, this.miningReward, "Mining reward transaction")
     this.pendingTransactions.push(coinbaseTx)
     return coinbaseTx
  }

  addPendingTransactionsToBlock() {
    this.difficulty = this.getNewMiningDifficulty()
    const block = new Block(this.pendingTransactions, this.difficulty, this.getLatestBlock().calculateHash(), this.chain.length)
    return block
  }

  getNewMiningDifficulty() {
    const lastMiningTime = this.getLatestBlock().timeSpentMiningInMilliSecs || MINE_RATE_MS
    
    if (lastMiningTime < MINE_RATE_MS) {
      this.difficulty++
    } else if (this.difficulty > 1){
      this.difficulty--
    }
    return this.difficulty
  }

  minePendingTransactions(miningRewardAddress) {
    this.addCoinbaseTxToMempool(miningRewardAddress)
    const block = this.addPendingTransactionsToBlock()
    block.mineBlock(block.difficulty)
    this.addBlockToChain(block)
    this.resetMempool()
    return this.chain
  }

  addBlockToChain(block) {
    this.chain.push(block)
    return this.chain
  }

  replaceChain(newBlockchain) {
    //The issue is newBlockchain is just a json object not a blockchain instance so it can't access .isChainValid
    if (newBlockchain.chain.length > this.chain.length && Blockchain.isChainValid(newBlockchain)) {
      this.chain = newBlockchain.chain
    } else {
      return false
    }
  }

  resetMempool() {
    this.pendingTransactions = []
  }

  //Node stuff:
  registerNode(address) {
    this.nodes.add(address)
  }

  static isChainValid(chain) {
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