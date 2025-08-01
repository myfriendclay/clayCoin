import ConstructionIcon from '@mui/icons-material/Construction';
import { Container, TextField } from "@mui/material";
import { useState } from "react";
import { AlertType, BlockType, TransactionType } from '../../types';
import LoadingButton from '@mui/lab/LoadingButton';
interface FormData {
  miningAddress: string;
}

interface MineMemPoolProps {
  setBlockchain: (mempool: BlockType[]) => void;
  blockchain: BlockType[];
  setmempool: (mempool: TransactionType[]) => void;
  setAlertDetails: (alertDetails: AlertType) => void;
}

function MineMemPool({
  setBlockchain,
  blockchain,
  setmempool,
  setAlertDetails,
}: MineMemPoolProps) {
  const blankFormValues = {
    miningAddress: "",
  };

  const [formData, setFormData] = useState<FormData>(blankFormValues);
  const [mining, setMining] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    let { name, value, id } = event.target;
    setFormData({ ...formData, [id || name]: value });
  };

  const handleSubmit = async (event: React.FormEvent<EventTarget>): Promise<void> => {
    event.preventDefault();
    setMining(true);
    try {
      const response = await fetch('/api/blocks/mine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Mining failed');
      }

      const block = await response.json();
      setBlockchain([...blockchain, block]);
      setmempool([]);
      setAlertDetails({
        open: true,
        alertMessage: `You mined block #${block.height} in ${
          block.miningDurationMs / 1000
        } seconds! Difficulty was ${block.difficulty} and magical nonce was ${block.nonce}`,
        alertType: "success",
      });
    } catch (err) {
      console.error(err);
      setAlertDetails({
        open: true,
        alertMessage: err instanceof Error ? err.message : 'Mining failed',
        alertType: "error",
      });
    } finally {
      setFormData(blankFormValues);
      setMining(false);
    }
  };

  return (
    <Container
      sx={{
        margin: "0px auto 30px auto",
        display: "flex",
      }}
    >
      <TextField
        size="small"
        sx={{ minWidth: "80%" }}
        id="miningAddress"
        label="Mining address"
        type="text"
        value={formData.miningAddress}
        onChange={handleChange}
        margin="normal"
        disabled={mining}
      />
      
      <LoadingButton
        variant="contained"
        disabled={mining}
        loading={mining}
        sx={{
          margin: 1
        }}
        size="large"
        onClick={handleSubmit}
        endIcon={<ConstructionIcon />}
      >
        Mine Block #{blockchain.length}
      </LoadingButton>
    </Container>
  );
}

export default MineMemPool;
