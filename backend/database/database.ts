import Blockchain from "../blockchain/Blockchain/Blockchain";
import Mempool from "../blockchain/Mempool/Mempool";
import DatabaseService from "./DatabaseService";

// Create shared database service instance
const dbService = new DatabaseService();

// Create blockchain and mempool instances with shared database service
export const blockchain = new Blockchain(dbService);
export const mempool = new Mempool(blockchain, dbService);

// Initialize function to be called at startup
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing blockchain database...');
    
    // Initialize blockchain first (loads existing data or creates genesis block)
    await blockchain.initialize();
    
    // Then initialize mempool (loads pending transactions)
    await mempool.initialize();
    
    console.log('Database initialization complete');
    
    // Log initial stats
    const stats = await blockchain.getDbStats();
    console.log('Database stats:', stats);
    
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Graceful shutdown function
export async function closeDatabase(): Promise<void> {
  try {
    console.log('Closing database connections...');
    await blockchain.close();
    await mempool.close();
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
}

// Handle process shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});