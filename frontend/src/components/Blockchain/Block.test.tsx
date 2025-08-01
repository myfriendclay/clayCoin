import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Block from './Block';
import axios from 'axios';
import { IntlProvider } from 'react-intl';

// Mock axios
vi.mock('axios');

// Mock data
const mockBlock = {
  hash: '000abc123',
  timestamp: new Date('2024-01-01').getTime(),
  height: 1,
  nonce: 12345,
  miningDurationMs: 1000,
  previousHash: '000abc122',
  transactions: [],
  difficulty: 3,
};

// Wrapper for IntlProvider and table structure
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <IntlProvider locale="en">
    <table>
      <tbody>
        {children}
      </tbody>
    </table>
  </IntlProvider>
);

describe('Block Component', () => {
  beforeEach(() => {
    // Mock axios for each test
    vi.mocked(axios.get).mockResolvedValue({ data: { isValidBlock: true } });
  });

  it('renders block information correctly', () => {
    render(<Block block={mockBlock} />, { wrapper });

    // Check if basic block information is displayed
    expect(screen.getByText('1')).toBeInTheDocument(); // height
    expect(screen.getByText('3')).toBeInTheDocument(); // difficulty
    expect(screen.getByText('12345')).toBeInTheDocument(); // nonce
    expect(screen.getByText('1000')).toBeInTheDocument(); // miningDurationMs
    expect(screen.getByText('0')).toBeInTheDocument(); // transactions length
  });

  it('expands and collapses when clicked', async () => {
    render(<Block block={mockBlock} />, { wrapper });

    // Initially collapsed
    expect(screen.queryByText('Strangely, there are no transactions found for this block.')).not.toBeInTheDocument();

    // Click to expand
    const expandButton = screen.getByLabelText('expand row');
    fireEvent.click(expandButton);

    // Should show empty transactions message
    expect(screen.getByText('Strangely, there are no transactions found for this block.')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(expandButton);

    // Wait for the collapse animation to complete
    await waitFor(() => {
      expect(screen.queryByText('Strangely, there are no transactions found for this block.')).not.toBeInTheDocument();
    });
  });

  it('shows valid block icon when block is valid', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { isValidBlock: true } });

    render(<Block block={mockBlock} />, { wrapper });

    // Look for the LockIcon with correct aria-label
    const validIcon = await screen.findByLabelText('Block has valid proof of work hash and only valid transactions.');
    expect(validIcon).toBeInTheDocument();
  });

  it('shows invalid block icon when block is invalid', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { isValidBlock: false } });

    render(<Block block={mockBlock} />, { wrapper });

    // Look for the DangerousIcon with correct aria-label
    const invalidIcon = await screen.findByLabelText('Block could not be validated. It cannot be trusted!');
    expect(invalidIcon).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    // Mock axios error
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('API Error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Block block={mockBlock} />, { wrapper });

    // Wait for error to be logged
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
}); 