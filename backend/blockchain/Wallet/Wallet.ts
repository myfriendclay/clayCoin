import EC from "elliptic"
import { BlockType, TransactionType } from "../../app/src/App";
const ec = new EC.ec('secp256k1')

export default class Wallet {
  publicKey: string;
  privateKey: string;

  constructor() {
    const key = ec.genKeyPair();
    this.publicKey = key.getPublic('hex');
    this.privateKey = key.getPrivate('hex');
  }

  public getPublicKey() : string {
    return this.publicKey
  }

  public getPrivateKey() : string {
    return this.privateKey
  }

  static getTotalPendingOwedByWallet(publicKey: string, pendingTransactions: TransactionType[]): number {
    const pendingTransactionsForWallet = pendingTransactions.filter(tx => tx.fromAddress === publicKey)
    const totalPendingAmount = pendingTransactionsForWallet.map(tx => tx.amount + tx.fee).reduce((prev, curr) => prev + curr, 0)
    return totalPendingAmount
  }

  static walletHasSufficientFunds(publicKey: string, transaction: TransactionType, chain: BlockType[], pendingTransactions: TransactionType[]): boolean {
    const walletBalance = this.getBalanceOfAddress(publicKey, chain)
    if (walletBalance === null) {
      return false
    }
    const totalPendingOwed = this.getTotalPendingOwedByWallet(publicKey, pendingTransactions)
    return walletBalance >= totalPendingOwed + transaction.amount + transaction.fee
  }
  
  static getAllTransactionsForWallet(publicKey: string, chain: BlockType[]): TransactionType[] {
    const transactions = []
    for (const block of chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === publicKey || transaction.toAddress === publicKey) {
          transactions.push(transaction)
        }
      }
    }
    return transactions
  }

  static getBalanceOfAddress(publicKey: string, chain: BlockType[]): number | null {
    let balance = 0
    for (const block of chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === publicKey) {
          balance -= transaction.amount
          balance -= transaction.fee
        }

        if (transaction.toAddress === publicKey) {
          balance += transaction.amount
        }
      }
    }
    return balance
  }
}