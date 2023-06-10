import { useState } from "react";
import axios from 'axios';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, TextField } from "@mui/material";

import Amount from './Amount'
import Memo from './Memo'
import { TransactionType, AlertType } from "../../../App";

interface FormData {
  fromAddress: string;
  toAddress: string;
  amount: number;
  memo: string;
  fee: number;
  secretKey: string;
}

interface MemPoolProps {
  setmemPool: (mempool: TransactionType[]) => void;
  setAlertDetails: (alertDetails: AlertType) => void;
}

export default function CreatePayment({setmemPool, setAlertDetails} : 
  MemPoolProps) {

  const blankFormValues = {
    fromAddress: '',
    toAddress: '',
    amount: 0,
    memo: '',
    fee: 0,
    secretKey: ''
  }

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(blankFormValues)

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
      console.log(formData)
      axios.post('http://localhost:3001/api/transactions', formData)
        .then(response => {
          const pendingTransactions = response.data
          setmemPool(pendingTransactions)
          setAlertDetails({ 
            open: true, 
            alertMessage: "You added a transaction to the mempool!", 
            alertType: 'success'
          })
          setFormData(blankFormValues)
          handleClose()
        })
        .catch(err => {
          const errorMessage = err.response.data.error
          console.error(errorMessage)
          setAlertDetails({ 
            open: true, 
            alertMessage: errorMessage, 
            alertType: 'error'
          })
        })
      
    }

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Add Transaction
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add payment transaction to mempool, enter the following information:
          </DialogContentText>

          <TextField
            size="small"
            margin="dense"
            sx={{minWidth: "100%"}}
            id="fromAddress"
            label="From address"
            type="text"
            value={formData.fromAddress}
            onChange={handleChange}
          />
          <TextField
            size="small"
            margin="dense"
            sx={{minWidth: "100%"}}
            id="toAddress"
            label="Recipient address"
            type="text"
            value={formData.toAddress}
            onChange={handleChange}
          />
          <TextField
            size="small"
            margin="dense"
            sx={{minWidth: "100%"}}
            id="secretKey"
            label="Private key"
            type="password"
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Send Payment</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}