import { pubsub } from "../../index";
import { blockchain, mempool } from "../../../database/database";
import { Router } from "express";
const router = Router();

//@ts-ignore
router.post("/mine", async (req, res) => {
  try {
    const { miningAddress } = req.body;
    const newBlock = await mempool.minePendingTransactions(miningAddress);
    pubsub.broadcastChain();
    res.status(201).json(newBlock);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:hash/isBlockValid", async (req, res) => {
  try {
    const { hash } = req.params;
    const block = await blockchain.getBlockByHash(hash);
    if (!block) {
      res.status(404).json({ error: "Block not found" });
      return;
    }
    let isValidBlock = block.isValid();
    res.status(200).json({ isValidBlock });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
