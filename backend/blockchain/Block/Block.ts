import hexToBinary from "hex-to-binary";
import Transaction from "../Transaction/Transaction";
import CoinbaseTransaction from "../Transaction/CoinbaseTransaction";
import { Type } from "class-transformer";
import "reflect-metadata";
import getSHA256Hash from "../utils/crypto-hash";
import Blockchain from "../Blockchain/Blockchain";


class Block {
  @Type(() => Transaction, {
    discriminator: {
      property: "__type",
      subTypes: [
        { value: Transaction, name: "default" },
        { value: CoinbaseTransaction, name: "CoinbaseTransaction" },
      ],
    },
  })
  transactions: Transaction[];
  previousHash: string | null;
  height: number;
  difficulty: number;
  nonce: number;
  timestamp: number;
  miningDurationMs!: number;
  hash!: string;
  // Only present on GenesisBlock as a commitment to the consensus rules
  protocolHash?: string;
  __type: "default" | "GenesisBlock";

  constructor(
    transactions: Transaction[],
    difficulty: number,
    previousHash: string | null = "",
    height: number
  ) {
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.height = height;
    this.difficulty = difficulty;
    this.nonce = 0;
    this.timestamp = Date.now();
    this.__type = "default";
  }

  mineBlock(): number {
    const startOfMining = Date.now();
    this.hash = this.getProofOfWorkHash();
    const endOfMining = Date.now();
    this.miningDurationMs = endOfMining - startOfMining;
    return this.miningDurationMs;
  }

  //Helper method for mineBlock
  getProofOfWorkHash(): string {
    let hash = "";
    const proofOfWorkReq = "0".repeat(this.difficulty);

    while (hexToBinary(hash).substring(0, this.difficulty) !== proofOfWorkReq) {
      this.nonce++;
      hash = this.calculateHash();
    }
    return hash;
  }

  calculateHash(): string {
    return getSHA256Hash(
      this.timestamp,
      this.transactions,
      this.previousHash,
      this.height,
      this.difficulty,
      this.nonce
    );
  }

  isValid(): boolean {
    return (
      this.hasValidTransactions() &&
      this.hasOnlyOneCoinbaseTx() &&
      this.timestampIsInPast() &&
      this.hasProofOfWork() &&
      this.validateCoinbaseAmount()
    );
  }

  /** Returns the single coinbase transaction, or null */
  private getCoinbaseTx(): CoinbaseTransaction | null {
    const tx = this.transactions.find(
      (t) => t instanceof CoinbaseTransaction
    );
    return tx ? (tx as CoinbaseTransaction) : null;
  }

  /**
   * Verify the coinbase amount equals current subsidy + total fees.
   * Subsidy halves every NUM_OF_BLOCKS_TO_HALF_MINING_REWARD blocks.
   */
  validateCoinbaseAmount(): boolean {
    const coinbase = this.getCoinbaseTx();
    if (!coinbase) return false;

    return coinbase.isMiningRewardValid(this.height, this.getTotalFees());
  }

  /** Sum of fees of all transactions in the block (coinbase fee is 0) */
  private getTotalFees(): number {
    return this.transactions.reduce((acc, tx) => acc + tx.fee, 0);
  }

  //Helper methods for isValid
  hasValidTransactions(): boolean {
    return this.transactions.every((transaction) => transaction.isValid());
  }

  hasOnlyOneCoinbaseTx(): boolean {
    const count = this.transactions.filter(
      (transaction) => transaction instanceof CoinbaseTransaction
    ).length;
    return count === 1;
  }

  hasValidDifficulty(blockchain: Blockchain): boolean {
    return this.difficulty === blockchain.getExpectedDifficulty(this.height);
  }

  timestampIsInPast(): boolean {
    if (!this.timestamp) return false;
    //Allow up to 5 minutes in the future, in case of discrepancies between nodes
    return this.timestamp < Date.now() + 1000 * 5;
  }

  hasProofOfWork(): boolean {
    return this.hasValidHash() && this.firstDCharsAreZero();
  }

  //Helper methods for hasProofOfWork:

  hasValidHash(): boolean {
    return this.hash === this.calculateHash();
  }

  firstDCharsAreZero(): boolean {
    const proofOfWorkReq = "0".repeat(this.difficulty);
    return (
      hexToBinary(this.hash).substring(0, this.difficulty) === proofOfWorkReq
    );
  }

  /**
   * Returns the amount of proof-of-work represented by this block, expressed as 2^difficulty.
   * A BigInt is used so the value can never overflow the JavaScript number range.
   */
  getWork(): bigint {
    // 1n << d   ===  2^d for BigInt
    return 1n << BigInt(this.difficulty);
  }

  static areBlocksValidlyConnected(block1: Block, block2: Block): boolean {
    return (
      this.blocksHashesAreConnected(block1, block2) &&
      this.block2ComesAfterBlock1(block1, block2) &&
      this.block1HasPlausibleMiningDuration(block1, block2)
    );
  }

  //Helper methods for areBlocksValidlyConnected:
  static blocksHashesAreConnected(block1: Block, block2: Block): boolean {
    return block2.previousHash === block1.hash;
  }

  static block2ComesAfterBlock1(block1: Block, block2: Block): boolean {
    const timestampDifference = block2.timestamp - block1.timestamp;
    //Allow 10 min of buffer in case one node publishes block with newer timestamp first and older block gets added after
    const timeCushion = -1000 * 60 * 10;
    return timestampDifference > timeCushion;
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
