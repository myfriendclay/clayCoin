import Transactions from "../Transactions/Transactions";
import { Container } from "@mui/material";
import MineMemPool from "./MineMemPool";
import { AlertType, BlockType, TransactionType } from "../../App";
import AddTransaction from "../Transactions/AddTransaction";
import { useEffect } from "react";
import io from 'socket.io-client';

interface MemPoolProps {
  memPool: TransactionType[];
  setBlockchain: (mempool: BlockType[]) => void;
  blockchain: BlockType[];
  setmemPool: (mempool: TransactionType[]) => void;
  setAlertDetails: (alertDetails: AlertType) => void;
}

export default function MemPool({memPool, setBlockchain, blockchain, setmemPool, setAlertDetails} : 
  MemPoolProps) {

    const { REACT_APP_WEBSOCKET_URL } = process.env;

    const socket = io(`${REACT_APP_WEBSOCKET_URL}`);
      
    socket.on('updateMempool', (transaction) => {
      setmemPool([...memPool, transaction]);
      setAlertDetails({
        open: true,
        alertMessage: `Mempool updated with more transactions found on network!`,
        alertType: "info",
      })
    });

    socket.on('clearMempool', () => {
      setmemPool([]);
      setAlertDetails({
        open: true,
        alertMessage: `Mempool cleared because block was mined!`,
        alertType: "info",
      })
    });

    useEffect(() => {

  
    }, [REACT_APP_WEBSOCKET_URL, memPool]);

  return (
    <Container sx={{ display: 'flex', flexFlow: "column", alignItems: "center", borderBottom: '1px grey dotted', borderTop: '1px grey dotted'}} >
      <h1>Mempool</h1>
      <AddTransaction 
        setmemPool={setmemPool}
        setAlertDetails={setAlertDetails}
      />
      <Transactions transactions={memPool}/>
      <MineMemPool 
        setBlockchain={setBlockchain}
        blockchain={blockchain}
        setmemPool={setmemPool}
        setAlertDetails={setAlertDetails}
      />
    </Container>
  )
}