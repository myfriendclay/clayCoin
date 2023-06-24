import CoinbaseTransaction from "./CoinbaseTransaction";
import Transaction from "./Transaction";
import { COINBASE_TX } from "../utils/config";

let coinbaseTx: CoinbaseTransaction;
let miningRewardAddress = "miningRewardAddress";
let miningReward = 10;

beforeEach(() => {
  coinbaseTx = new CoinbaseTransaction(miningRewardAddress, miningReward);
});

describe("Constructor", () => {
  it("Creates a transaction instance", () => {
    expect(coinbaseTx).toBeInstanceOf(Transaction);
    expect(coinbaseTx).toBeInstanceOf(CoinbaseTransaction);
  });

  it("Has Coinbase Tx fields from config value", () => {
    expect(coinbaseTx).toMatchObject({
      fromAddress: COINBASE_TX.fromAddress,
      memo: COINBASE_TX.memo,
    });
  });

  it("Sets toAddress and amount from method arguments", () => {
    expect(coinbaseTx).toMatchObject({
      toAddress: miningRewardAddress,
      amount: miningReward,
    });
  });

  it("Has 0 fee", () => {
    expect(coinbaseTx.fee).toBe(0);
  });

  it("Has a UUID", () => {
    expect(coinbaseTx).toHaveProperty("uuid");
  });

  it("Sets an accurate timestamp value", () => {
    const minTime = Date.now() - 1000;
    const maxTime = Date.now() + 1000;
    expect(coinbaseTx.timestamp).toBeGreaterThanOrEqual(minTime);
    expect(coinbaseTx.timestamp).toBeLessThanOrEqual(maxTime);
  });

  it("Has a valid signature", () => {
    expect(coinbaseTx.hasValidSignature()).toBe(true);
  });
});

describe("isValid", () => {
  beforeEach(() => {
    jest.spyOn(coinbaseTx, "hasValidSignature").mockReturnValue(true);
  });
  describe("Returns false", () => {
    it("When amount is 0 or less", () => {
      coinbaseTx.amount = 0;
      expect(coinbaseTx.isValid()).toBe(false);
      coinbaseTx.amount = -1;
      expect(coinbaseTx.isValid()).toBe(false);
    });

    it("When fromAddress doesnt match config", () => {
      coinbaseTx.fromAddress = "madeupFromAddress";
      expect(coinbaseTx.isValid()).toBe(false);
    });

    it("When memo doesnt match config", () => {
      coinbaseTx.memo = "madeupMemo";
      expect(coinbaseTx.isValid()).toBe(false);
    });

    it("When signature is invalid", () => {
      jest.spyOn(coinbaseTx, "hasValidSignature").mockReturnValueOnce(false);
      expect(coinbaseTx.isValid()).toBe(false);
    });
  });

  describe("Returns true", () => {
    it("Otherwise", () => {
      expect(coinbaseTx.isValid()).toBe(true);
    });
  });
});
