//@ts-ignore
import hexToBinary from "hex-to-binary"
import { GENESIS_BLOCK_DATA } from "../../config"
import Transaction, { CoinbaseTransaction } from "../Transaction/Transaction";
import { Type } from 'class-transformer';
import 'reflect-metadata';
import getSHA256Hash from "../utils/crypto-hash";

export default class Block {
  @Type(() => Transaction)
  transactions: Transaction[];
  previousHash: string | null;
  height: number;
  difficulty: number;
  nonce: number;
  timestamp: number;
  miningDurationMs!: number;
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
    return getSHA256Hash(this.timestamp, this.transactions, this.previousHash, this.height, this.difficulty, this.nonce)
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
    const proofOfWorkReq = "0".repeat(this.difficulty)

    while (hexToBinary(hash).substring(0, this.difficulty) !== proofOfWorkReq) {
        this.nonce ++
        hash = this.calculateHash()
    }
    return hash
  }

  hasValidTransactions(): boolean {
    return this.transactions.every(transaction => transaction.isValid())
  }

  hasOnlyOneCoinbaseTx(): boolean {
    const count = this.transactions.filter(transaction => transaction.isValidCoinbaseTx()).length;
    return count === 1
  }
  
  hasValidHash(): boolean {
    return this.hash === this.calculateHash()
  }

  firstDCharsAreZero(): boolean {
    const proofOfWorkReq = "0".repeat(this.difficulty)
    return hexToBinary(this.hash).substring(0, this.difficulty) === proofOfWorkReq
  }

  hasProofOfWork(): boolean {
    return this.hasValidHash() && this.firstDCharsAreZero()
  }

  hasPlausibleTimeStamp(): boolean {
    if (!this.timestamp) return false
    //Allow up to 5 minutes in the future, in case of discrepancies between nodes
    return this.timestamp < (Date.now() + 1000 * 5)
  }
  
  isValid(): boolean {
    return this.hasValidTransactions() && this.hasProofOfWork() && this.hasOnlyOneCoinbaseTx() && this.hasPlausibleTimeStamp()
  }

  isValidGenesisBlock(): boolean { 
    const { difficulty, transactions, previousHash, height } = GENESIS_BLOCK_DATA

    return (
      this.hasProofOfWork() && 
      this.difficulty === difficulty && 
      this.transactions.length === transactions.length && 
      this.previousHash === previousHash && 
      this.height === height
      )
  }

}

export class GenesisBlock extends Block {
  constructor() {
    super(GENESIS_BLOCK_DATA.transactions, GENESIS_BLOCK_DATA.difficulty, GENESIS_BLOCK_DATA.previousHash, GENESIS_BLOCK_DATA.height)
    this.mineBlock()
  }
}