const router = require('express').Router();
import { blockchain, pubsub } from "../utils/database";

//@ts-ignore
router.post('/', (req, res) => {
    const { miningAddress } = req.body
    const newBlock = blockchain.minePendingTransactions(miningAddress)
    pubsub.broadcastChain()
    res.status(201).json(newBlock)
});

module.exports = router;