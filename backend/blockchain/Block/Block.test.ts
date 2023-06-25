import hexToBinary from "hex-to-binary";
import * as getSHA256HashModule from "../utils/crypto-hash";
import CoinbaseTransaction from "../Transaction/CoinbaseTransaction";
import Block from "./Block";
import Transaction from "../Transaction/Transaction";
import { TARGET_MINE_RATE_MS } from "../utils/config";

jest.mock("../Transaction/Transaction");
//Setup values:
let block: Block;
let transactions: Transaction[];
let originalHash: string;
let prevHash = "prevHash";
let transaction1: Transaction,
  transaction2: Transaction,
  transaction3: Transaction;
const height = 2;
const difficulty = 3;
const fixedTimestamp = 1;
//correctHash value changes based on all the block properties so will need to update if any of it changes
const correctHash =
  "15ca1ca2d85540f0e16c4b4ccf9fb75b657d6655fc3957052571b4876acff24b";

beforeEach(() => {
  transaction1 = new Transaction(
    "fromAddress1",
    "toAddress1",
    10,
    "test memo1"
  );
  transaction2 = new Transaction(
    "fromAddress2",
    "toAddress2",
    11,
    "test memo2"
  );
  transaction3 = new Transaction(
    "fromAddress3",
    "toAddress3",
    12,
    "test memo3"
  );
  transactions = [transaction1, transaction2, transaction3];
  block = new Block(transactions, difficulty, prevHash, height);
});

describe("Constructor", () => {
  it("Creates instance of a block", () => {
    expect(block).toBeInstanceOf(Block);
  });

  it("Created block contains all 7 properties", () => {
    expect(block).toHaveProperty("timestamp");
    expect(block).toHaveProperty("transactions");
    expect(block).toHaveProperty("previousHash");
    expect(block).toHaveProperty("height");
    expect(block).toHaveProperty("difficulty");
    expect(block).toHaveProperty("nonce");
  });

  it("Accurately sets all of the fields", () => {
    expect(block.transactions).toBe(transactions);
    expect(block.previousHash).toBe(prevHash);
    expect(block.height).toBe(height);
    expect(block.difficulty).toBe(difficulty);
    expect(block.nonce).toBe(0);
  });

  it("Automatically creates a timestamp", () => {
    const minTime = Date.now() - 1000;
    const maxTime = Date.now() + 1000;
    expect(block.timestamp).toBeGreaterThanOrEqual(minTime);
    expect(block.timestamp).toBeLessThanOrEqual(maxTime);
  });
});

describe("mineBlock", () => {
  it("updates first d number of characters of BINARY hash to 0 (where d = difficulty)", () => {
    const { difficulty } = block;
    const targetHash = "0".repeat(difficulty);
    block.mineBlock();
    const hashHeader = hexToBinary(block.hash).substring(0, difficulty);
    expect(hashHeader).toBe(targetHash);
  });

  it("sets hash to return value of getProofOfWorkHash", () => {
    expect(block.hash).toBeUndefined();
    const proofOfWork = "myProofOfWork";
    jest.spyOn(block, "getProofOfWorkHash").mockReturnValueOnce(proofOfWork);
    block.mineBlock();
    expect(block.hash).toBe(proofOfWork);
  });

  it("updates first d number of characters of BINARY hash when d changes", () => {
    block.difficulty = 7;
    const targetHash = "0".repeat(block.difficulty);
    block.mineBlock();
    const hashHeader = hexToBinary(block.hash).substring(0, block.difficulty);
    expect(hashHeader).toBe(targetHash);
  });

  it("does not change the contents of the block besides nonce", () => {
    const originalBlock = { ...block };
    block.mineBlock();
    expect(originalBlock.timestamp).toBe(block.timestamp);
    expect(originalBlock.transactions).toBe(block.transactions);
    expect(originalBlock.previousHash).toBe(block.previousHash);
    expect(originalBlock.height).toBe(block.height);
    expect(originalBlock.difficulty).toBe(block.difficulty);
    expect(originalBlock.nonce).not.toBe(block.nonce);
  });

  it("sets miningTime to time it took to mine block", () => {
    //Need to set difficulty to something decently high so duration isn't 0
    block.difficulty = 15;
    const before = Date.now();
    block.mineBlock();
    const after = Date.now();
    const duration = after - before;
    expect(block.miningDurationMs).toBe(duration);
  });
});

