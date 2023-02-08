
import { TableRow, TableCell } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const getTruncatedString = (string: String, limit: number) => {
  if (!string) {
    return "N/A"
  }
  if (string.length <= limit * 2) {
    return string;
  }
  return `${string.slice(0, limit)}...${string.slice(string.length - limit, string.length)}`;
};

//@ts-ignore
export default function Transaction({transaction}) {


  return (
    <TableRow >
      <TableCell>{getTruncatedString(transaction.fromAddress, 4)}</TableCell>
      <TableCell><ArrowForwardIcon/></TableCell>
      <TableCell>{getTruncatedString(transaction.toAddress, 4)}</TableCell>
      <TableCell sx={{ color: 'success.main' }}>{transaction.amount} ₿</TableCell>
      {/* @ts-ignore */}
    </TableRow>
  )
}