import Blockchain from "../Blockchain/Blockchain";
import Transaction from "../Transaction/Transaction";
import {CoinbaseTransaction} from "../Transaction/Transaction"
import Block from "../Block/Block";
import { INITIAL_DIFFICULTY, TARGET_MINE_RATE_MS } from "../../config"
import Wallet from "../Wallet/Wallet";

let testCoin
let transaction

beforeEach(() => {
  testCoin = new Blockchain()
  transaction = jest.spyOn(Transaction,'constructor').mockReturnValue((
    {
      fromAddress: 'fromAddress',
      toAddress: 'toAddress',
      amount: 9,
      memo: 'pizza',
      fee: 1,
      uuid: 12345,
      timestamp: 1
    }
  ));


  jest.mock('../Block/Block', () => {
    return jest.fn().mockImplementation((transactions, previousHash, height, difficulty) => {
      return {
        transactions: transactions,
        previousHash: previousHash,
        height: height,
        difficulty: difficulty,
      }
    });
  });

  transaction.isValid = jest.fn();
});

describe('Constructor', () => {
  it('Creates blockchain successfully with all 5 properties', () => {
    expect(testCoin).toHaveProperty('chain');
    expect(testCoin).toHaveProperty('difficulty');
    expect(testCoin).toHaveProperty('pendingTransactions');
    expect(testCoin).toHaveProperty('blockSubsidy');
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
    transaction.isValid.mockReturnValue(false)
    expect(() => testCoin.addTransaction(transaction)).toThrow(Error)
  })

  test('Throws error if fromAddress does not have enough money', () => {
    jest.spyOn(Wallet, 'walletHasSufficientFunds').mockImplementation(() => false);
    expect(() => testCoin.addTransaction(transaction)).toThrow(Error)
  })

  test('Adds to mempool if valid transaction and fromAddress wallet has sufficient funds', () => {
    transaction.isValid.mockReturnValue(true)
    jest.spyOn(Wallet, 'walletHasSufficientFunds').mockImplementation(() => true);
    testCoin.addTransaction(transaction)
    expect(testCoin.pendingTransactions[0]).toBe(transaction)
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
    jest.spyOn(block1, 'isValid').mockImplementation(() => true);
    jest.spyOn(block2, 'isValid').mockImplementation(() => true);
    jest.spyOn(block3, 'isValid').mockImplementation(() => true);
    jest.spyOn(testCoin.chain[0], 'isValid').mockImplementation(() => true);
    jest.spyOn(Blockchain, 'areBlocksValidlyConnected').mockImplementation(() => true);
    testCoin.chain.push(block1, block2, block3)
  })

  it('Returns false if any two blocks are not validly connected', () => {
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(true)
    jest.spyOn(Blockchain, 'areBlocksValidlyConnected').mockImplementation(() => false);
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(false)
  })

  it('Returns false if any block is invalid', () => {
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(true)
    jest.spyOn(block2, 'isValid').mockImplementation(() => false);
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(false)
  })

  it('Returns false if genesis block is invalid', () => {
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(true)
    jest.spyOn(testCoin.chain[0], 'isValidGenesisBlock').mockImplementation(() => false);
    expect(Blockchain.isChainValid(testCoin.chain)).toBe(false)
  })
});

test.todo('areBlocksValidlyConnected')
test.todo('blocksHashesAreConnected')
test.todo('block2ComesAfterBlock1')
test.todo('difficultyJumpIsValid')
test.todo('block1HasPlausibleMiningDuration')

describe('addCoinbaseTxToMempool', () => {
  const minerAddress = "minerAddress"

  test('returns pending transactions of the blockchain', () => {
    const pendingTransactions = testCoin.addCoinbaseTxToMempool(minerAddress)
    expect(pendingTransactions).toBe(testCoin.pendingTransactions)
  })

  test("Adds new coinbase transaction to Blockchain's pending transactions", () => {
    testCoin.addCoinbaseTxToMempool(minerAddress)
    expect(testCoin.pendingTransactions[0]).toBeInstanceOf(CoinbaseTransaction)
  })
});

describe('getMiningReward', () => {
  it('Returns block subsidy + all transaction fees returned by getTotalTransactionFees', () => {
    const totalTxFees = 20
    jest.spyOn(testCoin, 'getTotalTransactionFees').mockImplementation(() => totalTxFees);
    const totalMiningReward = totalTxFees + testCoin.blockSubsidy
    expect(testCoin.getMiningReward()).toBe(totalMiningReward)
  })
})

describe('addPendingTransactionsToBlock', () => {

  test('adds pending transactions to block', () => {
    testCoin.pendingTransactions.push("tx1")
    testCoin.pendingTransactions.push("tx2")
    testCoin.addPendingTransactionsToBlock()
    const minedBlock = testCoin.addPendingTransactionsToBlock("mining_address")
    expect(minedBlock.transactions[minedBlock.transactions.length - 2]).toBe("tx1")
  })
});

describe('getTotalTransactionFees', () => {
  test('returns total amount of transaction fees in pending transactions', () => {
    let tx1 = new Transaction("randomAddress", "targetAddress", 100, "pizza", 1);
    let tx2 = new Transaction("targetAddress", "randomAddress", 10, 'pizza', 2);
    let tx3 = new Transaction("targetAddress", "randomAddress", 20, 'pizza', 3);
    let tx4 = new Transaction("targetAddress", "randomAddress", 30, 'pizza', 4);
    testCoin.pendingTransactions = [tx1, tx2, tx3, tx4]
    expect(testCoin.getTotalTransactionFees()).toBe(10)
  })

  test('returns 0 if no fees', () => {
    let tx1 = new Transaction("randomAddress", "targetAddress", 100);
    let tx2 = new Transaction("targetAddress", "randomAddress", 10, 'pizza', 0);

    testCoin.pendingTransactions = [tx1, tx2]
    expect(testCoin.getTotalTransactionFees()).toBe(0)
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

describe('getNewMiningDifficulty', () => {
  let block
  beforeEach(() => {
    block = new Block([], 4, '', 1)
    jest.spyOn(testCoin, 'getLatestBlock').mockImplementation(() => block);
  })

  it('it raises the difficulty for a quickly mined block', () => {
    block.miningDurationMs = TARGET_MINE_RATE_MS - 1
    expect(testCoin.getNewMiningDifficulty()).toBe(testCoin.difficulty + 1)
  })

  it('it lowers the difficulty for a quickly mined block', () => {
    block.miningDurationMs = TARGET_MINE_RATE_MS + 1
    expect(testCoin.getNewMiningDifficulty()).toBe(testCoin.difficulty - 1)
  })

  it('it never lowers before 1', () => {
    testCoin.difficulty = 1
    block.miningDurationMs = TARGET_MINE_RATE_MS + 1
    expect(testCoin.getNewMiningDifficulty()).toBe(1)
  })
})