import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import App from './App';

beforeEach(() => {
  render(<App/>);
})

describe("Blockchain", () => {
  test('Renders Blockchain header', () => {
    const blockChainHeader = screen.getByText("Blockchain");
    expect(blockChainHeader).toBeInTheDocument();
  });
})

describe("Mempool", () => {
  test('Renders Mempool header', () => {
    const memPoolHeader = screen.getByText("Mempool");
    expect(memPoolHeader).toBeInTheDocument();
  });
})

