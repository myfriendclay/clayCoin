const router = require('express').Router();
import Transaction from "../../../blockchain/Transaction/Transaction";
import { blockchain, pubsub } from "../utils/database";

//@ts-ignore
router.post('/',  (req, res) => {
    const { fromAddress, toAddress, amount, memo, secretKey, fee } = req.body
    const newTransaction = new Transaction(fromAddress, toAddress, amount, memo, fee)
  
    try {
      newTransaction.signTransaction(secretKey)
      blockchain.addTransaction(newTransaction)
      pubsub.broadcastTransaction(newTransaction)
      res.json(blockchain.pendingTransactions)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
});


module.exports = router;
