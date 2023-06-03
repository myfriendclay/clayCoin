import { useEffect, useState } from 'react';
import axios from 'axios'
import './App.css';
import MemPool from './components/MemPool/MemPool';
import CreatePayment from './components/createPayment/CreatePayment';
import { Blockchain } from './components/Blockchain';
import { Wallet } from './components/Wallet';
import AlertBanner from './components/AlertBanner';


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
  const [open, setOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

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
      <CreatePayment 
        setmemPool={setmemPool} 
        memPool={memPool} 
        setOpen={setOpen} 
        setAlertMessage={setAlertMessage} 
        setAlertType={setAlertType}
      />
      <MemPool 
        memPool={memPool} 
        setBlockchain={setBlockchain} 
        blockchain={blockchain} 
        setmemPool={setmemPool}
        setOpen={setOpen} 
        setAlertMessage={setAlertMessage} 
        setAlertType={setAlertType}
      />
      <Blockchain blockchain={blockchain}/>
      <AlertBanner open={open} alertMessage={alertMessage} alertType={alertType} setOpen={setOpen}/>
    </div>
  );
}

export default App;
