import { useEffect, useState } from "react";
import { Container } from "@mui/material";
import { BlockType, AlertType } from "./types";
import MemPool from "./components/MemPool/MemPool";
import Blockchain from "./components//Blockchain/Blockchain";
import AlertBanner from "./components/AlertBanner";
import Logo from "./components/Logo";

interface BlockchainResponse {
  blockchain: {
    chain: BlockType[];
  };
  isChainValid: boolean;
}

const App: React.FC = () => {
  const [blockchain, setBlockchain] = useState<BlockType[]>([]);
  const [alertDetails, setAlertDetails] = useState<AlertType>({
    open: false,
    alertMessage: "",
    alertType: "info",
  });
  const [isChainValid, setIsChainValid] = useState<boolean>(false);

  useEffect(() => {
    const fetchBlockchain = async () => {
      try {
        const response = await fetch('/api/blockchain');
        if (!response.ok) throw new Error('Failed to fetch blockchain');
        const data: BlockchainResponse = await response.json();
        setBlockchain(data.blockchain.chain);
        setIsChainValid(data.isChainValid);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBlockchain();
  }, []);

  return (
    <Container maxWidth="xl">
      <Logo />
      <MemPool
        setBlockchain={setBlockchain}
        blockchain={blockchain}
        setAlertDetails={setAlertDetails}
      />
      <Blockchain
        blockchain={blockchain}
        isChainValid={isChainValid}
        setBlockchain={setBlockchain}
        setAlertDetails={setAlertDetails}
      />
      <AlertBanner
        alertDetails={alertDetails}
        setAlertDetails={setAlertDetails}
      />
    </Container>
  );
};

export default App;
