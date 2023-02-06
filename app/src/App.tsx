import { useEffect, useState } from 'react';
import axios from 'axios'
import './App.css';
import Block from './components/Block';
import Mempool from './components/Mempool';
import AddTransactionForm from './components/AddTransactionForm';
import MineMemPool from './components/MineMemPool';
import React from 'react';
 
export interface BlockType {
  timestamp: string;
  hash: string;
  height: number;
  nonce: number;
  timeSpentMiningInMilliSecs: number;
  previousHash: string;
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
  const [notifications, setNotifications] = useState<{id: string, message: string}[]>([]);

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

  }, [notifications])

  return (
    <div>
      <AddTransactionForm/>
      <h1>Mempool</h1>
      <MineMemPool/>
      <Mempool memPool={memPool}/>
      <h1>Blockchain</h1>
      {blockchain.map(block => <Block key={block.hash} block={block}/>)}
    </div>
  );
}

export default App;
