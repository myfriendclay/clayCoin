import Transaction from "./Transaction";
import EC from "elliptic"
const ec = new EC.ec('secp256k1')
import * as getSHA256HashModule from "../../utils/crypto-hash";
import { COINBASE_TX } from "../../config";
import {CoinbaseTransaction} from './Transaction'

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

describe('isValid', () => {

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

