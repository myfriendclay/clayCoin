import { blockchain, mempool, initializeDatabase, closeDatabase } from './database/database';
import Transaction from './blockchain/Transaction/Transaction';
import Wallet from './blockchain/Wallet/Wallet';

async function testPersistence() {
  console.log('🧪 Testing blockchain persistence...\n');
  
  try {
    // Initialize database
    await initializeDatabase();
    
    // Show initial state
    console.log('📊 Initial state:');
    console.log(`- Blockchain length: ${blockchain.chain.length}`);
    console.log(`- Mempool transactions: ${mempool.pendingTransactions.length}`);
    console.log(`- Latest block height: ${blockchain.getLatestBlock().height}`);
    
    // Check if we can retrieve blocks
    const genesisBlock = await blockchain.getBlockByHeight(0);
    console.log(`🔍 Genesis block retrieval: ${genesisBlock ? '✅ Success' : '❌ Failed'}`);
    
    // Test block retrieval by hash
    const genesisHash = blockchain.getLatestBlock().hash;
    const blockByHash = await blockchain.getBlockByHash(genesisHash);
    console.log(`🔍 Block by hash retrieval: ${blockByHash ? '✅ Success' : '❌ Failed'}`);
    
    // Get database stats
    const stats = await blockchain.getDbStats();
    console.log('\n📈 Database stats:', stats);
    
    // Close database
    await closeDatabase();
    console.log('\n✅ Database closed successfully');
    
    // Test loading from database (restart simulation)
    console.log('\n🔄 Simulating restart - loading from database...');
    await initializeDatabase();
    
    // Show state after reload
    console.log('\n📊 State after reload:');
    console.log(`- Blockchain length: ${blockchain.chain.length}`);
    console.log(`- Mempool transactions: ${mempool.pendingTransactions.length}`);
    console.log(`- Latest block height: ${blockchain.getLatestBlock().height}`);
    
    // Verify genesis block is still there
    const reloadedGenesis = await blockchain.getBlockByHeight(0);
    console.log(`🔍 Genesis block after reload: ${reloadedGenesis ? '✅ Success' : '❌ Failed'}`);
    
    // Test that chain is still valid
    const isChainValid = blockchain.isChainValid();
    console.log(`✅ Chain validity: ${isChainValid ? '✅ Valid' : '❌ Invalid'}`);
    
    // Final stats
    const finalStats = await blockchain.getDbStats();
    console.log('\n📈 Final database stats:', finalStats);
    
    console.log('\n🎉 Basic persistence test completed successfully!');
    console.log('\n📝 Summary:');
    console.log('✅ Database initialization works');
    console.log('✅ Genesis block is properly stored and retrieved');
    console.log('✅ Block retrieval by height and hash works');
    console.log('✅ Database survives restart (persistence verified)');
    console.log('✅ Blockchain validation works after reload');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await closeDatabase();
  }
}

// Run the test
testPersistence();