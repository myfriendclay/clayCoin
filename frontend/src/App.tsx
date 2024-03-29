import { useEffect, useState } from "react";
import axios from "axios";
import { Container } from "@mui/material";
import { BlockType, AlertType } from "./types";
import MemPool from "./components/MemPool/MemPool";
import Blockchain from "./components//Blockchain/Blockchain";
import AlertBanner from "./components/AlertBanner";
import Logo from "./components/Logo";

function App() {
  const { REACT_APP_API_URL } = process.env;
  const [blockchain, setBlockchain] = useState<BlockType[]>([]);
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
        const { chain } = response.data.blockchain;
        setBlockchain(chain);
        setIsChainValid(response.data.isChainValid);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [REACT_APP_API_URL]);

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