describe("getProofOfWorkHash", () => {
  it("returns hash where first d (difficulty) number of characters is 0", () => {
    const { difficulty } = block;
    const proofOfWork = block.getProofOfWorkHash();
    const proofOfWorkHeader = hexToBinary(proofOfWork).substring(0, difficulty);
    const targetHashHeader = "0".repeat(difficulty);
    expect(proofOfWorkHeader).toBe(targetHashHeader);
  });

  it("Calls on calculateHash n times (n = nonce)", () => {
    const spyCalculateHash = jest.spyOn(block, "calculateHash");
    block.getProofOfWorkHash();
    expect(spyCalculateHash.mock.calls.length).toBe(block.nonce);
  });

  it("Returns a valid hash", () => {
    //This is sort of like an integration test as a deliberate redundancy
    block.timestamp = fixedTimestamp;
    const proofOfWorkHash = block.getProofOfWorkHash();
    expect(proofOfWorkHash).toBe(correctHash);
  });
});

describe("calculateHash", () => {
  beforeEach(() => {
    originalHash = block.calculateHash();
  });

  it("updates hash when timestamp is updated", () => {
    block.timestamp = 666;
    expect(block.calculateHash()).not.toBe(originalHash);
  });

  it("updates hash when transactions is updated", () => {
    block.transactions.push(
      new Transaction("fromAddress4", "toAddress4", 13, "test memo4")
    );
    expect(block.calculateHash()).not.toBe(originalHash);
  });

  it("updates hash when previousHash is updated", () => {
    block.previousHash = "bogusPrevHash";
    expect(block.calculateHash()).not.toBe(originalHash);
  });

  it("updates hash when height is updated", () => {
    block.height = 666;
    expect(block.calculateHash()).not.toBe(originalHash);
  });

  it("updates hash when difficulty is updated", () => {
    block.difficulty = 666;
    expect(block.calculateHash()).not.toBe(originalHash);
  });

  it("updates hash when nonce is updated", () => {
    block.nonce = 666;
    expect(block.calculateHash()).not.toBe(originalHash);
  });

  it("return results of getSHA256Hash helper with all block properties passed in", () => {
    const mockedReturnValue = "exampleHash";
    const { timestamp, transactions, previousHash, height, difficulty, nonce } =
      block;
    jest
      .spyOn(getSHA256HashModule, "default")
      .mockReturnValueOnce(mockedReturnValue);
    expect(block.calculateHash()).toBe(mockedReturnValue);
    expect(getSHA256HashModule.default).toHaveBeenCalledWith(
      timestamp,
      transactions,
      previousHash,
      height,
      difficulty,
      nonce
    );
  });
});

describe("isValid", () => {
  beforeEach(() => {
    jest.spyOn(block, "hasValidTransactions").mockImplementation(() => true);
    jest.spyOn(block, "hasProofOfWork").mockImplementation(() => true);
    jest.spyOn(block, "hasOnlyOneCoinbaseTx").mockImplementation(() => true);
    jest.spyOn(block, "timestampIsInPast").mockImplementation(() => true);
  });

  it("returns true if hasValidTransactions, hasProofOfWork, hasOnlyOneCoinbaseTx, timestampIsInPast all return true ", () => {
    expect(block.isValid()).toBe(true);
  });

  it("returns false if hasValidTransactions returns false", () => {
    jest.spyOn(block, "hasValidTransactions").mockImplementation(() => false);
    expect(block.isValid()).toBe(false);
  });

  it("returns false if hasProofOfWork returns false", () => {
    jest.spyOn(block, "hasProofOfWork").mockImplementation(() => false);
    expect(block.isValid()).toBe(false);
  });

  it("returns false if hasOnlyOneCoinbaseTx returns false", () => {
    jest.spyOn(block, "hasOnlyOneCoinbaseTx").mockImplementation(() => false);
    expect(block.isValid()).toBe(false);
  });

  it("returns false if timestampIsInPast returns false", () => {
    jest.spyOn(block, "timestampIsInPast").mockImplementation(() => false);
    expect(block.isValid()).toBe(false);
  });
});

