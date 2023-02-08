import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material"
import { TransactionType } from "../../App"
import Transaction from "./Transaction"
//@ts-ignore
export default function Transactions(props) {
  const { memPool, queryMatches, query } = props
  const headers = ["Sender 💸", "", "Receiver 🤑", "Amount 💰"]
  const numOfPaymentsToDisplay = 10

  return (
    <TableContainer component={Paper} sx={{ width: 700 }}>
      <Table aria-label="payments table">
        <TableHead>
          <TableRow>
            {headers.map(header => <TableCell key={header} sx={{ fontWeight: 'bold', fontSize: 18 }}>{header}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          { 
            memPool
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