import { Box, Collapse, IconButton, TableCell, TableRow, Tooltip } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { BlockType } from "../App";
import { getTruncatedString } from "./MemPool/Transaction";
import { useState } from "react";
import Transactions from "./MemPool/Transactions";

function Block({block}: {block: BlockType}) {

  const [open, setOpen] = useState(false);

  const {hash, timestamp, height, nonce, miningDurationMs, previousHash, transactions, difficulty} = block
  return (
    <>
    <TableRow>
      <TableCell>
        <IconButton
          aria-label="expand row"
          size="small"
          onClick={() => setOpen(!open)}
          >
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </TableCell>
      <TableCell>{height}</TableCell>
      <TableCell>{new Date (timestamp).toLocaleString()}</TableCell>
      <TableCell>
        <Tooltip title={hash} arrow>
          <span>
            {getTruncatedString(hash, 4)}
          </span>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ color: 'success.main' }}>
        <Tooltip title={previousHash} arrow>
          <span>
            {getTruncatedString(previousHash, 4)}
          </span>
        </Tooltip>
      </TableCell>
      <TableCell>{transactions.length}</TableCell>
      <TableCell>{difficulty}</TableCell>
      <TableCell>{nonce}</TableCell>
      <TableCell>{Math.ceil(miningDurationMs || 0 / 1000 / 60)}</TableCell>
    </TableRow>

    <TableRow>
    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ margin: 1 }}>

          {
          transactions.length !== 0 
          ? 
          <Transactions transactions={transactions}/>
          : <p>Strangely, there are no transactions found for this block.</p>
          }
        </Box>
      </Collapse>
    </TableCell>
    </TableRow>
    </>
    );
}

export default Block;
