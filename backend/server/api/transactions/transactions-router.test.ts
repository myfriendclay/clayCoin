import request from "supertest";
import app from "../server";
import { pubsub } from "../../index";
import { mempool as mempoolPOJO } from "../../../database/database";


describe("POST /transactions", () => {
  describe("When wallet doesn't have sufficient funds", () => {
    let res;
    beforeAll(async () => {
      const transaction = {
        fromAddress:
          "043a9d7e34eb6dfd8cf11ec05a774528a4dd899626e78c65655f0152d5c419f335f6c1198bd7bca70049e3bcc2da0b354b32ef9122df1ddae26628b69adc4c7354",
        toAddress: "testToAddress",
        amount: 5,
        memo: "test payment memo",
        fee: 1,
        secretKey:
          "684adfb19c37e7ca67aaf69d6d96c7b21fc205aa20b8adc0de73397161d139b4",
      };
      res = await request(app).post("/api/transactions").send(transaction);
    });

    it("Returns a 400 status code", () => {
      expect(res.status).toBe(400);
    });

    it("Returns the correct error msg", () => {
      expect(res.body.error).toBe(
        "not enough funds for transactions in mempool or this transaction itself"
      );
    });

    it("Does not add transaction to mempool", async () => {
      expect(mempoolPOJO.pendingTransactions).toHaveLength(0);
    });
  });

  describe("When wallet has invalid private key", () => {
    let res;
    beforeAll(async () => {
      const transaction = {
        fromAddress:
          "043a9d7e34eb6dfd8cf11ec05a774528a4dd899626e78c65655f0152d5c419f335f6c1198bd7bca70049e3bcc2da0b354b32ef9122df1ddae26628b69adc4c7354",
        toAddress: "testToAddress",
        amount: 5,
        memo: "test payment memo",
        fee: 1,
        secretKey: "boguskey",
      };
      res = await request(app).post("/api/transactions").send(transaction);
    });
    it("Returns a 400 status code", () => {
      expect(res.status).toBe(400);
    });

    it("Returns the correct error msg", () => {
      expect(res.body.error).toBe(
        "Unauthorized: Your private key is invalid or doesn't match your public address"
      );
    });

    it("Does not add transaction to mempool", async () => {
      expect(mempoolPOJO.pendingTransactions).toHaveLength(0);
    });
  });

  describe("When wallet has sufficient funds and valid key", () => {
    let res, transaction, mockBroadcastTx;
    beforeAll(async () => {
      mempoolPOJO.minePendingTransactions(
        "043a9d7e34eb6dfd8cf11ec05a774528a4dd899626e78c65655f0152d5c419f335f6c1198bd7bca70049e3bcc2da0b354b32ef9122df1ddae26628b69adc4c7354"
      );
      mockBroadcastTx = jest.spyOn(pubsub, "broadcastTransaction");
      transaction = {
        fromAddress:
          "043a9d7e34eb6dfd8cf11ec05a774528a4dd899626e78c65655f0152d5c419f335f6c1198bd7bca70049e3bcc2da0b354b32ef9122df1ddae26628b69adc4c7354",
        toAddress: "testToAddress",
        amount: 5,
        memo: "test payment memo",
        fee: 1,
        secretKey:
          "684adfb19c37e7ca67aaf69d6d96c7b21fc205aa20b8adc0de73397161d139b4",
      };
      res = await request(app).post("/api/transactions").send(transaction);
    });
    it("Returns a 201 status code", () => {
      expect(res.status).toBe(201);
    });

    it("Returns pending transactions in response", async () => {
      expect(res.body).toEqual(mempoolPOJO.pendingTransactions);
    });

    it("Adds transaction to blockchain POJO mempool and has same properties", async () => {
      const addedTx =
      mempoolPOJO.pendingTransactions[
        mempoolPOJO.pendingTransactions.length - 1
        ];
      expect(addedTx.fromAddress).toBe(transaction.fromAddress);
      expect(addedTx.toAddress).toBe(transaction.toAddress);
      expect(addedTx.amount).toBe(transaction.amount);
      expect(addedTx.memo).toBe(transaction.memo);
      expect(addedTx.fee).toBe(transaction.fee);
      expect(addedTx).toHaveProperty("signature");
      expect(addedTx).toHaveProperty("uuid");
      expect(addedTx).toHaveProperty("timestamp");
    });

    it("Broadcasts transaction to pubsub", async () => {
      expect(mockBroadcastTx).toHaveBeenCalled();
    });
  });
});