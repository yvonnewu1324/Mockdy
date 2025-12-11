import React from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  open: boolean;
  onClose: () => void;
  message: string;
  type?: NotificationType;
  title?: string;
  autoHideDuration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  open,
  onClose,
  message,
  type = 'info',
  title,
  autoHideDuration = 6000, // 6 seconds default
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={type}
        variant="filled"
        sx={{ width: '100%', minWidth: '300px' }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;

