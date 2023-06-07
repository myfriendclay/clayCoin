import Blockchain from '../blockchain/Blockchain/Blockchain'
import 'reflect-metadata';
import 'es6-shim';
import request from 'request'
import { plainToClass } from 'class-transformer';
import {blockchain } from './api/blockchain'
import { PORT, DEFAULT_PORT, ROOT_NODE_ADDRESS } from './api/utils/ports';
const server = require('./api/server');

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
