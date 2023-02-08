import { Box, Button, Container, TextField } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";

interface FormData {
  miningAddress: string;
}

function MineMemPool() {

  const blankFormValues = {
    miningAddress: '',
  }

  const [formData, setFormData] = useState<FormData>(blankFormValues)

  //@ts-ignore
  const handleChange = event => {
    let { name, value, id } = event.target;
    setFormData({ ...formData, [id || name]: value})
  }

  //@ts-ignore
  const handleSubmit = event => {
    console.log(formData)
    event.preventDefault();
    axios.post('http://localhost:3001/mine', formData)
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
      <h1>Mining</h1>
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
