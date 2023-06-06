import Blockchain from '../blockchain/Blockchain/Blockchain'
import 'reflect-metadata';
import 'es6-shim';
import request from 'request'
import { plainToClass } from 'class-transformer';
import {blockchain, pubsub} from './api/blockchain'
import server from './api/server'

require('dotenv').config();

const DEFAULT_PORT: number = parseInt(process.env.DEFAULT_PORT || '3000');

//Multiple peer setup- setup
let PEER_PORT
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
}
const PORT = PEER_PORT || DEFAULT_PORT

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

server.listen(PORT, () => {
  console.log(`Blockchain node running on port ${PORT}`)
  if (PORT !== DEFAULT_PORT) {
    syncChains()
  }
})
