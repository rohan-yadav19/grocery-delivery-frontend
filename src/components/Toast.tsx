import { Link } from "react-router-dom";
import { CheckIcon, ForwardIcon, InfoIcon } from "./icons";

export interface ToastData {
  id: string;
  productName?: string;
  message: string;
  type?: "success" | "warning" | "info";
  actionText?: string;
  actionTo?: string;
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

/**
 * Toast notification for add-to-cart and feedback actions.
 *
 * - Clean white card with subtle border & elevation shadow
 * - Displays above mobile BottomNav and bottom-right on desktop
 * - Accessible aria-live="polite" announcement
 * - Action button to navigate directly to /cart
 */
export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="toast-container"
      data-testid="cart-toast"
    >
      <div className="toast-content">
        <div
          className={`toast-icon-wrap ${toast.type === "warning" ? "toast-icon-wrap--warning" : ""}`}
          aria-hidden="true"
        >
          {toast.type === "warning" ? (
            <InfoIcon size={16} className="text-white" />
          ) : (
            <CheckIcon size={15} className="text-white" />
          )}
        </div>

        <div className="toast-text">
          {toast.productName ? (
            <span className="toast-message">
              <strong>{toast.productName}</strong> {toast.message}
            </span>
          ) : (
            <span className="toast-message">{toast.message}</span>
          )}
        </div>

        {toast.actionTo && (
          <Link
            to={toast.actionTo}
            onClick={onDismiss}
            className="toast-action"
            aria-label={toast.actionText ?? "View Cart"}
          >
            <span>{toast.actionText ?? "View Cart"}</span>
            <ForwardIcon size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
