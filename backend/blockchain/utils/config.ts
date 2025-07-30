import getSHA256Hash from "./crypto-hash";

// Bundle consensus parameters for an immutable commitment
export const CONSENSUS_PARAMS = {
  TARGET_MINE_RATE_MS: 100,
  INITIAL_DIFFICULTY: 3,
  BLOCK_SUBSIDY: 50,
  NUM_OF_BLOCKS_TO_HALF_MINING_REWARD: 210000,
};

export const TARGET_MINE_RATE_MS: number = CONSENSUS_PARAMS.TARGET_MINE_RATE_MS;
export const INITIAL_DIFFICULTY: number = CONSENSUS_PARAMS.INITIAL_DIFFICULTY;
export const BLOCK_SUBSIDY: number = CONSENSUS_PARAMS.BLOCK_SUBSIDY;

export const NUM_OF_BLOCKS_TO_HALF_MINING_REWARD: number = CONSENSUS_PARAMS.NUM_OF_BLOCKS_TO_HALF_MINING_REWARD;

// Deterministic hash of the consensus parameters – commitment to rule-set
export const PROTOCOL_HASH: string = getSHA256Hash(CONSENSUS_PARAMS);

//Note for test suite needs to be 100, 3, and 100 respectively to run in reasonable time:
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
