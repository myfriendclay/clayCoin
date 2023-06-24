import Transaction from "./Transaction";
import * as getSHA256HashModule from "../utils/crypto-hash";

const fromAddress =
  "0466106d7a83b41134c3e973fe13c0aa682ec8ee94c32cf6d66429e429554dc4ed9d7c64d0c5685229f503307a30f65c954e781d0f3cf4f77d07e0a9d4c37e1d02";
const toAddress = "bogus_to_address";
const amount = 45;
const memo = "pizza and beer";
const uuid = "123456789";
const timestamp = 1;
const privateKey =
  "0b9e25155f05ba792d8ed7d670201e60959184af77ab433ea814b67422276149";
const transactionHash =
  "b44414faa605d21b826315db81c64897ddd0c00f1abc06b37ea90c35d97ae448";
const transactionSignature =
  "30450221009053cc684f78c5173d389874fa556fde4f3314685650e58b89c1ac5ef920fc4c022042aae57e122bf5b13e75f45db4c3b1c59e7210b72197fa9b40ac3ca2955d395a";

let transaction: Transaction;

beforeEach(() => {
  transaction = new Transaction(fromAddress, toAddress, amount, memo);
  transaction.uuid = uuid;
  transaction.timestamp = timestamp;
});

describe("Constructor function (creation)", () => {
  it("Creates instance of Transaction class", () => {
    expect(transaction).toBeInstanceOf(Transaction);
  });

  it("Creates Transaction with all properties", () => {
    expect(transaction).toHaveProperty("fromAddress");
    expect(transaction).toHaveProperty("toAddress");
    expect(transaction).toHaveProperty("amount");
    expect(transaction).toHaveProperty("memo");
    expect(transaction).toHaveProperty("fee");
    expect(transaction).toHaveProperty("uuid");
    expect(transaction).toHaveProperty("timestamp");
    expect(transaction).toHaveProperty("__type");
  });

  it("Accurately sets all of the fields passed into constructor", () => {
    expect(transaction.fromAddress).toBe(fromAddress);
    expect(transaction.toAddress).toBe(toAddress);
    expect(transaction.amount).toBe(amount);
    expect(transaction.memo).toBe(memo);
  });

  it("Automatically creates a timestamp", () => {
    transaction = new Transaction(fromAddress, toAddress, amount, memo);
    const minTime = Date.now() - 100;
    const maxTime = Date.now() + 100;
    expect(transaction.timestamp).toBeGreaterThanOrEqual(minTime);
    expect(transaction.timestamp).toBeLessThanOrEqual(maxTime);
  });
});

describe("calculateHash", () => {
  let initialHash: string;

  beforeEach(() => {
    initialHash = transaction.calculateHash();
  });

  it("Changes hash if fromAddress changes", () => {
    transaction.fromAddress = "tamperedFromAddress";
    expect(transaction.calculateHash()).not.toBe(initialHash);
  });

  it("Changes hash if toAddress changes", () => {
    transaction.toAddress = "tamperedToAddress";
    expect(transaction.calculateHash()).not.toBe(initialHash);
  });

  it("Changes hash if amount changes", () => {
    transaction.amount = 999999;
    expect(transaction.calculateHash()).not.toBe(initialHash);
  });

  it("Changes hash if memo changes", () => {
    transaction.memo = "tamperedMemo";
    expect(transaction.calculateHash()).not.toBe(initialHash);
  });

  it("Changes hash if timestamp changes", () => {
    transaction.timestamp = 666;
    expect(transaction.calculateHash()).not.toBe(initialHash);
  });

  it("Changes hash if uuid changes", () => {
    transaction.uuid = "tamperedUUID";
    expect(transaction.calculateHash()).not.toBe(initialHash);
  });

  it("Changes hash if fee changes", () => {
    transaction.fee = 666;
    expect(transaction.calculateHash()).not.toBe(initialHash);
  });

  it("Returns result of getSHA256Hash method with all transaction properties passed in", () => {
    const mockedReturnValue = "exampleHash";
    jest
      .spyOn(getSHA256HashModule, "default")
      .mockReturnValueOnce(mockedReturnValue);
    const { fromAddress, toAddress, amount, memo, fee, uuid, timestamp } =
      transaction;
    expect(transaction.calculateHash()).toBe(mockedReturnValue);
    expect(getSHA256HashModule.default).toHaveBeenCalledWith(
      fromAddress,
      toAddress,
      amount,
      memo,
      fee,
      uuid,
      timestamp
    );
  });
});

