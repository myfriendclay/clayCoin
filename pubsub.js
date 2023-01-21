import redis from 'redis'
import Blockchain from './blockchain/Blockchain/Blockchain.js'

const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN"
}

export default class PubSub {
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

    if (channel === CHANNELS.BLOCKCHAIN) {
      Object.setPrototypeOf(parsedMessage, Blockchain.prototype);
      this.blockchain.replaceChain(parsedMessage)
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach(channel => {
      this.subscriber.subscribe(channel)
    })
  }

  publish({ channel, message }) {
    this.publisher.publish(channel, message)
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain)
    })
  }
 }
