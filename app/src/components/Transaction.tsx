import { TransactionType } from "../App";

function Transaction({transaction}: {transaction: TransactionType}) {
  const {fromAddress, toAddress, amount, memo, fee} = transaction
  return (
    <div>
      <p>From: {fromAddress}</p>
      <p>To: {toAddress}</p>
      <p>Amount: {amount}</p>
      <p>Memo: {memo}</p>
      <p>Fee: {fee}</p>
    </div>
    );
}

export default Transaction;
