import { Alert, Snackbar } from "@mui/material";
import { AlertType } from "../types";

interface AlertBannerProps {
  alertDetails: AlertType;
  setAlertDetails: (alertDetails: AlertType) => void;
}

function AlertBanner({ alertDetails, setAlertDetails }: AlertBannerProps) {
  const handleClose = (): void => {
    setAlertDetails({ ...alertDetails, open: false });
  };

  return (
    <Snackbar
      onClose={handleClose}
      open={alertDetails.open}
      autoHideDuration={6000}
    >
      <Alert severity={alertDetails.alertType} sx={{ width: "100%" }}>
        {alertDetails.alertMessage}
      </Alert>
    </Snackbar>
  );
}

export default AlertBanner;
