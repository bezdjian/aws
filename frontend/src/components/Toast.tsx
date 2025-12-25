import React, { useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

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
  duration = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-emerald-500 text-white shadow-emerald-500/20",
    error: "bg-red-500 text-white shadow-red-500/20",
    info: "bg-brand-500 text-white shadow-brand-500/20",
    warning: "bg-amber-500 text-white shadow-amber-500/20",
  };

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }[type];

  return (
    <div
      className={`${typeStyles[type]} flex items-center gap-3 p-4 pr-12 rounded-2xl shadow-xl min-w-[320px] pointer-events-auto animate-in fade-in slide-in-from-right-10 duration-500`}
    >
      <div className="shrink-0">
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <p className="text-sm font-bold tracking-tight">{message}</p>
      <button
        onClick={onClose}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-lg transition-all"
        aria-label="Close notification"
      >
        <X size={16} strokeWidth={3} />
      </button>
    </div>
  );
};

export default Toast;
