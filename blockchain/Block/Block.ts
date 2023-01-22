import SHA256 from "crypto-js/sha256.js"
import hexToBinary from "hex-to-binary"
import { GENESIS_BLOCK_DATA } from "../../config"
import Transaction from "../Transaction/Transaction";
import { Type } from 'class-transformer';
import 'reflect-metadata';

export default class Block {
  @Type(() => Transaction)
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

  calculateHash(): string {
    return SHA256(this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.height + this.difficulty + this.nonce).toString()
  }

  mineBlock(): number {
    const startOfMining = Date.now()
    this.hash = this.getProofOfWorkHash()
    const endOfMining = Date.now()
    this.timeSpentMiningInMilliSecs = endOfMining - startOfMining
    return this.timeSpentMiningInMilliSecs
  }

  getProofOfWorkHash(): string {
    let hash = ""

    while (hexToBinary(hash).substring(0, this.difficulty) !== "0".repeat(this.difficulty)) {
        this.nonce ++
        hash = this.calculateHash()
    }
    return hash
  }

  hasValidTransactions(): boolean {
    return this.transactions.every(transaction => transaction.isValid())
  }

  hasValidHash(): boolean {
    return this.hash === this.calculateHash()
  }

  firstDCharsAreZero(): boolean {
    return hexToBinary(this.hash).substring(0, this.difficulty) === "0".repeat(this.difficulty)
  }

  hasProofOfWork(): boolean {
    return this.hasValidHash() && this.firstDCharsAreZero()
  }
  
  isValidBlock(): boolean {
    return this.hasValidTransactions() && this.hasProofOfWork()
  }

  isValidGenesisBlock(): boolean {
    const { difficulty, transactions, previousHash, height } = GENESIS_BLOCK_DATA
    return this.isValidBlock() && this.difficulty === difficulty && this.transactions.length === transactions.length && this.previousHash === previousHash && this.height === height
  }

  static createGenesisBlock(): Block {
    const genesisBlock = new Block(GENESIS_BLOCK_DATA.transactions, GENESIS_BLOCK_DATA.difficulty, GENESIS_BLOCK_DATA.previousHash, GENESIS_BLOCK_DATA.height)
    genesisBlock.mineBlock()
    return genesisBlock
  }
}