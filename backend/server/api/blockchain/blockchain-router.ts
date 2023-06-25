import { blockchain, mempool } from "../../../database/database";
import { Router } from "express";
const router = Router();

router.get("/", (req: any, res: any) => {

  const response = {
    blockchain: blockchain,
    length: blockchain.chain.length,
    isChainValid: blockchain.isChainValid(),
    difficulty: blockchain.difficulty,
    mempool: mempool.pendingTransactions
  };
  res.json(response);
});

export default router;
