import Transactions from "./Transactions";
import { Container } from "@mui/system";
import MineMemPool from "../MineMemPool";
import { BlockType, TransactionType } from "../../App";

interface MemPoolProps {
  memPool: TransactionType[];
  setBlockchain: (mempool: BlockType[]) => void;
  blockchain: BlockType[];
  setmemPool: (mempool: TransactionType[]) => void;
}

export default function MemPool({memPool, setBlockchain, blockchain, setmemPool} : 
  MemPoolProps) {

  return (
    <Container sx={{ display: 'flex', flexFlow: "column", alignItems: "center"}}>
      <h1>Mempool</h1>
      {
        memPool.length ?
        <Transactions transactions={memPool}/> :
        "No transactions currently in memPool. Sad!"
      }
      <MineMemPool setBlockchain={setBlockchain} blockchain={blockchain} setmemPool={setmemPool}/>
    </Container>
  )
}