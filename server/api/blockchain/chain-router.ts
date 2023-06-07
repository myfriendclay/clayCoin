const router = require('express').Router();
import { blockchain } from "../utils/database";
import Blockchain from "../../../blockchain/Blockchain/Blockchain";

//@ts-ignore
router.get('/', (req, res) => {
    const response = {
        'blockchain': blockchain,
        'length': blockchain.chain.length,
        'isChainValid': Blockchain.isChainValid(blockchain.chain)
        }
        res.json(response)
});

module.exports = router;
