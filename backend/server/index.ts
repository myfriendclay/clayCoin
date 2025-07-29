import { createServer } from 'http';
import { Server } from "socket.io";
import { PORT, DEFAULT_PORT } from './api/utils/ports';
import { syncChains } from './api/utils/syncChains';
import PubSub from '../pubsub/pubsub';
import { blockchain, mempool, initializeDatabase } from '../database/database';
import app from './api/server';

//Create websocker server:
const server = createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Then start the server (only if not in test environment)
    if (process.env.NODE_ENV !== 'test') {
      server.listen(PORT, () => {
        console.log(`Blockchain node running on port ${PORT}`)
        if (PORT !== DEFAULT_PORT) {
          syncChains()
        }
      })
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server with database initialization
startServer();

//Pubsub setup
export const pubsub = new PubSub( { blockchain, mempool }, io )