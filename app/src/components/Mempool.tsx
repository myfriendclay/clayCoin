import Transaction from "./Transaction";
import { TransactionType } from "../App";
import React from "react";

function Mempool({memPool}: {memPool: TransactionType[]}) {

  return (
    <div>
    {memPool.map(transaction => <Transaction key={transaction.uuid} transaction={transaction}/>)}
    </div>
    );
}

export default Mempool;
