import { useState } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { TransactionType, AlertType } from "../../App";
import { Wallet } from "../Wallets/Wallet";

interface FormData {
  fromAddress: string;
  toAddress: string;
  amount: number;
  memo: string;
  fee: number;
  secretKey: string;
}

interface MemPoolProps {
  setmemPool: (mempool: TransactionType[]) => void;
  setAlertDetails: (alertDetails: AlertType) => void;
}

export default function AddTransaction({
  setmemPool,
  setAlertDetails,
}: MemPoolProps) {
  const blankFormValues = {
    fromAddress: "",
    toAddress: "",
    amount: 0,
    memo: "",
    fee: 0,
    secretKey: "",
  };

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(blankFormValues);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, id } = event.target;
    let numValue;
    if (!isNaN(Number(value))) {
      numValue = Number(value);
    }
    setFormData({ ...formData, [id || name]: numValue || value });
  };

  const handleSubmit = (event: React.FormEvent<EventTarget>): void => {
    event.preventDefault();
    console.log(formData);
    axios
      .post("http://localhost:3001/api/transactions", formData)
      .then((response) => {
        const pendingTransactions = response.data;
        setmemPool(pendingTransactions);
        setAlertDetails({
          open: true,
          alertMessage: "You added a transaction to the mempool!",
          alertType: "success",
        });
        setFormData(blankFormValues);
        handleClose();
      })
      .catch((err) => {
        const errorMessage = err.response.data.error;
        console.error(errorMessage);
        setAlertDetails({
          open: true,
          alertMessage: errorMessage,
          alertType: "error",
        });
      });
  };

  const formFields = [
    {
      id: "fromAddress",
      label: "From address",
      type: "text",
      value: formData.fromAddress,
    },
    {
      id: "toAddress",
      label: "Recipient address",
      type: "text",
      value: formData.toAddress,
    },
    {
      id: "secretKey",
      label: "Private key",
      type: "password",
      value: formData.secretKey,
    },
    {
      id: "amount",
      label: "Amount",
      type: "number",
      value: formData.amount,
    },
    {
      id: "fee",
      label: "Fee",
      type: "number",
      value: formData.fee,
    },
    {
      id: "memo",
      label: "Memo (optional)",
      type: "text",
      helperText: 'Purpose of payment (e.g. "Pizza + beer")',
      value: formData.memo,
    },
  ];

  return (
    <div>
      <Button
        variant="contained"
        size="large"
        sx={{
          backgroundColor: "#8656ef",
          "&:hover": {
            backgroundColor: "#8656ef",
          },
        }}
        onClick={handleClickOpen}
      >
        Add Transaction
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <Wallet />
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will add the transaction to the mempool.
          </DialogContentText>

          {formFields.map((field) => (
            <TextField
              key={field.id}
              size="small"
              margin="dense"
              sx={{ minWidth: "100%" }}
              id={field.id}
              label={field.label}
              type={field.type}
              value={field.value}
              onChange={handleChange}
              helperText={field.helperText}
              required={field.id === "amount" || field.id === "fee"}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Send Payment</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
