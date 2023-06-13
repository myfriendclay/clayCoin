import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import Block from './Block';

const testBlock = {
    timestamp: 1623468000000,
    hash: "0x123456789abcdef",
    height: 1,
    nonce: 123456,
    miningDurationMs: 5000,
    previousHash: "0x987654321fedcba",
    transactions: [
      {
        uuid: "transaction1",
        timestamp: 1623468000000,
        fromAddress: "0x1111111111111111",
        toAddress: "0x2222222222222222",
        amount: 10,
        fee: 0.1,
        memo: "Test transaction 1",
      },
      {
        uuid: "transaction2",
        timestamp: 1623468100000,
        fromAddress: "0x2222222222222222",
        toAddress: "0x3333333333333333",
        amount: 5,
        fee: 0.05,
        memo: "Test transaction 2",
      },
    ],
    difficulty: 12345,
  };
  

beforeEach(() => {
  render(<Block block={testBlock}/>);
})

describe("Headers", () => {
  test('Sanity test', () => {
    expect(true).toBe(true);
  });
})

