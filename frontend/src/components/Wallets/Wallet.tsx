import { Container } from "@mui/material";
import { WalletBalanceChecker } from "./WalletBalanceChecker";
import WalletGenerator from "./WalletGenerator";

function Wallet() {
  return (
    <Container
      sx={{
        display: "flex",
        flexFlow: "column",
        padding: "10px",
        borderBottom: "1px black dotted",
      }}
    >
      <WalletGenerator />
      <WalletBalanceChecker />
    </Container>
  );
}

export default Wallet;