describe("isValid helper methods", () => {
  describe("hasValidTransactions", () => {
    beforeEach(() => {
      jest.spyOn(transaction1, "isValid").mockReturnValueOnce(true);
      jest.spyOn(transaction2, "isValid").mockReturnValueOnce(true);
      jest.spyOn(transaction3, "isValid").mockReturnValueOnce(true);
    });

    it("Returns true only if all transactions are valid", () => {
      expect(block.hasValidTransactions()).toBe(true);
    });

    it("Returns false if one transaction is invalid", () => {
      let invalidTransaction = new Transaction(
        "fromAddress1",
        "toAddress1",
        10,
        "test memo1",
        1
      );
      block.transactions.push(invalidTransaction);
      jest.spyOn(invalidTransaction, "isValid").mockReturnValueOnce(false);
      expect(block.hasValidTransactions()).toBe(false);
    });
  });

  describe("hasOnlyOneCoinbaseTx", () => {
    let coinbaseTx: CoinbaseTransaction;

    beforeEach(() => {
      coinbaseTx = Object.create(CoinbaseTransaction.prototype, {});
      block.transactions.push(coinbaseTx);
    });

    it("returns true if block has one coinbase Tx", () => {
      expect(block.hasOnlyOneCoinbaseTx()).toBe(true);
    });

    it("returns false if block has 0 coinbase Tx", () => {
      block.transactions.pop();
      expect(block.hasOnlyOneCoinbaseTx()).toBe(false);
    });

    it("returns false if block has 2 or more coinbase Txs", () => {
      block.transactions.push(coinbaseTx);
      expect(block.hasOnlyOneCoinbaseTx()).toBe(false);
    });
  });

  describe("timestampIsInPast", () => {
    let currentTime = Date.now();

    it("returns true if timestamp is in the past", () => {
      block.timestamp = currentTime - 1;
      expect(block.timestampIsInPast()).toBe(true);
    });

    it("returns false if timestamp is more than 5 min in future", () => {
      block.timestamp = currentTime + 1000 * 5 + 1000;
      expect(block.timestampIsInPast()).toBe(false);
    });
  });

  describe("hasProofOfWork", () => {
    beforeEach(() => {
      jest.spyOn(block, "hasValidHash").mockImplementation(() => true);
      jest.spyOn(block, "firstDCharsAreZero").mockImplementation(() => true);
    });

    it("returns true if hasValidHash and firstDCharsAreZero both return true", () => {
      expect(block.hasProofOfWork()).toBe(true);
    });

    it("returns false if hasValidHash returns false", () => {
      jest.spyOn(block, "hasValidHash").mockImplementation(() => false);
      expect(block.hasProofOfWork()).toBe(false);
    });

    it("returns false if firstDCharsAreZero returns false", () => {
      jest.spyOn(block, "firstDCharsAreZero").mockImplementation(() => false);
      expect(block.hasProofOfWork()).toBe(false);
    });
  });
});

describe("Helper methods for hasProofOfWork", () => {
  describe("hasValidHash", () => {
    const mockHash = "mockHash";

    beforeEach(() => {
      jest.spyOn(block, "calculateHash").mockImplementation(() => mockHash);
    });

    it("returns true if block hash is return value of calculateHash", () => {
      block.hash = mockHash;
      expect(block.hasValidHash()).toBe(true);
    });

    it("returns false if block hash is different than return value of calculateHash", () => {
      block.hash = mockHash + "difference";
      expect(block.hasValidHash()).toBe(false);
    });
  });

  describe("firstDCharsAreZero", () => {
    // 0008 in hex === 0000 0000 0000 1000 in binary (i.e. 12 leading zeros)
    let hexHashWith12LeadingZerosinBinary = "0008";

    beforeEach(() => {
      block.hash = hexHashWith12LeadingZerosinBinary;
    });

    test("returns true if first d (difficulty) chars of binary are 0", () => {
      block.difficulty = 12;
      expect(block.firstDCharsAreZero()).toBe(true);
    });

    test("returns true if first d + 1 (difficulty) chars of binary are 0", () => {
      block.difficulty = 11;
      expect(block.firstDCharsAreZero()).toBe(true);
    });

    test("returns false first d (difficulty = 13) chars of binary are not 0", () => {
      block.difficulty = 13;
      expect(block.firstDCharsAreZero()).toBe(false);
    });
  });
});

