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
    jest.fn(newTransaction, 'isValid').mockImplementation(() => false);
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

describe('addCoinbaseTxToMempool', () => {

  test('adds Coinbase Tx to pending transactions', () => {
    testCoin.addCoinbaseTxToMempool("minerAddress")
    const coinbaseTx = new Transaction("Coinbase Tx", "minerAddress", testCoin.miningReward, "Mining reward transaction")
    //Need to set UUID
    testCoin.pendingTransactions[0].uuid = coinbaseTx.uuid
    expect(testCoin.pendingTransactions[0]).toEqual(coinbaseTx)
  })

});

describe('addPendingTransactionsToBlock', () => {

  test('adds pending transactions to block', () => {
    testCoin.pendingTransactions.push("tx1")
    testCoin.pendingTransactions.push("tx2")
    testCoin.addPendingTransactionsToBlock()
    const minedBlock = testCoin.addPendingTransactionsToBlock("mining_address")
    expect(minedBlock.transactions[minedBlock.transactions.length - 2]).toBe("tx1")
  })

});

describe('minePendingTransactions', () => {

  test('Calls addCoinbaseTxToMempool method', () => {
    const miningRewardAddress = "123"
    testCoin.addCoinbaseTxToMempool = jest.fn()
    testCoin.minePendingTransactions(miningRewardAddress)
    expect(testCoin.addCoinbaseTxToMempool).toHaveBeenCalledWith(miningRewardAddress)
  })

  test('Calls addPendingTransactionsToBlock', () => {
    const mockAddPendingTransactionsToBlock = jest.spyOn(testCoin, "addPendingTransactionsToBlock")
    testCoin.minePendingTransactions("123")
    expect(mockAddPendingTransactionsToBlock).toHaveBeenCalled()
  })

  test.todo('Calls mineBlock')

  test('Block has proof of work', () => {
    const minedBlock = testCoin.minePendingTransactions("mining_address")
    expect(minedBlock.hasProofOfWork()).toBe(true)
  })

});

describe('addBlockToChain', () => {
  it('adds block to chain', () => {
    expect(testCoin.chain).toHaveLength(1)
    testCoin.addBlockToChain('block1')
    testCoin.addBlockToChain('block2')
    expect(testCoin.chain).toHaveLength(3)
  })
});

describe('resetMempool', () => {
  it('resets the array to empty', () => {
    testCoin.pendingTransactions.push("tx1")
    testCoin.pendingTransactions.push("tx2")
    expect(testCoin.pendingTransactions).toHaveLength(2)
    testCoin.resetMempool()
    expect(testCoin.pendingTransactions).toHaveLength(0)
  })
});

describe('addPendingTransactionsToBlockchain', () => {

  it('Calls minePendingTransactions with miningRewardAddress', () => {
    const miningRewardAddress = "123"
    testCoin.minePendingTransactions = jest.fn()
    testCoin.addPendingTransactionsToBlockchain(miningRewardAddress)
    expect(testCoin.minePendingTransactions).toHaveBeenCalledWith(miningRewardAddress)
  })

  it('Calls addBlockToChain with block', () => {
    const miningRewardAddress = "123"
    jest.spyOn(testCoin, 'minePendingTransactions').mockImplementation(() => "blockExample");
    testCoin.addBlockToChain = jest.fn()
    testCoin.addPendingTransactionsToBlockchain(miningRewardAddress)
    expect(testCoin.addBlockToChain).toHaveBeenCalledWith("blockExample")
  })

  it('Calls resetMempool', () => {
    testCoin.resetMempool = jest.fn()
    testCoin.addPendingTransactionsToBlockchain("123")
    expect(testCoin.resetMempool).toHaveBeenCalled()
  })
});

