import request from "supertest";
import app from "../server";
import { pubsub } from "../../index";
import {
  blockchain as blockchainPOJO,
  mempool as mempoolPOJO,
} from "../../../database/database";

describe("POST /blocks/mine", () => {
  let res, mockBroadcastChain, mockMinePendingTxs, mockBlock;

  const minerInfo = {
    miningAddress:
      "04ab3939b5ddc445946f645e1ad497e42f11e76474819a07da0b5cc4c79bf3ffbdc397d0e7cffacc960cfe636e456fb43fdb6e93cab1fa2533675938fe9f9cfcff",
  };

  beforeAll(async () => {
    mockBroadcastChain = jest.spyOn(pubsub, "broadcastChain");
    mockMinePendingTxs = jest.spyOn(mempoolPOJO, "minePendingTransactions");
    res = await request(app).post("/api/blocks/mine").send(minerInfo);
  });

  test("Returns a 201", async () => {
    expect(res.status).toBe(201);
  });

  test("Increases length of blockchain to 2", async () => {
    expect(blockchainPOJO.chain).toHaveLength(2);
  });

  it("Broadcasts block to pubsub", async () => {
    expect(mockBroadcastChain).toHaveBeenCalled();
  });

  it("Calls blockchain.minePendingTransactions method", async () => {
    expect(mockMinePendingTxs).toHaveBeenCalled();
  });

  it("Returns the results of blockchain.minePendingTransactions method", async () => {
    mockBlock = "test blockchain.minePendingTransactions return value";
    jest
      .spyOn(mempoolPOJO, "minePendingTransactions")
      .mockReturnValueOnce(mockBlock);
    const response2 = await request(app)
      .post("/api/blocks/mine")
      .send(minerInfo);
    expect(response2.body).toBe(mockBlock);
  });
});

test.todo("/api/block/:id/isValid");
test.todo("/api/transactions/:id/isValid");
