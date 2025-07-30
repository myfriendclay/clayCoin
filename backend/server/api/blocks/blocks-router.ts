import { pubsub } from "../../index";
import { blockchain, mempool } from "../../../database/database";
import { Router, Request, Response, NextFunction } from "express";
const router = Router();

router.post("/mine", async (req: Request<{}, {}, { miningAddress: string }>, res: Response, next: NextFunction) => {
  try {
    const { miningAddress } = req.body;
    const newBlock = await mempool.minePendingTransactions(miningAddress);
    pubsub.broadcastChain();
    res.status(201).json(newBlock);
  }  catch (error) {
      next(error);
  }
});

router.get("/:hash/isBlockValid", async (req: Request<{ hash: string }>, res: Response, next: NextFunction) => {
  try {
    const { hash } = req.params;
    const block = await blockchain.getBlockByHash(hash);
    if (!block) {
      res.status(404).json({ error: "Block not found" });
      return;
    }
    let isValidBlock = block.isValid();
    res.status(200).json({ isValidBlock });
  }  catch (error) {
    next(error);
  }
});

export default router;
