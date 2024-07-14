import { TableRow, TableCell, Tooltip } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { TransactionType } from "../../types";
import getTruncatedString from "../../utils/getTruncatedString";
import { FormattedDate, FormattedTime } from "react-intl";

function Transaction({ transaction }: { transaction: TransactionType }) {
  return (
    <TableRow>
      <TableCell>
        <FormattedDate
          value={transaction.timestamp}
          month="short"
          day="2-digit"
          year="numeric"
        />{" "}
        <FormattedTime
          value={transaction.timestamp}
          hour="numeric"
          minute="numeric"
          hour12={true}
        />
      </TableCell>
      <TableCell>
        <Tooltip title={transaction.fromAddress} arrow>
          <span>{getTruncatedString(transaction.fromAddress, 6)}</span>
        </Tooltip>
      </TableCell>
      <TableCell>
        <ArrowForwardIcon />
      </TableCell>
      <TableCell>
        <Tooltip title={transaction.toAddress} arrow>
          <span>{getTruncatedString(transaction.toAddress, 6)}</span>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ color: "success.main" }}>
        {transaction.amount} ₿
      </TableCell>
      <TableCell>{transaction.fee} ₿</TableCell>
      <TableCell>
        <Tooltip title={transaction.memo} arrow>
          <span>{getTruncatedString(transaction.memo, 20)}</span>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

export default Transaction;
