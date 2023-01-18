import Block from '../Block/Block.js'
import Transaction from '../Transaction/Transaction.js'
import EC from "elliptic"
import { MINE_RATE_MS, INITIAL_DIFFICULTY, MINING_REWARD } from "../../config.js"
const ec = new EC.ec('secp256k1')

export default class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()]
    this.difficulty = INITIAL_DIFFICULTY
    this.pendingTransactions = []
    this.miningReward = MINING_REWARD
    this.nodes = new Set()
  }

  createGenesisBlock() {
    const genesisBlock = new Block("Genesis Block", 4, null, 0)
    genesisBlock.hash = genesisBlock.getProofOfWorkHash()
    return genesisBlock
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

  addPendingTransactionsToBlockchain(miningRewardAddress) {
    const block = this.minePendingTransactions(miningRewardAddress)
    this.addBlockToChain(block)
    this.resetMempool()
    return this.chain
  }

  //Validity methods:

  hasValidGenesisBlock() {
    const expectedGenesis = JSON.stringify(this.createGenesisBlock());
    return JSON.stringify(this.chain[0]) === expectedGenesis
  }

  isChainValid() {
    // Check if the Genesis block hasn't been tampered with:
    if (!this.hasValidGenesisBlock()) {
      return false
    }

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]
      if (!currentBlock.isValidBlock() && i > 1) {
        return false
      }
    
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }
    }
    return true
  }

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
    return block
  }

  addBlockToChain(block) {
    this.chain.push(block)
    return this.chain
  }

  replaceChain(newBlockchain) {
    if (newBlockchain.chain.length > this.chain.length  && newBlockchain.isChainValid()) {
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
  
}