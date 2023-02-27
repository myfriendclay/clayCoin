import { TableCell, TableRow } from "@mui/material";
import { BlockType } from "../App";
import { getTruncatedString } from "./MemPool/Transaction";

function Block({block}: {block: BlockType}) {
  const {hash, timestamp, height, nonce, miningDurationMs, previousHash, transactions, difficulty} = block
  return (
    <TableRow>
      <TableCell>{height}</TableCell>
      <TableCell>{new Date (timestamp).toLocaleString()}</TableCell>
      <TableCell>{getTruncatedString(hash, 4)}</TableCell>
      <TableCell sx={{ color: 'success.main' }}>{getTruncatedString(previousHash, 4)}</TableCell>
      <TableCell>{transactions.length}</TableCell>
      <TableCell>{difficulty}</TableCell>
      <TableCell>{nonce}</TableCell>
      <TableCell>{Math.ceil(miningDurationMs || 0 / 1000 / 60)}</TableCell>
    </TableRow>
    );
}

export default Block;
