const PubNub = require('pubnub')
import Blockchain from '../blockchain/Blockchain/Blockchain'
import Mempool from '../blockchain/Mempool/Mempool';
import Transaction from '../blockchain/Transaction/Transaction';
import { plainToInstance } from 'class-transformer';

const credentials = {
  publishKey: process.env.PUBNUB_PUBLISH_KEY,
  subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
  secretKey: process.env.PUBNUB_SECRET_KEY
}

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
        this.handleBlockchainMessage(parsedMessage);
        break;
      case CHANNELS.TRANSACTIONS:
        this.handleTransactionMessage(parsedMessage);
        break;
    }
  }

  async handleTransactionMessage(parsedMessage: any) {
    try {
      let transactionInstance = plainToInstance(Transaction, parsedMessage);
      await this.mempool.addTransaction(transactionInstance);
      this.io.emit('updateMempool', transactionInstance);
    } catch (error: any) {
      // Handle duplicate transactions gracefully - this is normal in distributed systems
      if (error.message === 'Transaction already in mempool') {
        // Don't log this as an error - it's expected behavior when nodes receive broadcasts
        // of transactions they already have
        return;
      }
      
      // Log other types of errors (invalid transactions, insufficient funds, etc.)
      console.error('Error handling transaction message:', error);
    }
  }

  async handleBlockchainMessage(parsedMessage: any) {
    try {
      let blockchainInstance = plainToInstance(Blockchain, parsedMessage);
      const chainWasReplaced = await this.blockchain.replaceChain(blockchainInstance);
      if (chainWasReplaced) {
        await this.mempool.resetMempool();
        this.io.emit('updateBlockchain', blockchainInstance);
        this.io.emit('clearMempool');
      }
    } catch (error) {
      console.error('Error handling blockchain message:', error);
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
