import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components";

// ---------------------------------------------------------------------------
// SVG Illustration — matches the Figma "order accepted" green checkmark
// with decorative confetti dots
// ---------------------------------------------------------------------------

function SuccessIllustration() {
  return (
    <div className="order-result-illustration" aria-hidden="true">
      {/* Confetti dots */}
      <svg
        className="order-confetti"
        viewBox="0 0 260 260"
        fill="none"
        width="260"
        height="260"
      >
        {/* Green dot top-left */}
        <circle cx="95" cy="30" r="8" fill="#53B175" />
        {/* Red dot top */}
        <circle cx="120" cy="25" r="4" fill="#F7A593" />
        {/* Yellow ring left */}
        <circle cx="40" cy="90" r="6" stroke="#F8C44C" strokeWidth="2" fill="none" />
        {/* Blue squiggle left */}
        <path d="M25 120 Q35 100 30 130 Q25 140 35 135" stroke="#5383EC" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Green ring bottom-left */}
        <circle cx="65" cy="195" r="5" stroke="#53B175" strokeWidth="1.5" fill="none" />
        {/* Purple ring right */}
        <circle cx="210" cy="95" r="5" stroke="#B589D6" strokeWidth="1.5" fill="none" />
        {/* Red curve top-right */}
        <path d="M200 50 Q215 40 220 60" stroke="#F0635A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Green dot bottom */}
        <circle cx="140" cy="215" r="3" fill="#53B175" />
        {/* Blue dot bottom */}
        <circle cx="160" cy="220" r="5" fill="#5383EC" />
        {/* Orange arc right */}
        <path d="M190 195 Q200 180 210 195" stroke="#F8C44C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>

      {/* Main checkmark circle */}
      <div className="order-check-circle">
        <div className="order-check-ring" />
        <svg
          className="order-checkmark"
          viewBox="0 0 24 24"
          fill="none"
          width="56"
          height="56"
          aria-hidden="true"
        >
          <polyline
            points="4 12 10 18 20 6"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface OrderSuccessState {
  orderId?: string;
  estimatedDelivery?: string;
  order?: unknown;
}

function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as OrderSuccessState | null) ?? {};

  return (
    <div className="order-result-page" role="status" aria-live="polite">
      <div className="order-result-card">
        <SuccessIllustration />

        <h1 className="order-result-heading">
          Your Order has been accepted
        </h1>

        <p className="order-result-message">
          Your items have been placed and are on their way to being processed
        </p>

        {state.orderId && (
          <p className="order-result-id" aria-label="Order ID">
            Order #{state.orderId}
          </p>
        )}

        <div className="order-result-actions">
          <Button
            onClick={() =>
              navigate("/order-tracking", {
                state: {
                  orderId: state.orderId,
                  order: state.order,
                  estimatedDelivery: state.estimatedDelivery,
                },
              })
            }
            className="order-result-primary-btn"
          >
            Track Order
          </Button>

          <button
            type="button"
            className="order-result-link"
            onClick={() => navigate("/")}
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
