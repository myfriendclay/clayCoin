import { Box, Button, Container, Typography } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { WalletBalanceChecker } from "./WalletBalanceChecker";

export function Wallet() {

  const emptyWallet = {
    publicKey: '',
    privateKey: ''
  }

  const [wallet, setWallet] = useState(emptyWallet)

  const handleSubmit = (event: React.FormEvent<EventTarget>): void => {
    event.preventDefault();
    axios.post('http://localhost:3001/api/wallets/')
      .then(response => {
        const walletKeyPair = response.data
        setWallet({
          publicKey: walletKeyPair.publicKey, 
          privateKey: walletKeyPair.privateKey})
      })
      .catch(err => {
        console.error(err)
      })
  }

  return (
    <Container sx={{ display: 'flex', flexFlow: "column", alignItems: "center"}}>
    <h1>Wallet</h1>
    <Button variant="text" sx={{ 
      margin: 1, 
      }} 

      onClick={handleSubmit}
      >
      Generate New Wallet
    </Button>
      {
      wallet.publicKey &&

      <Box
        sx={{
          }}
      >
        <Typography variant="body2" component="p">
          Public Key 🔓: {wallet.publicKey}
        </Typography>
        <Typography variant="body2" component="p">
          Private Key 🔑: {wallet.privateKey}
        </Typography>
      </Box>
      }
    <WalletBalanceChecker/>
  </Container>
  
  )
} 
