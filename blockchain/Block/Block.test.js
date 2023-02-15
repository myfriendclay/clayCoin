import Block from './Block.ts'
import { GenesisBlock } from './Block'
import hexToBinary from "hex-to-binary"
import { GENESIS_BLOCK_DATA } from "../../config"
import * as getSHA256HashModule from "../../utils/crypto-hash";
import { CoinbaseTransaction } from '../Transaction/Transaction';

let newBlock
let testTransactions
let originalHash

beforeEach(() => {
  testTransactions = ["tx1", "tx2", "tx3"]
  newBlock = new Block(testTransactions, 4, 'test_prev_hash', 23)
  newBlock.timestamp = 1
});

describe('createBlock', () => {
  it('Created block contains all 7 properties', () => {
    expect(newBlock).toHaveProperty('timestamp');
    expect(newBlock).toHaveProperty('transactions');
    expect(newBlock).toHaveProperty('previousHash');
    expect(newBlock).toHaveProperty('height');
    expect(newBlock).toHaveProperty('difficulty');
    expect(newBlock).toHaveProperty('nonce');
  });

  it('Accurately sets all of the fields', () => {
    expect(newBlock.transactions).toBe(testTransactions);
    expect(newBlock.previousHash).toBe("test_prev_hash");
    expect(newBlock.height).toBe(23);
    expect(newBlock.difficulty).toBe(4);
    expect(newBlock.nonce).toBe(0);
  });

  it('Automatically creates a timestamp', () => {
    const timestampBlock = new Block(testTransactions, 4, 'test_prev_hash', 23)
    const minTime = Date.now() - 10
    const maxTime = Date.now() + 10
    expect(timestampBlock.timestamp).toBeGreaterThanOrEqual(minTime);
    expect(timestampBlock.timestamp).toBeLessThanOrEqual(maxTime);
  });
})

describe('mineBlock', () => {

  it('updates first d number of characters of BINARY hash to 0 (where d = difficulty)', () => {
    const { difficulty } = newBlock
    const targetHash = "0".repeat(difficulty)
    newBlock.mineBlock(difficulty)
    const hashHeader = hexToBinary(newBlock.hash).substring(0, difficulty)
    expect(hashHeader).toBe(targetHash)
  });

  it('sets hash to return value of getProofOfWork', () => {
    expect(newBlock.hash).toBeUndefined()
    const proofOfWork = "myProofOfWork"
    jest.spyOn(newBlock, 'getProofOfWorkHash').mockReturnValueOnce(proofOfWork)
    newBlock.mineBlock()
    expect(newBlock.hash).toBe(proofOfWork)
  });

  it('updates first d number of characters of BINARY hash when d changes', () => {
    newBlock.difficulty = 3
    const targetHash = "0".repeat(newBlock.difficulty)
    newBlock.mineBlock(newBlock.difficulty)
    const hashHeader = hexToBinary(newBlock.hash).substring(0, newBlock.difficulty)
    expect(hashHeader).toBe(targetHash)
  });

  it('does not change the contents of the block besides nonce', () => {
    const originalBlock = {... newBlock}
    newBlock.mineBlock(originalBlock.difficulty)
    expect(originalBlock.timestamp).toBe(newBlock.timestamp)
    expect(originalBlock.transactions).toBe(newBlock.transactions)
    expect(originalBlock.previousHash).toBe(newBlock.previousHash)
    expect(originalBlock.height).toBe(newBlock.height)
    expect(originalBlock.difficulty).toBe(newBlock.difficulty)
    expect(originalBlock.nonce).not.toBe(newBlock.nonce)
  })

  it('sets miningTime to time it took to mine block', () => {
    //Need to set difficulty to something decently high so duration isn't 0
    newBlock.difficulty = 15
    const before = Date.now()
    newBlock.mineBlock()
    const after = Date.now()
    const duration = after - before
    expect(newBlock.miningDurationMs).toBe(duration)
  });
})

