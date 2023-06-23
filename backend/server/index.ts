import { createServer } from 'http';
import { Server } from "socket.io";
import { PORT, DEFAULT_PORT } from './api/utils/ports';
import { syncChains } from './api/utils/syncChains';
import PubSub from '../pubsub';
import Blockchain from '../blockchain/Blockchain/Blockchain';
const app = require('./api/server');

//Create websocker server:
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

//Listen on port and sync chains:
server.listen(PORT, () => {
  console.log(`Blockchain node running on port ${PORT}`)
  if (PORT !== DEFAULT_PORT) {
    syncChains()
  }
})

//Database setup (note, keep this here (vs separate file) otherwise the websocket updates fail):
export const blockchain = new Blockchain()
export const pubsub = new PubSub( { blockchain }, io )

module.exports = io 