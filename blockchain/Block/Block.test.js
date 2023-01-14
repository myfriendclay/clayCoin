import Block from './Block.js'
import Transaction from '../Transaction/Transaction'

let newBlock
let testTransactions
let originalHash

beforeEach(() => {
  testTransactions = [
    { amount: 10, fromAddress: "test_from_1", toAddress: "test_to_1" },
    { amount: 25, fromAddress: "test_from_2", toAddress: "test_to_2" },
  ]
  newBlock = new Block("01/5/2023", testTransactions, 4, 'test_prev_hash', 23)
});

describe('createBlock', () => {
  it('Created block contains all 7 properties', () => {
    expect(newBlock).toHaveProperty('timestamp');
    expect(newBlock).toHaveProperty('transactions');
    expect(newBlock).toHaveProperty('previousHash');
    expect(newBlock).toHaveProperty('height');
    expect(newBlock).toHaveProperty('difficulty');
    expect(newBlock).toHaveProperty('hash');
    expect(newBlock).toHaveProperty('nonce');
  });

  it('Accurately sets all of the fields', () => {
    expect(newBlock.timestamp).toBe('01/5/2023');
    expect(newBlock.transactions).toBe(testTransactions);
    expect(newBlock.previousHash).toBe("test_prev_hash");
    expect(newBlock.height).toBe(23);
    expect(newBlock.difficulty).toBe(4);
    expect(newBlock.nonce).toBe(0);
  });

  it('Automatically creates a timestamp', () => {
    // const minTime = Date.now() - 10
    // const maxTime = Date.now() + 10
    // expect(newBlock.timestamp).toBeGreaterThanOrEqual(minTime);
    // expect(newBlock.timestamp).toBeLessThanOrEqual(maxTime);
  });

  it('Block hash is calculated correctly', () => {
    expect(newBlock.hash).toBe('a25f306ba4b41715239c855b821b349d04eba5137345c071385a36e119343ac8')
  });
})

