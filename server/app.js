import express from 'express'
import Blockchain from '../blockchain/Blockchain/Blockchain.js'
import Transaction from '../blockchain/Transaction/Transaction.js'
import PubSub from '../pubsub.js'
import bodyParser from 'body-parser'

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

app.listen(PORT, () => {
  console.log(`Blockchain node running on port ${PORT}`)
})
