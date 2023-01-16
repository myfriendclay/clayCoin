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

beforeEach(() => {

})

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
