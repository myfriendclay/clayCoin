import Blockchain from "./Blockchain";
import Block from "../Block/Block";
import GenesisBlock from "../Block/GenesisBlock";
import { when } from "jest-when";

let blockchain: Blockchain;

jest.mock("../Block/Block");
let block1: Block;
let block2: Block;
let block3: Block;

beforeEach(() => {
  blockchain = new Blockchain();
  block1 = new Block([], 3, "prevHash", 1);
  block2 = new Block([], 4, "prevHash2", 2);
  block3 = new Block([], 5, "prevHash3", 3);
});

describe("Constructor", () => {
  it("Creates blockchain instance", () => {
    expect(blockchain).toBeInstanceOf(Blockchain);
  });
  it("Creates blockchain successfully with chain", () => {
    expect(blockchain).toHaveProperty("chain");
  });

  it("Has only one block on the chain (genesis block)", () => {
    expect(blockchain.chain.length).toBe(1);
  });
  it("Has GenesisBlock as first block", () => {
    expect(blockchain.chain[0]).toBeInstanceOf(GenesisBlock);
  });
});

describe("getLatestBlock", () => {
  it("Successfully returns the latest block", () => {
    blockchain.chain.push(block1);
    expect(blockchain.getLatestBlock()).toBe(block1);
  });
});

describe("addBlockToChain", () => {
  it("adds block to chain", () => {
    expect(blockchain.chain).toHaveLength(1);
    blockchain.addBlockToChain(block1);
    blockchain.addBlockToChain(block2);
    expect(blockchain.chain).toHaveLength(3);
    expect(blockchain.chain[2]).toBe(block2);
  });
});

describe("isChainValid", () => {
  let mockAreChainsValidlyConnected: jest.SpyInstance<
    boolean,
    [block1: Block, block2: Block],
    any
  >;
  beforeEach(() => {
    jest.spyOn(block1, "isValid").mockImplementation(() => true);
    jest.spyOn(block2, "isValid").mockImplementation(() => true);
    jest.spyOn(block3, "isValid").mockImplementation(() => true);
    jest.spyOn(blockchain.chain[0], "isValid").mockImplementation(() => true);
    mockAreChainsValidlyConnected = jest
      .spyOn(Block, "areBlocksValidlyConnected")
      .mockImplementation(() => true);
    blockchain.chain.push(block1, block2, block3);
  });

  it("Returns false if any two blocks are not validly connected", () => {
    //Want to mock areBlocksValidlyConnected returing false for just 2 of the blocks, rather than all of them as that's the minimum criteria to invalidate a chain
    when(mockAreChainsValidlyConnected)
      .calledWith(block2, block3)
      .mockReturnValue(false)
      .defaultReturnValue(true);
    expect(blockchain.isChainValid()).toBe(false);
  });

  it("Returns false if any block is invalid", () => {
    jest.spyOn(block2, "isValid").mockImplementation(() => false);
    expect(blockchain.isChainValid()).toBe(false);
  });

  it("Returns false if genesis block is invalid", () => {
    jest.spyOn(blockchain.chain[0], "isValid").mockImplementation(() => false);
    expect(blockchain.isChainValid()).toBe(false);
  });
  it("Returns true otherwise", () => {
    expect(blockchain.isChainValid()).toBe(true);
  });
});

describe("replaceChain", () => {
  let newBlockchain: Blockchain;
  let originalChain: Block[];
  beforeEach(() => {
    newBlockchain = new Blockchain();
    originalChain = blockchain.chain;
  });

  describe("when the new chain is not longer", () => {
    it("returns false", () => {
      jest.spyOn(newBlockchain, "isChainValid").mockImplementation(() => true);
      expect(blockchain.replaceChain(newBlockchain)).toBe(false);
    });

    it("does not replace the chain", () => {
      blockchain.replaceChain(newBlockchain);
      expect(blockchain.chain).toBe(originalChain);
    });
  });

  describe("when the chain is longer", () => {
    describe("and the chain is invalid", () => {
      it("returns false", () => {
        jest
          .spyOn(newBlockchain, "isChainValid")
          .mockImplementation(() => false);
        blockchain.replaceChain(newBlockchain);
        expect(blockchain.replaceChain(newBlockchain)).toBe(false);
      });

      it("does not replace chain", () => {
        jest
          .spyOn(newBlockchain, "isChainValid")
          .mockImplementation(() => false);
        blockchain.replaceChain(newBlockchain);
        expect(blockchain.chain).toBe(originalChain);
      });
    });

    describe("and the chain is valid", () => {
      let returnResult: boolean;
      beforeEach(() => {
        newBlockchain.chain.push("block");
        jest
          .spyOn(newBlockchain, "isChainValid")
          .mockImplementation(() => true);
        returnResult = blockchain.replaceChain(newBlockchain);
      });
      it("replaces the chain", () => {
        expect(blockchain.chain).toBe(newBlockchain.chain);
        expect(blockchain.chain).not.toBe(originalChain);
      });

      it("Returns true", () => {
        expect(returnResult).toBe(true);
      });
    });
  });
});
