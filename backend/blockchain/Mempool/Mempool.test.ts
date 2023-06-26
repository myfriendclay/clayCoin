import Mempool from "./Mempool";
import Transaction from "../Transaction/Transaction";
import CoinbaseTransaction from "../Transaction/CoinbaseTransaction";
import Block from "../Block/Block";
import { INITIAL_DIFFICULTY, TARGET_MINE_RATE_MS } from "../utils/config";
import Wallet from "../Wallet/Wallet";
import Blockchain from "../Blockchain/Blockchain";

let blockchain: Blockchain;
let mempool: Mempool;

let transaction1: Transaction,
  transaction2: Transaction,
  transaction3: Transaction,
  transaction4: Transaction;
//need to make transactions mocks.. was running into issues doing so
beforeEach(() => {
  blockchain = new Blockchain();
  mempool = new Mempool(blockchain);
  transaction1 = new Transaction(
    "randomAddress",
    "targetAddress",
    100,
    "test memo1",
    1
  );
  transaction2 = new Transaction(
    "targetAddress",
    "randomAddress",
    10,
    "test memo2",
    2
  );
  transaction3 = new Transaction(
    "targetAddress",
    "randomAddress",
    20,
    "test memo3",
    3
  );

  transaction4 = new Transaction(
    "targetAddress",
    "randomAddress",
    30,
    "test memo3",
    4
  );
});
describe("addTransaction", () => {
  beforeEach(() => {
    jest.spyOn(transaction1, "isValid").mockImplementation(() => true);
    jest
      .spyOn(Wallet, "walletHasSufficientFunds")
      .mockImplementation(() => true);
  });

  it("Throws error if transaction is not valid", () => {
    jest.spyOn(transaction1, "isValid").mockImplementation(() => false);
    expect(() => mempool.addTransaction(transaction1)).toThrow(Error);
    expect(() => mempool.addTransaction(transaction1)).toThrow(
      "Cannot add invalid transaction to chain"
    );
  });

  it("Throws error if fromAddress does not have enough money", () => {
    jest
      .spyOn(Wallet, "walletHasSufficientFunds")
      .mockImplementation(() => false);
    expect(() => mempool.addTransaction(transaction1)).toThrow(Error);
    expect(() => mempool.addTransaction(transaction1)).toThrow(
      "not enough funds for transactions in mempool or this transaction itself"
    );
  });

  it("Adds to mempool if valid transaction and fromAddress wallet has sufficient funds", () => {
    mempool.addTransaction(transaction1);
    expect(mempool.pendingTransactions[0]).toBe(transaction1);
  });
});

describe("addCoinbaseTxToMempool", () => {
  const minerAddress = "minerAddress";

  test("returns pending transactions of the blockchain", () => {
    const pendingTransactions = mempool.addCoinbaseTxToMempool(minerAddress);
    expect(pendingTransactions).toBe(mempool.pendingTransactions);
  });

  test("Adds new coinbase transaction to Blockchain's pending transactions", () => {
    mempool.addCoinbaseTxToMempool(minerAddress);
    expect(mempool.pendingTransactions[0]).toBeInstanceOf(CoinbaseTransaction);
  });
});

describe("getMiningReward", () => {
  it("Returns block subsidy + all transaction fees returned by getTotalTransactionFees", () => {
    const totalTxFees = 20;
    const blockSubsidy = 20;
    jest
      .spyOn(mempool, "getTotalTransactionFees")
      .mockImplementation(() => totalTxFees);
      jest
      .spyOn(mempool, "getCurrentBlockSubsidy")
      .mockImplementation(() => blockSubsidy);
    const totalMiningReward = totalTxFees + blockSubsidy
    expect(mempool.getMiningReward()).toBe(totalMiningReward);
  });
});

describe("addPendingTransactionsToBlock", () => {
  test("adds pending transactions to block", () => {
    mempool.pendingTransactions.push("tx1");
    mempool.pendingTransactions.push("tx2");
    mempool.addPendingTransactionsToBlock();
    const minedBlock = mempool.addPendingTransactionsToBlock("mining_address");
    expect(minedBlock.transactions[minedBlock.transactions.length - 2]).toBe(
      "tx1"
    );
  });
});

