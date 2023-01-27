
//Note for test suite needs to be 100, 3, and 100 respectively:
export const MINE_RATE_MS: number = 100;
export const INITIAL_DIFFICULTY: number = 3;
export const MINING_REWARD: number = 100;

export const GENESIS_BLOCK_DATA = {
  timestamp: 1,
  previousHash: null,
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  height: 0,
  transactions: []
};