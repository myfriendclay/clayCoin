import Block from "../Block/Block";
import GenesisBlock from "../Block/GenesisBlock";

import {
  BLOCK_SUBSIDY,
} from "../utils/config";
import { Type } from "class-transformer";
import "reflect-metadata";

export default class Blockchain {
  @Type(() => Block, {
    discriminator: {
      property: "__type",
      subTypes: [
        { value: Block, name: "default" },
        { value: GenesisBlock, name: "GenesisBlock" },
      ],
    },
  })
  chain: Block[];
  blockSubsidy: number;

  constructor() {
    this.chain = [new GenesisBlock()];
    this.blockSubsidy = BLOCK_SUBSIDY;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlockToChain(block: Block) {
    this.chain.push(block);
    return this.chain;
  }

  replaceChain(newBlockchain: Blockchain): undefined | boolean {
    if (
      newBlockchain.chain.length > this.chain.length &&
      newBlockchain.isChainValid()
    ) {
      this.chain = newBlockchain.chain;
      return true;
    } else {
      return false;
    }
  }

  isChainValid() {
    // Check if the Genesis block hasn't been tampered with:
    if (!this.chain[0].isValid()) {
      return false;
    }

    for (let i = 1; i < this.chain.length; i++) {
      const previousBlock = this.chain[i - 1];
      const currentBlock = this.chain[i];

      if (
        !currentBlock.isValid() ||
        !Block.areBlocksValidlyConnected(previousBlock, currentBlock)
      ) {
        return false;
      }
    }
    return true;
  }

}
