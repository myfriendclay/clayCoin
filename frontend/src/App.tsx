import { useEffect, useState } from "react";
import axios from "axios";
import { Container } from "@mui/material";
import { BlockType, AlertType } from "./types";
import MemPool from "./components/MemPool/MemPool";
import Blockchain from "./components//Blockchain/Blockchain";
import AlertBanner from "./components/AlertBanner";
import Logo from "./components/Logo";

const App: React.FC = () => {
  const [blockchain, setBlockchain] = useState<BlockType[]>([]);
  const [alertDetails, setAlertDetails] = useState<AlertType>({
    open: false,
    alertMessage: "",
    alertType: "info",
  });
  const [isChainValid, setIsChainValid] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get(`/api/blockchain`)
      .then((response) => {
        const { chain } = response.data.blockchain;
        setBlockchain(chain);
        setIsChainValid(response.data.isChainValid);
      })
      .catch((err) => {
        console.error(err);
      });
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
}

export default App;
