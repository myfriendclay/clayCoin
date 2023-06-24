import { createServer } from 'http';
import { Server } from "socket.io";
import { PORT, DEFAULT_PORT } from './api/utils/ports';
import { syncChains } from './api/utils/syncChains';
import PubSub from '../pubsub';
import { blockchain } from '../database/database';
import app from './api/server';

//Create websocker server:
const server = createServer(app);

export const io = new Server(server, {
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

//Pubsub setup
export const pubsub = new PubSub( { blockchain }, io )