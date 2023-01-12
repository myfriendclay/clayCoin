import Block from './Block.js'
import Transaction from './Transaction.js'
import Blockchain from './Blockchain.js';

import EC from "elliptic"
const ec = new EC.ec('secp256k1')

// Generate a new key pair and convert them to hex-strings
const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

const key2 = ec.genKeyPair();
const publicKey2 = key.getPublic('hex');
const privateKey2 = key.getPrivate('hex');

describe('Block class', () => {

  const test_transactions = [
    { amount: 10, fromAddress: "test_from_1", toAddress: "test_to_1" },
    { amount: 25, fromAddress: "test_from_2", toAddress: "test_to_2" },
  ]

  test('Created block contains all 5 properties', () => {
    const newBlock = new Block("01/5/2023", test_transactions, 4, 'test_prev_hash', 23)
    expect(newBlock).toHaveProperty('timestamp');
    expect(newBlock).toHaveProperty('transactions');
    expect(newBlock).toHaveProperty('previousHash');
    expect(newBlock).toHaveProperty('height');
    expect(newBlock).toHaveProperty('difficulty');
    expect(newBlock).toHaveProperty('hash');
    expect(newBlock).toHaveProperty('nonce');
  });
  
  test('Hash is calculated correctly', () => {
    const newBlock = new Block("01/5/2023", test_transactions, 4, 'test_prev_hash', 23)
    expect(newBlock.hash).toBe('3cb69bc3d3a225bec1b40c461dcd4c0abd73953e4ca06fdddfb4be2fb2de6148')
  });
  
  test('calculateHash updates hash when nonce is updated', () => {
    const newBlock = new Block("01/5/2023", test_transactions, 4, 'test_prev_hash', 23)
    expect(newBlock.calculateHash()).toBe('3cb69bc3d3a225bec1b40c461dcd4c0abd73953e4ca06fdddfb4be2fb2de6148')
    newBlock.nonce = 364245
    expect(newBlock.calculateHash()).toBe('a4068954ab7ee9727debdd8aff42253bc3d8411c05fa1921fada728abf90a0dd')
  });
  
  test('mineBlock function works', () => {

    const newBlock = new Block("01/5/2023", test_transactions, 4, 'test_prev_hash', 23)
    const { difficulty, hash } = newBlock
    const targetHash = "0".repeat(difficulty)
    let hashHeader = hash.substring(0, difficulty)
    expect(hashHeader).not.toBe(targetHash)
    newBlock.mineBlock(difficulty)
  
    hashHeader = newBlock.hash.substring(0, newBlock.difficulty)
    expect(hashHeader).toBe(targetHash)
  });
  test.todo('HasValidTransactions verifies returns false if one transaction is invalid')
  test.todo('HasValidTransactions verifies returns true only if all transactions are valid')

});

describe('Transaction class', () => {

  test('Able to create invalid/dummy Transaction with all 3 properties', () => {
    const newTransaction = new Transaction("bogus_from_address", "bogus_to_address", 45)
    expect(newTransaction).toHaveProperty('fromAddress');
    expect(newTransaction).toHaveProperty('toAddress');
    expect(newTransaction).toHaveProperty('amount');
  });

  describe('calculateHash', () => {
    test.todo('Returns a valid hash of transaction')
  });

  describe('signTransaction', () => {
    test('Throws error if not fromAddress signing', () => {
      const newTransaction = new Transaction("bogus_from_address", "to_address", 45)
      expect(() => newTransaction.signTransaction(key)).toThrow(Error)
    });

    test('Updates Transaction signature when signingKey matches fromAddress', () => {
      const newTransaction = new Transaction(publicKey, "bogus_to_address", 45)
      newTransaction.signTransaction(key)
      expect(newTransaction).toHaveProperty('signature')
    });

  });

  describe('isValid', () => {
    
    test('If fromAddress is "Coinbase Tx" then returns true (mining reward', () => {
      const newTransaction = new Transaction("Coinbase Tx", "to_address", 45)
      expect(newTransaction.isValid()).toBe(true)
    });

    test('Throws error if missing signature', () => {
      const newTransaction = new Transaction("from_address", "to_address", 45)
      expect(() => newTransaction.isValid()).toThrow(Error)
    });
    
    test('Returns false if signature doesnt match fromAddress public key', () => {
      const newTransaction = new Transaction(publicKey, "to_address", 45)
      const different_key = ec.genKeyPair();
      const transactionHash = newTransaction.calculateHash()
      const different_signature = different_key.sign(transactionHash, 'base64')
      newTransaction.signature = different_signature
      expect(newTransaction.isValid()).toBe(false)
    });

    test('Returns true if signature matches fromAddress public key', () => {
      const newTransaction = new Transaction(publicKey, "to_address", 45)
      newTransaction.signTransaction(key)
      expect(newTransaction.isValid()).toBe(true)
    });

  });
  
});

describe('Blockchain class', () => {

  describe('Creation', () => {

    test('Create blockchainj successfully with all 4 properties', () => {
      const testCoin = new Blockchain()
      expect(testCoin).toHaveProperty('chain');
      expect(testCoin).toHaveProperty('difficulty');
      expect(testCoin).toHaveProperty('pendingTransactions');
      expect(testCoin).toHaveProperty('miningReward');
    });
    test('Blockchain includes genesis block', () => {
      const testCoin = new Blockchain()
      expect(testCoin.chain.length).toBe(1)
    });
  });

  describe('createGenesisBlock', () => {
    test('Creates correct block', () => {
      const testCoin = new Blockchain()
      const expectedGenesisBlock = new Block("0000-01-01T00:00:00", "Genesis Block", 4, null, 0)
      expectedGenesisBlock.hash = expectedGenesisBlock.getProofOfWorkHash()
      const actualGenesisBlock = testCoin.createGenesisBlock()
      expect(actualGenesisBlock).toEqual(expectedGenesisBlock)
    });
  });
  describe('getLatestBlock', () => {
    test('Successfully returns the latest block', () => {
      const testCoin = new Blockchain()
      testCoin.chain.push('test_block_1')
      testCoin.chain.push('test_block_2')
      expect(testCoin.getLatestBlock()).toBe('test_block_2')
    })
  });

  describe('addTransaction', () => {
    test('Throws error if toAddress or fromAddress are missing', () => {
      const testCoin = new Blockchain()
      const newTransactionNoFromAddress = new Transaction(null, "to_address", 45)
      expect(() => testCoin.addTransaction(newTransactionNoFromAddress)).toThrow(Error)
      const newTransactionNoToAddress = new Transaction("from_address", null, 45)
      expect(() => testCoin.addTransaction(newTransactionNoFromAddress)).toThrow(Error)
    })

    test('Throws error if transaction is not valid', () => {
      const testCoin = new Blockchain()
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
      const testCoin = new Blockchain()
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
      const testCoin = new Blockchain()
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
    test.todo('Otherwise returns true if all valid transactions, each block with valid hash and each block hash pointing to the next chronologically with no breaks in the chain')
  });
});