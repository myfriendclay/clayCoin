import Blockchain from "./Blockchain";
import Transaction from "../Transaction/Transaction";
import Block from "../Block/Block";
import EC from "elliptic"
const ec = new EC.ec('secp256k1')

// Generate a new key pair and convert them to hex-strings
const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

const key2 = ec.genKeyPair();
const publicKey2 = key.getPublic('hex');
const privateKey2 = key.getPrivate('hex');

let newBlock
let testTransactions

let testCoin

beforeEach(() => {
  testCoin = new Blockchain()
});

describe('Blockchain class', () => {

  describe('Constructor', () => {
    it('Creates blockchain successfully with all 4 properties', () => {
      expect(testCoin).toHaveProperty('chain');
      expect(testCoin).toHaveProperty('difficulty');
      expect(testCoin).toHaveProperty('pendingTransactions');
      expect(testCoin).toHaveProperty('miningReward');
      expect(testCoin).toHaveProperty('nodes');
    });
    it('includes genesis block on blockchain', () => {
      expect(testCoin.chain.length).toBe(1)
    });
    test('includes valid genesis block', () => {
      const expectedGenesisBlock = new Block("Genesis Block", 4, null, 0)
      const actualGenesisBlock = testCoin.chain[0]
      //Need to make timestamps the same so hashes are the same
      expectedGenesisBlock.timestamp = actualGenesisBlock.timestamp
      expectedGenesisBlock.hash = expectedGenesisBlock.getProofOfWorkHash()
      expect(actualGenesisBlock).toEqual(expectedGenesisBlock)
    });
  });

  describe('createGenesisBlock', () => {
    test('Creates correct block', () => {
      const expectedGenesisBlock = new Block("Genesis Block", 4, null, 0)
      const actualGenesisBlock = testCoin.createGenesisBlock()
      //Need to make timestamps the same so hashes are the same
      expectedGenesisBlock.timestamp = actualGenesisBlock.timestamp
      expectedGenesisBlock.hash = expectedGenesisBlock.getProofOfWorkHash()
      expect(actualGenesisBlock).toEqual(expectedGenesisBlock)
    });
  });
  describe('getLatestBlock', () => {
    test('Successfully returns the latest block', () => {
      testCoin.chain.push('test_block_1')
      testCoin.chain.push('test_block_2')
      expect(testCoin.getLatestBlock()).toBe('test_block_2')
    })
  });

  describe('addTransaction', () => {

    test('Throws error if transaction is not valid', () => {
      const newTransaction = new Transaction("bogus_from_address", "bogus_to_address", 45, "pizza and beer")
      jest.spyOn(newTransaction, 'isValid').mockImplementation(() => false);
      expect(() => testCoin.addTransaction(newTransaction)).toThrow(Error)
    })

    test('Throws error if fromAddress does not have enough money', () => {
      jest.spyOn(testCoin, 'walletHasSufficientFunds').mockImplementation(() => false);
      expect(() => testCoin.addTransaction("fake")).toThrow(Error)
    })
    
    test('Adds to mempool if valid transaction and fromAddress wallet has sufficient funds', () => {
      const newTransaction = new Transaction("bogus_from_address", "bogus_to_address", 45, "pizza and beer")
      jest.spyOn(newTransaction, 'isValid').mockImplementation(() => true);
      jest.spyOn(testCoin, 'walletHasSufficientFunds').mockImplementation(() => true);
      testCoin.addTransaction(newTransaction)
      expect(testCoin.pendingTransactions[0]).toBe(newTransaction)
    })

  });

  describe('minePendingTransactions', () => {
    test('Block is mined successfully; pending transactions are added in a block', () => {
      const newTransaction = new Transaction(publicKey, "to_address", 45)
      testCoin.pendingTransactions.push(newTransaction)
      testCoin.minePendingTransactions("mining_address")
      expect(testCoin.chain[1].transactions[0]).toBe(newTransaction)
    })
   
    // test('Pending transactions is reset afterwards to only include mining reward with proper params', () => {
    //   const testCoin = new Blockchain()
    //   const fundTransaction = new Transaction("annonymous_millionaire", publicKey, 45)
    //   let fundingBlock = new Block(Date.now(), [fundTransaction])
    //   fundingBlock.mineBlock(2)
    //   testCoin.chain.push(fundingBlock)
    //   const newTransaction = new Transaction(publicKey, "to_address", 45)
    //   newTransaction.signTransaction(key)
    //   testCoin.addTransaction(newTransaction)
    //   testCoin.minePendingTransactions("mining_address")
    //   const miningTransaction = testCoin.pendingTransactions[0]
    //   expect(testCoin.pendingTransactions).toHaveLength(1)
    //   expect(miningTransaction.fromAddress).toBe(null)
    //   expect(miningTransaction.toAddress).toBe("mining_address")
    //   expect(miningTransaction.amount).toBe(testCoin.miningReward)
    // })
  });

  describe('getBalanceOfAddress', () => {
    test.todo('Returns null or error if address is not found')
    test('Returns correct balance', () => {
      const newTransaction1 = new Transaction(publicKey, publicKey2, 20)
      newTransaction1.signTransaction(key)
      const newTransaction2 = new Transaction(publicKey, publicKey2, 20)
      newTransaction2.signTransaction(key)
    })
  });
  describe('isChainValid', () => {
    test.todo('Returns false if there are any invalid transactions')
    test.todo('Returns false if any hash is not a valid hash')
    test.todo('Returns false if any previous hash does not match the current blocks previous hash')
    test.todo('should fail when a previous block hash has been changed')
    test.todo('should fail when a block has been changed e.g. timestamp')
    test.todo('should fail when genesis block has been tampered with')
    test.todo('Otherwise returns true if all valid transactions, each block with valid hash and each block hash pointing to the next chronologically with no breaks in the chain')
  });
});