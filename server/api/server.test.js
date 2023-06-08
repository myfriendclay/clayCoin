const server = require('./server')
const request = require('supertest')

import { BLOCK_SUBSIDY, INITIAL_DIFFICULTY } from "../../config"
import {blockchain as blockchainPOJO} from "./utils/database"

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

    test('Blockchain has blocksubsidy, initial difficulty, empty pending transactions, and chain', () => {
        const { blockchain } = res.body
        expect(blockchain.blockSubsidy).toBe(BLOCK_SUBSIDY)
        expect(blockchain.pendingTransactions).toHaveLength(0)
        expect(blockchain.difficulty).toBe(INITIAL_DIFFICULTY)
        expect(blockchain).toHaveProperty("chain")
    })

    test('Returns the original Pojo', () => {
        const { blockchain } = res.body
        expect()
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

describe('POST /blocks/mine', () => {
  test('Returns a 201', async () => {
    const minerInfo = {
        miningAddress: "04ab3939b5ddc445946f645e1ad497e42f11e76474819a07da0b5cc4c79bf3ffbdc397d0e7cffacc960cfe636e456fb43fdb6e93cab1fa2533675938fe9f9cfcff",
    }
    const res = await request(server).post('/api/blocks/mine').send(minerInfo)
    expect(res.status).toBe(201)
    const blockchainRes = await request(server).get('/api/blockchain')
    expect(blockchainRes.body.length).toBe(2)
  })

  test('Increases length of blockchain to 2', async () => {
    const blockchainRes = await request(server).get('/api/blockchain')
    expect(blockchainRes.body.length).toBe(2)
    expect(blockchainPOJO.chain).toHaveLength(2)
  })

})

describe('GET /:publicAddress', () => {
    test('Returns the balance and transactions of wallet', async () => {
        const res = await request(server).get('/api/wallets/:04761ecbe8d05ea5c2e25450b3f444bf0e0013e0e00c4f4f7a76135fc7a572471efe88598bae3ad0af0fe00c1b24a0b17c1011b77d7e81e58bb55f79bbc4e79853')
        const wallet = res.body
        expect(wallet).toHaveProperty('balance')
        expect(wallet).toHaveProperty('transactions')
        expect(wallet.transactions).toHaveLength(0)
        expect(wallet.balance).toBe(0)
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
    test('Returns a 400 and error msg if wallet doesnt have sufficient funds', async () => {
        const transaction = {
            "fromAddress": "043a9d7e34eb6dfd8cf11ec05a774528a4dd899626e78c65655f0152d5c419f335f6c1198bd7bca70049e3bcc2da0b354b32ef9122df1ddae26628b69adc4c7354",
            "toAddress": "testToAddress",
            "amount": 5,
            "memo": "test payment memo",
            "fee": 1,
            "secretKey": "684adfb19c37e7ca67aaf69d6d96c7b21fc205aa20b8adc0de73397161d139b4"
        }
        const res = await request(server).post('/api/transactions').send(transaction)
        expect(res.status).toBe(400)
        expect(res.body.error).toBe('not enough funds for transactions in mempool or this transaction itself')
    })
    test('Returns a 400 and error msg if wallet has invalid private key ', async () => {
        const transaction = {
            "fromAddress": "04ab3939b5ddc445946f645e1ad497e42f11e76474819a07da0b5cc4c79bf3ffbdc397d0e7cffacc960cfe636e456fb43fdb6e93cab1fa2533675938fe9f9cfcff",
            "toAddress": "testToAddress",
            "amount": 5,
            "memo": "test payment memo",
            "fee": 1,
            "secretKey": "bogusKey"
        }
        const res = await request(server).post('/api/transactions').send(transaction)
        expect(res.status).toBe(400)
        expect(res.body.error).toBe("you can't sign transactions for other wallets")
    })
})