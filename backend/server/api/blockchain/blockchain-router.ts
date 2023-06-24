import { blockchain } from "../../../database/database";
import Blockchain from "../../../blockchain/Blockchain/Blockchain";
import { Router } from "express";
import { plainToInstance } from "class-transformer";
const router = Router();

router.get("/", (req: any, res: any) => {

  const response = {
    blockchain: blockchain,
    length: blockchain.chain.length,
    isChainValid: blockchain.isChainValid(),
    difficulty: blockchain.difficulty,
  };
  res.json(response);
});

export default router;
