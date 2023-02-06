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
    let { name, value } = event.target;
    setFormData({ ...formData, [name]: value})
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
  }


  return (
    <div>
    <form onSubmit={handleSubmit}>
      <label>
        Mining address:
        <input type="text" name="miningAddress" value={formData.miningAddress} onChange={handleChange} />
      </label>
      <button type="submit">Mine Block</button>
    </form>
    </div>
    )
}

export default MineMemPool;
