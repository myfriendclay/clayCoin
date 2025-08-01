import { Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";

export function WalletBalanceChecker() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState(null);

  const handleSubmit = async (event: React.FormEvent<EventTarget>): Promise<void> => {
    event.preventDefault();
    try {
      const response = await fetch(`/api/wallets/${walletAddress}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallet balance');
      }

      const data = await response.json();
      setWalletBalance(data.balance);
    } catch (error) {
      console.error('Error checking balance:', error);
      setWalletBalance(null);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    let { value } = event.target;
    setWalletAddress(value);
  };

  return (
    <Container sx={{ display: "flex", marginTop: "15px" }}>
      <TextField
        size="small"
        sx={{ minWidth: "40%" }}
        id="walletAddress"
        label="Wallet public key"
        type="text"
        value={walletAddress}
        onChange={handleChange}
      />
      <Button
        variant="outlined"
        size="large"
        onClick={handleSubmit}
        sx={{ minWidth: "30%", marginLeft: "10px", marginBottom: "10px" }}
      >
        Check Balance
      </Button>
      {walletBalance != null && (
        <Typography
          variant="h6"
          sx={{ marginLeft: "10px", marginTop: "5px", color: "success.main" }}
        >
          {walletBalance} ₿
        </Typography>
      )}
    </Container>
  );
}
