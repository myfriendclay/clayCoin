import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material"
import Transaction from "./Transaction"
//@ts-ignore
export default function Payments(props) {
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
            (query === ""
            ? memPool.slice(0, numOfPaymentsToDisplay)
            : memPool.filter(queryMatches))
            //@ts-ignore
            .map((transaction) => <Transaction transaction={transaction} key={transaction.uuid}/>)
          }
        </TableBody>
      </Table>
    </TableContainer>
  )
}