describe('getProofOfWorkHash', () => {
  it('returns hash where first d (difficulty) number of characters is 0', () => {
    const { difficulty } = newBlock
    const proofOfWork = newBlock.getProofOfWorkHash()
    const proofOfWorkHeader = hexToBinary(proofOfWork).substring(0, difficulty)
    const targetHashHeader = "0".repeat(difficulty)
    expect(proofOfWorkHeader).toBe(targetHashHeader)
  });

  it('Calls on calculateHash n times (n = nonce)', () => {
    const spyCalculateHash = jest.spyOn(newBlock, 'calculateHash')
    newBlock.getProofOfWorkHash()
    expect(spyCalculateHash.mock.calls.length).toBe(newBlock.nonce)
  });

  it('Returns a valid hash', () => {
    const block = new Block(testTransactions, 4, 'testPrevHash', 23)
    block.timestamp = 3
    const proofOfWorkHash = block.getProofOfWorkHash()
    expect(proofOfWorkHash).toBe("0083712d90c62878b7d305b648d558f9a715b34f3926b2ec59645e7a694427c3")
  });
})

describe('calculateHash', () => {

  beforeEach(() => {
    newBlock.timestamp = 1
    originalHash = newBlock.calculateHash()
  });

  it('updates hash when timestamp is updated', () => {
    newBlock.timestamp = "newTamperedTimestamp"
    expect(newBlock.calculateHash()).not.toBe(originalHash)
  });

  it('updates hash when transactions is updated', () => {
    newBlock.transactions = ["newBogusTransaction1", "newbogusTransaction2"]
    expect(newBlock.calculateHash()).not.toBe(originalHash)
  });

  it('updates hash when previousHash is updated', () => {
    newBlock.previousHash = "bogusPrevHash"
    expect(newBlock.calculateHash()).not.toBe(originalHash)
  });

  it('updates hash when height is updated', () => {
    newBlock.height = 9999999999999
    expect(newBlock.calculateHash()).not.toBe(originalHash)
  });

  it('updates hash when difficulty is updated', () => {
    newBlock.difficulty = 666
    expect(newBlock.calculateHash()).not.toBe(originalHash)
  });
  
  it('updates hash when nonce is updated', () => {
    newBlock.nonce = 666
    expect(newBlock.calculateHash()).not.toBe(originalHash)
  });

  it('return results of getSHA256Hash helper with all block properties passed in', () => {
    const mockedReturnValue = "exampleHash"
    const { timestamp, transactions, previousHash, height, difficulty, nonce } = newBlock
    jest.spyOn(getSHA256HashModule, 'default').mockReturnValueOnce(mockedReturnValue)
    expect(newBlock.calculateHash()).toBe(mockedReturnValue)
    expect(getSHA256HashModule.default).toHaveBeenCalledWith(timestamp, transactions, previousHash, height, difficulty, nonce)
  });

})

describe('hasValidTransactions', () => {

  let transactions
  beforeEach(() => {
    transactions = [
      { isValid: jest.fn().mockReturnValue(true) },
      { isValid: jest.fn().mockReturnValue(true) },
      { isValid: jest.fn().mockReturnValue(true) },
    ];
    newBlock.transactions = transactions
  });

  it('hasValidTransactions verifies returns false if one transaction is invalid', () => {
    transactions[1].isValid.mockImplementation(() => false);
    expect(newBlock.hasValidTransactions()).toBe(false)
  })
  
  it('hasValidTransactions returns true only if all transactions are valid', () => {
    expect(newBlock.hasValidTransactions()).toBe(true)
  })
})

describe('hasValidHash', () => {
  const mockHash = "mockHash"

  beforeEach(() => {
    jest.spyOn(newBlock, 'calculateHash').mockImplementation(() => mockHash);
  });

  it('returns false if block hash is different than return value of calculateHash', () => {
    newBlock.hash = mockHash
    expect(newBlock.hasValidHash()).toBe(true)
  })
  
  it('returns true if block hash is same as return value of calculateHash', () => {
    newBlock.hash = mockHash + "extra"
    expect(newBlock.hasValidHash()).toBe(false)
  })
})

describe('firstDCharsAreZero', () => {
  it('returns true if first d (difficulty) chars are 0', () => {
    newBlock.hash = "0".repeat(newBlock.difficulty) + "blahblah"
    expect(newBlock.firstDCharsAreZero()).toBe(true)
  })
  test.todo('returns false first d (difficulty) chars are not 0')

})

