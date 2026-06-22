import { createContext } from "react";

export type ToastType = "success" | "error" | "info" | "warning";



interface ToastContextValue {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export default ToastContext;