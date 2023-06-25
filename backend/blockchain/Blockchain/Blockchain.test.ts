import Blockchain from "./Blockchain";
import Transaction from "../Transaction/Transaction";
import CoinbaseTransaction from "../Transaction/CoinbaseTransaction";
import Block from "../Block/Block";
import { INITIAL_DIFFICULTY, TARGET_MINE_RATE_MS } from '../utils/config';
import Wallet from "../Wallet/Wallet";
import GenesisBlock from "../Block/GenesisBlock";

let blockchain: Blockchain

let transaction: Transaction

beforeEach(() => {
  blockchain = new Blockchain()
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
    expect(blockchain).toHaveProperty('chain');
    expect(blockchain).toHaveProperty('difficulty');
    expect(blockchain).toHaveProperty('pendingTransactions');
    expect(blockchain).toHaveProperty('blockSubsidy');
  });
  it('Has only one block on the chain (genesis block)', () => {
    expect(blockchain.chain.length).toBe(1)
  });
  it('Has GenesisBlock as first block', () => {
    expect(blockchain.chain[0]).toBeInstanceOf(GenesisBlock)
  });
  it('Has a valid GenesisBlock as first block', () => {
    expect(blockchain.chain[0].isValid()).toBe(true)
  });
});

describe('getLatestBlock', () => {
  it('Successfully returns the latest block', () => {
    const block = new Block([], 3, "prevHash", 1);
    blockchain.chain.push(block)
    expect(blockchain.getLatestBlock()).toBe(block)
  })
});

describe('addTransaction', () => {

  beforeEach(() => {
    jest.spyOn(transaction, 'isValid').mockImplementation(() => true);
    jest.spyOn(Wallet, 'walletHasSufficientFunds').mockImplementation(() => true);
  })

  it('Throws error if transaction is not valid', () => {
    jest.spyOn(transaction, 'isValid').mockImplementation(() => false);
    expect(() => blockchain.addTransaction(transaction)).toThrow(Error)
    expect(() => blockchain.addTransaction(transaction)).toThrow("Cannot add invalid transaction to chain")
  })

  it('Throws error if fromAddress does not have enough money', () => {
    jest.spyOn(Wallet, 'walletHasSufficientFunds').mockImplementation(() => false);
    expect(() => blockchain.addTransaction(transaction)).toThrow(Error)
    expect(() => blockchain.addTransaction(transaction)).toThrow("not enough funds for transactions in mempool or this transaction itself")
  })

  it('Adds to mempool if valid transaction and fromAddress wallet has sufficient funds', () => {
    blockchain.addTransaction(transaction)
    expect(blockchain.pendingTransactions[0]).toBe(transaction)
  })

});

describe('isChainValid', () => {

  let block1
  let block2
  let block3

  beforeEach(() => {
    block1 = new Block(["tx1", "tx2"], 2, blockchain.chain[0].hash, 1)
    block1.hash = "block1Hash"
    block2 = new Block(["tx1", "tx2"], 2, block1.hash, 1)
    block2.hash = "block2Hash"
    block3 = new Block(["tx1", "tx2"], 2, block2.hash, 1)
    jest.spyOn(block1, 'isValid').mockImplementation(() => true);
    jest.spyOn(block2, 'isValid').mockImplementation(() => true);
    jest.spyOn(block3, 'isValid').mockImplementation(() => true);
    jest.spyOn(blockchain.chain[0], 'isValid').mockImplementation(() => true);
    jest.spyOn(Block, 'areBlocksValidlyConnected').mockImplementation(() => true);
    blockchain.chain.push(block1, block2, block3)
  })

  it('Returns false if any two blocks are not validly connected', () => {
    expect(blockchain.isChainValid(blockchain.chain)).toBe(true)
    jest.spyOn(Block, 'areBlocksValidlyConnected').mockImplementation(() => false);
    expect(blockchain.isChainValid(blockchain.chain)).toBe(false)
  })

  it('Returns false if any block is invalid', () => {
    expect(blockchain.isChainValid(blockchain.chain)).toBe(true)
    jest.spyOn(block2, 'isValid').mockImplementation(() => false);
    expect(blockchain.isChainValid(blockchain.chain)).toBe(false)
  })

  it('Returns false if genesis block is invalid', () => {
    expect(blockchain.isChainValid(blockchain.chain)).toBe(true)
    jest.spyOn(blockchain.chain[0], 'isValid').mockImplementation(() => false);
    expect(blockchain.isChainValid(blockchain.chain)).toBe(false)
  })
});


