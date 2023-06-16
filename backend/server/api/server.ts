const express = require('express');
const cors = require('cors');

const server = express();
const bodyParser = require('body-parser');

const transactionsRouter = require('./transactions/transactions-router');
const walletsRouter = require('./wallets/wallet-router');
const blockchainRouter = require('./blockchain/blockchain-router');
const blocksRouter = require('./blocks/blocks-router');

server.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
server.use(express.json());
server.use(bodyParser.json())

server.use('/api/transactions', transactionsRouter);
server.use('/api/wallets', walletsRouter);
server.use('/api/blockchain', blockchainRouter);
server.use('/api/blocks', blocksRouter);


server.use((err: any, req: any, res: any, next: any) => { 
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
