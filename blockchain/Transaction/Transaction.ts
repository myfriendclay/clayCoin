import SHA256 from "crypto-js/sha256.js"
import EC from "elliptic"
const ec = new EC.ec('secp256k1')
import { v4 as uuidv4 } from 'uuid';

export default class Transaction {
  fromAddress: string
  toAddress: string
  amount: number
  memo: string
  uuid: string
  timestamp: number
  signature: string

  constructor(fromAddress: string, toAddress: string, amount: number, memo: string) {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
    this.memo = memo
    this.uuid = uuidv4()
    this.timestamp = Date.now()
  }

  calculateHash():string {
    return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp + this.memo + this.uuid).toString()
  }

  signTransaction(secretKey: string) {
    const signingKey = ec.keyFromPrivate(secretKey, 'hex')
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error("you can't sign transactions for other wallets")
    }

    const transactionHash = this.calculateHash()
    const signature = signingKey.sign(transactionHash, 'base64')
    this.signature = signature.toDER('hex')
  }

  hasValidSignature(): boolean {
    if (this.signature) {
      const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
      return publicKey.verify(this.calculateHash(), this.signature)
    } else {
      return false
    }
  }

  isCoinbaseTransaction():boolean {
    //For mining reward:
    return this.fromAddress === "Coinbase Tx"
  }

  hasRequiredFields() {
    return !!(this.fromAddress && this.toAddress && this.amount > 0)
  }

  isValid(): boolean {
    if (this.isCoinbaseTransaction()) {
      return true
    }
    return this.hasRequiredFields() && this.hasValidSignature()
  }
}