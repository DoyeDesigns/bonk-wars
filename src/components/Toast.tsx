import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  duration?: number; // Duration in milliseconds
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded shadow-lg">
      {message}
    </div>
  );
};

export default Toast;
