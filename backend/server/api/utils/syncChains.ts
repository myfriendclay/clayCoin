import request from 'request'
import { plainToInstance } from 'class-transformer';

import {blockchain} from "../../../database/database";

import Blockchain from '../../../blockchain/Blockchain/Blockchain';
import { ROOT_NODE_ADDRESS } from './ports';

export const syncChains = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blockchain`}, async (error: any, response: { statusCode: number }, body: string) => {
      if (!error && response.statusCode === 200) {
        try {
          const rootChain = JSON.parse(body)
          let blockchainResult = plainToInstance(Blockchain, rootChain.blockchain);
          
          // Handle case where plainToInstance returns an array
          const blockchainInstance: Blockchain = Array.isArray(blockchainResult) 
            ? blockchainResult[0] 
            : blockchainResult;
          
          console.log('Replace chain on a sync with', blockchainInstance.chain.length)
          await blockchain.replaceChain(blockchainInstance)
        } catch (syncError) {
          console.error('Error syncing chains:', syncError);
        }
      }
    })
  }

  