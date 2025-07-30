import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { isHttpError } from 'http-errors';

import transactionsRouter from "./transactions/transactions-router";
import walletsRouter from "./wallets/wallet-router";
import blockchainRouter from "./blockchain/blockchain-router";
import blocksRouter from "./blocks/blocks-router";
import mempoolRouter from './mempool/mempool-router'

const app = express();

//Middleware setup:
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(bodyParser.json());

//Routers setup:
app.use("/api/blockchain", blockchainRouter);
app.use("/api/blocks", blocksRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/wallets", walletsRouter);
app.use("/api/mempool", mempoolRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (isHttpError(err)) {
    res.status(err.status).json({ message: err.message });
  } else {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    res.status(500).json({ message });
  }
});

export default app;
