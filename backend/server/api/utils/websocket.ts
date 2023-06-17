
import { createServer } from 'http';
import { Server } from "socket.io";
import { PORT, DEFAULT_PORT } from './ports';
import server from '../server';
require('dotenv').config();

const { WEBSOCKET_PORT } = process.env
const webSocketServer = createServer(server);

const io = new Server(webSocketServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

//Only want one port to listen to websockets- if there is a peer node running on same machine, don't want to listen to websockets on that port (otherwise causes error)
if (PORT === DEFAULT_PORT) {
  webSocketServer.listen(WEBSOCKET_PORT, () => {
    console.log(`Websocket listening on port ${WEBSOCKET_PORT}`);
  });
}

module.exports = io;