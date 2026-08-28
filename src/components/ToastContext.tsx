import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";
import { Toast, type ToastData } from "./Toast";

export interface ToastContextValue {
  showToast: (toast: Omit<ToastData, "id">) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  hideToast: () => {},
});

/**
 * Provides a single-toast management system across the application.
 *
 * - Automatically dismisses toasts after 2.8s.
 * - If a new toast is requested while one is visible, updates the existing toast without stacking.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((data: Omit<ToastData, "id">) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const newToast: ToastData = {
      ...data,
      id: String(Date.now()),
    };

    setToast(newToast);

    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast toast={toast} onDismiss={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
