import Transaction from "./Transaction";
import EC from "elliptic"
const ec = new EC.ec('secp256k1')
import * as getSHA256HashModule from "../../utils/crypto-hash";
import { COINBASE_TX } from "../../config";

let newTransaction
let key
let publicKey
let privateKey

beforeEach(() => {

  key = ec.genKeyPair();
  publicKey = key.getPublic('hex');
  privateKey = key.getPrivate('hex');
  newTransaction = new Transaction("bogus_from_address", "bogus_to_address", 45, "pizza and beer")
  newTransaction.uuid = "123456789"
});

describe('Constructor function (creation)', () => {
  it('Create Transaction with all 6 properties', () => {
    expect(newTransaction).toHaveProperty('fromAddress');
    expect(newTransaction).toHaveProperty('toAddress');
    expect(newTransaction).toHaveProperty('amount');
    expect(newTransaction).toHaveProperty('memo');
    expect(newTransaction).toHaveProperty('timestamp');
    expect(newTransaction).toHaveProperty('uuid');
  });

  it('Accurately sets all of the fields', () => {
    expect(newTransaction.fromAddress).toBe('bogus_from_address');
    expect(newTransaction.toAddress).toBe('bogus_to_address');
    expect(newTransaction.amount).toBe(45);
    expect(newTransaction.memo).toBe("pizza and beer");
    expect(newTransaction.uuid).toBe("123456789");
  });

  it('Automatically creates a timestamp', () => {
    const minTime = Date.now() - 10
    const maxTime = Date.now() + 10
    expect(newTransaction.timestamp).toBeGreaterThanOrEqual(minTime);
    expect(newTransaction.timestamp).toBeLessThanOrEqual(maxTime);
  });
});

describe('calculateHash', () => {
  beforeEach(() => {
    newTransaction.timestamp = 1
  });

  it('Changes hash if fromAddress changes', () => {
    const initialHash = newTransaction.calculateHash()
    newTransaction.fromAddress = "tamperedFromAddress"
    expect(newTransaction.calculateHash()).not.toBe(initialHash)
  })

  it('Changes hash if toAddress changes', () => {
    const initialHash = newTransaction.calculateHash()
    newTransaction.toAddress = "tamperedToAddress"
    expect(newTransaction.calculateHash()).not.toBe(initialHash)
  })

  it('Changes hash if amount changes', () => {
    const initialHash = newTransaction.calculateHash()
    newTransaction.amount = 999999
    expect(newTransaction.calculateHash()).not.toBe(initialHash)
  })

  it('Changes hash if memo changes', () => {
    const initialHash = newTransaction.calculateHash()
    newTransaction.memo = "tamperedMemo"
    expect(newTransaction.calculateHash()).not.toBe(initialHash)
  })

  it('Changes hash if timestamp changes', () => {
    const initialHash = newTransaction.calculateHash()
    newTransaction.timestamp = "tamperedtimestamp"
    expect(newTransaction.calculateHash()).not.toBe(initialHash)
  })

  it('Changes hash if uuid changes', () => {
    const initialHash = newTransaction.calculateHash()
    newTransaction.uuid = "tamperedUUID"
    expect(newTransaction.calculateHash()).not.toBe(initialHash)
  })

  it('Returns results of getSHA256Hash function', () => {
    jest.spyOn(getSHA256HashModule, 'default').mockImplementation(() => 'expected-hash-value')
    expect(newTransaction.calculateHash()).toBe('expected-hash-value')
  })

  it('Calls getSHA256Hash with all parameter properties', () => {
    jest.spyOn(getSHA256HashModule, 'default').mockImplementation(() => 'expected-hash-value')
    expect(getSHA256HashModule.default).toHaveBeenCalledWith(newTransaction.fromAddress, newTransaction.toAddress, newTransaction.amount, newTransaction.memo, newTransaction.fee, newTransaction.uuid, newTransaction.timestamp)
  })

  });

describe('signTransaction', () => {
  beforeEach(() => {
    newTransaction.timestamp = 1
  });

  it('Throws error if not fromAddress signing', () => {
    expect(() => newTransaction.signTransaction(key)).toThrow(Error)
  });

  it('Updates Transaction signature when signingKey matches fromAddress', () => {
    newTransaction.fromAddress = publicKey
    newTransaction.signTransaction(privateKey)
    expect(newTransaction).toHaveProperty('signature')
  });

  test.todo('Updates Transaction with valid signature')

});

describe('isValid', () => {
  test('If fromAddress is "Coinbase Tx" then returns true (mining reward)', () => {
    newTransaction.fromAddress = "Coinbase Tx"
    expect(newTransaction.isValid()).toBe(true)
  });

  test('Returns false if missing signature', () => {
    expect(newTransaction.isValid()).toBe(false)
  });

  test('Returns false if missing fromAddress', () => {
    newTransaction.fromAddress = null
    expect(newTransaction.isValid()).toBe(false)
  });

  test('Returns false if missing toAddress', () => {
    newTransaction.toAddress = null
    expect(newTransaction.isValid()).toBe(false)
  });
  
  test('Returns false if signature doesnt match fromAddress public key', () => {
    newTransaction.fromAddress = publicKey
    const different_key = ec.genKeyPair();
    const transactionHash = newTransaction.calculateHash()
    const different_signature = different_key.sign(transactionHash, 'base64')
    newTransaction.signature = different_signature
    expect(newTransaction.isValid()).toBe(false)
  });

  test('Returns false if amount is zero or negative', () => {
    newTransaction.amount = 0
    expect(newTransaction.isValid()).toBe(false)
    newTransaction.amount = -1
    expect(newTransaction.isValid()).toBe(false)
  });

  test('Returns true if signature matches fromAddress public key', () => {
    newTransaction.fromAddress = publicKey
    newTransaction.signTransaction(privateKey)
    expect(newTransaction.isValid()).toBe(true)
  });

});
  
describe('getCoinbaseTx', () => {
  let coinbaseTx
  let miningRewardAddress = "miningRewardAddress"
  let miningReward = 10

  beforeAll(() => {
    coinbaseTx = Transaction.getCoinbaseTx(miningRewardAddress, miningReward)
  })

  it('Returns a Transaction', () => {
    expect(coinbaseTx).toBeInstanceOf(Transaction)
    expect(Object.getPrototypeOf(coinbaseTx)).toBe(Transaction.prototype);
  });

  it('Return value includes the correct Coinbase Tx fields from config value', () => {
    expect(coinbaseTx).toMatchObject({
      fromAddress: COINBASE_TX.fromAddress,
      memo: COINBASE_TX.memo,
    });
  }); 

  it('Sets toAddress and amount from method arguments', () => {
    expect(coinbaseTx).toMatchObject({
      toAddress: miningRewardAddress,
      amount: miningReward,
    });
  }); 

  it('Has no fee', () => {
    expect(coinbaseTx).toMatchObject({
      fee: 0
    });
  }); 

});

