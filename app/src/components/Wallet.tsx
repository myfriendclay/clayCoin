import { Button, Container } from "@mui/material";
import axios from "axios";
import { useState } from "react";

export function Wallet() {

  const emptyWallet = {
    publicKey: '',
    privateKey: ''
  }

  const [wallet, setWallet] = useState(emptyWallet)

  const handleSubmit = (event: React.FormEvent<EventTarget>): void => {
    event.preventDefault();
    axios.get('http://localhost:3001/wallet')
      .then(response => {
        const walletKeyPair = response.data
        setWallet({...wallet, 
          publicKey: walletKeyPair.publicKey, 
          privateKey: walletKeyPair.privateKey})
      })
      .catch(err => {
        console.error(err)
      })
  }

  return (
    <Container sx={{ display: 'flex', flexFlow: "column", alignItems: "center"}}>
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
      Generate New Wallet
    </Button>
      {wallet.publicKey ?
      <div>
        <p>Public Key: {wallet.publicKey}</p>
        <p>Private Key: {wallet.privateKey}</p> 
      </div>
      :
      <div/>
    }
  </Container>
  )
} 
