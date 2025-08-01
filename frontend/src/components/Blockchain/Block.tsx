import { useEffect, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { FormattedDate, FormattedTime } from "react-intl";

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
import { BlockType } from "../../types";
import getTruncatedString from "../../utils/getTruncatedString";
import Transactions from "../Transactions/Transactions";

interface BlockValidResponse {
  isValidBlock: boolean;
}

function Block({ block }: { block: BlockType }) {
  const [open, setOpen] = useState(false);
  const [isValidBlock, setIsValidBlock] = useState(false);

  const { hash, timestamp, height, nonce, miningDurationMs, previousHash, transactions, difficulty } = block;

  useEffect(() => {
    const validateBlock = async () => {
      try {
        const response = await fetch(`/api/blocks/${hash}/isBlockValid`);
        if (!response.ok) throw new Error('Failed to validate block');
        const data: BlockValidResponse = await response.json();
        setIsValidBlock(data.isValidBlock);
      } catch (err) {
        console.error('Failed to validate block:', err);
      }
    };

    validateBlock();
  }, [hash]);

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
          <FormattedDate
            value={timestamp}
            month="short"
            day="2-digit"
            year="numeric"
          />{" "}
          <FormattedTime
            value={timestamp}
            hour="numeric"
            minute="numeric"
            hour12={true}
          />
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
        <TableCell>{Math.ceil(miningDurationMs)}</TableCell>
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
