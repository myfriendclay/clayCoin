import axios from "axios";
import React, { useState } from "react";

interface FormData {
  fromAddress: string;
  toAddress: string;
  amount: number;
  memo: string;
  fee: number;
  secretKey: string;
}

function MineMemPool() {

  const blankFormValues = {
    fromAddress: '',
    toAddress: '',
    amount: 0,
    memo: '',
    fee: 0,
    secretKey: ''
  }

  const [formData, setFormData] = useState<FormData>(blankFormValues)

  //@ts-ignore
  const handleChange = event => {
    let { name, value } = event.target;
    if (!isNaN(Number(value))) {
      value = Number(value)
    }
    setFormData({ ...formData, [name]: value})
  }

  //@ts-ignore
  const handleSubmit = event => {
    event.preventDefault();
    axios.post('http://localhost:3001/transactions', formData)
      .then(response => {
        console.log(response)
      })
      .catch(err => {
        console.error(err)
      })
  }


  return (
    <div>
    <form onSubmit={handleSubmit}>
      <label>
        
        <input type="text" name="fromAddress" value={formData.fromAddress} onChange={handleChange} />
      </label>
      <button type="submit">Sign Transaction</button>
    </form>
    </div>
    )
}

export default MineMemPool;
