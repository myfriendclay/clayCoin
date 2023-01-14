import SHA256 from "crypto-js/sha256.js"
import EC from "elliptic"
const ec = new EC.ec('secp256k1')
import { v4 as uuidv4 } from 'uuid';

export default class Transaction {
  constructor(fromAddress, toAddress, amount, memo = "") {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
    this.memo = memo
    this.uuid = uuidv4()
    this.timestamp = Date.now()
  }

  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp + this.memo + this.uuid).toString()
  }

  signTransaction(secretKey) {
    const signingKey = ec.keyFromPrivate(secretKey, 'hex')
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error("you can't sign transactions for other wallets")
    }

    const transactionHash = this.calculateHash()
    const signature = signingKey.sign(transactionHash, 'base64')
    this.signature = signature.toDER('hex')
  }

  hasValidSignature() {
    if (this.signature) {
      const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
      return publicKey.verify(this.calculateHash(), this.signature)
    } else {
      return false
    }
  }

  isCoinbaseTransaction() {
    //For mining reward:
    return this.fromAddress === "Coinbase Tx"
  }

  hasRequiredFields() {
    return !!(this.fromAddress && this.toAddress && this.amount > 0)
  }

  isValid() {
    if (this.isCoinbaseTransaction()) {
      return true
    }
    return this.hasRequiredFields() && this.hasValidSignature()
  }
}