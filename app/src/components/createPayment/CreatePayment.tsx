import { useState } from "react";
import axios from 'axios';
import { Box, Container, FormControl, TextField } from "@mui/material";

import Amount from './Amount'
import Memo from './Memo'
import SendPaymentButton from "./SendPaymentButton";

interface FormData {
  fromAddress: string;
  toAddress: string;
  amount: number;
  memo: string;
  fee: number;
  secretKey: string;
}

export default function CreatePayment() {

  const blankFormValues = {
    fromAddress: '',
    toAddress: '',
    amount: 0,
    memo: '',
    fee: 0,
    secretKey: ''
  }

  const [formData, setFormData] = useState<FormData>(blankFormValues)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, id } = event.target;
      let numValue
      if (!isNaN(Number(value))) {
        numValue = Number(value)
      }
      setFormData({ ...formData, [id || name]: numValue || value})
    }

    const handleSubmit = (event: React.FormEvent<EventTarget>): void => {
      event.preventDefault();
      axios.post('http://localhost:3001/transactions', formData)
        .then(response => {
          console.log(response)
        })
        .catch(err => {
          console.error(err)
        })
      setFormData(blankFormValues)
    }

  return (
    <Container sx={{ 
      margin: "0px auto 30px auto",  
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: '40px',
      borderBottom: '1px grey dotted'
      }}>
      <h1>Send Payment</h1>
      <Box>

        <TextField
          size="small"
          sx={{minWidth: "100%"}}
          id="fromAddress"
          label="From address"
          type="text"
          helperText='Your public key'
          value={formData.fromAddress}
          onChange={handleChange}
        />
        <TextField
          size="small"
          sx={{minWidth: "100%"}}
          id="toAddress"
          label="Recipient address"
          type="text"
          helperText='Their public key'
          value={formData.toAddress}
          onChange={handleChange}
        />
        <TextField
          size="small"
          sx={{minWidth: "100%"}}
          id="secretKey"
          label="Private key"
          type="password"
          helperText='Your secret key'
          value={formData.secretKey}
          onChange={handleChange}
        />
          <Amount values={formData} handleChange={handleChange}/>
          <FormControl sx={{ margin: 1, width: 110 }}>
            <TextField
              size="small"
              required
              id="fee"
              label="Fee"
              type="number"
              value={formData.fee}
              onChange={handleChange}
            >
            </TextField>
          </FormControl>
          <Memo values={formData} handleChange={handleChange}/>
          <SendPaymentButton
            handleSubmit={handleSubmit} 
          />

      </Box>
    </Container>
  )
}