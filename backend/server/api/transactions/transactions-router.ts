import Transaction from "../../../blockchain/Transaction/Transaction";
import { pubsub } from "../../index";
import { blockchain, mempool } from "../../../database/database";
import { Router } from "express";
const router = Router();

//@ts-ignore
router.post("/", (req, res) => {
  const { fromAddress, toAddress, amount, memo, secretKey, fee } = req.body;
  const newTransaction = new Transaction(
    fromAddress,
    toAddress,
    amount,
    memo,
    fee
  );
  try {
    newTransaction.signTransaction(secretKey);
    mempool.addTransaction(newTransaction);
    pubsub.broadcastTransaction(newTransaction);
    res.status(201).json(mempool.pendingTransactions);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
