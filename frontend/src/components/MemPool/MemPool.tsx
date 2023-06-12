import Transactions from "../Transactions/Transactions";
import { Container } from "@mui/system";
import MineMemPool from "./MineMemPool";
import { AlertType, BlockType, TransactionType } from "../../App";
import AddTransaction from "../Transactions/AddTransaction";

interface MemPoolProps {
  memPool: TransactionType[];
  setBlockchain: (mempool: BlockType[]) => void;
  blockchain: BlockType[];
  setmemPool: (mempool: TransactionType[]) => void;
  setAlertDetails: (alertDetails: AlertType) => void;
}

export default function MemPool({memPool, setBlockchain, blockchain, setmemPool, setAlertDetails} : 
  MemPoolProps) {

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