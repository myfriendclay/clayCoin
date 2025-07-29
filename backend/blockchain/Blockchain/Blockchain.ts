import Block from "../Block/Block";
import GenesisBlock from "../Block/GenesisBlock";
import { Type } from "class-transformer";
import "reflect-metadata";
import DatabaseService from "../../database/DatabaseService";

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
  private dbService: DatabaseService;

  constructor(dbService?: DatabaseService) {
    this.chain = [new GenesisBlock()];
    this.dbService = dbService || new DatabaseService();
  }

  async initialize(): Promise<void> {
    await this.dbService.initialize();
    await this.loadFromDatabase();
  }

  private async loadFromDatabase(): Promise<void> {
    try {
      const blocks = await this.dbService.getAllBlocks();
      
      if (blocks.length > 0) {
        // Load existing blockchain from database
        this.chain = blocks;
        console.log(`Loaded ${blocks.length} blocks from database`);
      } else {
        // No existing data, save genesis block
        await this.saveBlockToDatabase(this.chain[0]);
        console.log('Initialized new blockchain with genesis block');
      }
    } catch (error) {
      console.error('Failed to load blockchain from database:', error);
      throw error;
    }
  }

  private async saveBlockToDatabase(block: Block): Promise<void> {
    try {
      await this.dbService.saveBlock(block);
      await this.dbService.saveBlockchainMetadata({
        latestBlockHeight: this.getLatestBlock().height,
        chainLength: this.chain.length
      });
    } catch (error) {
      console.error('Failed to save block to database:', error);
      throw error;
    }
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  async addBlockToChain(block: Block): Promise<Block[]> {
    this.chain.push(block);
    await this.saveBlockToDatabase(block);
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

  async replaceChain(newBlockchain: Blockchain): Promise<boolean> {
    if (
      newBlockchain.chain.length <= this.chain.length ||
      !newBlockchain.isChainValid()
    ) {
      return false;
    }
    
    // Replace chain and save to database
    this.chain = newBlockchain.chain;
    
    try {
      // Clear existing data and save new chain
      await this.dbService.clearDatabase();
      
      // Save all blocks from new chain
      for (const block of this.chain) {
        await this.dbService.saveBlock(block);
      }
      
      await this.dbService.saveBlockchainMetadata({
        latestBlockHeight: this.getLatestBlock().height,
        chainLength: this.chain.length
      });
      
      console.log(`Replaced blockchain with ${this.chain.length} blocks`);
      return true;
    } catch (error) {
      console.error('Failed to replace blockchain in database:', error);
      throw error;
    }
  }

  async getBlockByHeight(height: number): Promise<Block | null> {
    // First check in-memory chain
    const block = this.chain.find(b => b.height === height);
    if (block) {
      return block;
    }
    
    // If not in memory, check database
    return await this.dbService.getBlock(height);
  }

  async getBlockByHash(hash: string): Promise<Block | null> {
    // First check in-memory chain
    const block = this.chain.find(b => b.hash === hash);
    if (block) {
      return block;
    }
    
    // If not in memory, check database
    return await this.dbService.getBlockByHash(hash);
  }

  async getDbStats(): Promise<any> {
    return await this.dbService.getDbStats();
  }

  async close(): Promise<void> {
    await this.dbService.close();
  }
}
