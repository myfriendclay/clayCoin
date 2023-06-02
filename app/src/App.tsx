import { useEffect, useState } from 'react';
import axios from 'axios'
import './App.css';
import MemPool from './components/MemPool/MemPool';
import CreatePayment from './components/createPayment/CreatePayment';
import { Blockchain } from './components/Blockchain';
import { Wallet } from './components/Wallet';


export interface BlockType {
  timestamp: number;
  hash: string | undefined;
  height: number;
  nonce: number;
  miningDurationMs: number | undefined;
  previousHash: string | null;
  transactions: TransactionType[];
  difficulty: number;
}

export interface TransactionType {
  fromAddress: string;
  toAddress: string;
  amount: number;
  memo: string;
  fee: number;
  uuid: string;
  timestamp: number;
}

function App() {

  const [blockchain, setBlockchain] = useState<BlockType[]>([]);
  const [memPool, setmemPool] = useState<TransactionType[]>([]);

  useEffect(() => {
    axios.get(`http://localhost:3001/blockchain`)
      .then(response => {
        const { chain } = response.data.blockchain
        const {pendingTransactions} = response.data.blockchain
        setBlockchain(chain)
        setmemPool(pendingTransactions)
      })
      .catch(err => {
        console.error(err)
      })

  }, [])

  return (
    <div>
      <Wallet/>
      <CreatePayment setmemPool={setmemPool} memPool={memPool}/>
      <MemPool memPool={memPool} setBlockchain={setBlockchain} blockchain={blockchain}/>
      <Blockchain blockchain={blockchain}/>
    </div>
  );
}

export default App;
