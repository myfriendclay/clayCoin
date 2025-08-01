import { Box, Button, TextField } from "@mui/material";
import { useState } from "react";
import CachedIcon from "@mui/icons-material/Cached";

function WalletGenerator() {
  const emptyWallet = {
    publicKey: "",
    privateKey: "",
  };
  const handleCopyClick = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const [wallet, setWallet] = useState(emptyWallet);

  const handleSubmit = async (event: React.FormEvent<EventTarget>): Promise<void> => {
    event.preventDefault();
    try {
      const response = await fetch('/api/wallets/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate wallet');
      }

      const walletKeyPair = await response.json();
      setWallet({
        publicKey: walletKeyPair.publicKey,
        privateKey: walletKeyPair.privateKey,
      });
    } catch (error) {
      console.error('Error generating wallet:', error);
    }
  };

  return (
    <>
      <Button
        variant="text"
        sx={{
          margin: 1,
        }}
        onClick={handleSubmit}
        endIcon={<CachedIcon />}
      >
        Generate New Wallet
      </Button>
      {wallet.publicKey && (
        <Box sx={{ display: "flex" }}>
          <Box>
            <TextField
              label="Public Key 🔓"
              size="small"
              sx={{ minWidth: "70%" }}
              // value={getTruncatedString(wallet.publicKey, 8)}
              value={wallet.publicKey}
            />
            <Button onClick={() => handleCopyClick(wallet.publicKey)}>
              Copy Public Key 🔓
            </Button>
          </Box>
          <Box>
            <TextField
              label="Private Key 🔑"
              type="password"
              size="small"
              value={wallet.privateKey}
              sx={{ minWidth: "70%" }}
            />
            <Button onClick={() => handleCopyClick(wallet.privateKey)}>
              Copy Private Key 🔑
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
}

export default WalletGenerator;
