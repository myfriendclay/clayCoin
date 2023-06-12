import ConstructionIcon from '@mui/icons-material/Construction';
import { Container, TextField } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { AlertType, BlockType, TransactionType } from "../../App";
import LoadingButton from '@mui/lab/LoadingButton';

interface FormData {
  miningAddress: string;
}

interface MineMemPoolProps {
  setBlockchain: (mempool: BlockType[]) => void;
  blockchain: BlockType[];
  setmemPool: (mempool: TransactionType[]) => void;
  setAlertDetails: (alertDetails: AlertType) => void;
}

function MineMemPool({
  setBlockchain,
  blockchain,
  setmemPool,
  setAlertDetails,
}: MineMemPoolProps) {
  const blankFormValues = {
    miningAddress: "",
  };

  const { REACT_APP_API_URL } = process.env;
  const [formData, setFormData] = useState<FormData>(blankFormValues);
  const [mining, setMining] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    let { name, value, id } = event.target;
    setFormData({ ...formData, [id || name]: value });
  };

  const handleSubmit = (event: React.FormEvent<EventTarget>): void => {
    event.preventDefault();
    setFormData(blankFormValues);
    setMining(true);
    axios
      .post(`${REACT_APP_API_URL}/api/blocks/mine`, formData)
      .then((response) => {
        const block = response.data;
        setBlockchain([...blockchain, block]);
        setmemPool([]);
        setAlertDetails({
          open: true,
          alertMessage: `You mined block #${block.height} in ${
            block.miningDurationMs / 1000
          } seconds! Difficulty was ${block.difficulty} and magical nonce was ${block.nonce}`,
          alertType: "success",
        });
      })
      .catch((err) => {
        console.error(err);
        setAlertDetails({
          open: true,
          alertMessage: err.message,
          alertType: "error",
        });
      })
      .finally(() => {
        setMining(false);
      });
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
