import { Box, Button, Container, TextField } from "@mui/material";
import axios from "axios";
import { useState } from "react";

export function WalletBalanceChecker() {

  const [walletAddress, setWalletAddress] = useState('')
  const [walletBalance, setWalletBalance] = useState(null)

  const handleSubmit = (event: React.FormEvent<EventTarget>): void => {
    event.preventDefault();
      axios.get(`http://localhost:3001/api/wallets/${walletAddress}`)
        .then(response => {
          const balance = response.data.balance
          const transactions = response.data.transactions
          setWalletBalance(balance)
        })
        .catch(err => {
          console.error(err)
        })
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    let { value } = event.target;
    setWalletAddress(value)
  }

  return (
    <Container sx={{ display: 'flex', flexFlow: "column", alignItems: "center"}}>
      <Box>
        <TextField
          size="small"
          sx={{minWidth: "100%"}}
          id="walletAddress"
          label="Wallet address"
          type="text"
          value={walletAddress}
          onChange={handleChange}
        />
        <Button variant="contained" sx={{ 
            margin: 1, 
            backgroundColor: '#8656ef',
            '&:hover': {
              backgroundColor: '#8656ef',
            } 
          }} 
          size="large"
          onClick={handleSubmit}
          >
          Check Wallet Balance
        </Button>
        {walletBalance !== null ?
      <div>
        <p>Wallet balance: {walletBalance}</p>
      </div>
      :
      <div/>
    }
      </Box>
  </Container>
  )
} 
