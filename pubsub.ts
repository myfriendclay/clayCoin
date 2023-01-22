import redis from 'redis'
import Blockchain from './blockchain/Blockchain/Blockchain'
import Transaction from './blockchain/Transaction/Transaction';
import { plainToClass, plainToInstance } from 'class-transformer';

const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTIONS: "TRANSACTIONS"
}


export default class PubSub {
  blockchain: Blockchain
  publisher: any
  subscriber: any

  constructor( { blockchain } ) {
    this.blockchain = blockchain

    this.publisher = redis.createClient()
    this.subscriber = redis.createClient()

    this.subscribeToChannels()
    this.subscriber.on(
      'message',
      (channel, message) => this.handleMessage(channel, message)
    )
  }

  handleMessage(channel, message) {
    console.log(`Message received: Channel: ${channel} Message: ${message}`)

    const parsedMessage = JSON.parse(message)

    switch (channel) {
      case CHANNELS.BLOCKCHAIN:
        let blockchainInstance = plainToInstance(Blockchain, parsedMessage);
        this.blockchain.replaceChain(blockchainInstance)
        break;
      case CHANNELS.TRANSACTIONS:
        let transactionInstance = plainToInstance(Transaction, parsedMessage);
        this.blockchain.addTransaction(transactionInstance)
        console.log(this.blockchain)
        break;
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach(channel => {
      this.subscriber.subscribe(channel)
    })
  }

  publish({ channel, message }) {
    //Want to first unsubscribe, then publish, then resubscribe. This prevents each node from receiving its own message
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel)
      })

    })
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

