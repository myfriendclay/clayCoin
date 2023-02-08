import Transactions from "./Transactions";
import { useState } from "react";
import { Container } from "@mui/system";
import MineMemPool from "../MineMemPool";

//@ts-ignore
export default function MemPool(props) {
  const { memPool } = props
  const [query, setQuery] = useState('')

  return (
    <Container sx={{ display: 'flex', flexFlow: "column", alignItems: "center"}}>
      <h1>Mempool</h1>
      <MineMemPool/>
      <Transactions query={query} memPool={memPool}/>
    </Container>
  )
}