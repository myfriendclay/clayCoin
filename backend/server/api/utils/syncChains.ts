import request from 'request'
import { plainToClass } from 'class-transformer';

import {blockchain} from "../../../database/database";

import Blockchain from '../../../blockchain/Blockchain/Blockchain';
import { ROOT_NODE_ADDRESS } from './ports';

export const syncChains = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blockchain`}, (error: any, response: { statusCode: number }, body: string) => {
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body)
        let blockchainInstance = plainToClass(Blockchain, rootChain.blockchain);
        console.log('Replace chain on a sync with', blockchainInstance.chain.length)
        blockchain.replaceChain(blockchainInstance)
      }
    })
  }

  