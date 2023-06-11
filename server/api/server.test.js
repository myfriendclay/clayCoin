const server = require('./server')
const request = require('supertest')

import { BLOCK_SUBSIDY, INITIAL_DIFFICULTY } from "../../config"
import {blockchain as blockchainPOJO, pubsub} from "./utils/database"

describe('GET api/blockchain', () => {
    let res, blockchain

    beforeAll(async () => {
        res = await request(server).get('/api/blockchain')
        blockchain = res.body.blockchain
    })

    test('returns a 200 status code', () => {
        expect(res.status).toBe(200)
    })

    test('returns the blockchain with length 1, isChainValid true', () => {
        const { length, isChainValid } = res.body
        expect(length).toBe(1)
        expect(isChainValid).toBe(true)
    })

    test('Blockchain has blocksubsidy, initial difficulty, empty pending transactions, and chain', () => {
        expect(blockchain.blockSubsidy).toBe(BLOCK_SUBSIDY)
        expect(blockchain.difficulty).toBe(INITIAL_DIFFICULTY)
        expect(blockchain.pendingTransactions).toHaveLength(0)
        expect(blockchain).toHaveProperty("chain")
    })

    test('Returns the original Pojo', () => {
        expect(blockchain).toEqual(blockchainPOJO)
    })

    test('Genesis block has nonce, hash, miningDurationMs, timestamp, height, prevHash', () => {
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
    let res, mockBroadcastChain, mockMinePendingTxs, mockBlock

    const minerInfo = {
        miningAddress: "04ab3939b5ddc445946f645e1ad497e42f11e76474819a07da0b5cc4c79bf3ffbdc397d0e7cffacc960cfe636e456fb43fdb6e93cab1fa2533675938fe9f9cfcff",
    }

    beforeAll(async () => {
        mockBroadcastChain = jest.spyOn(pubsub, 'broadcastChain')
        mockMinePendingTxs = jest.spyOn(blockchainPOJO, 'minePendingTransactions')
        res = await request(server).post('/api/blocks/mine').send(minerInfo)
    })
    
  test('Returns a 201', async () => {
    expect(res.status).toBe(201)
  })

  test('Increases length of blockchain to 2', async () => {
    expect(blockchainPOJO.chain).toHaveLength(2)
  })

  it('Broadcasts block to pubsub', async () => {
    expect(mockBroadcastChain).toHaveBeenCalled()
  })

  it('Calls blockchain.minePendingTransactions method', async () => {
    expect(mockMinePendingTxs).toHaveBeenCalled()
  })

  it('Returns the results of blockchain.minePendingTransactions method', async () => {
    mockBlock = "test blockchain.minePendingTransactions return value"
    jest.spyOn(blockchainPOJO, 'minePendingTransactions').mockReturnValueOnce(mockBlock)
    const response2 = await request(server).post('/api/blocks/mine').send(minerInfo)
    expect(response2.body).toBe(mockBlock)
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
    describe("When wallet doesn't have sufficient funds", () => {
        let res
        beforeAll(async () => {
            const transaction = {
                "fromAddress": "043a9d7e34eb6dfd8cf11ec05a774528a4dd899626e78c65655f0152d5c419f335f6c1198bd7bca70049e3bcc2da0b354b32ef9122df1ddae26628b69adc4c7354",
                "toAddress": "testToAddress",
                "amount": 5,
                "memo": "test payment memo",
                "fee": 1,
                "secretKey": "684adfb19c37e7ca67aaf69d6d96c7b21fc205aa20b8adc0de73397161d139b4"
            }
            res = await request(server).post('/api/transactions').send(transaction)
        })

        it('Returns a 400 status code', () => {
            expect(res.status).toBe(400)
        })

        it('Returns the correct error msg', () => {
            expect(res.body.error).toBe('not enough funds for transactions in mempool or this transaction itself')
        })

        it('Does not add transaction to mempool', async () => {
            expect(blockchainPOJO.pendingTransactions).toHaveLength(0)
        })
    })

    describe("When wallet has invalid private key", () => {
        let res
        beforeAll(async () => {
            const transaction = {
                "fromAddress": "043a9d7e34eb6dfd8cf11ec05a774528a4dd899626e78c65655f0152d5c419f335f6c1198bd7bca70049e3bcc2da0b354b32ef9122df1ddae26628b69adc4c7354",
                "toAddress": "testToAddress",
                "amount": 5,
                "memo": "test payment memo",
                "fee": 1,
                "secretKey": "boguskey"
            }
            res = await request(server).post('/api/transactions').send(transaction)
        })
        it('Returns a 400 status code', () => {
            expect(res.status).toBe(400)
        })

        it('Returns the correct error msg', () => {
            expect(res.body.error).toBe("Unauthorized: Your private key is invalid or doesn't match your public address")
        })

        it('Does not add transaction to mempool', async () => {
            expect(blockchainPOJO.pendingTransactions).toHaveLength(0)
        })
    })

    describe("When wallet has sufficient funds and valid key", () => {
        
        let res, transaction, mockBroadcastTx
        beforeAll(async () => {

            blockchainPOJO.minePendingTransactions("043a9d7e34eb6dfd8cf11ec05a774528a4dd899626e78c65655f0152d5c419f335f6c1198bd7bca70049e3bcc2da0b354b32ef9122df1ddae26628b69adc4c7354")
            mockBroadcastTx = jest.spyOn(pubsub, 'broadcastTransaction')
            transaction = {
                "fromAddress": "043a9d7e34eb6dfd8cf11ec05a774528a4dd899626e78c65655f0152d5c419f335f6c1198bd7bca70049e3bcc2da0b354b32ef9122df1ddae26628b69adc4c7354",
                "toAddress": "testToAddress",
                "amount": 5,
                "memo": "test payment memo",
                "fee": 1,
                "secretKey": "684adfb19c37e7ca67aaf69d6d96c7b21fc205aa20b8adc0de73397161d139b4"
            }
            res = await request(server).post('/api/transactions').send(transaction)
        })
        it('Returns a 201 status code', () => {
            expect(res.status).toBe(201)
        })

        it('Returns pending transactions in response', async () => {
            expect(res.body).toEqual(blockchainPOJO.pendingTransactions)
        })

        it('Adds transaction to blockchain POJO mempool and has same properties', async () => {
            const addedTx = blockchainPOJO.pendingTransactions[blockchainPOJO.pendingTransactions.length - 1]
            expect(addedTx.fromAddress).toBe(transaction.fromAddress)
            expect(addedTx.toAddress).toBe(transaction.toAddress)
            expect(addedTx.amount).toBe(transaction.amount)
            expect(addedTx.memo).toBe(transaction.memo)
            expect(addedTx.fee).toBe(transaction.fee)
            expect(addedTx).toHaveProperty("signature")
            expect(addedTx).toHaveProperty("uuid")
            expect(addedTx).toHaveProperty("timestamp")
        })

        it('Broadcasts transaction to pubsub', async () => {
            expect(mockBroadcastTx).toHaveBeenCalled()
        })
    })
  
})

<<<<<<< HEAD
test.todo("/api/block/:id/isValid")
test.todo("/api/transactions/:id/isValid")
=======
todo.test("/api/block/:id/isValid")
todo.test("/api/transactions/:id/isValid")
>>>>>>> 8f5078d (More server test cleanup)