describe('calculateHash', () => {
  beforeEach(() => {
    originalHash = newBlock.calculateHash()
  });

  it('returns correct SHA256 hash', () => {
    expect(newBlock.calculateHash()).toBe("a25f306ba4b41715239c855b821b349d04eba5137345c071385a36e119343ac8")
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
  it('updates first d number of characters of hash to 0 (where d = difficulty)', () => {
    const { difficulty } = newBlock
    const targetHash = "0".repeat(difficulty)
    let hashHeader = newBlock.hash.substring(0, difficulty)
    expect(hashHeader).not.toBe(targetHash)
    newBlock.mineBlock(difficulty)
    hashHeader = newBlock.hash.substring(0, difficulty)
    expect(hashHeader).toBe(targetHash)
  });

  it('produces valid hash', () => {
    newBlock.mineBlock(4)
    expect(newBlock.hash).toBe("000062c6a9eee8ba674551d798fe337b27fc91457121aa99a94e3b6ee14362c1")
  });
  
  it('updates first d number of characters when d changes', () => {
    newBlock.difficulty = 3
    const targetHash = "0".repeat(newBlock.difficulty)
    let hashHeader = newBlock.hash.substring(0, newBlock.difficulty)
    expect(hashHeader).not.toBe(targetHash)
    newBlock.mineBlock(newBlock.difficulty)
    hashHeader = newBlock.hash.substring(0, newBlock.difficulty)
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
    const { difficulty, hash } = newBlock
    const proofOfWork = newBlock.getProofOfWorkHash()
    const proofOfWorkHeader = proofOfWork.substring(0, difficulty)
    const targetHashHeader = "0".repeat(difficulty)
    expect(proofOfWorkHeader).toBe(targetHashHeader)
    expect(proofOfWork).toBe("000062c6a9eee8ba674551d798fe337b27fc91457121aa99a94e3b6ee14362c1")
  });
})

describe('hasValidTransactions', () => {
  it('hasValidTransactions verifies returns false if one transaction is invalid', () => {
    let tx1 = new Transaction("fromAddress", "toAddress", 45);
    let tx2 = new Transaction("fromAddress", "toAddress", 35);
    let tx3 = new Transaction("fromAddress", "toAddress", 35);
    jest.spyOn(tx1, 'isValid').mockImplementation(() => true);
    jest.spyOn(tx2, 'isValid').mockImplementation(() => false);
    jest.spyOn(tx3, 'isValid').mockImplementation(() => true);
    newBlock.transactions = [tx1, tx2, tx3]
    expect(newBlock.hasValidTransactions()).toBe(false)
    
  })
  
  it('hasValidTransactions returns true only if all transactions are valid', () => {
    let tx1 = new Transaction("fromAddress", "toAddress", 45);
    let tx2 = new Transaction("fromAddress", "toAddress", 35);
    let tx3 = new Transaction("fromAddress", "toAddress", 35);
    jest.spyOn(tx1, 'isValid').mockImplementation(() => true);
    jest.spyOn(tx2, 'isValid').mockImplementation(() => true);
    jest.spyOn(tx3, 'isValid').mockImplementation(() => true);
    newBlock.transactions = [tx1, tx2, tx3]
    expect(newBlock.hasValidTransactions()).toBe(true)
  })
})

describe('hasProofOfWork', () => {
  it('returns true if hash is valid and first d (difficulty) characters are zero', () => {
    jest.spyOn(newBlock, 'hasValidHash').mockImplementation(() => true);
    newBlock.hash = "000062c6a9eee8ba674551d798fe337b27fc91457121aa99a94e3b6ee14362c1"
    expect(newBlock.hasProofOfWork()).toBe(true)
  })
  
  it('returns false if hash is invalid', () => {
    jest.spyOn(newBlock, 'hasValidHash').mockImplementation(() => false);
    newBlock.hash = "0000invalidbogus"
    expect(newBlock.hasProofOfWork()).toBe(false)
  })

  it('returns false if hash does not contain first d (difficulty) characters of zero', () => {
    jest.spyOn(newBlock, 'hasValidHash').mockImplementation(() => true);
    newBlock.hash = "000162c6a9eee8ba674551d798fe337b27fc91457121aa99a94e3b6ee14362c1"
    expect(newBlock.hasProofOfWork()).toBe(false)
  })
})

describe('hasValidHash', () => {
  it('returns true positive', () => {
    newBlock.hash = "a25f306ba4b41715239c855b821b349d04eba5137345c071385a36e119343ac8"
    expect(newBlock.hasValidHash()).toBe(true)
  })
  
  it('returns true negative', () => {
    newBlock.hash = "Ncb69bc3d3a225bec1b40c461dcd4c0abd73953e4ca06fdddfb4be2fb2de6148"
    expect(newBlock.hasValidHash()).toBe(false)
  })

  it('returns false if timestamp is tampered with', () => {
    expect(newBlock.hasValidHash()).toBe(true)
    newBlock.timestamp = "newTamperedTimestamp"
    expect(newBlock.hasValidHash()).toBe(false)
  });

  it('returns false if transactions are tampered with', () => {
    expect(newBlock.hasValidHash()).toBe(true)
    newBlock.timestamp = ["newBogusTransaction1", "newbogusTransaction2"]
    expect(newBlock.hasValidHash()).toBe(false)
  });

  it('returns false if previous hash is tampered with', () => {
    expect(newBlock.hasValidHash()).toBe(true)
    newBlock.previousHash = "newTamperedPrevHash"
    expect(newBlock.hasValidHash()).toBe(false)
  });

  it('returns false if block height is tampered with', () => {
    expect(newBlock.hasValidHash()).toBe(true)
    newBlock.height = 999999
    expect(newBlock.hasValidHash()).toBe(false)
  });

  it('returns false if difficulty is tampered with', () => {
    expect(newBlock.hasValidHash()).toBe(true)
    newBlock.difficulty = 666
    expect(newBlock.hasValidHash()).toBe(false)
  });
  
  it('returns false if nonce is tampered with', () => {
    expect(newBlock.hasValidHash()).toBe(true)
    newBlock.nonce = 666
    expect(newBlock.hasValidHash()).toBe(false)
  });
})

describe('isValidBlock', () => {
  it("returns false if all transactions aren't valid", () => {
    let inValidBlock = new Block("01/5/2023", testTransactions, 4, 'test_prev_hash', 23)
    jest.spyOn(inValidBlock, 'hasValidTransactions').mockImplementation(() => false);
    jest.spyOn(inValidBlock, 'hasProofOfWork').mockImplementation(() => true);
    expect(inValidBlock.isValidBlock()).toBe(false)
  })

  it("returns false if doesn't have proof of work", () => {
    let inValidBlock = new Block("01/5/2023", testTransactions, 4, 'test_prev_hash', 23)
    jest.spyOn(inValidBlock, 'hasValidTransactions').mockImplementation(() => true);
    jest.spyOn(inValidBlock, 'hasProofOfWork').mockImplementation(() => false);
    expect(inValidBlock.isValidBlock()).toBe(false)
  })

  it("returns true if all transactions are valid, has proof of work, and valid hash", () => {
    let inValidBlock = new Block("01/5/2023", testTransactions, 4, 'test_prev_hash', 23)
    jest.spyOn(inValidBlock, 'hasValidTransactions').mockImplementation(() => true);
    jest.spyOn(inValidBlock, 'hasProofOfWork').mockImplementation(() => true);
    expect(inValidBlock.isValidBlock()).toBe(true)
  })
})




