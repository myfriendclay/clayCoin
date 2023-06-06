const router = require('express').Router();
import { blockchain, pubsub } from "../blockchain";

//@ts-ignore
router.post('/', (req, res) => {
    const { miningAddress } = req.body
    const newBlock = blockchain.minePendingTransactions(miningAddress)
    pubsub.broadcastChain()
    res.json(newBlock)
});

module.exports = router;