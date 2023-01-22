import Blockchain from "./blockchain/Blockchain/Blockchain.js";

import EC from "elliptic"
const ec = new EC.ec('secp256k1')

const testCoin = new Blockchain()

const times = []
let average

for (let i = 0; i < 10000; i++) {
  const start = Date.now()
  testCoin.addPendingTransactionsToBlockchain()
  const end = Date.now()
  const miningTime = end - start
  times.push(miningTime)
  let sum = times.reduce((total, num) => total + num, 0)
  average = sum /times.length
  console.log(`Time to mine block: ${miningTime / 1000}sec. Average time: ${average / 1000} seconds`);
}