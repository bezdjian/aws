import React, { useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const baseStyles =
    "fixed top-4 right-4 p-4 rounded-lg shadow-lg animate-slide-down";
  const typeStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-primary-500 text-white",
    warning: "bg-yellow-500 text-white",
  };

  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    info: "fa-info-circle",
    warning: "fa-exclamation-triangle",
  };

  return (
    <div
      className={`${baseStyles} ${typeStyles[type]} flex items-center gap-2`}
    >
      <i className={`fa ${icons[type]}`} />
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-75 transition-opacity"
        aria-label="Close notification"
      >
        <i className="fa fa-times" />
      </button>
    </div>
  );
};

export default Toast;
