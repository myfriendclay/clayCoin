import hexToBinary from "hex-to-binary"
import { GENESIS_BLOCK_DATA } from "../../config"
import Transaction, { CoinbaseTransaction } from "../Transaction/Transaction";
import { Type } from 'class-transformer';
import 'reflect-metadata';
import getSHA256Hash from "../../utils/crypto-hash";

export default class Block {
  @Type(() => Transaction)
  transactions: Transaction[];
  previousHash: string | null;
  height: number;
  difficulty: number;
  nonce: number;
  timestamp: number;
  miningDurationMs: number | undefined;
  hash: string | undefined;

  constructor(transactions: Transaction[], difficulty: number, previousHash: string | null = '', height: number) {
    this.transactions = transactions
    this.previousHash = previousHash
    this.height = height
    this.difficulty = difficulty
    this.nonce = 0
    this.timestamp = Date.now()
  }

  calculateHash(): string {
    return getSHA256Hash(this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.height + this.difficulty + this.nonce)
  }

  mineBlock(): number {
    const startOfMining = Date.now()
    this.hash = this.getProofOfWorkHash()
    const endOfMining = Date.now()
    this.miningDurationMs = endOfMining - startOfMining
    return this.miningDurationMs
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

  hasOnlyOneCoinbaseTx(): boolean {
    const count = this.transactions.filter(transaction => transaction instanceof CoinbaseTransaction).length;
    return count === 1
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
  
  isValid(): boolean {
    return this.hasValidTransactions() && this.hasProofOfWork() && this.hasOnlyOneCoinbaseTx()
  }
}

export class GenesisBlock extends Block {
  constructor() {
    super(GENESIS_BLOCK_DATA.transactions, GENESIS_BLOCK_DATA.difficulty, GENESIS_BLOCK_DATA.previousHash, GENESIS_BLOCK_DATA.height)
    this.mineBlock()
  }

  isValid(): boolean {
    const { difficulty, transactions, previousHash, height } = GENESIS_BLOCK_DATA
    return this.hasProofOfWork() && this.difficulty === difficulty && this.transactions.length === transactions.length && this.previousHash === previousHash && this.height === height
  }
}