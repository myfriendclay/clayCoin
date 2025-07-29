import { blockchain } from "../../../database/database";
import { Request, Response, Router } from "express";
const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const response = {
    blockchain: blockchain,
    length: blockchain.chain.length,
    isChainValid: blockchain.isChainValid(),
  };
  res.json(response);
});

export default router;
