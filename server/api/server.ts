const express = require('express');
const cors = require('cors');

const server = express();
const bodyParser = require('body-parser');

const transactionsRouter = require('./transactions/transactions');
const walletsRouter = require('./wallets/wallets');
const blockchainRouter = require('./blockchain/blockchain');
const mineBlockRouter = require('./blockchain/mine');

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

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
