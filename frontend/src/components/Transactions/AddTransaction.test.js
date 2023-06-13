import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import AddTransaction from './AddTransaction';

beforeEach(() => {
  render(<AddTransaction/>);
})

describe("Blockchain", () => {
  test('Renders Height header', () => {
    const addTxHeader = screen.getByText("Add Transaction");
    expect(addTxHeader).toBeInTheDocument();
  });
})