describe('hasProofOfWork', () => {

  beforeEach(() => {
    jest.spyOn(newBlock, 'hasValidHash').mockImplementation(() => true);
    jest.spyOn(newBlock, 'firstDCharsAreZero').mockImplementation(() => true);
  })

  it('returns true if hash is valid and first d (difficulty) characters are zero', () => {
    expect(newBlock.hasProofOfWork()).toBe(true)
  })
  
  it('returns false if hash is invalid', () => {
    jest.spyOn(newBlock, 'hasValidHash').mockImplementation(() => false);
    expect(newBlock.hasProofOfWork()).toBe(false)
  })

  it('returns false if hash does not contain first d (difficulty) characters of zero', () => {
    jest.spyOn(newBlock, 'firstDCharsAreZero').mockImplementation(() => false);
    expect(newBlock.hasProofOfWork()).toBe(false)
  })
})

describe('hasOnlyOneCoinbaseTx', () => {
  let coinbaseTx
  beforeEach(() => {
    coinbaseTx = Object.create(CoinbaseTransaction.prototype, {
      miningRewardAddress: { value: 'mock-address' },
      miningReward: { value: 10 },
    });
    newBlock.transactions.push(coinbaseTx)
  })

  it("returns true if block has one coinbase Tx", () => {
    expect(newBlock.hasOnlyOneCoinbaseTx()).toBe(true)
  })

  it("returns false if block has 0 coinbase Tx", () => {
    newBlock.transactions.pop()
    expect(newBlock.hasOnlyOneCoinbaseTx()).toBe(false)
  })

  it("returns false if block has 2 or more coinbase Txs", () => {
    newBlock.transactions.push(coinbaseTx)
    expect(newBlock.hasOnlyOneCoinbaseTx()).toBe(false)
  })
})

describe('isValid', () => {

  beforeEach(() => {
    jest.spyOn(newBlock, 'hasValidTransactions').mockImplementation(() => true);
    jest.spyOn(newBlock, 'hasProofOfWork').mockImplementation(() => true);
    jest.spyOn(newBlock, 'hasOnlyOneCoinbaseTx').mockImplementation(() => true);
  })

  it("returns true if all transactions are valid and has proof of work", () => {
    expect(newBlock.isValid()).toBe(true)
  })

  it("returns false if all transactions aren't valid", () => {
    jest.spyOn(newBlock, 'hasValidTransactions').mockImplementation(() => false);
    expect(newBlock.isValid()).toBe(false)
  })

  it("returns false if doesn't have proof of work", () => {
    jest.spyOn(newBlock, 'hasProofOfWork').mockImplementation(() => false);
    expect(newBlock.isValid()).toBe(false)
  })

  it("returns false if has more than one coinbase Tx", () => {
    jest.spyOn(newBlock, 'hasOnlyOneCoinbaseTx').mockImplementation(() => false);
    expect(newBlock.isValid()).toBe(false)
  })

})

describe('GenesisBlock', () => {

  let genesisBlock
  beforeEach(() => {
    genesisBlock = new GenesisBlock()
  })

  describe('Constructor', () => {
    test('Creates a block', () => {
      expect(genesisBlock).toBeInstanceOf(Block)
    });

    test('Transactions match genesis config', () => {
      expect(genesisBlock.transactions).toBe(GENESIS_BLOCK_DATA.transactions)
    });
    test('Difficulty match genesis config', () => {
      expect(genesisBlock.difficulty).toBe(GENESIS_BLOCK_DATA.difficulty)
    });
    test('previousHash is null', () => {
      expect(genesisBlock.previousHash).toBe(null)
    });

    test('height is 0', () => {
      expect(genesisBlock.height).toBe(0)
    });

    it('Automatically creates a timestamp', () => {
      const minTime = Date.now() - 100
      const maxTime = Date.now() + 100
      expect(genesisBlock.timestamp).toBeGreaterThanOrEqual(minTime);
      expect(genesisBlock.timestamp).toBeLessThanOrEqual(maxTime);
    });
  });

  describe('isValid()', () => {

    it('Returns false if Genesis block has non zero height', () => {
      genesisBlock.height = 1
      expect(genesisBlock.isValid()).toBe(false)
    })
  
    it('Returns false if Genesis block has previous hash thats not null', () => {
      genesisBlock.previousHash = "someOtherHash"
      expect(genesisBlock.isValid()).toBe(false)
    })

    it('Returns false if doesnt have proof of work hash', () => {
      jest.spyOn(genesisBlock, 'hasProofOfWork').mockImplementation(() => false);
      expect(genesisBlock.isValid()).toBe(false)
    })
  
    it('Returns true otherwise', () => {
      expect(genesisBlock.isValid()).toBe(true)
    })
  
  });
});

