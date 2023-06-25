import Block from "./Block";
import GenesisBlock from "./GenesisBlock";
import { GENESIS_BLOCK_DATA } from "../utils/config";

let genesisBlock: GenesisBlock;
let mineBlockSpy
beforeEach(() => {
    mineBlockSpy = jest.spyOn(GenesisBlock.prototype, 'mineBlock');
    new GenesisBlock();
  genesisBlock = new GenesisBlock();
});

describe("Constructor", () => {
  it("Creates a block", () => {
    expect(genesisBlock).toBeInstanceOf(GenesisBlock);
    expect(genesisBlock).toBeInstanceOf(Block);
  });

  it("Transactions match genesis config", () => {
    expect(genesisBlock.transactions).toBe(GENESIS_BLOCK_DATA.transactions);
  });
  it("Difficulty match genesis config", () => {
    expect(genesisBlock.difficulty).toBe(GENESIS_BLOCK_DATA.difficulty);
  });
  it("previousHash is null", () => {
    expect(genesisBlock.previousHash).toBe(null);
  });

  it("height is 0", () => {
    expect(genesisBlock.height).toBe(0);
  });
  it("Type is GenesisBlock", () => {
    expect(genesisBlock.__type).toBe("GenesisBlock");
  });

  it("Automatically creates a timestamp", () => {
    const minTime = Date.now() - 100;
    const maxTime = Date.now() + 100;
    expect(genesisBlock.timestamp).toBeGreaterThanOrEqual(minTime);
    expect(genesisBlock.timestamp).toBeLessThanOrEqual(maxTime);
  });
  it("Mines the block", () => {
    expect(mineBlockSpy).toHaveBeenCalled();
  });
});

describe("isValid", () => {
  it("Returns false if Genesis block has non zero height", () => {
    genesisBlock.height = 1;
    expect(genesisBlock.isValid()).toBe(false);
  });

  it("Returns false if Genesis block has previous hash thats not null", () => {
    genesisBlock.previousHash = "someOtherHash";
    expect(genesisBlock.isValid()).toBe(false);
  });

  it("Returns false if doesnt have proof of work hash", () => {
    jest.spyOn(genesisBlock, "hasProofOfWork").mockImplementation(() => false);
    expect(genesisBlock.isValid()).toBe(false);
  });

  it("Returns false if timestamp in future", () => {
    jest
      .spyOn(genesisBlock, "timestampIsInPast")
      .mockImplementation(() => false);
    expect(genesisBlock.isValid()).toBe(false);
  });

  it("Returns true otherwise", () => {
    expect(genesisBlock.isValid()).toBe(true);
  });
});
