import { Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";

export function WalletBalanceChecker() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<EventTarget>): Promise<void> => {
    event.preventDefault();
    setError(null);
    try {
      const response = await fetch(`/api/wallets/${walletAddress}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch wallet balance');
      }

      setWalletBalance(data.balance);
    } catch (error) {
      setWalletBalance(null);
      setError(error instanceof Error ? error.message : 'Failed to check balance');
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
        error={!!error}
        helperText={error}
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
