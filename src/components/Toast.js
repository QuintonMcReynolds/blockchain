import React, { useEffect } from 'react';
import classes from './Toast.module.css';

const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      className={`${classes.toast} ${classes[toast.type]}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
    >
      <span>{toast.message}</span>
      <button className={classes.close} onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
};

export default Toast;