describe("signTransaction", () => {
  it("Throws error if not fromAddress signing", () => {
    expect(() => transaction.signTransaction("randomPrivateKey")).toThrow(
      Error
    );
    expect(() => {
      transaction.signTransaction("randomPrivateKey");
    }).toThrow(
      "Unauthorized: Your private key is invalid or doesn't match your public address"
    );
  });

  describe("When private key is valid and matches fromAddress", () => {
    let mockedCalcHash;

    beforeEach(() => {
      mockedCalcHash = jest
        .spyOn(transaction, "calculateHash")
        .mockReturnValue(transactionHash);
      transaction.signTransaction(privateKey);
    });

    it("Calls calculateHash method", () => {
      expect(mockedCalcHash).toHaveBeenCalled();
    });

    it("Updates transaction signature", () => {
      expect(transaction).toHaveProperty("signature");
    });

    it("Updates transaction with valid signature", () => {
      expect(transaction.signature).toBe(transactionSignature);
    });
  });
});

describe("hasValidSignature", () => {
  beforeEach(() => {
    //Set to be valid signature
    transaction.signature = transactionSignature;
  });

  it("Returns true if signature matches fromAddress public key and all transaction details", () => {
    expect(transaction.hasValidSignature()).toBe(true);
  });

  it("Calls calculateHash method", () => {
    const mockedCalcHash = jest.spyOn(transaction, "calculateHash");
    transaction.hasValidSignature();
    expect(mockedCalcHash).toHaveBeenCalled();
  });

  describe("Returns false", () => {
    beforeEach(() => {
      expect(transaction.hasValidSignature()).toBe(true);
    });

    it("Returns false if missing signature", () => {
      transaction.signature = undefined;
      expect(transaction.isValid()).toBe(false);
    });

    it("Returns false if signature is valid signature from different public key", () => {
      transaction.signature =
        "3045022100e89ec48b4645c96d64b138e2a1628ddcbe63e8c1eb47c29b3ba4c53a18aa004a02205288382a46f3c9d8ab9833a3f5300fcf38814873d0484b05f30e44b05fba20c0";
      expect(transaction.hasValidSignature()).toBe(false);
    });

    test("Returns false if amount changes", () => {
      transaction.amount = transaction.amount + 1;
      expect(transaction.hasValidSignature()).toBe(false);
    });

    test("Returns false if toAddress changes", () => {
      transaction.toAddress = transaction.toAddress + "badData";
      expect(transaction.hasValidSignature()).toBe(false);
    });

    test("Returns false if memo changes", () => {
      transaction.memo = transaction.memo + "badData";
      expect(transaction.hasValidSignature()).toBe(false);
    });

    test("Returns false if fee changes", () => {
      transaction.fee = 666;
      expect(transaction.hasValidSignature()).toBe(false);
    });

    test("Returns false if timestamp changes", () => {
      transaction.timestamp = 666;
      expect(transaction.hasValidSignature()).toBe(false);
    });

    test("Returns false if uuid changes", () => {
      transaction.uuid = "bogusUUID";
      expect(transaction.hasValidSignature()).toBe(false);
    });

    test("Returns false if fromAddress changes", () => {
      transaction.fromAddress =
        "0466106d7a83b41134c3e973fe13c0aa682ec8ee94c32cf6d66429e429554dc4ed9d7c64d0c5685229f503307a30f65c954e781d0f3cf4f77d07e0a9d4c37e1d01";
      expect(transaction.hasValidSignature()).toBe(false);
    });
  });
});

describe("hasRequiredFields", () => {
  it("Returns false if missing fromAddress", () => {
    transaction.fromAddress = undefined;
    expect(transaction.hasRequiredFields()).toBe(false);
  });

  it("Returns false if missing toAddress", () => {
    transaction.toAddress = undefined;
    expect(transaction.hasRequiredFields()).toBe(false);
  });

  it("Returns false if amount is zero or negative", () => {
    transaction.amount = 0;
    expect(transaction.hasRequiredFields()).toBe(false);
    transaction.amount = -1;
    expect(transaction.hasRequiredFields()).toBe(false);
  });

  it("Returns true if required fields are present and amount > 0", () => {
    expect(transaction.hasRequiredFields()).toBe(true);
  });
});

describe("isValid", () => {
  beforeEach(() => {
    jest.spyOn(transaction, "hasRequiredFields").mockReturnValue(true);
    jest.spyOn(transaction, "hasValidSignature").mockReturnValue(true);
  });

  it("Returns true if has required fields, valid signature, and amount > 0", () => {
    expect(transaction.isValid()).toBe(true);
  });

  it("Returns false if hasRequiredFields returns false", () => {
    jest.spyOn(transaction, "hasRequiredFields").mockReturnValue(false);
    expect(transaction.isValid()).toBe(false);
  });

  it("Returns false if hasValidSignature returns false", () => {
    jest.spyOn(transaction, "hasValidSignature").mockReturnValue(false);
    expect(transaction.isValid()).toBe(false);
  });

  it("Returns false if amount <= 0", () => {
    transaction.amount = 0;
    expect(transaction.isValid()).toBe(false);
    transaction.amount = -1;
    expect(transaction.isValid()).toBe(false);
  });
});
