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

  describe('Creation', () => {
    test('Create blockchain successfully with all 4 properties', () => {
      expect(testCoin).toHaveProperty('chain');
      expect(testCoin).toHaveProperty('difficulty');
      expect(testCoin).toHaveProperty('pendingTransactions');
      expect(testCoin).toHaveProperty('miningReward');
    });
    test('Blockchain includes genesis block', () => {
      expect(testCoin.chain.length).toBe(1)
    });
  });

  describe('createGenesisBlock', () => {
    test('Creates correct block', () => {
      const expectedGenesisBlock = new Block("0000-01-01T00:00:00", "Genesis Block", 4, null, 0)
      expectedGenesisBlock.hash = expectedGenesisBlock.getProofOfWorkHash()
      const actualGenesisBlock = testCoin.createGenesisBlock()
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
    test('Throws error if toAddress or fromAddress are missing', () => {
      const newTransactionNoFromAddress = new Transaction(null, "to_address", 45)
      expect(() => testCoin.addTransaction(newTransactionNoFromAddress)).toThrow(Error)
      const newTransactionNoToAddress = new Transaction("from_address", null, 45)
      expect(() => testCoin.addTransaction(newTransactionNoFromAddress)).toThrow(Error)
    })

    test('Throws error if transaction is not valid', () => {
      const newTransaction = new Transaction(publicKey, "to_address", 45)
      expect(() => testCoin.addTransaction(newTransaction)).toThrow(Error)
    })
    test.todo('Throws error if fromAddress does not have enough money')
    
    // test('Otherwise adds transaction to blockchains pending transactions', () => {
    //   const testCoin = new Blockchain()
    //   const fundTransaction = new Transaction("annonymous_millionaire", publicKey, 45)
    //   let fundingBlock = new Block(Date.now(), [fundTransaction])
    //   fundingBlock.mineBlock(2)
    //   testCoin.chain.push(fundingBlock)
    //   const newTransaction = new Transaction(publicKey, "to_address", 45)
    //   newTransaction.signTransaction(key)
    //   testCoin.addTransaction(newTransaction)
    //   expect(testCoin.pendingTransactions[0]).toBe(newTransaction)
    // })
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