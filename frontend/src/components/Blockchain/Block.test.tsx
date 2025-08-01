import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Block from './Block';
import { IntlProvider } from 'react-intl';

// Mock fetch
const mockFetch = vi.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ isValidBlock: true })
  })
);

// Patch: Make mockFetch look more like a real Response object for TypeScript
global.fetch = mockFetch as unknown as typeof fetch;

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
    vi.clearAllMocks();
  });

  it('renders block information correctly', async () => {
    render(<Block block={mockBlock} />, { wrapper });

    // Wait for async operations to complete
    await waitFor(() => {
      // Check if basic block information is displayed
      expect(screen.getByText('1')).toBeInTheDocument(); // height
      expect(screen.getByText('3')).toBeInTheDocument(); // difficulty
      expect(screen.getByText('12345')).toBeInTheDocument(); // nonce
      expect(screen.getByText('1000')).toBeInTheDocument(); // miningDurationMs
      expect(screen.getByText('0')).toBeInTheDocument(); // transactions length
    });
  });

  it('expands and collapses when clicked', async () => {
    render(<Block block={mockBlock} />, { wrapper });

    // Wait for initial render to complete
    await waitFor(() => {
      expect(screen.queryByText('Strangely, there are no transactions found for this block.')).not.toBeInTheDocument();
    });

    // Click to expand
    const expandButton = screen.getByLabelText('expand row');
    fireEvent.click(expandButton);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('Strangely, there are no transactions found for this block.')).toBeInTheDocument();
    });

    // Click to collapse
    fireEvent.click(expandButton);

    // Wait for collapse
    await waitFor(() => {
      expect(screen.queryByText('Strangely, there are no transactions found for this block.')).not.toBeInTheDocument();
    });
  });

  it('shows valid block icon when block is valid', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ isValidBlock: true })
    });

    render(<Block block={mockBlock} />, { wrapper });

    // Wait for the validation check to complete
    await waitFor(() => {
      expect(screen.getByLabelText('Block has valid proof of work hash and only valid transactions.')).toBeInTheDocument();
    });
  });

  it('shows invalid block icon when block is invalid', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ isValidBlock: false })
    });

    render(<Block block={mockBlock} />, { wrapper });

    // Wait for the validation check to complete
    await waitFor(() => {
      expect(screen.getByLabelText('Block could not be validated. It cannot be trusted!')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Block block={mockBlock} />, { wrapper });

    // Wait for the error to be logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
}); 