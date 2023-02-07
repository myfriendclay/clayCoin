import { TextField } from "@mui/material"
//@ts-ignore
export default function FilterTransactions(props) {
  const { query, setQuery } = props
//@ts-ignore
  const handleChange = event => {
    const { value } = event.target
    setQuery(value)
  }

  return (
    <TextField
      id="query" 
      name="query"
      size="small"
      value={query}
      label="Filter Payments" 
      type="search"
      onChange={handleChange}
      helperText="Filter by fromAddress, toAddress, amount, date, memo, or ID"
    />
  )
}