describe("getTotalTransactionFees", () => {
  test("returns total amount of transaction fees in pending transactions", () => {
    mempool.pendingTransactions = [
      transaction1,
      transaction2,
      transaction3,
      transaction4,
    ];
    expect(mempool.getTotalTransactionFees()).toBe(10);
  });

  test("returns 0 if no fees", () => {
    let tx1 = new Transaction(
      "randomAddress",
      "targetAddress",
      100,
      "memotest"
    );
    let tx2 = new Transaction("targetAddress", "randomAddress", 10, "pizza", 0);

    mempool.pendingTransactions = [tx1, tx2];
    expect(mempool.getTotalTransactionFees()).toBe(0);
  });
});

describe("minePendingTransactions", () => {
  test("Calls addCoinbaseTxToMempool method", () => {
    const miningRewardAddress = "123";
    mempool.addCoinbaseTxToMempool = jest.fn();
    mempool.minePendingTransactions(miningRewardAddress);
    expect(mempool.addCoinbaseTxToMempool).toHaveBeenCalledWith(
      miningRewardAddress
    );
  });

  test("Calls addPendingTransactionsToBlock", () => {
    const mockAddPendingTransactionsToBlock = jest.spyOn(
      mempool,
      "addPendingTransactionsToBlock"
    );
    mempool.minePendingTransactions("123");
    expect(mockAddPendingTransactionsToBlock).toHaveBeenCalled();
  });

  it("Calls addBlockToChain with block", () => {
    const miningRewardAddress = "123";
    const block = new Block([], INITIAL_DIFFICULTY, "hash", 2);
    jest
      .spyOn(mempool, "addPendingTransactionsToBlock")
      .mockImplementation(() => block);
    blockchain.addBlockToChain = jest.fn();
    mempool.minePendingTransactions(miningRewardAddress);
    expect(blockchain.addBlockToChain).toHaveBeenCalledWith(block);
  });

  it("Calls mineBlock", () => {
    const miningRewardAddress = "123";
    const block = new Block([], INITIAL_DIFFICULTY, "hash", 2);
    jest
      .spyOn(mempool, "addPendingTransactionsToBlock")
      .mockImplementation(() => block);
    const mockMineBlock = jest.spyOn(block, "mineBlock").mockImplementation();
    mempool.minePendingTransactions(miningRewardAddress);
    expect(mockMineBlock).toHaveBeenCalled();
  });

  it("Calls resetMempool", () => {
    mempool.resetMempool = jest.fn();
    mempool.minePendingTransactions("123");
    expect(mempool.resetMempool).toHaveBeenCalled();
  });

  it("Returns the block", () => {
    const miningRewardAddress = "123";
    const returnValue = mempool.minePendingTransactions(miningRewardAddress);
    expect(returnValue).toBe(blockchain.chain[blockchain.chain.length - 1]);
  });

  test("Block has proof of work", () => {
    mempool.minePendingTransactions("mining_address");
    expect(blockchain.chain[blockchain.chain.length - 1].hasProofOfWork()).toBe(
      true
    );
  });
});

describe("getNewMiningDifficulty", () => {
  let block: Block;
  beforeEach(() => {
    block = new Block([], 4, "", 1);
    jest.spyOn(blockchain, "getLatestBlock").mockImplementation(() => block);
  });

  it("it raises the difficulty for a quickly mined block", () => {
    block.miningDurationMs = TARGET_MINE_RATE_MS - 1;
    expect(mempool.getNewMiningDifficulty()).toBe(block.difficulty + 1);
  });

  it("it lowers the difficulty for a quickly mined block", () => {
    block.miningDurationMs = TARGET_MINE_RATE_MS + 1;
    expect(mempool.getNewMiningDifficulty()).toBe(block.difficulty - 1);
  });

  it("it never lowers before 1", () => {
    block.difficulty = 1;
    block.miningDurationMs = TARGET_MINE_RATE_MS + 1;
    expect(mempool.getNewMiningDifficulty()).toBe(1);
  });
});

describe("resetMempool", () => {
  it("resets the array to empty", () => {
    mempool.pendingTransactions.push("tx1");
    mempool.pendingTransactions.push("tx2");
    expect(mempool.pendingTransactions).toHaveLength(2);
    mempool.resetMempool();
    expect(mempool.pendingTransactions).toHaveLength(0);
  });
});
