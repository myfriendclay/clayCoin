const PubNub = require('pubnub')
import Blockchain from './blockchain/Blockchain/Blockchain'
import Mempool from './blockchain/Mempool/Mempool';
import Transaction from './blockchain/Transaction/Transaction';
import { plainToInstance } from 'class-transformer';

const credentials = {
  publishKey: 'pub-c-48b0bafe-494a-4048-a5cf-e3645661414b',
  subscribeKey: 'sub-c-504dc069-0369-4dee-881b-78d1c660f673',
  secretKey: 'sec-c-YjcyZjA1NGItYjgzOS00YWVjLWFkYjgtOWQzMzJhNDQxMjk4'
};

const CHANNELS = {
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTIONS: "TRANSACTIONS"
}

export default class PubSub {
  blockchain: Blockchain
  mempool: Mempool
  publisher: any
  subscriber: any;
  io: any;
  pubnub: any;
  
  constructor( { blockchain, mempool }, io ) {
    this.blockchain = blockchain
    this.mempool = mempool
    this.io = io

    this.pubnub = new PubNub(credentials);
    this.pubnub.subscribe({ channels: Object.values(CHANNELS) });
    this.pubnub.addListener(this.listener());
  }

  handleMessage(channel, message) {
    console.log(`Message received: Channel: ${channel} Message: ${message}`)

    const parsedMessage = JSON.parse(message)

    switch (channel) {
      case CHANNELS.BLOCKCHAIN:
        let blockchainInstance = plainToInstance(Blockchain, parsedMessage);
        const chainWasReplaced = this.blockchain.replaceChain(blockchainInstance)
        if (chainWasReplaced) {
          this.mempool.resetMempool()
          this.io.emit('updateBlockchain', blockchainInstance)
          this.io.emit('clearMempool')
        }
        break;
      case CHANNELS.TRANSACTIONS:
        let transactionInstance = plainToInstance(Transaction, parsedMessage);
        this.mempool.addTransaction(transactionInstance)
        this.io.emit('updateMempool', transactionInstance)
        break;
    }
  }

  listener() { 
    return {
      message: messageObject => {
        const { channel, message } = messageObject

        this.handleMessage(channel, message)
      }
    }
  }

  publish({ channel, message }) {
    this.pubnub.publish({ channel, message })
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain)
    })
  }

  broadcastTransaction(transaction: Transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTIONS,
      message: JSON.stringify(transaction)
    })
  }
 }
