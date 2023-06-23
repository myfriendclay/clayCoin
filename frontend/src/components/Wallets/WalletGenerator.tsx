import { Box, Button, TextField } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import getTruncatedString from "../../utils/getTruncatedString";
import CachedIcon from "@mui/icons-material/Cached";

function WalletGenerator() {
  const { REACT_APP_API_URL } = process.env;
  const emptyWallet = {
    publicKey: "",
    privateKey: "",
  };
  const handleCopyClick = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const [wallet, setWallet] = useState(emptyWallet);

  const handleSubmit = (event: React.FormEvent<EventTarget>): void => {
    event.preventDefault();
    axios
      .post(`${REACT_APP_API_URL}/api/wallets/`)
      .then((response) => {
        const walletKeyPair = response.data;
        setWallet({
          publicKey: walletKeyPair.publicKey,
          privateKey: walletKeyPair.privateKey,
        });
      })
      .catch((err) => {
        console.error(err);
      });
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
              value={getTruncatedString(wallet.publicKey, 8)}
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