describe('addCoinbaseTxToMempool', () => {
  const minerAddress = "minerAddress"

  test('returns pending transactions of the blockchain', () => {
    const pendingTransactions = blockchain.addCoinbaseTxToMempool(minerAddress)
    expect(pendingTransactions).toBe(blockchain.pendingTransactions)
  })

  test("Adds new coinbase transaction to Blockchain's pending transactions", () => {
    blockchain.addCoinbaseTxToMempool(minerAddress)
    expect(blockchain.pendingTransactions[0]).toBeInstanceOf(CoinbaseTransaction)
  })
});

describe('getMiningReward', () => {
  it('Returns block subsidy + all transaction fees returned by getTotalTransactionFees', () => {
    const totalTxFees = 20
    jest.spyOn(blockchain, 'getTotalTransactionFees').mockImplementation(() => totalTxFees);
    const totalMiningReward = totalTxFees + blockchain.blockSubsidy
    expect(blockchain.getMiningReward()).toBe(totalMiningReward)
  })
})

describe('addPendingTransactionsToBlock', () => {

  test('adds pending transactions to block', () => {
    blockchain.pendingTransactions.push("tx1")
    blockchain.pendingTransactions.push("tx2")
    blockchain.addPendingTransactionsToBlock()
    const minedBlock = blockchain.addPendingTransactionsToBlock("mining_address")
    expect(minedBlock.transactions[minedBlock.transactions.length - 2]).toBe("tx1")
  })
});

describe('getTotalTransactionFees', () => {
  test('returns total amount of transaction fees in pending transactions', () => {
    let tx1 = new Transaction("randomAddress", "targetAddress", 100, "pizza", 1);
    let tx2 = new Transaction("targetAddress", "randomAddress", 10, 'pizza', 2);
    let tx3 = new Transaction("targetAddress", "randomAddress", 20, 'pizza', 3);
    let tx4 = new Transaction("targetAddress", "randomAddress", 30, 'pizza', 4);
    blockchain.pendingTransactions = [tx1, tx2, tx3, tx4]
    expect(blockchain.getTotalTransactionFees()).toBe(10)
  })

  test('returns 0 if no fees', () => {
    let tx1 = new Transaction("randomAddress", "targetAddress", 100);
    let tx2 = new Transaction("targetAddress", "randomAddress", 10, 'pizza', 0);

    blockchain.pendingTransactions = [tx1, tx2]
    expect(blockchain.getTotalTransactionFees()).toBe(0)
  })

});

describe('minePendingTransactions', () => {

  test('Calls addCoinbaseTxToMempool method', () => {
    const miningRewardAddress = "123"
    blockchain.addCoinbaseTxToMempool = jest.fn()
    blockchain.minePendingTransactions(miningRewardAddress)
    expect(blockchain.addCoinbaseTxToMempool).toHaveBeenCalledWith(miningRewardAddress)
  })

  test('Calls addPendingTransactionsToBlock', () => {
    const mockAddPendingTransactionsToBlock = jest.spyOn(blockchain, "addPendingTransactionsToBlock")
    blockchain.minePendingTransactions("123")
    expect(mockAddPendingTransactionsToBlock).toHaveBeenCalled()
  })

  it('Calls addBlockToChain with block', () => {
    const miningRewardAddress = "123"
    const block = new Block([], INITIAL_DIFFICULTY, "hash", 2)
    jest.spyOn(blockchain, 'addPendingTransactionsToBlock').mockImplementation(() => block);
    blockchain.addBlockToChain = jest.fn()
    blockchain.minePendingTransactions(miningRewardAddress)
    expect(blockchain.addBlockToChain).toHaveBeenCalledWith(block)
  })

  it('Calls mineBlock', () => {
    const miningRewardAddress = "123"
    const block = new Block([], INITIAL_DIFFICULTY, "hash", 2)
    jest.spyOn(blockchain, 'addPendingTransactionsToBlock').mockImplementation(() => block);
    const mockMineBlock = jest.spyOn(block, 'mineBlock').mockImplementation();
    blockchain.minePendingTransactions(miningRewardAddress)
    expect(mockMineBlock).toHaveBeenCalled()
  })

  it('Calls resetMempool', () => {
    blockchain.resetMempool = jest.fn()
    blockchain.minePendingTransactions("123")
    expect(blockchain.resetMempool).toHaveBeenCalled()
  })

  it('Returns the block', () => {
    const miningRewardAddress = "123"
    const returnValue = blockchain.minePendingTransactions(miningRewardAddress)
    expect(returnValue).toBe(blockchain.chain[blockchain.chain.length - 1])
  })

  test('Block has proof of work', () => {
    blockchain.minePendingTransactions("mining_address")
    expect(blockchain.chain[blockchain.chain.length - 1].hasProofOfWork()).toBe(true)
  })

});

