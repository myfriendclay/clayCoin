import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import transactionsRouter from "./transactions/transactions-router";
import walletsRouter from "./wallets/wallet-router";
import blockchainRouter from "./blockchain/blockchain-router";
import blocksRouter from "./blocks/blocks-router";

//App creation:
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

app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

//Routers setup:
app.use("/api/transactions", transactionsRouter);
app.use("/api/wallets", walletsRouter);
app.use("/api/blockchain", blockchainRouter);
app.use("/api/blocks", blocksRouter);

export default app;
