import SHA256 from "crypto-js/sha256.js"
import EC from "elliptic"
const ec = new EC.ec('secp256k1')
import { v4 as uuidv4 } from 'uuid';

export default class Transaction {
  constructor(fromAddress, toAddress, amount, timestamp, memo = "") {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
    this.uuid = uuidv4()
    this.memo = memo
    this.timestamp = timestamp
  }

  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount + this.uuid + this.memo + this.timestamp).toString()
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

// export class CoinbaseTransaction extends Transaction {
//     constructor(length) {
//       // Here, it calls the parent class' constructor with lengths
//       // provided for the Polygon's width and height
//       super(toAddress, amount, timestamp, memo = "");
//       // Note: In derived classes, super() must be called before you
//       // can use 'this'. Leaving this out will cause a reference error.
//       this.name = 'Square';
//     }
// }