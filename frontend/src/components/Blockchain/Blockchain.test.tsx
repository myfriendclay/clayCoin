import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Blockchain from './Blockchain';
import { IntlProvider } from 'react-intl';
import io from 'socket.io-client';

// Mock fetch
const mockFetch = vi.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ isValidBlock: true })
  })
);
global.fetch = mockFetch;

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
    // Add a cleanup function that will be called in useEffect cleanup
    close: vi.fn()
  }))
}));

// Import the mocked socket.io-client
import io from 'socket.io-client';

// Mock data
const mockBlockchain = [
  {
    hash: '000abc123',
    timestamp: new Date('2024-01-01').getTime(),
    height: 1,
    nonce: 12345,
    miningDurationMs: 1000,
    previousHash: '000abc122',
    transactions: [],
    difficulty: 3,
  },
  {
    hash: '000abc124',
    timestamp: new Date('2024-01-02').getTime(),
    height: 2,
    nonce: 12346,
    miningDurationMs: 2000,
    previousHash: '000abc123',
    transactions: [],
    difficulty: 3,
  }
];

const mockSetBlockchain = vi.fn();
const mockSetAlertDetails = vi.fn();

// Wrapper for IntlProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <IntlProvider locale="en">
    {children}
  </IntlProvider>
);

describe('Blockchain Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders blockchain information correctly', async () => {
    render(
      <Blockchain
        blockchain={mockBlockchain}
        isChainValid={true}
        setBlockchain={mockSetBlockchain}
        setAlertDetails={mockSetAlertDetails}
      />,
      { wrapper }
    );

    // Check if header is present
    expect(screen.getByText('Blockchain')).toBeInTheDocument();

    // Check if table headers are present
    const headers = ['Height', 'Time', 'Hash', 'Prev Hash', 'Transactions', 'Difficulty', 'Nonce', 'Mining Time (sec)', 'Valid'];
    headers.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });

    // Check if blocks are rendered
    expect(screen.getByText('1')).toBeInTheDocument(); // First block height
    expect(screen.getByText('2')).toBeInTheDocument(); // Second block height
  });

  it('shows valid chain icon when chain is valid', () => {
    render(
      <Blockchain
        blockchain={mockBlockchain}
        isChainValid={true}
        setBlockchain={mockSetBlockchain}
        setAlertDetails={mockSetAlertDetails}
      />,
      { wrapper }
    );

    expect(screen.getByLabelText('Blockchain has been validated. Every block has valid proof of work and each block is validly connected to the previous block.')).toBeInTheDocument();
  });

  it('shows invalid chain icon when chain is invalid', () => {
    render(
      <Blockchain
        blockchain={mockBlockchain}
        isChainValid={false}
        setBlockchain={mockSetBlockchain}
        setAlertDetails={mockSetAlertDetails}
      />,
      { wrapper }
    );

    expect(screen.getByLabelText('Blockchain is invalid! One block does not have valid proof of work and/or two or more blocks are not validly connected.')).toBeInTheDocument();
  });

  it('handles socket updates correctly', async () => {
    const mockIo = vi.mocked(io);
    const mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      disconnect: vi.fn()
    };
    
    mockIo.mockImplementation(() => mockSocket);

    render(
      <Blockchain
        blockchain={mockBlockchain}
        isChainValid={true}
        setBlockchain={mockSetBlockchain}
        setAlertDetails={mockSetAlertDetails}
      />,
      { wrapper }
    );

    // Get the callback that was registered
    const [[event, callback]] = mockSocket.on.mock.calls;
    expect(event).toBe('updateBlockchain');

    // Simulate socket event
    const newChain = [...mockBlockchain, {
      hash: '000abc125',
      timestamp: new Date('2024-01-03').getTime(),
      height: 3,
      nonce: 12347,
      miningDurationMs: 3000,
      previousHash: '000abc124',
      transactions: [],
      difficulty: 3,
    }];

    callback({ chain: newChain });

    // Verify the callbacks were called with correct data
    expect(mockSetBlockchain).toHaveBeenCalledWith(newChain);
    expect(mockSetAlertDetails).toHaveBeenCalledWith({
      open: true,
      alertMessage: `Blockchain updated with a longer chain of length ${newChain.length} found on the network!`,
      alertType: "info",
    });
  });

  it('cleans up socket connection on unmount', () => {
    const mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      disconnect: vi.fn(),
      close: vi.fn()
    };
    
    (io as jest.Mock).mockImplementation(() => mockSocket);

    const { unmount } = render(
      <Blockchain
        blockchain={mockBlockchain}
        isChainValid={true}
        setBlockchain={mockSetBlockchain}
        setAlertDetails={mockSetAlertDetails}
      />,
      { wrapper }
    );

    unmount();
    
    // The socket should be cleaned up
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
}); 