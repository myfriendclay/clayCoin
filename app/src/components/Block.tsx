import { Card } from "@mui/material";
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

// @ts-ignore
function Block({block}) {
  const {hash, timestamp, height, nonce, timeSpentMiningInMilliSecs, previousHash, transactions, difficulty} = block

  const card = (
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
      </CardContent>
      </Box>
  );

  

  return (
    <div>
      <Card variant="outlined">{card}</Card>
    
    </div>
    );
}

export default Block;
