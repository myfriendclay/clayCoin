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

export interface AlertType {
  open: boolean;
  alertMessage: string;
  alertType: 'success' | 'error' | 'warning' | 'info';
}

function App() {

  const [blockchain, setBlockchain] = useState<BlockType[]>([]);
  const [memPool, setmemPool] = useState<TransactionType[]>([]);
  const [alertDetails, setAlertDetails] = useState<AlertType>({open: false, alertMessage: '', alertType: 'info'});

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
        setAlertDetails={setAlertDetails}
      />
      <MemPool 
        memPool={memPool} 
        setmemPool={setmemPool}
        setBlockchain={setBlockchain}
        blockchain={blockchain} 
        setAlertDetails={setAlertDetails}
      />
      <Blockchain blockchain={blockchain}/>
      <AlertBanner alertDetails={alertDetails} setAlertDetails={setAlertDetails}/>
    </div>
  );
}

export default App;
