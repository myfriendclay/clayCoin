import Block from './Block.ts'
import { GenesisBlock } from './Block'
import hexToBinary from "hex-to-binary"
import { GENESIS_BLOCK_DATA } from "../../config"

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

describe('calculateHash', () => {

  beforeEach(() => {
    newBlock.timestamp = 1
    originalHash = newBlock.calculateHash()
  });

  it('returns correct SHA256 hash', () => {
    expect(newBlock.calculateHash()).toBe("6b30524c359e1259e8d3c3b066f8832bca6543607f71f45260b802a31a23b46d")
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
})

describe('mineBlock', () => {

  it('updates first d number of characters of BINARY hash to 0 (where d = difficulty)', () => {
    const { difficulty } = newBlock
    const targetHash = "0".repeat(difficulty)
    newBlock.mineBlock(difficulty)
    const hashHeader = hexToBinary(newBlock.hash).substring(0, difficulty)
    expect(hashHeader).toBe(targetHash)
  });

  it('produces valid hash', () => {
    newBlock.mineBlock(4)
    expect(newBlock.hash).toBe("0d66103da789a884f9105911d0f927b52dd6c220e757492baa498c0e7509275f")
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
})

describe('getProofOfWorkHash', () => {
  it('returns valid hash first d number of characters of 0 (where d = difficulty)', () => {
    const { difficulty } = newBlock
    const proofOfWork = newBlock.getProofOfWorkHash()
    const proofOfWorkHeader = hexToBinary(proofOfWork).substring(0, difficulty)
    const targetHashHeader = "0".repeat(difficulty)
    expect(proofOfWorkHeader).toBe(targetHashHeader)
    expect(proofOfWork).toBe("0d66103da789a884f9105911d0f927b52dd6c220e757492baa498c0e7509275f")
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

  test.todo('Block should only contain one mining reward Tx')
})

describe('hasValidHash', () => {

  beforeEach(() => {
    //set to valid SHA256 hash:
    newBlock.hash = "6b30524c359e1259e8d3c3b066f8832bca6543607f71f45260b802a31a23b46d"
  });

  it('returns true if hash is valid', () => {
    expect(newBlock.hasValidHash()).toBe(true)
  })
  
  it('returns true if hash is invalid', () => {
    newBlock.hash = "falsec70c3f454e745fb06cc7d6dc374506df2e6ff3c334ecf4d359129c6549f"
    expect(newBlock.hasValidHash()).toBe(false)
  })

  it('returns false if timestamp is tampered with', () => {
    newBlock.timestamp = "newTamperedTimestamp"
    expect(newBlock.hasValidHash()).toBe(false)
  });

  it('returns false if transactions are tampered with', () => {
    newBlock.timestamp = ["newBogusTransaction1", "newbogusTransaction2"]
    expect(newBlock.hasValidHash()).toBe(false)
  });

  it('returns false if previous hash is tampered with', () => {
    newBlock.previousHash = "newTamperedPrevHash"
    expect(newBlock.hasValidHash()).toBe(false)
  });

  it('returns false if block height is tampered with', () => {
    newBlock.height = 999999
    expect(newBlock.hasValidHash()).toBe(false)
  });

  it('returns false if difficulty is tampered with', () => {
    newBlock.difficulty = 666
    expect(newBlock.hasValidHash()).toBe(false)
  });
  
  it('returns false if nonce is tampered with', () => {
    newBlock.nonce = 666
    expect(newBlock.hasValidHash()).toBe(false)
  });
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

describe('isValid', () => {

  beforeEach(() => {
    jest.spyOn(newBlock, 'hasValidTransactions').mockImplementation(() => true);
    jest.spyOn(newBlock, 'hasProofOfWork').mockImplementation(() => true);
    jest.spyOn(newBlock, 'hasOnlyOneCoinbaseTx').mockImplementation(() => true);
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

  it("returns true if all transactions are valid and has proof of work", () => {
    expect(newBlock.isValid()).toBe(true)
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

