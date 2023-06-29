//Note for test suite needs to be 100, 3, and 100 respectively to run in reasonable time:
export const TARGET_MINE_RATE_MS: number = 100;
export const INITIAL_DIFFICULTY: number = 3;
export const BLOCK_SUBSIDY: number = 50;

export const NUM_OF_BLOCKS_TO_HALF_MINING_REWARD: number = 210000;

export const GENESIS_BLOCK_DATA = {
  timestamp: 1,
  previousHash: null,
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  height: 0,
  transactions: []
};

export const COINBASE_TX = {
  fromAddress: process.env.COINBASE_TX_FROM_ADDRESS,
  secretKey: process.env.COINBASE_TX_SECRET_KEY,
  memo: "Coinbase Tx"
};
