import { Card } from "@mui/material";
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import React from "react";
import { BlockType } from "../App";

function Block({block}: {block: BlockType}) {
  const {hash, timestamp, height, nonce, timeSpentMiningInMilliSecs, previousHash, transactions, difficulty} = block
  return (
    <div>
      <Card variant="outlined">
        <Box component="span"
        sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}>
        <CardContent>
          <Typography>
            Timestamp: {timestamp}
          </Typography>
          <Typography>
            Hash: {hash}
          </Typography>
          <Typography>
            Previous hash: {previousHash}
          </Typography>
          <Typography>
          height: {height}
          </Typography>
          <Typography>
          nonce: {nonce}
          </Typography>
          <Typography>
          timeSpentMiningInMilliSecs: {timeSpentMiningInMilliSecs}
          </Typography>
          <Typography>
          difficulty: {difficulty}
          </Typography>
          <Typography>
          Transactions: {transactions.length}
          </Typography>
        </CardContent>
        </Box>
      </Card>
    
    </div>
    );
}

export default Block;
