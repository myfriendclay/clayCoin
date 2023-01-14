import EC from "elliptic"
import Transaction from "./Transaction.js";
const ec = new EC.ec('secp256k1')

const key = ec.genKeyPair();
// console.log('key', key)
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

const key2 = ec.genKeyPair();
const publicKey2 = key.getPublic('hex');
const privateKey2 = key.getPrivate('hex');

const transaction = new Transaction(publicKey, publicKey2, 23)
// transaction.signTransaction(key)

// console.log("from address", publicKey)
// console.log("to address", publicKey2)
// console.log("signature", transaction.signature)

const msgHash = "not secret transaction message"
//here's how we'll do it
// const privateKeyguy = ec.keyFromPrivate(privateKey, 'hex')
// console.log(privateKey)
// console.log(privateKeyguy)

const signingKey = ec.keyFromPrivate("0b9e25155f05ba792d8ed7d670201e60959184af77ab433ea814b67422276149", 'hex')
// console.log(signingKey)
// console.log(signingKey.getPublic('hex'))



// from address "0442350eabbb6bfba7e82c4007a9503e9e671088f0596dc4d33bff1930f6ff59e1396f86fe18431e0a3e6b8e90a65db0f215f5519ef1d9760c6c4bf8e80b21bcc2"
// to address "0442350eabbb6bfba7e82c4007a9503e9e671088f0596dc4d33bff1930f6ff59e1396f86fe18431e0a3e6b8e90a65db0f215f5519ef1d9760c6c4bf8e80b21bcc2"
// signature "3045022100e43e23faff28d86bc86152c2b0f18fd415c0249726af0f51f5a478fe0479bea00220045bb97c46871130d98889c41360c797f66fdf37d5b8f81d15ddfba0c0c9aac8"

// {
//   "fromAddress": "0442350eabbb6bfba7e82c4007a9503e9e671088f0596dc4d33bff1930f6ff59e1396f86fe18431e0a3e6b8e90a65db0f215f5519ef1d9760c6c4bf8e80b21bcc2",
//   "toAddress": "0442350eabbb6bfba7e82c4007a9503e9e671088f0596dc4d33bff1930f6ff59e1396f86fe18431e0a3e6b8e90a65db0f215f5519ef1d9760c6c4bf8e80b21bcc2",
//   "amount": 23,
//   "signature": "3045022100e43e23faff28d86bc86152c2b0f18fd415c0249726af0f51f5a478fe0479bea00220045bb97c46871130d98889c41360c797f66fdf37d5b8f81d15ddfba0c0c9aac8"
// }