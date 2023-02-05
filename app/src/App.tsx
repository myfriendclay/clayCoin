import { useEffect, useState } from 'react';
import axios from 'axios'
import './App.css';
import Block from './components/Block';


export interface BlockType {
  timestamp: string;
  hash: string;
  // other properties
}

function App() {
  const [notifications, setNotifications] = useState<{id: string, message: string}[]>([]);

  const [blockchain, setBlockchain] = useState<BlockType[]>([]);

  useEffect(() => {
    axios.get(`http://localhost:3001/blockchain`)
      .then(response => {
        const { chain } = response.data.blockchain
        console.log(chain)
        setBlockchain(chain)
      })
      .catch(err => {
        console.error(err)
      })

  }, [notifications])

  return (
    <div>
      <h1>Blockchain</h1>
      {blockchain.map(block => <Block key={block.hash} block={block}/>)}
    </div>
  );
}

export default App;
