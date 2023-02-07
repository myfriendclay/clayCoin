import Payments from "./Transactions";
import FilterPayments from './FilterTransactions'
import { useState } from "react";
import { Container } from "@mui/system";

//@ts-ignore
export default function MemPool(props) {
  const { memPool } = props
  const [query, setQuery] = useState('')
  
// @ts-ignore
  const queryMatches = transaction => {
    if (query === "") return true
    const { uuid, timestamp, fromAddress, toAddress, amount, memo } = transaction
    const superString = uuid + timestamp + fromAddress + toAddress + amount + memo
    return superString.toLowerCase().includes(query.toLowerCase())
  }

  return (
    <Container sx={{ display: 'flex', flexFlow: "column", alignItems: "center"}}>
      <h1>Mempool</h1>
      <FilterPayments query={query} setQuery={setQuery}/>
      <Payments query={query} memPool={memPool} queryMatches={queryMatches}/>
    </Container>
  )
}