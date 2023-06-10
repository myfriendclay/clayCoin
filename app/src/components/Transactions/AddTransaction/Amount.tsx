import { FormControl, TextField} from "@mui/material";

export default function Amount({values, handleChange}: any) {
  
  return (
    <FormControl sx={{ margin: 1, width: 110 }}>
      <TextField
        size="small"
        required
        id="amount"
        label="Amount"
        type="number"
        value={values.amount}
        onChange={handleChange}
      >
      </TextField>
    </FormControl>
  )
}