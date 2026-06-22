import { useCallback, useRef, useState, type ReactNode } from "react";
import type { ToastType } from "../context/ToastContext";
import ToastContext from "../context/ToastContext";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}



const TOAST_CONFIG: Record<ToastType, { icon: string; accent: string; bg: string }> = {
    success: { icon: "✓", accent: "#2F9E44", bg: "#F1FBF4" },
    error: { icon: "✕", accent: "#C1121F", bg: "#FFF5F5" },
    info: { icon: "ℹ", accent: "#3B82F6", bg: "#F0F6FF" },
    warning: { icon: "!", accent: "#E8A93B", bg: "#FFFAF0" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = "info", duration = 3500) => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            setToasts((prev) => [...prev, { id, message, type }]);

            const timer = setTimeout(() => removeToast(id), duration);
            timers.current.set(id, timer);
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-5 right-5 z-[1000] flex flex-col gap-2.5 items-end pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const cfg = TOAST_CONFIG[toast.type];

    return (
        <div
            role="status"
            className="pointer-events-auto flex items-start gap-3 bg-white border border-[#EEECEA] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] px-4 py-3 min-w-[260px] max-w-[360px] animate-toast-in"
        >
            <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[0.75rem] font-bold flex-shrink-0 mt-0.5"
                style={{ backgroundColor: cfg.bg, color: cfg.accent }}
            >
                {cfg.icon}
            </div>
            <p className="flex-1 text-[0.85rem] text-[#1a1a1a] leading-snug pt-0.5">{toast.message}</p>
            <button
                onClick={onClose}
                aria-label="Dismiss"
                className="text-[#ccc] hover:text-[#888] text-sm leading-none mt-0.5 transition-colors"
            >
                ✕
            </button>
        </div>
    );
}