import { mempool } from "../../../database/database";
import { Router } from "express";
const router = Router();

router.get("/", (req: any, res: any) => {
  const response = {
    mempool: mempool.pendingTransactions
  };
  res.json(response);
});

export default router;
