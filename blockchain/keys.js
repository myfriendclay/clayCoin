import EC from "elliptic"
import Transaction from "./Transaction.js";
const ec = new EC.ec('secp256k1')

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

const key2 = ec.genKeyPair();
const publicKey2 = key.getPublic('hex');
const privateKey2 = key.getPrivate('hex');

const transaction = new Transaction(publicKey, publicKey2, 23)
// transaction.signTransaction(key)

const msgHash = "not secret transaction message"
//here's how we'll do it
// const privateKeyguy = ec.keyFromPrivate(privateKey, 'hex')


const signingKey = ec.keyFromPrivate("0b9e25155f05ba792d8ed7d670201e60959184af77ab433ea814b67422276149", 'hex')
