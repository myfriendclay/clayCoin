import express from 'express'
import Blockchain from '../blockchain/Blockchain/Blockchain'
import Transaction from '../blockchain/Transaction/Transaction'
import bodyParser from 'body-parser'
import 'reflect-metadata';
import 'es6-shim';
import request from 'request'
import { plainToClass } from 'class-transformer';
import cors from 'cors'
import Wallet from '../blockchain/Wallet/Wallet'
import {blockchain, pubsub} from './api/blockchain'


require('dotenv').config();

const DEFAULT_PORT: number = parseInt(process.env.DEFAULT_PORT || '3000');

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

//Multiple peer setup- setup
let PEER_PORT
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
}
const PORT = PEER_PORT || DEFAULT_PORT

// parse application/json
app.use(bodyParser.json())

const syncChains = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/blockchain`}, (error: any, response: { statusCode: number }, body: string) => {
    if (!error && response.statusCode === 200) {
      const rootChain = JSON.parse(body)
      let blockchainInstance = plainToClass(Blockchain, rootChain.blockchain);
      console.log('replace chain on a sync with', blockchainInstance)
      blockchain.replaceChain(blockchainInstance)
    }
  })
}

//API calls
app.post('/mine', (req, res) => {
  const { miningAddress } = req.body
  const newBlock = blockchain.minePendingTransactions(miningAddress)
  pubsub.broadcastChain()
  res.json(newBlock)
})

app.get('/blockchain', (req, res) => {
  const response = {
    'blockchain': blockchain,
    'length': blockchain.chain.length,
    'isChainValid': Blockchain.isChainValid(blockchain.chain)
  }
  res.json(response)
})

app.get('/wallets/new', (req, res) => {
  const wallet = new Wallet()
  const response = {
    'publicKey': wallet.getPublicKey(),
    'privateKey': wallet.getPrivateKey(),
  }
  res.json(response)
})

app.get(`/wallets/:publicAddress`, (req, res) => {
  const publicAddress = req.params.publicAddress
  const balance = Wallet.getBalanceOfAddress(publicAddress, blockchain.chain)
  const transactions = Wallet.getAllTransactionsForWallet(publicAddress, blockchain.chain)
  const wallet = {
    balance: balance,
    transactions: transactions
  }
  res.json(wallet)
})

app.post('/transactions', (req, res) => {
  const { fromAddress, toAddress, amount, memo, secretKey, fee } = req.body
  const newTransaction = new Transaction(fromAddress, toAddress, amount, memo, fee)

  try {
    newTransaction.signTransaction(secretKey)
    blockchain.addTransaction(newTransaction)
    pubsub.broadcastTransaction(newTransaction)
    res.json(blockchain.pendingTransactions)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Blockchain node running on port ${PORT}`)
  if (PORT !== DEFAULT_PORT) {
    syncChains()
  }
})
