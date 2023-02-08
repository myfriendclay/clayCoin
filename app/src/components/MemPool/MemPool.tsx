import Transactions from "./Transactions";
import { useState } from "react";
import { Container } from "@mui/system";
import MineMemPool from "../MineMemPool";
import { TransactionType } from "../../App";

export default function MemPool({memPool} : {memPool: TransactionType[]}) {

  const [query, setQuery] = useState('')

  return (
    <Container sx={{ display: 'flex', flexFlow: "column", alignItems: "center"}}>
      <h1>Mempool</h1>
      {
        memPool.length ?
        <Transactions query={query} memPool={memPool}/> :
        "No transactions currently in memPool. Sad!"
      }
      <MineMemPool/>
    </Container>
  )
}