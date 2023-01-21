export const MINE_RATE_MS = 100;
export const INITIAL_DIFFICULTY = 3;
export const MINING_REWARD = 100;

export const GENESIS_BLOCK_DATA = {
  timestamp: 1,
  previousHash: null,
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  height: 0,
  transactions: []
};