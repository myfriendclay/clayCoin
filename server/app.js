// const express = require('express')
import express from 'express'
import Blockchain from '../Blockchain.js'
import Transaction from '../Transaction.js'

const app = express()
const port = 3000

// parse application/json
import bodyParser from 'body-parser'
app.use(bodyParser.json())

const blockchain = new Blockchain()

app.post('/mine', (req, res) => {
  const { miningAddress } = req.body
  const newBlock = blockchain.minePendingTransactions(miningAddress)
  res.json(newBlock)
})

app.get('/chain', (req, res) => {
  const response = {
    'chain': blockchain.chain,
    'length': blockchain.chain.length,
    'isChainValid': blockchain.isChainValid()
  }
  res.json(response)
})

app.post('/transactions', (req, res) => {
  const { fromAddress, toAddress, amount, secretKey } = req.body
  const newTransaction = new Transaction(fromAddress, toAddress, amount)
  newTransaction.signTransaction(secretKey)
  blockchain.addTransaction(newTransaction)
  res.json(blockchain.pendingTransactions)
})

app.post('/nodes', (req, res) => {
  const url = req.body
  blockchain.registerNode(url)
  res.json(blockchain.nodes)
})

app.get('/nodes/resolve', (req, res) => {
  //let the function do it's thing and if replaced respond with "out"
  // if replaced:
  //         response = {
  //             'message': 'Our chain was replaced',
  //             'new_chain': blockchain.chain
  //         }
  //     else:
  //         response = {
  //             'message': 'Our chain is authoritative',
  //             'chain': blockchain.chain
  //         }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
