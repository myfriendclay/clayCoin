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

function AddTransactionForm() {

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
        From Address (public key):
        <input type="text" name="fromAddress" value={formData.fromAddress} onChange={handleChange} />
      </label>
      <label>
        To Address (public key):
        <input type="text" name="toAddress" value={formData.toAddress} onChange={handleChange} />
      </label>
      <label>
        Amount:
        <input type="number" name="amount" value={formData.amount} onChange={handleChange} />
      </label>
      <label>
        Memo:
        <input type="memo" name="memo" value={formData.memo} onChange={handleChange} />
      </label>
      <label>
        Fee:
        <input type="number" name="fee" value={formData.fee} onChange={handleChange} />
      </label>
      <label>
        Secret Key:
        <input type="password" name="secretKey" value={formData.secretKey} onChange={handleChange} />
      </label>
      <button type="submit">Sign Transaction</button>
    </form>
    </div>
    )
}

export default AddTransactionForm;
