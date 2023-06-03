import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Container } from "@mui/material";
import { BlockType } from "../App";
import Block from "./Block";

const headers = [" ", "Height", "Time", "Hash", "Prev Hash", "Transactions", "Difficulty", "Nonce", "Mining Time (min)"]

export function Blockchain({blockchain}: {blockchain: BlockType[]}) {
  return (
    <Container sx={{ 
      margin: "0px auto 30px auto",  
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: '40px',
      borderBottom: '1px grey dotted'
    }}>
    <h1>Blockchain</h1>
    <TableContainer component={Paper}>
      <Table aria-label="payments table">
        <TableHead>
          <TableRow>
            {headers.map(header => 
              <TableCell
                key={header}
                sx={{ fontWeight: 'bold', fontSize: 18 }}
                >
                  {header}
              </TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {
            blockchain.map(block => <Block block={block} key={block.hash}/>)
          }
        </TableBody>
      </Table>
    </TableContainer>
  </Container>
  )
} 

