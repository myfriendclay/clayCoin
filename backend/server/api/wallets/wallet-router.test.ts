import request from "supertest";
import app from "../server";

describe("GET /:publicAddress", () => {
  test("Returns the balance and transactions of wallet", async () => {
    const res = await request(app).get(
      "/api/wallets/:04761ecbe8d05ea5c2e25450b3f444bf0e0013e0e00c4f4f7a76135fc7a572471efe88598bae3ad0af0fe00c1b24a0b17c1011b77d7e81e58bb55f79bbc4e79853"
    );
    const wallet = res.body;
    expect(wallet).toHaveProperty("balance");
    expect(wallet).toHaveProperty("transactions");
    expect(wallet.transactions).toHaveLength(0);
    expect(wallet.balance).toBe(0);
  });
});

describe("POST /wallets", () => {
  test("Returns a 200 and wallet with public and private key", async () => {
    const res = await request(app).post("/api/wallets");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("publicKey");
    expect(res.body).toHaveProperty("privateKey");
  });
});