import io from 'socket.io-client';
import { Container } from "@mui/material";
import { AlertType, BlockType, TransactionType } from "../../types";
import { useEffect, useState } from "react";
import Transactions from "../Transactions/Transactions";
import MineMemPool from "./MineMemPool";
import AddTransaction from "../Transactions/AddTransaction";
import { API_URL } from "../../config/env";

interface MemPoolProps {
  setBlockchain: (mempool: BlockType[]) => void;
  blockchain: BlockType[];
  setAlertDetails: (alertDetails: AlertType) => void;
}

interface MempoolResponse {
  mempool: TransactionType[];
}

function MemPool({setBlockchain, blockchain, setAlertDetails} : MemPoolProps) {
  const [mempool, setmempool] = useState<TransactionType[]>([]);

  useEffect(() => {
    const fetchMempool = async () => {
      try {
        const response = await fetch('/api/mempool');
        if (!response.ok) throw new Error('Failed to fetch mempool');
        const data: MempoolResponse = await response.json();
        setmempool(data.mempool);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMempool();
  }, []);

  useEffect(() => {
    const socket = io(`${API_URL}`);
    
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

    // Clean up socket connection on unmount
    return () => {
      socket.disconnect();
    };
  }, [mempool, setAlertDetails, setmempool]);

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