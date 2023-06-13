import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
} from "@mui/material";
import { TransactionType } from "../../App";
import Transaction from "./Transaction";

export default function Transactions({
  transactions,
}: {
  transactions: TransactionType[];
}) {
  const headers = ["Time", "Sender", "", "Receiver", "Amount", "Fee", "Memo"];

  return (
    <TableContainer
      component={Paper}
      sx={{ minWidth: "1100px", paddingTop: "15px" }}
      elevation={2}
    >
      <Typography
        variant="h5"
        gutterBottom
        component="div"
        sx={{ textAlign: "center" }}
      >
        Transactions
      </Typography>
      <Table aria-label="transactions table">
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell key={header} sx={{ fontWeight: "bold", fontSize: 18 }}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>

          {transactions.length ? (
            transactions.map((transaction: TransactionType) => (
              <Transaction transaction={transaction} key={transaction.uuid} />
            ))
          ) : (
            <TableRow>
              <TableCell>
                <Typography>No transactions found. Sad!</Typography>
              </TableCell>
            </TableRow>
          )}

        </TableBody>
      </Table>
    </TableContainer>
  );
}
