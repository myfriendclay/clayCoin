const router = require('express').Router();
import { blockchain } from "../blockchain";
import Wallet from "../../../blockchain/Wallet/Wallet";

// @ts-ignore
router.get('/:publicAddress',  (req, res) => {
    const publicAddress = req.params.publicAddress
    const balance = Wallet.getBalanceOfAddress(publicAddress, blockchain.chain)
    const transactions = Wallet.getAllTransactionsForWallet(publicAddress, blockchain.chain)
    const wallet = {
      balance: balance,
      transactions: transactions
    }
    res.json(wallet)
});

router.post('/', (_req: any, res: { json: (arg0: { publicKey: string; privateKey: string; }) => void; }) => {
    const wallet = new Wallet()
    const response = {
      'publicKey': wallet.getPublicKey(),
      'privateKey': wallet.getPrivateKey(),
    }
    res.json(response)
  })

module.exports = router;
