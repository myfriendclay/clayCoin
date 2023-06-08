const server = require('./server')
const request = require('supertest')

import { BLOCK_SUBSIDY, INITIAL_DIFFICULTY } from "../../config"

describe('GET /blockchain', () => {
    let res

    beforeEach(async () => {
        res = await request(server).get('/api/blockchain')
    })

    test('returns a 200 status code', async () => {
        expect(res.status).toBe(200)
      })

    test('returns the blockchain with length 1, isChainValid true', async () => {
        const { length, isChainValid } = res.body
        expect(length).toBe(1)
        expect(isChainValid).toBe(true)
    })

    test('Blockchain has blocksubsidy, difficulty, empty pending transactions, and chain', () => {
        const { blockchain } = res.body

        expect(blockchain.blockSubsidy).toBe(BLOCK_SUBSIDY)
        expect(blockchain.pendingTransactions).toHaveLength(0)
        expect(blockchain.difficulty).toBe(INITIAL_DIFFICULTY)
        expect(blockchain).toHaveProperty("chain")
        
    })

    test('Genesis block has nonce, hash, miningDurationMs, timestamp, height, prevHash', () => {
        const { blockchain } = res.body
        
        const genesisBlock = blockchain.chain[0]
        expect(genesisBlock).toHaveProperty("nonce")
        expect(genesisBlock).toHaveProperty("hash")
        expect(genesisBlock).toHaveProperty("miningDurationMs")
        expect(genesisBlock).toHaveProperty("timestamp")
        expect(genesisBlock.height).toBe(0)
        expect(genesisBlock.previousHash).toBeNull()

    })
})


describe('POST /mine', () => {
  test('Returns a 200 and increases length of blockchain to 2', async () => {
    const res = await request(server).post('/api/blocks/mine')
    expect(res.status).toBe(200)
    const blockchainRes = await request(server).get('/api/blockchain')
    expect(blockchainRes.body.length).toBe(2)
  })
})

describe('GET /:publicAddress', () => {
    test('Returns the balance and transactions of wallet', async () => {

    })
  })

describe('POST /wallets', () => {
    test('Returns a 200 and wallet with public and private key', async () => {
        const res = await request(server).post('/api/wallets')
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('publicKey')
        expect(res.body).toHaveProperty('privateKey')
    })
})

describe('POST /transactions', () => {
    test('Returns a 201 and transaction is added to blockchains mempool', async () => {

    })
})