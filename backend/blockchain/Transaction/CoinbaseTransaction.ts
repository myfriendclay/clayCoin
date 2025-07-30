import { COINBASE_TX } from "../utils/config";
import Transaction from "./Transaction";
import { BLOCK_SUBSIDY, NUM_OF_BLOCKS_TO_HALF_MINING_REWARD } from "../utils/config";

class CoinbaseTransaction extends Transaction {
  constructor(miningRewardAddress: string, miningReward: number) {
    super(
      COINBASE_TX.fromAddress as string,
      miningRewardAddress,
      miningReward,
      COINBASE_TX.memo
    );
    this.__type = "CoinbaseTransaction";
    this.signTransaction(COINBASE_TX.secretKey as string);
  }

  isValid(): boolean {
    const { fromAddress, memo } = COINBASE_TX;
    return (
      this.fromAddress === fromAddress &&
      this.memo === memo &&
      this.amount > 0 &&
      this.hasValidSignature()
    );
  }

  /**
   * Verify that the coinbase transaction amount matches the expected
   * subsidy (after halvings) plus the total fees in the block.
   */
  isMiningRewardValid(blockHeight: number, totalFees: number): boolean {
    const halvings = Math.floor(
      blockHeight / NUM_OF_BLOCKS_TO_HALF_MINING_REWARD
    );
    let expectedSubsidy = BLOCK_SUBSIDY >> halvings;
    if (expectedSubsidy < 0) expectedSubsidy = 0;

    return this.amount === expectedSubsidy + totalFees;
  }
}

export default CoinbaseTransaction;
