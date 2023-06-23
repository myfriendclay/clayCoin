import { blockchain } from "../../../database/database";
import Wallet from "../../../blockchain/Wallet/Wallet";
import { Router } from "express";
const router = Router();

// @ts-ignore
router.get("/:publicAddress", (req, res) => {
  const publicAddress = req.params.publicAddress;
  const balance = Wallet.getBalanceOfAddress(publicAddress, blockchain.chain);
  const transactions = Wallet.getAllTransactionsForWallet(
    publicAddress,
    blockchain.chain
  );
  const wallet = {
    balance: balance,
    transactions: transactions,
  };
  res.json(wallet);
});

router.post("/", (_req: any, res: any) => {
  const wallet = new Wallet();
  const response = {
    publicKey: wallet.getPublicKey(),
    privateKey: wallet.getPrivateKey(),
  };
  res.json(response);
});

export default router;
