import io from 'socket.io-client';
import { Container } from "@mui/material";
import { AlertType, BlockType, TransactionType } from "../../types";
import { useEffect } from "react";
import Transactions from "../Transactions/Transactions";
import MineMemPool from "./MineMemPool";
import AddTransaction from "../Transactions/AddTransaction";

interface MemPoolProps {
  memPool: TransactionType[];
  setBlockchain: (mempool: BlockType[]) => void;
  blockchain: BlockType[];
  setmemPool: (mempool: TransactionType[]) => void;
  setAlertDetails: (alertDetails: AlertType) => void;
}

function MemPool({memPool, setBlockchain, blockchain, setmemPool, setAlertDetails} : 
  MemPoolProps) {

    const { REACT_APP_API_URL } = process.env;

    useEffect(() => {
      const socket = io(`${REACT_APP_API_URL}`);
      
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
      });
  
    }, [REACT_APP_API_URL, memPool, setAlertDetails, setmemPool]);

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

export default MemPool;