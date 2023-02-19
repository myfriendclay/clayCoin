import EC from "elliptic"
const ec = new EC.ec('secp256k1')
import { v4 as uuidv4 } from 'uuid';
import getSHA256Hash from '../utils/crypto-hash'
import { COINBASE_TX } from "../../config";

export default class Transaction {
  fromAddress: string
  toAddress: string
  amount: number
  memo: string
  fee: number
  uuid: string
  timestamp: number
  signature: string | undefined

  constructor(fromAddress: string, toAddress: string, amount: number, memo: string, fee: number = 0) {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
    this.memo = memo
    this.fee = fee
    this.uuid = uuidv4()
    this.timestamp = Date.now()
  }

  calculateHash():string {
    return getSHA256Hash(this.fromAddress, this.toAddress, this.amount, this.memo, this.fee, this.uuid, this.timestamp)
  }

  signTransaction(secretKey: string): void {
    const signingKey = ec.keyFromPrivate(secretKey, 'hex')
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error("you can't sign transactions for other wallets")
    }

    const transactionHash = this.calculateHash()
    const signature = signingKey.sign(transactionHash, 'base64')
    this.signature = signature.toDER('hex')
  }

  hasValidSignature(): boolean {
    if (!this.signature) {
      return false
    }
    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
    return publicKey.verify(this.calculateHash(), this.signature)
  }

  hasRequiredFields(): boolean {
    return !!(this.fromAddress && this.toAddress && this.amount > 0)
  }

  isValid(): boolean {
    return this.hasRequiredFields() && this.hasValidSignature() && this.amount > 0
  }
}

export class CoinbaseTransaction extends Transaction {
  constructor(miningRewardAddress: string, miningReward: number) {
    super(COINBASE_TX.fromAddress, miningRewardAddress, miningReward, COINBASE_TX.memo)
  }

  isValid(): boolean {
    const { fromAddress, memo } = COINBASE_TX
    return this.fromAddress === fromAddress && this.memo === memo && this.amount > 0
  }
}