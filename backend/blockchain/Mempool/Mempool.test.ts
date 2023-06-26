import Mempool from "./Mempool";
import Transaction from "../Transaction/Transaction";
import CoinbaseTransaction from "../Transaction/CoinbaseTransaction";
import Block from "../Block/Block";
import { INITIAL_DIFFICULTY, TARGET_MINE_RATE_MS } from "../utils/config";
import Wallet from "../Wallet/Wallet";
import Blockchain from "../Blockchain/Blockchain";

let block: Block;
let blockchain: Blockchain;
let mempool: Mempool;
let transaction1: Transaction,
  transaction2: Transaction,
  transaction3: Transaction,
  transaction4: Transaction;
let pendingTransactions: Transaction[];
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
  pendingTransactions = [
    transaction1,
    transaction2,
    transaction3,
    transaction4,
  ];
  block = new Block([], INITIAL_DIFFICULTY, "hash", 2);
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

  test("returns pending transactions of the mempool", () => {
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
    const blockSubsidy = 30;
    jest
      .spyOn(mempool, "getTotalTransactionFees")
      .mockImplementation(() => totalTxFees);
    jest
      .spyOn(mempool, "getCurrentBlockSubsidy")
      .mockImplementation(() => blockSubsidy);
    const totalMiningReward = totalTxFees + blockSubsidy;
    expect(mempool.getMiningReward()).toBe(totalMiningReward);
  });
});

describe("addPendingTransactionsToBlock", () => {
  let minedBlock: Block;
  let latestBlock: Block;
  let miningDifficulty: number;
  let hash = "exampleHashValue";

  beforeEach(() => {
    latestBlock = new Block([], miningDifficulty, "prevHash", 666);
    latestBlock.hash = hash;
    miningDifficulty = 55;
    jest
      .spyOn(mempool, "getNewMiningDifficulty")
      .mockImplementation(() => miningDifficulty);
    jest
      .spyOn(blockchain, "getLatestBlock")
      .mockImplementation(() => latestBlock);
    mempool.pendingTransactions = pendingTransactions;
    minedBlock = mempool.addPendingTransactionsToBlock();
  });

  test("Returns a block", () => {
    expect(minedBlock).toBeInstanceOf(Block);
  });

  test("adds pending transactions to the block", () => {
    expect(minedBlock.transactions).toBe(pendingTransactions);
  });
  test("Returned mined block has return value of getNewMiningDifficulty as difficulty", () => {
    expect(minedBlock.difficulty).toBe(miningDifficulty);
  });
  test("Returned mined block has previousHash of getLatestBlock result's hash", () => {
    expect(minedBlock.previousHash).toBe(hash);
  });
  test("Returned mined block has height of block chain's length", () => {
    expect(minedBlock.height).toBe(blockchain.chain.length);
  });
});

describe("getTotalTransactionFees", () => {
  test("returns total amount of transaction fees in pending transactions", () => {
    mempool.pendingTransactions = pendingTransactions;
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

  test("returns 0 if no transactions", () => {
    mempool.pendingTransactions = [];
    expect(mempool.getTotalTransactionFees()).toBe(0);
  });
});

describe("minePendingTransactions", () => {
  let miningRewardAddress: string;
  let mockAddPendingTransactionsToBlock;

  beforeEach(() => {
    miningRewardAddress = "123";
    mockAddPendingTransactionsToBlock = jest
      .spyOn(mempool, "addPendingTransactionsToBlock")
      .mockImplementation(() => block);
  });

  test("Calls addCoinbaseTxToMempool method with miningreward address", () => {
    mempool.addCoinbaseTxToMempool = jest.fn();
    mempool.minePendingTransactions(miningRewardAddress);
    expect(mempool.addCoinbaseTxToMempool).toHaveBeenCalledWith(
      miningRewardAddress
    );
  });

  test("Calls addPendingTransactionsToBlock", () => {
    mempool.minePendingTransactions(miningRewardAddress);
    expect(mockAddPendingTransactionsToBlock).toHaveBeenCalled();
  });

  it("Calls mineBlock", () => {
    const mockMineBlock = jest.spyOn(block, "mineBlock");
    mempool.minePendingTransactions(miningRewardAddress);
    expect(mockMineBlock).toHaveBeenCalled();
  });

  it("Calls addBlockToChain with block", () => {
    blockchain.addBlockToChain = jest.fn();
    mempool.minePendingTransactions(miningRewardAddress);
    expect(blockchain.addBlockToChain).toHaveBeenCalledWith(block);
  });

  it("Calls resetMempool", () => {
    mempool.resetMempool = jest.fn();
    mempool.minePendingTransactions(miningRewardAddress);
    expect(mempool.resetMempool).toHaveBeenCalled();
  });

  it("Returns the block it added", () => {
    const returnValue = mempool.minePendingTransactions(miningRewardAddress);
    expect(returnValue).toBe(blockchain.chain[blockchain.chain.length - 1]);
  });

  test("Block has proof of work", () => {
    mempool.minePendingTransactions(miningRewardAddress);
    expect(blockchain.chain[blockchain.chain.length - 1].hasProofOfWork()).toBe(
      true
    );
  });
});

describe("getNewMiningDifficulty", () => {
  beforeEach(() => {
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
