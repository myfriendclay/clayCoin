import DatabaseService from './DatabaseService';
import Block from '../blockchain/Block/Block';
import Transaction from '../blockchain/Transaction/Transaction';
import path from 'path';
import fs from 'fs';

// Define custom error type for database errors
interface DatabaseError extends Error {
  code?: string;
}

// Mock the Level database
jest.mock('level');

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  let testDbPath: string;
  let mockDb: any;
  let mockBatch: any;

  beforeEach(() => {
    // Create a unique test database path
    testDbPath = path.join(__dirname, 'test-db-' + Date.now());
    
    // Setup mock database and batch operations
    mockBatch = {
      put: jest.fn().mockReturnThis(),
      write: jest.fn().mockResolvedValue(undefined),
    };

    mockDb = {
      open: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      put: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      batch: jest.fn().mockReturnValue(mockBatch),
      iterator: jest.fn(),
      clear: jest.fn().mockResolvedValue(undefined),
    };

    // Mock Level constructor
    const { Level } = require('level');
    Level.mockImplementation(() => mockDb);

    databaseService = new DatabaseService(testDbPath);
  });

  afterEach(async () => {
    await databaseService.close();
    
    // Clean up test database directory if it exists
    if (fs.existsSync(testDbPath)) {
      fs.rmSync(testDbPath, { recursive: true, force: true });
    }
    
    jest.clearAllMocks();
  });

  describe('Initialization and Lifecycle', () => {
    it('should initialize the database successfully', async () => {
      await databaseService.initialize();
      
      expect(mockDb.open).toHaveBeenCalledTimes(1);
    });

    it('should not initialize twice', async () => {
      await databaseService.initialize();
      await databaseService.initialize();
      
      expect(mockDb.open).toHaveBeenCalledTimes(1);
    });

    it('should throw error if initialization fails', async () => {
      const error = new Error('Database initialization failed');
      mockDb.open.mockRejectedValueOnce(error);
      
      await expect(databaseService.initialize()).rejects.toThrow('Database initialization failed');
    });

    it('should close the database', async () => {
      await databaseService.initialize();
      await databaseService.close();
      
      expect(mockDb.close).toHaveBeenCalledTimes(1);
    });

    it('should not error when closing an uninitialized database', async () => {
      await expect(databaseService.close()).resolves.not.toThrow();
      expect(mockDb.close).not.toHaveBeenCalled();
    });
  });

  describe('Block Storage Operations', () => {
    let testBlock: Block;
    let testTransaction: Transaction;

    beforeEach(() => {
      testTransaction = new Transaction(
        'fromAddress',
        'toAddress',
        100,
        'test memo'
      );
      testBlock = new Block([testTransaction], 2, 'previousHash', 1);
      testBlock.hash = 'testHash123';
    });

    it('should save a block successfully', async () => {
      await databaseService.saveBlock(testBlock);

      expect(mockBatch.put).toHaveBeenCalledWith(
        'block:1',
        expect.any(String)
      );
      expect(mockBatch.put).toHaveBeenCalledWith(
        'hash:testHash123',
        '1'
      );
      expect(mockBatch.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when saving block fails', async () => {
      const error = new Error('Save failed');
      mockBatch.write.mockRejectedValueOnce(error);

      await expect(databaseService.saveBlock(testBlock)).rejects.toThrow('Save failed');
    });

    it('should retrieve a block by height', async () => {
      const blockData = JSON.stringify({
        transactions: [testTransaction],
        difficulty: 2,
        previousHash: 'previousHash',
        height: 1,
        hash: 'testHash123',
        __type: 'default'
      });
      
      mockDb.get.mockResolvedValueOnce(blockData);

      const result = await databaseService.getBlock(1);

      expect(mockDb.get).toHaveBeenCalledWith('block:1');
      expect(result).toBeInstanceOf(Block);
      expect(result?.height).toBe(1);
    });

    it('should return null when block not found', async () => {
      const error = new Error('Not found') as DatabaseError;
      error.code = 'LEVEL_NOT_FOUND';
      mockDb.get.mockRejectedValueOnce(error);

      const result = await databaseService.getBlock(99);

      expect(result).toBeNull();
    });

    it('should throw error for other database errors when getting block', async () => {
      const error = new Error('Database error');
      mockDb.get.mockRejectedValueOnce(error);

      await expect(databaseService.getBlock(1)).rejects.toThrow('Database error');
    });

    it('should retrieve a block by hash', async () => {
      const blockData = JSON.stringify({
        transactions: [testTransaction],
        difficulty: 2,
        previousHash: 'previousHash',
        height: 1,
        hash: 'testHash123',
        __type: 'default'
      });
      
      mockDb.get
        .mockResolvedValueOnce('1') // height lookup
        .mockResolvedValueOnce(blockData); // block data

      const result = await databaseService.getBlockByHash('testHash123');

      expect(mockDb.get).toHaveBeenCalledWith('hash:testHash123');
      expect(mockDb.get).toHaveBeenCalledWith('block:1');
      expect(result).toBeInstanceOf(Block);
    });

    it('should return null when block hash not found', async () => {
      const error = new Error('Not found') as DatabaseError;
      error.code = 'LEVEL_NOT_FOUND';
      mockDb.get.mockRejectedValueOnce(error);

      const result = await databaseService.getBlockByHash('nonexistent');

      expect(result).toBeNull();
    });

    it('should retrieve all blocks', async () => {
      const block1Data = JSON.stringify({
        transactions: [testTransaction],
        difficulty: 2,
        previousHash: null,
        height: 0,
        hash: 'hash1',
        __type: 'GenesisBlock'
      });

      const block2Data = JSON.stringify({
        transactions: [testTransaction],
        difficulty: 2,
        previousHash: 'hash1',
        height: 1,
        hash: 'hash2',
        __type: 'default'
      });

      const mockIterator = [
        ['block:0', block1Data],
        ['block:1', block2Data]
      ];

      mockDb.iterator.mockReturnValueOnce({
        [Symbol.asyncIterator]() {
          let index = 0;
          return {
            async next() {
              if (index < mockIterator.length) {
                return { value: mockIterator[index++], done: false };
              }
              return { done: true };
            }
          };
        }
      });

      const result = await databaseService.getAllBlocks();

      expect(result).toHaveLength(2);
      expect(result[0].height).toBe(0);
      expect(result[1].height).toBe(1);
    });

    it('should handle GenesisBlock deserialization correctly', async () => {
      const genesisData = JSON.stringify({
        transactions: [],
        difficulty: 1,
        previousHash: null,
        height: 0,
        hash: 'genesisHash',
        __type: 'GenesisBlock'
      });

      mockDb.get.mockResolvedValueOnce(genesisData);

      const result = await databaseService.getBlock(0);

      expect(result).toBeInstanceOf(Block);
      expect(result?.height).toBe(0);
    });
  });

  describe('Blockchain Metadata Operations', () => {
    const testMetadata = {
      latestBlockHeight: 5,
      chainLength: 6
    };

    it('should save blockchain metadata', async () => {
      await databaseService.saveBlockchainMetadata(testMetadata);

      expect(mockDb.put).toHaveBeenCalledWith(
        'metadata:blockchain',
        JSON.stringify(testMetadata)
      );
    });

    it('should throw error when saving metadata fails', async () => {
      const error = new Error('Save metadata failed');
      mockDb.put.mockRejectedValueOnce(error);

      await expect(databaseService.saveBlockchainMetadata(testMetadata))
        .rejects.toThrow('Save metadata failed');
    });

    it('should retrieve blockchain metadata', async () => {
      mockDb.get.mockResolvedValueOnce(JSON.stringify(testMetadata));

      const result = await databaseService.getBlockchainMetadata();

      expect(mockDb.get).toHaveBeenCalledWith('metadata:blockchain');
      expect(result).toEqual(testMetadata);
    });

    it('should return null when metadata not found', async () => {
      const error = new Error('Not found') as DatabaseError;
      error.code = 'LEVEL_NOT_FOUND';
      mockDb.get.mockRejectedValueOnce(error);

      const result = await databaseService.getBlockchainMetadata();

      expect(result).toBeNull();
    });

    it('should return null when metadata is undefined string', async () => {
      mockDb.get.mockResolvedValueOnce('undefined');

      const result = await databaseService.getBlockchainMetadata();

      expect(result).toBeNull();
    });

    it('should throw error for other database errors when getting metadata', async () => {
      const error = new Error('Database error');
      mockDb.get.mockRejectedValueOnce(error);

      await expect(databaseService.getBlockchainMetadata())
        .rejects.toThrow('Database error');
    });
  });

  describe('Mempool Operations', () => {
    let testTransactions: Transaction[];

    beforeEach(() => {
      testTransactions = [
        new Transaction('from1', 'to1', 100, 'memo1'),
        new Transaction('from2', 'to2', 200, 'memo2')
      ];
    });

    it('should save pending transactions', async () => {
      await databaseService.savePendingTransactions(testTransactions);

      expect(mockDb.put).toHaveBeenCalledWith(
        'mempool:pending',
        expect.any(String)
      );
    });

    it('should throw error when saving pending transactions fails', async () => {
      const error = new Error('Save transactions failed');
      mockDb.put.mockRejectedValueOnce(error);

      await expect(databaseService.savePendingTransactions(testTransactions))
        .rejects.toThrow('Save transactions failed');
    });

    it('should retrieve pending transactions', async () => {
      const transactionsData = JSON.stringify([
        {
          fromAddress: 'from1',
          toAddress: 'to1',
          amount: 100,
          memo: 'memo1',
          fee: 0,
          __type: 'default'
        }
      ]);

      mockDb.get.mockResolvedValueOnce(transactionsData);

      const result = await databaseService.getPendingTransactions();

      expect(mockDb.get).toHaveBeenCalledWith('mempool:pending');
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Transaction);
    });

    it('should return empty array when no pending transactions found', async () => {
      const error = new Error('Not found') as DatabaseError;
      error.code = 'LEVEL_NOT_FOUND';
      mockDb.get.mockRejectedValueOnce(error);

      const result = await databaseService.getPendingTransactions();

      expect(result).toEqual([]);
    });

    it('should return empty array when pending transactions data is undefined', async () => {
      mockDb.get.mockResolvedValueOnce('undefined');

      const result = await databaseService.getPendingTransactions();

      expect(result).toEqual([]);
    });

    it('should return empty array when pending transactions data is not an array', async () => {
      mockDb.get.mockResolvedValueOnce('{}');

      const result = await databaseService.getPendingTransactions();

      expect(result).toEqual([]);
    });

    it('should throw error for other database errors when getting pending transactions', async () => {
      const error = new Error('Database error');
      mockDb.get.mockRejectedValueOnce(error);

      await expect(databaseService.getPendingTransactions())
        .rejects.toThrow('Database error');
    });

    it('should clear pending transactions', async () => {
      await databaseService.clearPendingTransactions();

      expect(mockDb.del).toHaveBeenCalledWith('mempool:pending');
    });

    it('should not error when clearing non-existent pending transactions', async () => {
      const error = new Error('Not found') as DatabaseError;
      error.code = 'LEVEL_NOT_FOUND';
      mockDb.del.mockRejectedValueOnce(error);

      await expect(databaseService.clearPendingTransactions()).resolves.not.toThrow();
    });

    it('should throw error for other database errors when clearing pending transactions', async () => {
      const error = new Error('Database error');
      mockDb.del.mockRejectedValueOnce(error);

      await expect(databaseService.clearPendingTransactions())
        .rejects.toThrow('Database error');
    });
  });

  describe('Utility Operations', () => {
    it('should get database statistics', async () => {
      // Mock block iterator
      const mockBlockIterator = [
        ['block:0', 'data1'],
        ['block:1', 'data2']
      ];

      mockDb.iterator.mockReturnValueOnce({
        [Symbol.asyncIterator]() {
          let index = 0;
          return {
            async next() {
              if (index < mockBlockIterator.length) {
                return { value: mockBlockIterator[index++], done: false };
              }
              return { done: true };
            }
          };
        }
      });

      // Mock pending transactions
      mockDb.get.mockResolvedValueOnce(JSON.stringify([
        { fromAddress: 'from1', toAddress: 'to1', amount: 100 }
      ]));

      await databaseService.initialize();
      const stats = await databaseService.getDbStats();

      expect(stats).toEqual({
        blockCount: 2,
        mempoolSize: 1,
        isInitialized: true
      });
    });

    it('should throw error when getting database stats fails', async () => {
      const error = new Error('Stats error');
      mockDb.iterator.mockImplementationOnce(() => {
        throw error;
      });

      await expect(databaseService.getDbStats()).rejects.toThrow('Stats error');
    });

    it('should clear the database', async () => {
      await databaseService.clearDatabase();

      expect(mockDb.clear).toHaveBeenCalledTimes(1);
    });

    it('should throw error when clearing database fails', async () => {
      const error = new Error('Clear failed');
      mockDb.clear.mockRejectedValueOnce(error);

      await expect(databaseService.clearDatabase()).rejects.toThrow('Clear failed');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON in block data', async () => {
      mockDb.get.mockResolvedValueOnce('invalid json');

      await expect(databaseService.getBlock(1)).rejects.toThrow();
    });

    it('should handle malformed JSON in metadata', async () => {
      mockDb.get.mockResolvedValueOnce('invalid json');

      await expect(databaseService.getBlockchainMetadata()).rejects.toThrow();
    });

    it('should handle malformed JSON in pending transactions', async () => {
      mockDb.get.mockResolvedValueOnce('invalid json');

      await expect(databaseService.getPendingTransactions()).rejects.toThrow();
    });

    it('should handle empty transaction arrays in pending transactions', async () => {
      mockDb.get.mockResolvedValueOnce('[]');

      const result = await databaseService.getPendingTransactions();

      expect(result).toEqual([]);
    });

    it('should create database with custom path', () => {
      const customPath = './custom-db-path';
      const customDbService = new DatabaseService(customPath);

      expect(customDbService).toBeInstanceOf(DatabaseService);
    });

    it('should create database with default path when none provided', () => {
      const defaultDbService = new DatabaseService();

      expect(defaultDbService).toBeInstanceOf(DatabaseService);
    });
  });
}); 