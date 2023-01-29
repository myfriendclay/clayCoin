import Transaction from "./Transaction/Transaction"

export default class MemPool {
  pendingTransactionPool: Set<Transaction>

  constructor() {
    this.pendingTransactionPool = new Set<Transaction>()
  }

  addTransaction(transaction: Transaction) {
    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transaction to chain")
    }
    
    this.pendingTransactionPool.add(transaction)
  }

   //Transaction helpers:
  addCoinbaseTxToMempool(miningRewardAddress: string, blockSubsidyAmount: number): Transaction {
     //Mining reward:
     const coinbaseTx = new Transaction("Coinbase Tx", miningRewardAddress, blockSubsidyAmount, "Mining reward transaction")
     this.addTransaction(coinbaseTx)
     return coinbaseTx
  }

  resetMempool() {
    this.pendingTransactionPool.clear()
  }
}