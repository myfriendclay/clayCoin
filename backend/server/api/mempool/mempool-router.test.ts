import request from "supertest";
import app from "../server";
import { mempool as mempoolPOJO } from "../../../database/database";
import Mempool from "../../../blockchain/Mempool/Mempool";

let res: { body: { mempool: Mempool; }; status: any; }, mempool: Mempool;

beforeAll(async () => {
  res = await request(app).get("/api/mempool");
  mempool = res.body.mempool;
});

test("returns a 200 status code", () => {
  expect(res.status).toBe(200);
});

test("returns the mempool's pending transactions", () => {
  expect(mempool).toEqual(mempoolPOJO.pendingTransactions);
});
