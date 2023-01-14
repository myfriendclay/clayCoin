import SHA256 from "crypto-js/sha256.js"

export default class Block {
  constructor(timestamp, transactions, difficulty, previousHash = '', height = null) {
    this.timestamp = timestamp
    this.transactions = transactions
    this.previousHash = previousHash
    this.height = height
    this.difficulty = difficulty
    this.nonce = 0
    this.hash = this.calculateHash()
  }

  calculateHash() {
    return SHA256(this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.height + this.difficulty + this.nonce).toString()
  }

  mineBlock() {
    return this.getProofOfWorkHash()
  }

  getProofOfWorkHash() {
    while (this.hash.substring(0, this.difficulty) !== "0".repeat(this.difficulty)) {
        this.nonce ++
        this.hash = this.calculateHash()
    }
    return this.hash
  }

  hasValidTransactions() {
    return this.transactions.every(transaction => transaction.isValid())
  }

  firstDCharsAreZero() {
    return this.hash.substring(0, this.difficulty) === "0".repeat(this.difficulty)
  }

  hasProofOfWork() {
    return this.hasValidHash() && this.firstDCharsAreZero()
  }

  hasValidHash() {
    return this.hash === this.calculateHash()
  }
  
  isValidBlock() {
    return this.hasValidTransactions() && this.hasProofOfWork()
  }
}