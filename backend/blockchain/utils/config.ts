import getSHA256Hash from "./crypto-hash";

// Bundle consensus parameters for an immutable commitment
export const CONSENSUS_PARAMS = {
  TARGET_MINE_RATE_MS: 100,
  INITIAL_DIFFICULTY: 3,
  BLOCK_SUBSIDY: 50,
  NUM_OF_BLOCKS_TO_HALF_MINING_REWARD: 210000,
  DIFFICULTY_ADJUSTMENT_INTERVAL: 2016, // Bitcoin value; can lower for tests
  MAX_DIFFICULTY_STEP: 2,
};

export const {
  TARGET_MINE_RATE_MS,
  INITIAL_DIFFICULTY,
  BLOCK_SUBSIDY,
  NUM_OF_BLOCKS_TO_HALF_MINING_REWARD,
  DIFFICULTY_ADJUSTMENT_INTERVAL,
  MAX_DIFFICULTY_STEP,
} = CONSENSUS_PARAMS;

export const PROTOCOL_HASH: string = getSHA256Hash(CONSENSUS_PARAMS);

export const GENESIS_BLOCK_DATA = {
  timestamp: 1,
  previousHash: null,
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  height: 0,
  protocolHash: PROTOCOL_HASH,
  transactions: []
};

export const COINBASE_TX = {
  fromAddress: process.env.COINBASE_TX_FROM_ADDRESS,
  secretKey: process.env.COINBASE_TX_SECRET_KEY,
  memo: "Coinbase Tx"
};
