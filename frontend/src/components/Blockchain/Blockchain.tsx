import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Container,
  Tooltip,
} from "@mui/material";
import { AlertType, BlockType } from "../../App";
import Block from "./Block";
import AssuredWorkloadIcon from "@mui/icons-material/AssuredWorkload";
import DangerousOutlinedIcon from "@mui/icons-material/DangerousOutlined";
import io from 'socket.io-client';
import { useEffect } from "react";

const headers = [
  " ",
  "Height",
  "Time",
  "Hash",
  "Prev Hash",
  "Transactions",
  "Difficulty",
  "Nonce",
  "Mining Time (min)",
  "Valid"
];

export function Blockchain({
  blockchain,
  isChainValid,
  setBlockchain,
  setAlertDetails
}: {
  blockchain: BlockType[];
  isChainValid: boolean;
  setBlockchain: (blockchain: BlockType[]) => void;
  setAlertDetails: (alertDetails: AlertType) => void;
}) {
  const { REACT_APP_WEBSOCKET_URL } = process.env;

  useEffect(() => {
    const socket = io(`${REACT_APP_WEBSOCKET_URL}`);
    
    socket.on('updateBlockchain', (blockchain) => {
      setBlockchain(blockchain.chain);
      setAlertDetails({
        open: true,
        alertMessage: `Blockchain updated with a longer chain of length ${blockchain.chain.length} found on the network!`,
        alertType: "info",
      })
    });

  }, [REACT_APP_WEBSOCKET_URL, setBlockchain, setAlertDetails]);


  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: "40px",
        minWidth: "85%",
      }}
    >
      <h1>Blockchain</h1>
      {isChainValid ? (
        <Tooltip title="Blockchain has been validated. Every block has valid proof of work and each block is validly connected to the previous block.">
          <AssuredWorkloadIcon sx={{ color: "success.main" }} />
        </Tooltip>
      ) : (
        <Tooltip title="Blockchain is invalid! One block does not have valid proof of work and/or two or more blocks are not validly connected.">
          <DangerousOutlinedIcon sx={{ color: "error.main" }} />
        </Tooltip>
      )}
      <TableContainer component={Paper}>
        <Table aria-label="blockchain table">
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  key={header}
                  sx={{ fontWeight: "bold", fontSize: 18 }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {blockchain.map((block) => (
              <Block block={block} key={block.hash} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
