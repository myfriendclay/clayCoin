import Block from './Block.js'
import Transaction from './Transaction.js'
import SHA256 from "crypto-js/sha256.js"
import EC from "elliptic"
const ec = new EC.ec('secp256k1')
import axios from "axios"

export default class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()]
    this.difficulty = 4
    this.pendingTransactions = []
    this.miningReward = 100
    this.nodes = new Set()
  }

  createGenesisBlock() {
    const genesisBlock = new Block("0000-01-01T00:00:00", "Genesis Block", 4, null, 0)
    genesisBlock.hash = genesisBlock.getProofOfWorkHash()
    return genesisBlock
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  getTotalPendingOwedByWallet(transaction) {
    const pendingTransactionsForWallet = this.pendingTransactions.filter(tx => tx.fromAddress === transaction.fromAddress)
    const totalPendingAmount = pendingTransactionsForWallet.map(tx => tx.amount).reduce((prev, curr) => prev + curr, 0)
    return totalPendingAmount
  }

  walletHasSufficientFunds(transaction) {
    const walletBalance = this.getBalanceOfAddress(transaction.fromAddress)
    const totalPendingOwed = this.getTotalPendingOwedByWallet(transaction)
    return walletBalance >= totalPendingOwed + transaction.amount
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

  minePendingTransactions(miningRewardAddress) {
    //Mining reward:
    this.pendingTransactions.push(new Transaction("Coinbase Tx", miningRewardAddress, this.miningReward, Date.now(), "Mining reward transaction"))
    let block = new Block(Date.now(), this.pendingTransactions, this.difficulty, this.getLatestBlock().calculateHash(), this.chain.length)
    
    block.mineBlock(block.difficulty)
    this.chain.push(block)
    //need to reset pending transactions
    this.pendingTransactions = []
    console.log('Block successfully mined!')
    return block
  }

  getBalanceOfAddress(address) {
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

  hasValidGenesisBlock() {
    const realGenesis = JSON.stringify(this.createGenesisBlock());
    return realGenesis === JSON.stringify(this.chain[0])
  }

  isChainValid() {
    // Check if the Genesis block hasn't been tampered with:
    if (!this.hasValidGenesisBlock()) {
      return false
    }

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]
      if (!currentBlock.isValidBlock() && i !== 1) {
        return false
      }
    
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }
    }
    return true
  }

  registerNode(address) {
    //add a new to the list of nodes e.g. 'http://192.168.0.5:5000'
    const url = new URL(address);
    if (url) {
      //Should add some validation later to make sure it's a legit URL but not sure what format we want to allow
      this.nodes.add(href)
    }
  }
  resolveConflicts() {
    //Resolves conflicts by replacing our chain with the longest one on the network. returns true if replaced false if not
    const nodes = Array.from(this.nodes)
    let latestBlock = this.blockchain
    // for (const node of nodes) {
    //   axios.get(`${node}/chain`)
    //     .then(response => {
    //       console.log(response.data)
    //       const blockchain = response.data
    //       if (blockchain.isChainValid && blockchain.length > this.chain.length) {
    //         this.chain = blockchain.chain
    //         this.nodes = blockchain.nodes
    //         this.difficulty = blockchain.difficulty
    //       }
    //     })
    // }
    if (latestBlock === this.blockchain) {
      return "You have the latest block, no update made!"
    } else {
      return `Here is the latest block: + ${latestBlock}`
    }
  }
}
//testing out stuff with axios consolelog:
// axios.get("http://localhost:3000/chain")
//   .then(response => {
//     console.log(typeof response.data.isChainValid)
//   })
