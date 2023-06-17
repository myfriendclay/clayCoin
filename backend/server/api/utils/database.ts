import Blockchain from "../../../blockchain/Blockchain/Blockchain";
import PubSub from "../../../pubsub";
import io from './websocket'

export const blockchain = new Blockchain()
export const pubsub = new PubSub( { blockchain }, io )