
import { Box, TextField } from "@mui/material";

export default function Memo({ values, handleChange }: any) {

  return (
    <Box >
      <TextField
        size="small"
        margin="dense"
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