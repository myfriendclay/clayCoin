const router = require('express').Router();
import {blockchain} from "../../../database/database";
import Blockchain from "../../../blockchain/Blockchain/Blockchain";

router.get('/', (req: any, res: any) => {
    const response = {
        'blockchain': blockchain,
        'length': blockchain.chain.length,
        'isChainValid': Blockchain.isChainValid(blockchain.chain),
        'difficulty': blockchain.difficulty,
        }
        res.json(response)
});

module.exports = router;
