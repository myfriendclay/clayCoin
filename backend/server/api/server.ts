const express = require('express');
const cors = require('cors');

const app = express();
const bodyParser = require('body-parser');

const transactionsRouter = require('./transactions/transactions-router');
const walletsRouter = require('./wallets/wallet-router');
const blockchainRouter = require('./blockchain/blockchain-router');
const blocksRouter = require('./blocks/blocks-router');

//Middleware setup:
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(bodyParser.json())

app.use((err: any, req: any, res: any, next: any) => { 
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});
//End of middleware setup

//Routers setup:
app.use('/api/transactions', transactionsRouter);
app.use('/api/wallets', walletsRouter);
app.use('/api/blockchain', blockchainRouter);
app.use('/api/blocks', blocksRouter);

module.exports = app;