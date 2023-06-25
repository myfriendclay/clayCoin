import hexToBinary from "hex-to-binary"
import Transaction from "../Transaction/Transaction";
import CoinbaseTransaction from "../Transaction/CoinbaseTransaction";
import { Type } from 'class-transformer';
import 'reflect-metadata';
import getSHA256Hash from "../utils/crypto-hash";
import { TARGET_MINE_RATE_MS } from "../utils/config";

class Block {
  @Type(() => Transaction, {
    discriminator: {
      property: "__type",
      subTypes: [
        { value: Transaction, name: 'default' },
        { value: CoinbaseTransaction, name: 'CoinbaseTransaction' }
      ]
     }
  })
  transactions: Transaction[];
  previousHash: string | null;
  height: number;
  difficulty: number;
  nonce: number;
  timestamp: number;
  miningDurationMs!: number;
  hash!: string;
  __type: 'default' | 'GenesisBlock'

  constructor(transactions: Transaction[], difficulty: number, previousHash: string | null = '', height: number) {
    this.transactions = transactions
    this.previousHash = previousHash
    this.height = height
    this.difficulty = difficulty
    this.nonce = 0
    this.timestamp = Date.now()
    this.__type = 'default'
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
    const count = this.transactions.filter(transaction => transaction instanceof CoinbaseTransaction).length;
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

  timestampIsInPast(): boolean {
    if (!this.timestamp) return false
    //Allow up to 5 minutes in the future, in case of discrepancies between nodes
    return this.timestamp < (Date.now() + 1000 * 5)
  }
  
  isValid(): boolean {
    return this.hasValidTransactions() && this.hasProofOfWork() && this.hasOnlyOneCoinbaseTx() && this.timestampIsInPast()
  }

  static areBlocksValidlyConnected(block1: Block, block2: Block): boolean {
    return (
      this.blocksHashesAreConnected(block1, block2) &&
      this.block2ComesAfterBlock1(block1, block2) &&
      this.difficultyJumpIsValid(block1, block2) &&
      this.block1HasPlausibleMiningDuration(block1, block2)
    );
  }

  static blocksHashesAreConnected(block1: Block, block2: Block): boolean {
    return block2.previousHash === block1.hash;
  }

  static block2ComesAfterBlock1(block1: Block, block2: Block): boolean {
    const timestampDifference = block2.timestamp - block1.timestamp;
    //Allow 10 min of buffer in case one node publishes block with newer timestamp first and older block gets added after
    const timeCushion = -1000 * 60 * 10;
    return timestampDifference > timeCushion;
  }

  static difficultyJumpIsValid(block1: Block, block2: Block): boolean {
    const difficultyJump = block2.difficulty - block1.difficulty;
    //Difficulty should never jump down more than one level
    if (difficultyJump < -1) {
      return false;
    }

    //Difficulty increases by at least 1 when below target mine rate
    //Ultimately for a truly secure blockchain network since miningDurationMs can be faked by bad actor, this should be calculated based on average difference between timestamps of last X blocks. Only works when you have a large enough network of nodes that there is constant block mining one after the other.
    if (block1.miningDurationMs < TARGET_MINE_RATE_MS) {
      return block2.difficulty >= block1.difficulty + 1;
    }
    return true;
  }

  static block1HasPlausibleMiningDuration(
    block1: Block,
    block2: Block
  ): boolean {
    //Allow up to 2 minutes cushion, in case of discrepancies between nodes
    const timeCushionMs = 1000 * 60 * 2;
    const timeBetweenBlocks = block2.timestamp - block1.timestamp;
    return block1.miningDurationMs < timeBetweenBlocks + timeCushionMs;
  }
}

export default Block;