describe('getBalanceOfAddress', () => {

  test('Returns null if address is not found', () => {
    expect(testCoin.getBalanceOfAddress("nonExistentAddress")).toBe(null)
  })

  test('Returns correct balance if positive', () => {
    let tx1 = new Transaction("randomAddress", "targetAddress", 100);
    let tx2 = new Transaction("targetAddress", "randomAddress", 10);
    let tx3 = new Transaction("targetAddress", "randomAddress", 20);
    let tx4 = new Transaction("randomAddress", "targetAddress", 5);
    testCoin.pendingTransactions.push(tx1, tx2, tx3, tx4)
    testCoin.addPendingTransactionsToBlockchain("miningAddress")
    expect(testCoin.getBalanceOfAddress("targetAddress")).toBe(75)
  })

  test('Returns correct balance if negative', () => {
    let tx1 = new Transaction("randomAddress", "targetAddress", 100);
    let tx2 = new Transaction("targetAddress", "randomAddress", 1000);
    let tx3 = new Transaction("targetAddress", "randomAddress", 20);
    let tx4 = new Transaction("randomAddress", "targetAddress", 5);
    testCoin.pendingTransactions.push(tx1, tx2, tx3, tx4)
    testCoin.addPendingTransactionsToBlockchain("miningAddress")
    expect(testCoin.getBalanceOfAddress("targetAddress")).toBe(-915)
  })

  test('Returns correct balance if zero', () => {
    let tx1 = new Transaction("randomAddress", "targetAddress", 100);
    let tx2 = new Transaction("targetAddress", "randomAddress", 200);
    let tx3 = new Transaction("targetAddress", "randomAddress", 300);
    let tx4 = new Transaction("randomAddress", "targetAddress", 400);
    testCoin.pendingTransactions.push(tx1, tx2, tx3, tx4)
    testCoin.addPendingTransactionsToBlockchain("miningAddress")
    expect(testCoin.getBalanceOfAddress("targetAddress")).toBe(0)
  })

  test('Returns correct balance if no transactions', () => {
    testCoin.addPendingTransactionsToBlockchain("miningAddress")
    expect(testCoin.getBalanceOfAddress("targetAddress")).toBe(null)
  })
});

describe('hasValidGenesisBlock', () => {
  let expectedBlock
  beforeEach(() => {
    expectedBlock = new Block("Genesis Block", 4, null, 0)
    expectedBlock.hash = expectedBlock.getProofOfWorkHash()
    testCoin.chain = [expectedBlock]
  })

  it('Returns false is GenesisBlock is invalid block', () => {
    expectedBlock.hash = "bogusHash"
    expect(testCoin.hasValidGenesisBlock()).toBe(false)
  })

  it('Returns false if GenesisBlock has different transactions', () => {
    expectedBlock.transactions = "differentTransactions"
    expect(testCoin.hasValidGenesisBlock()).toBe(false)
  })

  it('Returns false if Genesis block has non zero height', () => {
    expectedBlock.height = 1
    expect(testCoin.hasValidGenesisBlock()).toBe(false)
  })

  it('Returns false if Genesis block has previous hash thats not null', () => {
    expectedBlock.previousHash = "someOtherHash"
    expect(testCoin.hasValidGenesisBlock()).toBe(false)
  })

  it('Returns true if Genesis block is the same', () => {
    jest.spyOn(testCoin, 'createGenesisBlock').mockImplementation(() => expectedBlock);
    expect(testCoin.hasValidGenesisBlock()).toBe(true)
  })

});

describe('isChainValid', () => {

  let block1
  let block2
  let block3

  beforeEach(() => {
    block1 = new Block(["tx1", "tx2"], 2, testCoin.chain[0].hash, 1)
    block1.hash = "block1Hash"
    block2 = new Block(["tx1", "tx2"], 2, block1.hash, 1)
    block2.hash = "block2Hash"
    block3 = new Block(["tx1", "tx2"], 2, block2.hash, 1)
    jest.spyOn(block1, 'isValidBlock').mockImplementation(() => true);
    jest.spyOn(block2, 'isValidBlock').mockImplementation(() => true);
    jest.spyOn(block3, 'isValidBlock').mockImplementation(() => true);
    jest.spyOn(testCoin, 'hasValidGenesisBlock').mockImplementation(() => true);
    testCoin.chain.push(block1, block2, block3)
  })

  it('Returns false if any previous hash does not match the current blocks previous hash', () => {
    block2.hash = "bogus"
    expect(testCoin.isChainValid()).toBe(false)
  })

  it('Returns false if any (nonGenesis) block is invalid', () => {
    jest.spyOn(block2, 'isValidBlock').mockImplementation(() => false);
    expect(testCoin.isChainValid()).toBe(false)
  })
  it('Returns false if genesis block is invalid', () => {
    jest.spyOn(testCoin, 'hasValidGenesisBlock').mockImplementation(() => false);
    expect(testCoin.isChainValid()).toBe(false)
  })
  it('Returns true if all blocks are valid (or genesis) and each block connects', () => {
    expect(testCoin.isChainValid()).toBe(true)
  })
});