describe('addBlockToChain', () => {
  it('adds block to chain', () => {
    expect(blockchain.chain).toHaveLength(1)
    blockchain.addBlockToChain('block1')
    blockchain.addBlockToChain('block2')
    expect(blockchain.chain).toHaveLength(3)
  })
});

describe('resetMempool', () => {
  it('resets the array to empty', () => {
    blockchain.pendingTransactions.push("tx1")
    blockchain.pendingTransactions.push("tx2")
    expect(blockchain.pendingTransactions).toHaveLength(2)
    blockchain.resetMempool()
    expect(blockchain.pendingTransactions).toHaveLength(0)
  })
});

describe('replaceChain', () => {
  let newBlockchain

  beforeEach(() => {
    newBlockchain = new Blockchain()
  });

  describe('when the new chain is not longer', () => {
    it('does not replace the chain', () => {
      jest.spyOn(newBlockchain, 'isChainValid').mockImplementation(() => true);

      expect(blockchain.replaceChain(newBlockchain)).toBe(false)
    })

    it('returns false', () => {
      const originalChain = blockchain.chain
      blockchain.replaceChain(newBlockchain)
      expect(blockchain.chain).toBe(originalChain)
    })
  })

  describe('when the chain is longer', () => {
    describe('and the chain is invalid', () => {
      beforeEach(() => {
        newBlockchain.chain.push("invalidBlock")
      });

      it('returns false', () => {
        jest.spyOn(newBlockchain, 'isChainValid').mockImplementation(() => false);
        blockchain.replaceChain(newBlockchain)
        expect(blockchain.replaceChain(newBlockchain)).toBe(false)
      })

      it('does not replace chain', () => {
        const originalChain = blockchain.chain
        jest.spyOn(newBlockchain, 'isChainValid').mockImplementation(() => false);
        blockchain.replaceChain(newBlockchain)
        expect(blockchain.chain).toBe(originalChain)
      })
    })

    describe('and the chain is valid', () => {
      it('replaces the chain', () => {
        newBlockchain.chain.push("block")
        jest.spyOn(newBlockchain, 'isChainValid').mockImplementation(() => true);
        blockchain.replaceChain(newBlockchain)
        expect(blockchain.chain).toBe(newBlockchain.chain)
      })
    })
  })
})

describe('getNewMiningDifficulty', () => {
  let block
  beforeEach(() => {
    block = new Block([], 4, '', 1)
    jest.spyOn(blockchain, 'getLatestBlock').mockImplementation(() => block);
  })

  it('it raises the difficulty for a quickly mined block', () => {
    block.miningDurationMs = TARGET_MINE_RATE_MS - 1
    expect(blockchain.getNewMiningDifficulty()).toBe(blockchain.difficulty + 1)
  })

  it('it lowers the difficulty for a quickly mined block', () => {
    block.miningDurationMs = TARGET_MINE_RATE_MS + 1
    expect(blockchain.getNewMiningDifficulty()).toBe(blockchain.difficulty - 1)
  })

  it('it never lowers before 1', () => {
    blockchain.difficulty = 1
    block.miningDurationMs = TARGET_MINE_RATE_MS + 1
    expect(blockchain.getNewMiningDifficulty()).toBe(1)
  })
})