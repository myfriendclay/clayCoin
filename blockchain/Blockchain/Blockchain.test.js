import Blockchain from "../Blockchain/Blockchain";
import Transaction from "../Transaction/Transaction";
import Block from "../Block/Block";
import EC from "elliptic"
import { INITIAL_DIFFICULTY } from "../../config"

const ec = new EC.ec('secp256k1')

const key = ec.genKeyPair();
let testCoin

beforeEach(() => {
  testCoin = new Blockchain()
});

describe('Constructor', () => {
  it('Creates blockchain successfully with all 5 properties', () => {
    expect(testCoin).toHaveProperty('chain');
    expect(testCoin).toHaveProperty('difficulty');
    expect(testCoin).toHaveProperty('pendingTransactions');
    expect(testCoin).toHaveProperty('miningReward');
  });
  it('includes genesis block on blockchain', () => {
    expect(testCoin.chain.length).toBe(1)
  });
  test('First block on chain is valid genesis block', () => {
    expect(testCoin.chain[0].isValidGenesisBlock()).toBe(true)
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
    jest.spyOn(testCoin.chain[0], 'isValidGenesisBlock').mockImplementation(() => true);
    testCoin.chain.push(block1, block2, block3)
  })

  it('Returns false if any previous hash does not match the current blocks previous hash', () => {
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(true)
    block2.hash = "bogus"
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(false)
  })

  it('Returns false if any (nonGenesis) block is invalid', () => {
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(true)
    jest.spyOn(block2, 'isValidBlock').mockImplementation(() => false);
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(false)
  })
  it('Returns false if genesis block is invalid', () => {
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(true)
    jest.spyOn(testCoin.chain[0], 'isValidGenesisBlock').mockImplementation(() => false);
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(false)
  })
  it('Returns false if there is a negative jump in difficulty between blocks more than 1', () => {
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(true)
    block2.difficulty = 10
    block3.difficulty = 8
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(false)
  })
  it('Returns true if all blocks are valid (or genesis) and each block connects', () => {
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(true)
  })
});

describe('getBalanceOfAddress', () => {

  test('Returns null if address is not found', () => {
    expect(testCoin.getBalanceOfAddress("nonExistentAddress")).toBe(null)
  })

  test('Subtracts fees from fromAddress', () => {
    let tx1 = new Transaction("targetAddress", "randomAddress", 5, 'pizza', 20);
    let tx2 = new Transaction("targetAddress", "randomAddress", 10, 'pizza', 25);
    testCoin.pendingTransactions.push(tx1, tx2)
    testCoin.minePendingTransactions("miningAddress")
    expect(testCoin.getBalanceOfAddress("targetAddress")).toBe(-60)
  })

  test('Returns correct balance if positive', () => {
    let tx1 = new Transaction("randomAddress", "targetAddress", 100);
    let tx2 = new Transaction("targetAddress", "randomAddress", 10);
    let tx3 = new Transaction("targetAddress", "randomAddress", 20);
    let tx4 = new Transaction("randomAddress", "targetAddress", 5);
    let tx5 = new Transaction("targetAddress", "randomAddress", 10, 'test', 30);
    testCoin.pendingTransactions.push(tx1, tx2, tx3, tx4, tx5)
    testCoin.minePendingTransactions("miningAddress")
    expect(testCoin.getBalanceOfAddress("targetAddress")).toBe(35)
  })

  test('Returns correct balance if negative', () => {
    let tx1 = new Transaction("randomAddress", "targetAddress", 100);
    let tx2 = new Transaction("targetAddress", "randomAddress", 100);
    let tx3 = new Transaction("targetAddress", "randomAddress", 20);
    let tx4 = new Transaction("randomAddress", "targetAddress", 5);
    let tx5 = new Transaction("targetAddress", "randomAddress", 10, 'test', 10);
    testCoin.pendingTransactions.push(tx1, tx2, tx3, tx4, tx5)
    testCoin.minePendingTransactions("miningAddress")
    expect(testCoin.getBalanceOfAddress("targetAddress")).toBe(-35)
  })

  test('Returns correct balance if zero', () => {
    let tx1 = new Transaction("randomAddress", "targetAddress", 100);
    let tx2 = new Transaction("targetAddress", "randomAddress", 200);
    let tx3 = new Transaction("targetAddress", "randomAddress", 100);
    let tx4 = new Transaction("randomAddress", "targetAddress", 400);
    let tx5 = new Transaction("targetAddress", "randomAddress", 150, 'pizza', 50);
    testCoin.pendingTransactions.push(tx1, tx2, tx3, tx4, tx5)
    testCoin.minePendingTransactions("miningAddress")
    expect(testCoin.getBalanceOfAddress("targetAddress")).toBe(0)
  })

  test('Returns correct balance if no transactions', () => {
    testCoin.minePendingTransactions("miningAddress")
    expect(testCoin.getBalanceOfAddress("targetAddress")).toBe(null)
  })
});

describe('getTotalPendingOwedByWallet', () => {
  it('returns total wallet owes for all pending transactions including fees', () => {
    let tx1 = new Transaction("randomAddress", "targetAddress", 100);
    let tx2 = new Transaction("targetAddress", "randomAddress", 10);
    let tx3 = new Transaction("targetAddress", "randomAddress", 20);
    let tx4 = new Transaction("targetAddress", "randomAddress", 30, 'pizza', 5);
    testCoin.pendingTransactions.push(tx1, tx2, tx3, tx4)
    expect(testCoin.getTotalPendingOwedByWallet("targetAddress")).toBe(65)
  })
});

