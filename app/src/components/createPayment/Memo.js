
import { Box, TextField } from "@mui/material";

export default function Memo(props) {

  const { values, handleChange } = props

  return (
    <Box sx={{ minWidth: "80%", margin: 1 }}>
      <TextField
        size="small"
        sx={{minWidth: "100%"}}
        id="memo"
        label="Memo (optional)"
        type="text"
        helperText='Purpose of payment (e.g. "Pizza + beer")'
        value={values.memo}
        onChange={handleChange}
      />
    </Box>
  )
}