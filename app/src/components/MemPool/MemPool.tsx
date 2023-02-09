import Transactions from "./Transactions";
import { Container } from "@mui/system";
import MineMemPool from "../MineMemPool";
import { TransactionType } from "../../App";

export default function MemPool({memPool} : {memPool: TransactionType[]}) {

  return (
    <Container sx={{ display: 'flex', flexFlow: "column", alignItems: "center"}}>
      <h1>Mempool</h1>
      {
        memPool.length ?
        <Transactions memPool={memPool}/> :
        "No transactions currently in memPool. Sad!"
      }
      <MineMemPool/>
    </Container>
  )
}