import Block from '../Block/Block'
import Transaction from '../Transaction/Transaction'
import Wallet from './Wallet'
import EC from 'elliptic';
const ec = new EC.ec('secp256k1')

let wallet: Wallet
let chain: Block[]
let pendingTransactions: Transaction[]
let publicKey: string

beforeEach(() => {
  wallet = new Wallet()
  publicKey = wallet.publicKey

  const tx1 = {
    toAddress: publicKey,
    amount: 20,
    fee: 5000
  }
  const tx2 = {
    fromAddress: publicKey,
    amount: 1,
    fee: 2
  }
  const tx3 = {
    fromAddress: publicKey,
    amount: 3,
    fee: 4
  }
  const block1 = {
    transactions: [tx1, tx2]
  }

  const block2 = {
    transactions: [tx3]
  }
  chain = [ block1, block2 ]
  pendingTransactions= [tx1, tx2, tx3]
});

describe('Constructor', () => {
  it('has a publicKey key', () => {
    expect(wallet).toHaveProperty('publicKey')
  })

  it('has a privateKey key', () => {
    expect(wallet).toHaveProperty('privateKey')
  })
  it('Generates a valid public key', () => {    
    const publicKey = ec.keyFromPublic(wallet.publicKey, 'hex').getPublic('hex');
    expect(publicKey).toBe(wallet.publicKey);
  })

  it('Generates a valid private key', () => {    
    const privateKey = ec.keyFromPrivate(wallet.privateKey, 'hex').getPrivate('hex');
    expect(privateKey).toBe(wallet.privateKey);
  })

  it('Generates a valid key pair- able to sign a transaction and validate using ec library', () => {    
    const key = ec.keyFromPrivate(wallet.privateKey, 'hex')
    const txHash = "testTxHashToSign";
    const signature = key.sign(txHash);
    expect(key.verify(txHash, signature)).toBe(true)
  })
})

describe('getBalanceOfAddress', () => {
  test('Returns correct balance, subtracting fees, and adding/subtracting received/sent amounts respectively for each transaction across all blocks', () => {
    expect(Wallet.getBalanceOfAddress(publicKey, chain)).toBe(10)
  })

  test('Returns 0 if chain empty', () => {
    chain = []
    expect(Wallet.getBalanceOfAddress(publicKey, chain)).toBe(0)
  })

  test('Returns 0 if no transactions on chain', () => {
    const block1 = {
      transactions: []
    }
    const block2 = {
      transactions: []
    }
    chain = [ block1, block2 ]
    expect(Wallet.getBalanceOfAddress(publicKey, chain)).toBe(0)
  })

});

describe('getTotalPendingOwedByWallet', () => {
  it('returns total wallet owes for all pending transactions including fees', () => {
    expect(Wallet.getTotalPendingOwedByWallet(publicKey, pendingTransactions)).toBe(10)
  })

  it('returns 0 if no pending transactions', () => {
    pendingTransactions = []
    expect(Wallet.getTotalPendingOwedByWallet(publicKey, pendingTransactions)).toBe(0)
  })
});

describe('walletHasSufficientFunds', () => {
  let tx1
  beforeEach(() => {
    tx1 = {
      amount: 10,
      fee: 6
    }
    jest.spyOn(Wallet, 'getTotalPendingOwedByWallet').mockImplementation(() => 5);
    jest.spyOn(Wallet, 'getBalanceOfAddress').mockImplementation(() => 20);
  })

  it('returns false if total pending owed plus transaction is more than wallet balance', () => {
    expect(Wallet.walletHasSufficientFunds(publicKey, tx1, chain, pendingTransactions)).toBe(false)
  })

  it('returns true if wallet balance is more than or equal to total pending plus transaction amount', () => {
    jest.spyOn(Wallet, 'getBalanceOfAddress').mockImplementation(() => 21);
    expect(Wallet.walletHasSufficientFunds(publicKey, tx1, chain, pendingTransactions)).toBe(true)
  })
});