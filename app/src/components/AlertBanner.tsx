import { useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

interface AlertBannerProps {
  open: boolean;
  alertMessage: string;
  alertType: 'success' | 'error' | 'warning' | 'info';
  setOpen: (open: boolean) => void;
}

function AlertBanner({open, alertMessage, alertType, setOpen}: AlertBannerProps) {

  const handleClose = (): void => {
    setOpen(false)
  }

  return (
      <div>
        {
        <Snackbar onClose={handleClose} open={open} autoHideDuration={6000}>
          <Alert severity={alertType} sx={{ width: '100%' }}>
          {alertMessage}
          </Alert>
        </Snackbar>
        }
      </div>
  );
}

export default AlertBanner;
