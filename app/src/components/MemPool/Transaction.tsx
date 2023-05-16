
import { TableRow, TableCell, Tooltip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const getTruncatedString = (string: String | null | undefined, limit: number) => {
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
      <TableCell>      
        <Tooltip title={transaction.fromAddress} arrow>
          <span>
            {getTruncatedString(transaction.fromAddress, 4)}
          </span>
        </Tooltip>
      </TableCell>
      <TableCell><ArrowForwardIcon/></TableCell>
      <TableCell>
        <Tooltip title={transaction.toAddress} arrow>
          <span>
            {getTruncatedString(transaction.toAddress, 4)}
          </span>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ color: 'success.main' }}>{transaction.amount} ₿</TableCell>
      {/* @ts-ignore */}
    </TableRow>
  )
}