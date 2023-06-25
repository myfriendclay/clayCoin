import io from 'socket.io-client';
import { Container } from "@mui/material";
import { AlertType, BlockType, TransactionType } from "../../types";
import { useEffect } from "react";
import Transactions from "../Transactions/Transactions";
import MineMemPool from "./MineMemPool";
import AddTransaction from "../Transactions/AddTransaction";

interface MemPoolProps {
  mempool: TransactionType[];
  setBlockchain: (mempool: BlockType[]) => void;
  blockchain: BlockType[];
  setmempool: (mempool: TransactionType[]) => void;
  setAlertDetails: (alertDetails: AlertType) => void;
}

function MemPool({mempool, setBlockchain, blockchain, setmempool, setAlertDetails} : 
  MemPoolProps) {

    const { REACT_APP_API_URL } = process.env;

    useEffect(() => {
      const socket = io(`${REACT_APP_API_URL}`);
      
      socket.on('updateMempool', (transaction) => {
        setmempool([...mempool, transaction]);
        setAlertDetails({
          open: true,
          alertMessage: `Mempool updated with more transactions found on network!`,
          alertType: "info",
        })
      });
  
      socket.on('clearMempool', () => {
        setmempool([]);
      });
  
    }, [REACT_APP_API_URL, mempool, setAlertDetails, setmempool]);


  return (
    <Container sx={{ display: 'flex', flexFlow: "column", alignItems: "center", borderBottom: '1px grey dotted', borderTop: '1px grey dotted'}} >
      <h1>Mempool</h1>
      <AddTransaction 
        setmempool={setmempool}
        setAlertDetails={setAlertDetails}
      />
      <Transactions transactions={mempool}/>
      <MineMemPool 
        setBlockchain={setBlockchain}
        blockchain={blockchain}
        setmempool={setmempool}
        setAlertDetails={setAlertDetails}
      />
    </Container>
  )
}

export default MemPool;