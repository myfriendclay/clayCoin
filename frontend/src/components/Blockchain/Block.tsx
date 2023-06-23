import { useEffect, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import DangerousIcon from "@mui/icons-material/Dangerous";
import axios from "axios";

import { BlockType } from "../../types";
import getTruncatedString from "../../utils/getTruncatedString";
import Transactions from "../Transactions/Transactions";

function Block({ block }: { block: BlockType }) {
  const { REACT_APP_API_URL } = process.env;
  const [open, setOpen] = useState(false);
  const [isValidBlock, setIsValidBlock] = useState(false);

  const {
    hash,
    timestamp,
    height,
    nonce,
    miningDurationMs,
    previousHash,
    transactions,
    difficulty,
  } = block;

  useEffect(() => {
    axios
      .get(`${REACT_APP_API_URL}/api/blocks/${hash}/isBlockValid`)
      .then((response) => {
        setIsValidBlock(response.data.isValidBlock);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [REACT_APP_API_URL, hash]);

  return (
    <>
      <TableRow sx={{ backgroundColor: open ? "#f1f8e9" : "transparent" }}>
        <TableCell width={10}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell width={20}>{height}</TableCell>
        <TableCell width={150}>
          {new Date(timestamp).toLocaleString()}
        </TableCell>
        <TableCell width={20}>
          <Tooltip title={hash} arrow>
            <span>{getTruncatedString(hash, 4)}</span>
          </Tooltip>
        </TableCell>
        <TableCell width={0}>
          <Tooltip title={previousHash} arrow>
            <span>{getTruncatedString(previousHash, 4)}</span>
          </Tooltip>
        </TableCell>
        <TableCell width={20}>{transactions.length}</TableCell>
        <TableCell>{difficulty}</TableCell>
        <TableCell>{nonce}</TableCell>
        <TableCell>{Math.ceil(miningDurationMs / 1000)}</TableCell>
        <TableCell>
          {isValidBlock ? (
            <Tooltip title="Block has valid proof of work hash and only valid transactions.">
              <LockIcon sx={{ color: "success.main" }} />
            </Tooltip>
          ) : (
            <Tooltip title="Block could not be validated. It cannot be trusted!">
              <DangerousIcon sx={{ color: "error.main" }} />
            </Tooltip>
          )}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={9}
          sx={{ margin: 1, backgroundColor: open ? "#e3f2fd" : "transparent" }}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {transactions.length !== 0 ? (
                <Transactions transactions={transactions} />
              ) : (
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography>
                          Strangely, there are no transactions found for this
                          block.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default Block;
