import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography } from "@mui/material"
import { TransactionType } from "../../App"
import Transaction from "./Transaction"

export default function Transactions({transactions}: {transactions: TransactionType[]}) {

  const headers = ["Sender 💸", "", "Receiver 🤑", "Amount 💰", "Memo 📝", "Fee", "Timestamp"]

  return (
    <TableContainer component={Paper} sx={{ width: 800 }}>
   
      <Table aria-label="payments table">
        <TableHead>
          <TableRow sx={{ textAlign: 'center'}}>
          <Typography variant="h6" gutterBottom component="div">
              Transactions
            </Typography>
          </TableRow>
          <TableRow>
            {headers.map(header => 
              <TableCell 
                key={header} 
                sx={{ fontWeight: 'bold', fontSize: 18 }}>
                  {header}
              </TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          { 
            transactions
            .map((transaction: TransactionType) => 
              <Transaction 
                transaction={transaction}
                key={transaction.uuid}/>)
          }
        </TableBody>
      </Table>
    </TableContainer>
  )
}