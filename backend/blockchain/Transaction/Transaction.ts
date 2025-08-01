import EC from "elliptic";
const ec = new EC.ec("secp256k1");
import { v4 as uuidv4 } from "uuid";
import getSHA256Hash from "../utils/crypto-hash";
import Wallet from "../Wallet/Wallet";

class Transaction {
  fromAddress: string;
  toAddress: string;
  amount: number;
  memo: string;
  fee: number;
  uuid: string;
  timestamp: number;
  signature: string | undefined;
  __type: 'default' | 'CoinbaseTransaction'

  constructor(
    fromAddress: string,
    toAddress: string,
    amount: number,
    memo: string,
    fee: number = 0
  ) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.memo = memo;
    this.fee = fee;
    this.uuid = uuidv4();
    this.timestamp = Date.now();
    this.__type = "default";
  }

  calculateHash(): string {
    return getSHA256Hash(
      this.fromAddress,
      this.toAddress,
      this.amount,
      this.memo,
      this.fee,
      this.uuid,
      this.timestamp
    );
  }

  signTransaction(secretKey: string): void {
    const signingKey = ec.keyFromPrivate(secretKey, "hex");
    if (signingKey.getPublic("hex") !== this.fromAddress) {
      throw new Error(
        "Unauthorized: Your private key is invalid or doesn't match your public address"
      );
    }

    const transactionHash = this.calculateHash();
    const signature = signingKey.sign(transactionHash, "base64");
    this.signature = signature.toDER("hex");
  }

  hasValidSignature(): boolean {
    if (!this.signature) {
      return false;
    }
    const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
    return publicKey.verify(this.calculateHash(), this.signature);
  }

  hasRequiredFields(): boolean {
    if (!this.fromAddress) {
      throw new Error('fromAddress is missing');
    }
    if (!this.toAddress) { 
      throw new Error('toAddress is missing');
    }

    if (this.amount <= 0) { 
      throw new Error('amount must be greater than 0');
    }
    return !!(this.fromAddress && this.toAddress && this.amount > 0);

  }

  isValid(): boolean {
    if (!this.hasRequiredFields()) {
      throw new Error('Transaction is missing required fields');
    }
    
    if (!this.hasValidSignature()) {
      throw new Error('Transaction has invalid signature');
    }

    if (this.amount <= 0) {
      throw new Error('Transaction amount must be greater than 0');
    }

    if (this.fee < 0) {
      throw new Error('Transaction fee cannot be negative');
    }

    if (!Wallet.isValidPublicKey(this.toAddress)) {
      throw new Error(`Invalid recipient public key: ${this.toAddress}`);
    }

    return true;
  }
}

export default Transaction;