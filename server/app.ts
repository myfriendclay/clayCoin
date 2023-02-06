import express from 'express'
import Blockchain from '../blockchain/Blockchain/Blockchain'
import Transaction from '../blockchain/Transaction/Transaction'
import PubSub from '../pubsub'
import bodyParser from 'body-parser'
import 'reflect-metadata';
import 'es6-shim';
import request from 'request'
import { plainToClass } from 'class-transformer';
import cors from 'cors'

const app = express()


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

//Multiple peer setup- setup
const DEFAULT_PORT = 3001
let PEER_PORT
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
}
const PORT = PEER_PORT || DEFAULT_PORT

// parse application/json
app.use(bodyParser.json())

const blockchain = new Blockchain()
const pubsub = new PubSub( { blockchain } )

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

app.post('/transactions', (req, res) => {
  const { fromAddress, toAddress, amount, memo, secretKey } = req.body
  const newTransaction = new Transaction(fromAddress, toAddress, amount, memo)
  newTransaction.signTransaction(secretKey)
  blockchain.addTransaction(newTransaction)
  pubsub.broadcastTransaction(newTransaction)
  res.json(blockchain.pendingTransactions)
})

app.listen(PORT, () => {
  console.log(`Blockchain node running on port ${PORT}`)
  if (PORT !== DEFAULT_PORT) {
    syncChains()
  }
})
