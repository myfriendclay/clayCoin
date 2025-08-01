import { blockchain } from "../../../database/database";
import Wallet from "../../../blockchain/Wallet/Wallet";
import { Router } from "express";
const router = Router();

router.get("/:publicAddress", (req, res) => {
  const publicAddress = req.params.publicAddress;
  
  try {
    const balance = Wallet.getBalanceOfAddress(publicAddress, blockchain.chain);
    const transactions = Wallet.getAllTransactionsForWallet(
      publicAddress,
      blockchain.chain
    );
    const wallet = {
      balance,
      transactions,
    };
    res.json(wallet);
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to get wallet info' 
    });
  }
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
