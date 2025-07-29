import { Router, Request, Response } from "express";
import { mempool } from "../../../database/database";
import Transaction from "../../../blockchain/Transaction/Transaction";
interface MempoolResponse {
  mempool: Transaction[];
}

const router = Router();

router.get("/", (_req: Request, res: Response<MempoolResponse>) => {
  const response: MempoolResponse = {
    mempool: mempool.pendingTransactions
  };
  res.json(response);
});

export default router;
