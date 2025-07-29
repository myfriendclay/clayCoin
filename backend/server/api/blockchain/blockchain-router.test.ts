import request from "supertest";
import app from "../server";
import { blockchain as blockchainPOJO } from "../../../database/database";

describe("GET api/blockchain", () => {
  let res: request.Response;
  let blockchain: any;

  beforeAll(async () => {
    res = await request(app).get("/api/blockchain");
    blockchain = res.body.blockchain;
  });

  test("returns a 200 status code", () => {
    expect(res.status).toBe(200);
  });

  test("returns the blockchain with length 1, isChainValid true", () => {
    const { length, isChainValid } = res.body;
    expect(length).toBe(1);
    expect(isChainValid).toBe(true);
  });

  test("Blockchain has chain", () => {
    expect(blockchain).toHaveProperty("chain");
  });

  test("Returns the original Pojo", () => {
    expect(blockchain).toEqual(blockchainPOJO);
  });

  test("Genesis block has nonce, hash, miningDurationMs, timestamp, height, prevHash", () => {
    const genesisBlock = blockchain.chain[0];
    expect(genesisBlock).toHaveProperty("nonce");
    expect(genesisBlock).toHaveProperty("hash");
    expect(genesisBlock).toHaveProperty("miningDurationMs");
    expect(genesisBlock).toHaveProperty("timestamp");
    expect(genesisBlock.height).toBe(0);
    expect(genesisBlock.previousHash).toBeNull();
  });
});
