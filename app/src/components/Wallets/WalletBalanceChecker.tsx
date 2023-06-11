import { Box, Button, Container, TextField } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { getTruncatedString } from "../Transactions/Transaction";

export function WalletBalanceChecker() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState(null);

  const handleSubmit = (event: React.FormEvent<EventTarget>): void => {
    event.preventDefault();
    axios
      .get(`http://localhost:3001/api/wallets/${walletAddress}`)
      .then((response) => {
        const balance = response.data.balance;
        const transactions = response.data.transactions;
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
    <Container sx={{ marginTop: "20px" }}>
        <TextField
          size="small"
          sx={{ minWidth: "50%" }}
          id="walletAddress"
          label="Wallet address (public key)"
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
        {walletBalance !== null ? (
          <div>
            <p>Wallet {getTruncatedString(walletAddress, 6)} balance: {walletBalance}</p>
          </div>
        ) : (
          <div />
        )}
    </Container>
  );
}
