import Wallet from './Wallet'

let wallet
let chain
let pendingTransactions
let publicKey

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