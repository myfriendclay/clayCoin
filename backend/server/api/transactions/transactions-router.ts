import { Router, Request, Response } from "express";
import Transaction from "../../../blockchain/Transaction/Transaction";
import { pubsub } from "../../index";
import { mempool } from "../../../database/database";

interface CreateTransactionRequest {
  fromAddress: string;
  toAddress: string;
  amount: number;
  memo: string;
  secretKey: string;
  fee?: number;
}

const router = Router();

router.post("/", async (req: Request<{}, {}, CreateTransactionRequest>, res: Response) => {
  try {
    const { fromAddress, toAddress, amount, memo, secretKey, fee } = req.body;
    
    const newTransaction = new Transaction(
      fromAddress,
      toAddress,
      amount,
      memo,
      fee
    );
    
    newTransaction.signTransaction(secretKey);
    await mempool.addTransaction(newTransaction);
    pubsub.broadcastTransaction(newTransaction);
    
    res.status(201).json(mempool.pendingTransactions);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({ error: errorMessage });
  }
});

export default router;
