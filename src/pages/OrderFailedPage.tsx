import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components";

// ---------------------------------------------------------------------------
// SVG Illustration — matches Figma "error" grocery bag illustration style
// ---------------------------------------------------------------------------

function FailureIllustration() {
  return (
    <div className="order-result-illustration" aria-hidden="true">
      {/* Grocery bag SVG */}
      <div className="order-fail-circle">
        <svg
          className="order-fail-icon"
          viewBox="0 0 64 64"
          fill="none"
          width="80"
          height="80"
          aria-hidden="true"
        >
          {/* Bag body */}
          <rect x="12" y="24" width="40" height="32" rx="4" fill="#D4A574" />
          {/* Bag top fold */}
          <rect x="10" y="20" width="44" height="8" rx="2" fill="#C49A6C" />
          {/* Bag handle */}
          <path d="M24 20 V14 Q24 8 32 8 Q40 8 40 14 V20" stroke="#B08B5B" strokeWidth="2.5" fill="none" />
          {/* Tomato */}
          <circle cx="22" cy="30" r="5" fill="#E74C3C" />
          <path d="M20 26 Q22 24 24 26" stroke="#27AE60" strokeWidth="1" fill="none" />
          {/* Leaf/carrot top */}
          <rect x="30" y="18" width="2" height="8" rx="1" fill="#27AE60" />
          <rect x="34" y="16" width="2" height="10" rx="1" fill="#2ECC71" />
          {/* Bread */}
          <ellipse cx="42" cy="26" rx="6" ry="8" fill="#F5D6A0" />
          {/* X mark overlay */}
          <circle cx="32" cy="40" r="10" fill="rgba(231, 76, 60, 0.9)" />
          <path d="M27 35 L37 45 M37 35 L27 45" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface OrderFailedState {
  errorMessage?: string;
}

function OrderFailedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as OrderFailedState | null) ?? {};

  const errorMessage =
    state.errorMessage || "Something went terribly wrong.";

  return (
    <div className="order-result-page order-result-failed" role="alert" aria-live="assertive">
      <div className="order-result-card">
        <FailureIllustration />

        <h1 className="order-result-heading">
          Oops! Order Failed
        </h1>

        <p className="order-result-message">{errorMessage}</p>

        <div className="order-result-actions">
          <Button
            onClick={() => navigate("/checkout")}
            className="order-result-primary-btn"
          >
            Please Try Again
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

export default OrderFailedPage;
