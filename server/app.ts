import express from 'express'
import Blockchain from '../blockchain/Blockchain/Blockchain'
import Transaction from '../blockchain/Transaction/Transaction'
import PubSub from '../pubsub'
import bodyParser from 'body-parser'
import 'reflect-metadata';
import 'es6-shim';
// const express = require('express')
// const Blockchain = require('../blockchain/Blockchain/Blockchain')
// const Transaction = require('../blockchain/Transaction/Transaction')
// const PubSub = require('../pubsub.ts')
// const bodyParser = require('body-parser')
// require('reflect-metadata')
// require('es6-shim')

const app = express()

//Multiple peer setup- setup
const DEFAULT_PORT = 3000
let PEER_PORT

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
}
const PORT = PEER_PORT || DEFAULT_PORT

// parse application/json
app.use(bodyParser.json())

const blockchain = new Blockchain()
const pubsub = new PubSub( { blockchain } )
setTimeout(() => pubsub.broadcastChain(), 1000);

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

app.post('/transactions', (req, res) => {
  const { fromAddress, toAddress, amount, memo, secretKey } = req.body
  const newTransaction = new Transaction(fromAddress, toAddress, amount, memo)
  newTransaction.signTransaction(secretKey)
  blockchain.addTransaction(newTransaction)
  res.json(blockchain.pendingTransactions)
})

app.listen(PORT, () => {
  console.log(`Blockchain node running on port ${PORT}`)
})
