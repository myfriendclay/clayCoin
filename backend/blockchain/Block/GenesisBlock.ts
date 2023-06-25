import { GENESIS_BLOCK_DATA } from "../utils/config";
import Block from "./Block";

class GenesisBlock extends Block {
  constructor() {
    super(
      GENESIS_BLOCK_DATA.transactions,
      GENESIS_BLOCK_DATA.difficulty,
      GENESIS_BLOCK_DATA.previousHash,
      GENESIS_BLOCK_DATA.height
    );
    this.__type = "GenesisBlock";
    this.mineBlock();
  }

  isValid(): boolean {
    const { difficulty, transactions, previousHash, height } =
      GENESIS_BLOCK_DATA;

    return (
      this.hasProofOfWork() &&
      this.timestampIsInPast() &&
      this.difficulty === difficulty &&
      this.transactions.length === transactions.length &&
      this.previousHash === previousHash &&
      this.height === height
    );
  }
}

export default GenesisBlock;
