import Transaction from "./Transaction";
import { TransactionType } from "../App";

function Mempool({memPool}: {memPool: TransactionType[]}) {

  return (
    <div>
    {memPool.map(transaction => <Transaction transaction={transaction}/>)}
    </div>
    );
}

export default Mempool;
