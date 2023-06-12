import { Button, Container, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useState } from "react";

export function WalletBalanceChecker() {
  const { REACT_APP_API_URL } = process.env;
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState(null);

  const handleSubmit = (event: React.FormEvent<EventTarget>): void => {
    event.preventDefault();
    axios
      .get(`${REACT_APP_API_URL}/api/wallets/${walletAddress}`)
      .then((response) => {
        const balance = response.data.balance;
        setWalletBalance(balance);
      })
      .catch((err) => {
        console.error(err);
      });
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
