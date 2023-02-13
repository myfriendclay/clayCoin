import Transaction from "./Transaction";
import EC from "elliptic"
const ec = new EC.ec('secp256k1')
import * as getSHA256HashModule from "../../utils/crypto-hash";
import { COINBASE_TX } from "../../config";
import {CoinbaseTransaction} from './Transaction'

let newTransaction
let publicKey
let privateKey

beforeEach(() => {
  publicKey = "0466106d7a83b41134c3e973fe13c0aa682ec8ee94c32cf6d66429e429554dc4ed9d7c64d0c5685229f503307a30f65c954e781d0f3cf4f77d07e0a9d4c37e1d02"
  privateKey = "0b9e25155f05ba792d8ed7d670201e60959184af77ab433ea814b67422276149"
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

  it('Returns result of getSHA256Hash method with all transaction properties passed in', () => {
    const mockedReturnValue = "exampleHash"
    jest.spyOn(getSHA256HashModule, 'default').mockReturnValueOnce(mockedReturnValue)
    const {fromAddress, toAddress, amount, memo, fee, uuid, timestamp} = newTransaction
    expect(newTransaction.calculateHash()).toBe(mockedReturnValue)
    expect(getSHA256HashModule.default).toHaveBeenCalledWith(fromAddress, toAddress, amount, memo, fee, uuid, timestamp)
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

describe('hasValidSignature', () => {

  beforeEach(() => {
    newTransaction.timestamp = 1
    newTransaction.signature = "30450221009053cc684f78c5173d389874fa556fde4f3314685650e58b89c1ac5ef920fc4c022042aae57e122bf5b13e75f45db4c3b1c59e7210b72197fa9b40ac3ca2955d395a"
    newTransaction.fromAddress = publicKey
  });

  test('Returns false if missing signature', () => {
    newTransaction.signature = null
    expect(newTransaction.isValid()).toBe(false)
  });

  test('Calls calculateHash method', () => {
    const mockedCalcHash = jest.spyOn(newTransaction, 'calculateHash')
    newTransaction.hasValidSignature()
    expect(mockedCalcHash).toHaveBeenCalled()
  });

  test('Returns false if signature is valid signature from different public key', () => {
    //Valid signature from another public/private key pair
    newTransaction.signature = "3045022100e89ec48b4645c96d64b138e2a1628ddcbe63e8c1eb47c29b3ba4c53a18aa004a02205288382a46f3c9d8ab9833a3f5300fcf38814873d0484b05f30e44b05fba20c0"
    expect(newTransaction.hasValidSignature()).toBe(false)
  });

  test('Returns true if signature matches fromAddress public key and all transaction details', () => {
    expect(newTransaction.hasValidSignature()).toBe(true)
  });

  test('Returns false if amount changes', () => {
    expect(newTransaction.hasValidSignature()).toBe(true)
    newTransaction.amount = newTransaction.amount + 1
    expect(newTransaction.hasValidSignature()).toBe(false)
  });

  test('Returns false if toAddress changes', () => {
    expect(newTransaction.hasValidSignature()).toBe(true)
    newTransaction.toAddress = newTransaction.toAddress + "badData"
    expect(newTransaction.hasValidSignature()).toBe(false)
  });

  test('Returns false if memo changes', () => {
    expect(newTransaction.hasValidSignature()).toBe(true)
    newTransaction.memo = "badData"
    expect(newTransaction.hasValidSignature()).toBe(false)
  });

  test('Returns false if fee changes', () => {
    expect(newTransaction.hasValidSignature()).toBe(true)
    newTransaction.fee = 99999
    expect(newTransaction.hasValidSignature()).toBe(false)
  });

  test('Returns false if timestamp changes', () => {
    expect(newTransaction.hasValidSignature()).toBe(true)
    newTransaction.timestamp = 999999
    expect(newTransaction.hasValidSignature()).toBe(false)
  });

  test('Returns false if uuid changes', () => {
    expect(newTransaction.hasValidSignature()).toBe(true)
    newTransaction.uuid = "badUUID"
    expect(newTransaction.hasValidSignature()).toBe(false)
  });

  test('Returns false if fromAddress changes', () => {
    expect(newTransaction.hasValidSignature()).toBe(true)
    newTransaction.fromAddress = "0466106d7a83b41134c3e973fe13c0aa682ec8ee94c32cf6d66429e429554dc4ed9d7c64d0c5685229f503307a30f65c954e781d0f3cf4f77d07e0a9d4c37e1d01"
    expect(newTransaction.hasValidSignature()).toBe(false)
  });

});


describe('hasRequiredFields', () => {

  test('Returns false if missing fromAddress', () => {
    newTransaction.fromAddress = null
    expect(newTransaction.hasRequiredFields()).toBe(false)
  });

  test('Returns false if missing toAddress', () => {
    newTransaction.toAddress = null
    expect(newTransaction.hasRequiredFields()).toBe(false)
  });

  test('Returns false if amount is zero or negative', () => {
    newTransaction.amount = 0
    expect(newTransaction.hasRequiredFields()).toBe(false)
    newTransaction.amount = -1
    expect(newTransaction.hasRequiredFields()).toBe(false)
  });

  test('Returns true if required fields are present and amount > 0', () => {
    expect(newTransaction.hasRequiredFields()).toBe(true)
  });

});

describe('isValid', () => {

  beforeEach(() => {
    jest.spyOn(newTransaction, 'hasRequiredFields').mockImplementation(() => true);
    jest.spyOn(newTransaction, 'hasValidSignature').mockImplementation(() => true);
  })

  test('Returns false if hasRequiredFields returns false', () => {
    jest.spyOn(newTransaction, 'hasRequiredFields').mockImplementation(() => false);
    expect(newTransaction.isValid()).toBe(false)
  });

  test('Returns false if hasValidSignature returns false', () => {
    jest.spyOn(newTransaction, 'hasValidSignature').mockImplementation(() => false);
    expect(newTransaction.isValid()).toBe(false)
  });

  test('Returns false if amount <= 0', () => {
    newTransaction.amount = 0
    expect(newTransaction.isValid()).toBe(false)
  });

  test('Returns true if has required fields, valid signature, and amount > 0', () => {
    expect(newTransaction.isValid()).toBe(true)
  });

});
  
describe('CoinbaseTransaction subclass', () => {
  let coinbaseTx
  let miningRewardAddress = "miningRewardAddress"
  let miningReward = 10

  beforeEach(() => {
    coinbaseTx = new CoinbaseTransaction(miningRewardAddress, miningReward)
  })

  describe('Constructor', () => {
    it('Creates a transaction instance', () => {
      expect(coinbaseTx).toBeInstanceOf(Transaction)
    });
  
    it('Has Coinbase Tx fields from config value', () => {
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
  })

  describe('isValid', () => {

    describe('Returns false', () => {

      it('When amount is 0 or less', () => {
        coinbaseTx.amount = 0
        expect(coinbaseTx.isValid()).toBe(false)
        coinbaseTx.amount = -1
        expect(coinbaseTx.isValid()).toBe(false)
      });

      it('When fromAddress doesnt match config', () => {
        coinbaseTx.fromAddress = "madeupFromAddress"
        expect(coinbaseTx.isValid()).toBe(false)
      });

      it('When memo doesnt match config', () => {
        coinbaseTx.memo = "madeupMemo"
        expect(coinbaseTx.isValid()).toBe(false)
      }); 
    })


    describe('Returns true', () => {
      it('Otherwise', () => {
        expect(coinbaseTx.isValid()).toBe(true)
      });
    })
 

  })

});

