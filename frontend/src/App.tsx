import { useEffect, useState } from "react";
import axios from "axios";
import MemPool from "./components/MemPool/MemPool";
import { Blockchain } from "./components//Blockchain/Blockchain";
import AlertBanner from "./components/AlertBanner";
import { Container } from "@mui/material";
import CircleLogo from "./components/Logo";

export interface BlockType {
  timestamp: number;
  hash: string | undefined;
  height: number;
  nonce: number;
  miningDurationMs: number | undefined;
  previousHash: string | null;
  transactions: TransactionType[];
  difficulty: number;
}

export interface TransactionType {
  fromAddress: string;
  toAddress: string;
  amount: number;
  memo: string;
  fee: number;
  uuid: string;
  timestamp: number;
}

export interface AlertType {
  open: boolean;
  alertMessage: string;
  alertType: "success" | "error" | "warning" | "info";
}

function App() {
  const { REACT_APP_API_URL } = process.env;
  const [blockchain, setBlockchain] = useState<BlockType[]>([]);
  const [memPool, setmemPool] = useState<TransactionType[]>([]);
  const [alertDetails, setAlertDetails] = useState<AlertType>({
    open: false,
    alertMessage: "",
    alertType: "info",
  });
  const [isChainValid, setIsChainValid] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get(`${REACT_APP_API_URL}/api/blockchain`)
      .then((response) => {
        const { chain, pendingTransactions } = response.data.blockchain;
        setBlockchain(chain);
        setmemPool(pendingTransactions);
        setIsChainValid(response.data.isChainValid);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [REACT_APP_API_URL]);

  return (
    <Container maxWidth="xl">
      <CircleLogo />
      <MemPool
        memPool={memPool}
        setmemPool={setmemPool}
        setBlockchain={setBlockchain}
        blockchain={blockchain}
        setAlertDetails={setAlertDetails}
      />
      <Blockchain blockchain={blockchain} isChainValid={isChainValid} setBlockchain={setBlockchain} setAlertDetails={setAlertDetails} />
      <AlertBanner
        alertDetails={alertDetails}
        setAlertDetails={setAlertDetails}
      />
  </Container>
  );
}

export default App;