describe("Static methods", () => {
  describe("areBlocksValidlyConnected", () => {
    let block2: Block;
    beforeEach(() => {
      jest
        .spyOn(Block, "blocksHashesAreConnected")
        .mockImplementation(() => true);
      jest
        .spyOn(Block, "block2ComesAfterBlock1")
        .mockImplementation(() => true);
      jest.spyOn(Block, "difficultyJumpIsValid").mockImplementation(() => true);
      jest
        .spyOn(Block, "block1HasPlausibleMiningDuration")
        .mockImplementation(() => true);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("returns true if blocksHashesAreConnected, block2ComesAfterBlock1, difficultyJumpIsValid, block1HasPlausibleMiningDuration all return true ", () => {
      expect(Block.areBlocksValidlyConnected(block, block2)).toBe(true);
    });

    it("returns false if blocksHashesAreConnected returns false", () => {
      jest
        .spyOn(Block, "blocksHashesAreConnected")
        .mockImplementation(() => false);
      expect(Block.areBlocksValidlyConnected(block, block2)).toBe(false);
    });

    it("returns false if block2ComesAfterBlock1 returns false", () => {
      jest
        .spyOn(Block, "block2ComesAfterBlock1")
        .mockImplementation(() => false);
      expect(Block.areBlocksValidlyConnected(block, block2)).toBe(false);
    });

    it("returns false if difficultyJumpIsValid returns false", () => {
      jest
        .spyOn(Block, "difficultyJumpIsValid")
        .mockImplementation(() => false);
      expect(Block.areBlocksValidlyConnected(block, block2)).toBe(false);
    });

    it("returns false if block1HasPlausibleMiningDuration returns false", () => {
      jest
        .spyOn(Block, "block1HasPlausibleMiningDuration")
        .mockImplementation(() => false);
      expect(Block.areBlocksValidlyConnected(block, block2)).toBe(false);
    });
  });

  describe("Helper methods for areBlocksValidlyConnected", () => {
    describe("blocksHashesAreConnected", () => {
      let prevBlock = new Block(transactions, difficulty, "irrelevant", height);

      it("returns true if block2's previousHash = block1's hash ", () => {
        prevBlock.hash = prevHash;
        expect(Block.blocksHashesAreConnected(prevBlock, block)).toBe(true);
      });

      it("returns false if block2's previousHash != block1's hash", () => {
        prevBlock.hash = prevHash + "extraBogusText";
        expect(Block.blocksHashesAreConnected(prevBlock, block)).toBe(false);
      });
    });

    describe("block2ComesAfterBlock1", () => {
      let prevBlock = new Block(transactions, difficulty, "irrelevant", height);

      it("returns true if block1's timestamp is before block2's timestamp", () => {
        prevBlock.timestamp = block.timestamp - 1;
        expect(Block.block2ComesAfterBlock1(prevBlock, block)).toBe(true);
      });

      it("returns false if block1's timestamp is after block2's timestamp by more than 10 min", () => {
        prevBlock.timestamp = block.timestamp + 1000 * 60 * 10;
        expect(Block.block2ComesAfterBlock1(prevBlock, block)).toBe(false);
      });
    });

    describe("difficultyJumpIsValid", () => {
      let prevBlock = new Block(
        transactions,
        difficulty + 2,
        "irrelevant",
        height
      );

      it("Returns false if difficulty jumps down more than one level from block1 to block2", () => {
        expect(Block.difficultyJumpIsValid(prevBlock, block)).toBe(false);
      });

      describe("When block1 mining duration is below target mine rate", () => {
        beforeEach(() => {
          prevBlock.miningDurationMs = TARGET_MINE_RATE_MS - 1;
        });
        it("Returns false if block2's difficulty < block1's difficulty + 1", () => {
          block.difficulty = prevBlock.difficulty;
          expect(Block.difficultyJumpIsValid(prevBlock, block)).toBe(false);
        });
        it("Otherwise returns true if block2's difficulty increases by at least 1 from block1's", () => {
          block.difficulty = prevBlock.difficulty + 1;
          expect(Block.difficultyJumpIsValid(prevBlock, block)).toBe(true);
        });
      });
    });

    describe("block1HasPlausibleMiningDuration", () => {
      let prevBlock = new Block(
        transactions,
        difficulty + 2,
        "irrelevant",
        height
      );

      beforeEach(() => {
        //5 min between blocks:
        prevBlock.timestamp = 1000 * 60 * 10;
        block.timestamp = 1000 * 60 * 15;
      });

      it("Returns false if block1's miningDuration is less than the time between the two blocks (with 2 min cushion)", () => {
        //Mining took first block 7 min to mine, which is just over the 5 minute window + 2 min grace period
        prevBlock.miningDurationMs = 1000 * 60 * 7;
        expect(Block.block1HasPlausibleMiningDuration(prevBlock, block)).toBe(
          false
        );
      });

      it("Returns true if block1's miningDuration is greater than or equal to the time between the two blocks (with 2 min cushion)", () => {
        //Mining took first block 6 min 59 sec to mine, which is just under the 5 minute window + 2 min grace period
        prevBlock.miningDurationMs = 1000 * 60 * 7 - 1;
        expect(Block.block1HasPlausibleMiningDuration(prevBlock, block)).toBe(
          true
        );
      });
    });
  });
});
