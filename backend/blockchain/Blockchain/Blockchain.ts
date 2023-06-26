import Block from "../Block/Block";
import GenesisBlock from "../Block/GenesisBlock";
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

  constructor() {
    this.chain = [new GenesisBlock()];
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlockToChain(block: Block) {
    this.chain.push(block);
    return this.chain;
  }

  isChainValid() {
    // Check if the Genesis block has been tampered with:
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

  replaceChain(newBlockchain: Blockchain): boolean {
    if (
      newBlockchain.chain.length <= this.chain.length ||
      !newBlockchain.isChainValid()
    ) {
      return false;
    }
    this.chain = newBlockchain.chain;
    return true;
  }
}
