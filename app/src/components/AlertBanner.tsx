import { useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { AlertType } from '../App';

interface AlertBannerProps {
  alertDetails: AlertType;
  setAlertDetails: (alertDetails: AlertType) => void;
}

function AlertBanner({alertDetails, setAlertDetails }: AlertBannerProps) {

  const handleClose = (): void => {
    setAlertDetails({ ...alertDetails, open: false })
  }

  return (
      <div>
        {
        <Snackbar onClose={handleClose} open={alertDetails.open} autoHideDuration={6000}>
          <Alert severity={alertDetails.alertType} sx={{ width: '100%' }}>
          {alertDetails.alertMessage}
          </Alert>
        </Snackbar>
        }
      </div>
  );
}

export default AlertBanner;
