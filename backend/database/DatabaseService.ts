import { Level } from 'level';
import Block from '../blockchain/Block/Block';
import GenesisBlock from '../blockchain/Block/GenesisBlock';
import Transaction from '../blockchain/Transaction/Transaction';
import { plainToInstance, instanceToPlain, Type } from 'class-transformer';
import 'reflect-metadata';
import path from 'path';

interface BlockchainMetadata {
  latestBlockHeight: number;
  chainLength: number;
}

// Helper class for proper block deserialization
class BlockWrapper {
  @Type(() => Block, {
    discriminator: {
      property: "__type",
      subTypes: [
        { value: Block, name: "default" },
        { value: GenesisBlock, name: "GenesisBlock" },
      ],
    },
  })
  block!: Block;
}

class DatabaseService {
  private db: Level<string, string>;
  private isInitialized: boolean = false;

  constructor(dbPath: string = './blockchain-data') {
    // Create database in the specified path
    this.db = new Level(path.resolve(dbPath), {
      valueEncoding: 'json'
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.db.open();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.isInitialized) {
      await this.db.close();
      this.isInitialized = false;
    }
  }

  // Block storage methods
  async saveBlock(block: Block): Promise<void> {
    const blockKey = `block:${block.height}`;
    const hashKey = `hash:${block.hash}`;
    
    try {
      // Use class-transformer to serialize the block
      const serializedBlock = instanceToPlain(block);
      
      // Store block by height and create hash -> height mapping
      await this.db.batch()
        .put(blockKey, JSON.stringify(serializedBlock))
        .put(hashKey, block.height.toString())
        .write();
    } catch (error) {
      console.error(`Failed to save block ${block.height}:`, error);
      throw error;
    }
  }

  async getBlock(height: number): Promise<Block | null> {
    const blockKey = `block:${height}`;
    
    try {
      const blockData = await this.db.get(blockKey);
      const blockObj = JSON.parse(blockData);
      
      // Use wrapper class for proper discriminator handling
      const wrapper = plainToInstance(BlockWrapper, { block: blockObj });
      return wrapper.block || null;
    } catch (error: any) {
      if (error.code === 'LEVEL_NOT_FOUND') {
        return null;
      }
      console.error(`Failed to get block ${height}:`, error);
      throw error;
    }
  }

  async getBlockByHash(hash: string): Promise<Block | null> {
    try {
      const heightStr = await this.db.get(`hash:${hash}`);
      const height = parseInt(heightStr);
      return await this.getBlock(height);
    } catch (error: any) {
      if (error.code === 'LEVEL_NOT_FOUND') {
        return null;
      }
      console.error(`Failed to get block by hash ${hash}:`, error);
      throw error;
    }
  }

  async getAllBlocks(): Promise<Block[]> {
    const blocks: Block[] = [];
    
    try {
      // Iterate through all block keys
      for await (const [key, value] of this.db.iterator({ 
        gte: 'block:', 
        lt: 'block;\xff' 
      })) {
        const blockObj = JSON.parse(value);
        
        // Use wrapper class for proper discriminator handling
        const wrapper = plainToInstance(BlockWrapper, { block: blockObj });
        if (wrapper.block) {
          blocks.push(wrapper.block);
        }
      }
      
      // Sort by height to maintain order
      blocks.sort((a, b) => a.height - b.height);
      return blocks;
    } catch (error) {
      console.error('Failed to get all blocks:', error);
      throw error;
    }
  }

  // Blockchain metadata methods
  async saveBlockchainMetadata(metadata: BlockchainMetadata): Promise<void> {
    try {
      await this.db.put('metadata:blockchain', JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to save blockchain metadata:', error);
      throw error;
    }
  }

  async getBlockchainMetadata(): Promise<BlockchainMetadata | null> {
    try {
      const metadataStr = await this.db.get('metadata:blockchain');
      // Handle case where data might be undefined or empty
      if (!metadataStr || metadataStr === 'undefined') {
        return null;
      }
      return JSON.parse(metadataStr) as BlockchainMetadata;
    } catch (error: any) {
      if (error.code === 'LEVEL_NOT_FOUND') {
        return null;
      }
      console.error('Failed to get blockchain metadata:', error);
      throw error;
    }
  }

  // Mempool methods
  async savePendingTransactions(transactions: Transaction[]): Promise<void> {
    try {
      // Use class-transformer to serialize transactions
      const serializedTransactions = instanceToPlain(transactions);
      await this.db.put('mempool:pending', JSON.stringify(serializedTransactions));
    } catch (error) {
      console.error('Failed to save pending transactions:', error);
      throw error;
    }
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    try {
      const transactionsStr = await this.db.get('mempool:pending');
      // Handle case where data might be undefined or empty
      if (!transactionsStr || transactionsStr === 'undefined') {
        return [];
      }
      const transactionsObj = JSON.parse(transactionsStr);
      
      // Use class-transformer to deserialize back to Transaction instances
      if (Array.isArray(transactionsObj)) {
        return transactionsObj.map(tx => {
          const transaction = plainToInstance(Transaction, tx);
          // Handle case where plainToInstance returns an array
          return Array.isArray(transaction) ? transaction[0] : transaction;
        }).filter(Boolean) as Transaction[];
      } else {
        return [];
      }
    } catch (error: any) {
      if (error.code === 'LEVEL_NOT_FOUND') {
        return [];
      }
      console.error('Failed to get pending transactions:', error);
      throw error;
    }
  }

  async clearPendingTransactions(): Promise<void> {
    try {
      await this.db.del('mempool:pending');
    } catch (error: any) {
      if (error.code === 'LEVEL_NOT_FOUND') {
        return; // Already cleared
      }
      console.error('Failed to clear pending transactions:', error);
      throw error;
    }
  }

  // Utility methods
  async getDbStats(): Promise<any> {
    let blockCount = 0;
    let mempoolSize = 0;

    try {
      // Count blocks
      for await (const [key] of this.db.iterator({ 
        gte: 'block:', 
        lt: 'block;\xff' 
      })) {
        blockCount++;
      }

      // Get mempool size
      const pendingTxs = await this.getPendingTransactions();
      mempoolSize = pendingTxs.length;

      return {
        blockCount,
        mempoolSize,
        isInitialized: this.isInitialized
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      throw error;
    }
  }

  async clearDatabase(): Promise<void> {
    try {
      await this.db.clear();
      console.log('Database cleared successfully');
    } catch (error) {
      console.error('Failed to clear database:', error);
      throw error;
    }
  }
}

export default DatabaseService;