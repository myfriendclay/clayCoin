import SHA256 from "crypto-js/sha256.js"
import hexToBinary from "hex-to-binary"
import { GENESIS_BLOCK_DATA } from "../../config.js"
import Transaction from "../Transaction/Transaction.js";

export default class Block {
  transactions: Transaction[];
  previousHash: string | null;
  height: number;
  difficulty: number;
  nonce: number;
  timestamp: number;
  timeSpentMiningInMilliSecs: number;
  hash: string

  constructor(transactions, difficulty, previousHash = '', height) {
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
    const startOfMining = Date.now()
    this.hash = this.getProofOfWorkHash()
    const endOfMining = Date.now()
    this.timeSpentMiningInMilliSecs = endOfMining - startOfMining
    return this.timeSpentMiningInMilliSecs
  }

  getProofOfWorkHash() {
    let hash = ""

    while (hexToBinary(hash).substring(0, this.difficulty) !== "0".repeat(this.difficulty)) {
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
    return hexToBinary(this.hash).substring(0, this.difficulty) === "0".repeat(this.difficulty)
  }

  hasProofOfWork() {
    return this.hasValidHash() && this.firstDCharsAreZero()
  }
  
  isValidBlock() {
    return this.hasValidTransactions() && this.hasProofOfWork()
  }

  isValidGenesisBlock() {
    const { difficulty, transactions, previousHash, height } = GENESIS_BLOCK_DATA

    return this.isValidBlock() && this.difficulty === difficulty && this.transactions === transactions && this.previousHash === previousHash && this.height === height
  }

  static createGenesisBlock() {
    const genesisBlock = new Block(GENESIS_BLOCK_DATA.transactions, GENESIS_BLOCK_DATA.difficulty, GENESIS_BLOCK_DATA.previousHash, GENESIS_BLOCK_DATA.height)
    genesisBlock.mineBlock()
    return genesisBlock
  }
}