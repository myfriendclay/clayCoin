import { Box, Button, Container, TextField } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { BlockType, TransactionType } from "../App";

interface FormData {
  miningAddress: string;
}

interface MineMemPoolProps {
  setBlockchain: (mempool: BlockType[]) => void;
  blockchain: BlockType[];
  setmemPool: (mempool: TransactionType[]) => void;
  setOpen: (open: boolean) => void;
  setAlertMessage: (alertMessage: string) => void;
  setAlertType: (alertType: 'success' | 'error' | 'warning' | 'info') => void;
}

function MineMemPool({setBlockchain, blockchain, setmemPool, setOpen, setAlertMessage, setAlertType}: MineMemPoolProps) {

  const blankFormValues = {
    miningAddress: '',
  }

  const [formData, setFormData] = useState<FormData>(blankFormValues)


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    let { name, value, id } = event.target;
    setFormData({ ...formData, [id || name]: value})
  }

  const handleSubmit = (event: React.FormEvent<EventTarget>): void => {
    event.preventDefault();
    axios.post('http://localhost:3001/mine', formData)
      .then(response => {
        const block = response.data
        setBlockchain([...blockchain, block])
        setmemPool([])
        setOpen(true)
        setAlertType('success')
        setAlertMessage("You mined a block and it was added to blockchain!")
      })
      .catch(err => {
        console.error(err)
        setOpen(true)
        setAlertType('error')
        setAlertMessage(err.message)
      })
      .finally(() => {
        setFormData(blankFormValues)
      })
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
      <Box>
        <TextField
          size="small"
          sx={{minWidth: "100%"}}
          id="miningAddress"
          label="Mining address"
          type="text"
          value={formData.miningAddress}
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
          Mine Block
        </Button>
      </Box>
    </Container>

    )
}

export default MineMemPool;