describe('walletHasSufficientFunds', () => {
  it('returns false if transaction amount is more than wallet balance', () => {
    const transaction = new Transaction("fromAddress", "toAddress", 10);
    jest.spyOn(testCoin, 'getBalanceOfAddress').mockImplementation(() => 9);
    expect(testCoin.walletHasSufficientFunds(transaction)).toBe(false)
  })
  it('returns false if total pending owed is more than wallet balance', () => {
    const transaction = new Transaction("fromAddress", "toAddress", 0);
    jest.spyOn(testCoin, 'getBalanceOfAddress').mockImplementation(() => 10);
    jest.spyOn(testCoin, 'getTotalPendingOwedByWallet').mockImplementation(() => 11);
    expect(testCoin.walletHasSufficientFunds(transaction)).toBe(false)
  })
  it('returns false if total pending owed plus transaction is more than wallet balance', () => {
    const transaction = new Transaction("fromAddress", "toAddress", 10);
    jest.spyOn(testCoin, 'getTotalPendingOwedByWallet').mockImplementation(() => 11);
    jest.spyOn(testCoin, 'getBalanceOfAddress').mockImplementation(() => 20);
    expect(testCoin.walletHasSufficientFunds(transaction)).toBe(false)
  })
  it('returns true if wallet balance is more than total pending plus transaction amount', () => {
    const transaction = new Transaction("fromAddress", "toAddress", 10);
    jest.spyOn(testCoin, 'getTotalPendingOwedByWallet').mockImplementation(() => 10);
    jest.spyOn(testCoin, 'getBalanceOfAddress').mockImplementation(() => 20);
    expect(testCoin.walletHasSufficientFunds(transaction)).toBe(true)
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

  it('Calls addBlockToChain with block', () => {
    const miningRewardAddress = "123"
    const block = new Block([], INITIAL_DIFFICULTY, "hash", 2)
    jest.spyOn(testCoin, 'addPendingTransactionsToBlock').mockImplementation(() => block);
    testCoin.addBlockToChain = jest.fn()
    testCoin.minePendingTransactions(miningRewardAddress)
    expect(testCoin.addBlockToChain).toHaveBeenCalledWith(block)
  })

  it('Calls resetMempool', () => {
    testCoin.resetMempool = jest.fn()
    testCoin.minePendingTransactions("123")
    expect(testCoin.resetMempool).toHaveBeenCalled()
  })

  it('Returns the block', () => {
    const miningRewardAddress = "123"
    const returnValue = testCoin.minePendingTransactions(miningRewardAddress)
    expect(returnValue).toBe(testCoin.chain[testCoin.chain.length - 1])
  })

  test.todo('Calls mineBlock')
  test('Block has proof of work', () => {
    testCoin.minePendingTransactions("mining_address")
    expect(testCoin.chain[testCoin.chain.length - 1].hasProofOfWork()).toBe(true)
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


describe('resetMempool', () => {
  it('resets the array to empty', () => {
    testCoin.pendingTransactions.push("tx1")
    testCoin.pendingTransactions.push("tx2")
    expect(testCoin.pendingTransactions).toHaveLength(2)
    testCoin.resetMempool()
    expect(testCoin.pendingTransactions).toHaveLength(0)
  })
});

describe('replaceChain', () => {
  let newBlockchain

  beforeEach(() => {
    newBlockchain = new Blockchain()
  });

  describe('when the new chain is not longer', () => {
    it('does not replace the chain', () => {
      expect(testCoin.replaceChain(newBlockchain)).toBe(false)
    })

    it('returns false', () => {
      const originalChain = testCoin.chain
      testCoin.replaceChain(newBlockchain)
      expect(testCoin.chain).toBe(originalChain)
    })
  })

  describe('when the chain is longer', () => {
    describe('and the chain is invalid', () => {
      beforeEach(() => {
        newBlockchain.chain.push("invalidBlock")
      });

      it('returns false', () => {
        jest.spyOn(Blockchain, 'isChainValid').mockImplementation(() => false);
        testCoin.replaceChain(newBlockchain)
        expect(testCoin.replaceChain(newBlockchain)).toBe(false)
      })

      it('does not replace chain', () => {
        const originalChain = testCoin.chain
        jest.spyOn(Blockchain, 'isChainValid').mockImplementation(() => false);
        testCoin.replaceChain(newBlockchain)
        expect(testCoin.chain).toBe(originalChain)
      })
    })

    describe('and the chain is valid', () => {
      it('replaces the chain', () => {
        newBlockchain.chain.push("block")
        jest.spyOn(Blockchain, 'isChainValid').mockImplementation(() => true);
        testCoin.replaceChain(newBlockchain)
        expect(testCoin.chain).toBe(newBlockchain.chain)
      })
    })
  })
})

describe('adjustDifficulty', () => { 
  test.todo('it raises the difficulty for a quickly mined block')
  test.todo('it lowers the difficulty for a quickly mined block')
  test.todo('it never lowers before 1')
})