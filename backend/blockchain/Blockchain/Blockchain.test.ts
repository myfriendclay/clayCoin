import Blockchain from "./Blockchain";
import Transaction from "../Transaction/Transaction";
import Block from "../Block/Block";
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
  it('Creates blockchain successfully with properties', () => {
    expect(blockchain).toHaveProperty('chain');
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

describe('addBlockToChain', () => {
  it('adds block to chain', () => {
    expect(blockchain.chain).toHaveLength(1)
    blockchain.addBlockToChain('block1')
    blockchain.addBlockToChain('block2')
    expect(blockchain.chain).toHaveLength(3)
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

