import Transaction from "./Transaction";
import EC from "elliptic"
const ec = new EC.ec('secp256k1')

// Generate a new key pair and convert them to hex-strings
const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log(publicKey)
console.log(privateKey)

const key2 = ec.genKeyPair();
const publicKey2 = key.getPublic('hex');
const privateKey2 = key.getPrivate('hex');
let newTransaction

beforeEach(() => {
  newTransaction = new Transaction("bogus_from_address", "bogus_to_address", 45, "01/12/2022", "pizza and beer")
  newTransaction.uuid = "123456789"
});

describe('Constructor function (creation)', () => {
  it('Create Transaction with all 6 properties', () => {
    expect(newTransaction).toHaveProperty('fromAddress');
    expect(newTransaction).toHaveProperty('toAddress');
    expect(newTransaction).toHaveProperty('amount');
    expect(newTransaction).toHaveProperty('timestamp');
    expect(newTransaction).toHaveProperty('memo');
    expect(newTransaction).toHaveProperty('uuid');
  });
});


  describe('calculateHash', () => {
    it('Returns a valid hash of transaction', () => {
      expect(newTransaction.calculateHash()).toBe('2d42a23585224da9e3a6c5001c64e989d83690f2c75e6b0e03ed7ec5153d07e2')
    })

    it('Changes hash if you tamper with any part of transaction', () => {
      const firstHash = newTransaction.calculateHash()
      newTransaction.amount = 99999
      expect(newTransaction.calculateHash()).not.toBe(firstHash)

      const secondHash = newTransaction.calculateHash()
      newTransaction.toAddress = "tamperedToAddress"
      expect(newTransaction.calculateHash()).not.toBe(secondHash)

      const thirdHash = newTransaction.calculateHash()
      newTransaction.fromAddress = "tamperedFromAddress"
      expect(newTransaction.calculateHash()).not.toBe(thirdHash)

    })
  });

  describe('signTransaction', () => {
    test('Throws error if not fromAddress signing', () => {
      const newTransaction = new Transaction("bogus_from_address", "to_address", 45)
      expect(() => newTransaction.signTransaction(key)).toThrow(Error)
    });

    test('Updates Transaction signature when signingKey matches fromAddress', () => {
      const newTransaction = new Transaction(publicKey, "bogus_to_address", 45)
      newTransaction.signTransaction(key)
      expect(newTransaction).toHaveProperty('signature')
    });

  });

  describe('isValid', () => {
    
    test('If fromAddress is "Coinbase Tx" then returns true (mining reward', () => {
      const newTransaction = new Transaction("Coinbase Tx", "to_address", 45)
      expect(newTransaction.isValid()).toBe(true)
    });

    test('Throws error if missing signature', () => {
      const newTransaction = new Transaction("from_address", "to_address", 45)
      expect(() => newTransaction.isValid()).toThrow(Error)
    });
    
    test('Returns false if signature doesnt match fromAddress public key', () => {
      const newTransaction = new Transaction(publicKey, "to_address", 45)
      const different_key = ec.genKeyPair();
      const transactionHash = newTransaction.calculateHash()
      const different_signature = different_key.sign(transactionHash, 'base64')
      newTransaction.signature = different_signature
      expect(newTransaction.isValid()).toBe(false)
    });

    test('Returns true if signature matches fromAddress public key', () => {
      const newTransaction = new Transaction(publicKey, "to_address", 45)
      newTransaction.signTransaction(key)
      expect(newTransaction.isValid()).toBe(true)
    });

  });
  

