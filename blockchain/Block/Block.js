import SHA256 from "crypto-js/sha256.js"

export default class Block {
  constructor(transactions, difficulty, previousHash = '', height = null) {
    this.transactions = transactions
    this.previousHash = previousHash
    this.height = height
    this.difficulty = difficulty
    this.nonce = 0
    this.timestamp = Date.now()
  }

  calculateHash() {
    return SHA256(this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.height + this.difficulty + this.nonce).toString()
  }

  mineBlock() {
    this.hash = this.getProofOfWorkHash()
  }

  getProofOfWorkHash() {
    let hash = ""
    while (hash.substring(0, this.difficulty) !== "0".repeat(this.difficulty)) {
        this.nonce ++
        hash = this.calculateHash()
    }
    return hash
  }

  hasValidTransactions() {
    return this.transactions.every(transaction => transaction.isValid())
  }

  hasValidHash() {
    return this.hash === this.calculateHash()
  }

  firstDCharsAreZero() {
    return this.hash.substring(0, this.difficulty) === "0".repeat(this.difficulty)
  }

  hasProofOfWork() {
    return this.hasValidHash() && this.firstDCharsAreZero()
  }
  
  isValidBlock() {
    return this.hasValidTransactions() && this.hasProofOfWork()
  }
}