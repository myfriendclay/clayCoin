import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import Transaction from './Transaction';

const transaction = {
    fromAddress: 'sender123',
    toAddress: 'recipient456',
    amount: 10.5,
    memo: 'Payment for goods',
    fee: 0.5,
    uuid: 'abc123',
    timestamp: 1654321000,
  };

beforeEach(() => {
  render(<Transaction transaction={transaction}/>);
})

describe("Headers", () => {
  test('Sanity test', () => {
    expect(true).toBe(true);
  });
})

