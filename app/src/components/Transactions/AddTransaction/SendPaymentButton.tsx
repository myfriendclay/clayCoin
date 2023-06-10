
import { Button } from "@mui/material";

export default function SendPaymentButton({ handleSubmit, values }: any) {

  return (
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
      Sign and Add
    </Button>
  )
}