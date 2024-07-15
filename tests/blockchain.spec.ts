import { test, expect } from "@playwright/test";

test("can generate a new wallet", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  // create wallet
  await page.getByRole("button", { name: "Add Transaction" }).click();
  await page.getByRole("button", { name: "Generate New Wallet" }).click();
  const publicKeyInput = await page.getByLabel('Public Key 🔓');
  const publicKeyValue = await publicKeyInput.getAttribute('value');
  const privateKeyInput = await page.getByLabel('Private Key 🔑');
  const privateKeyValue = await privateKeyInput.getAttribute('value');
  await page.getByRole('button', { name: 'Cancel' }).click();

  // mine a block so that there are funds in the wallet
  await page.getByLabel('Mining address').fill(publicKeyValue as string);
  await page.getByRole("button", { name: "Mine Block #" }).click();

  // add a transaction
  await page.getByRole("button", { name: "Add Transaction" }).click();
  await page.getByLabel("From address").fill(publicKeyValue as string);
  await page
    .getByLabel("Recipient address")
    .fill("test recipient public address");
    await page.getByLabel("Private key").fill(privateKeyValue as string);
  await page.getByLabel("Amount").fill("2");
  await page.getByLabel("Fee").fill("1");
  await page.getByLabel("Memo (optional)").fill("test memo");

  await page.getByRole("button", { name: "SEND PAYMENT" }).click();
  await expect(
    page.getByText("You added a transaction to the mempool!")
  ).toBeVisible();

});

