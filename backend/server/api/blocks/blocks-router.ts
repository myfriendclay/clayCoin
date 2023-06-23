import { pubsub } from "../../index";
import { blockchain } from "../../../database/database";
import { Router } from "express";
const router = Router();

//@ts-ignore
router.post("/mine", (req, res) => {
  const { miningAddress } = req.body;
  const newBlock = blockchain.minePendingTransactions(miningAddress);
  pubsub.broadcastChain();
  res.status(201).json(newBlock);
});

router.get("/:hash/isBlockValid", (req, res) => {
  const { hash } = req.params;
  const block = blockchain.chain.find((blck) => blck.hash === hash);
  if (block === undefined) {
    res.status(404).json({ error: "Block not found" });
    return;
  }
  let isValidBlock =
    blockchain.chain[0].hash === hash
      ? block.isValidGenesisBlock()
      : block.isValid();
  res.status(200).json({ isValidBlock });
});

export default router;
