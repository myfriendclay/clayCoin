import Blockchain from "../../../blockchain/Blockchain/Blockchain";
import PubSub from "../../../pubsub";

export const blockchain = new Blockchain()
export const pubsub = new PubSub( { blockchain } )