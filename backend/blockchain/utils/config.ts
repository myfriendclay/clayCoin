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
  fromAddress: "04307622101c4342ca10ab09d2e683c69eb44db5c27a6d717c0039a18054cc7fcd15e05c52e41150fb2ad586eb30be6d36b873b7b548be9c408ee7b6a57998de84",
  secretKey: "e508e87d38428be0b787496c0e6d0ab4555962c9ea34b6de524cc44c7be572b3",
  memo: "Coinbase Tx"
};
