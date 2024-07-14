import { test, expect } from "@playwright/test";

const publicKey =
  "0484d19facc101b65997d15e48cee4710876734f27ae987eb39bc995b3aff3ff41827be2ce4d38f3e603f0ea0b3a2a471f3ac9882dced113ee6baf4dda740cae83";
const privateKey =
  "3f2343fbfe75396971c9e97115f7f50ce0d2b11da058747138ac74eaa8457c75";

test("can mine a clayCoin", async ({ page }) => {
  await page.goto("https://clay-coin.com");

  await page.getByLabel("Mining address").fill(publicKey);
  await page.getByRole("button", { name: "Mine Block #" }).click();
});

test("can generate a new wallet", async ({ page }) => {
  await page.goto("https://clay-coin.com");

  await page.getByRole("button", { name: "Add Transaction" }).click();
  await page.getByRole("button", { name: "Generate New Wallet" }).click();
  await page.getByRole("button", { name: "COPY PUBLIC KEY" }).click();

  await page.getByRole("button", { name: "COPY PRIVATE KEY" }).click();
});

test("can add a new transaction", async ({ page }) => {
  await page.goto("https://clay-coin.com");

  await page.getByRole("button", { name: "Add Transaction" }).click();

  await page.getByLabel("From address").fill(publicKey);
  await page
    .getByLabel("Recipient address")
    .fill("test recipient public address");
  await page.getByLabel("Private key").fill(privateKey);
  await page.getByLabel("Amount").fill("2");
  await page.getByLabel("Fee").fill("1");
  await page.getByLabel("Memo (optional)").fill("test memo");

  await page.getByRole("button", { name: "SEND PAYMENT" }).click();
  await expect(
    page.getByText("You added a transaction to the mempool!")
  ).toBeVisible();
});
