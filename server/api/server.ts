const express = require('express');
const cors = require('cors');

const server = express();
const bodyParser = require('body-parser');

const transactionsRouter = require('./transactions/transactions-router');
const walletsRouter = require('./wallets/wallet-router');
const blockchainRouter = require('./blockchain/chain-router');
const mineBlockRouter = require('./blockchain/mine-router');

server.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
server.use(express.json());
server.use(bodyParser.json())

server.use('/transactions', transactionsRouter);
server.use('/wallets', walletsRouter);
server.use('/blockchain', blockchainRouter);
server.use('/mine', mineBlockRouter);


server.use((err, req, res, next) => { 
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
