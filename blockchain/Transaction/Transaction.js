import SHA256 from "crypto-js/sha256.js"
import EC from "elliptic"
const ec = new EC.ec('secp256k1')
import { v4 as uuidv4 } from 'uuid';

export default class Transaction {
  constructor(fromAddress, toAddress, amount, timestamp, memo = "") {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
    this.timestamp = timestamp
    this.memo = memo
    this.uuid = uuidv4()
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

  isValid() {
    //For mining reward:
    if (this.fromAddress === "Coinbase Tx") {
      return true
    }
    if (!this.fromAddress || !this.toAddress) {
      throw new Error("Transaction must include from and to address ")
    }
    if (this.amount <= 0) {
      throw new Error("Amount must be greater than 0!")
    }
    if (!this.signature) {
      throw new Error("All transactions must be signed")
    }
    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
    return publicKey.verify(this.calculateHash(), this.signature)
  }
}