import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "../components";
import {
  UserIcon,
  BagIcon,
  LocationIcon,
  CreditCardIcon,
  TagIcon,
  BellIcon,
  HelpIcon,
  InfoIcon,
  LogoutIcon,
  ForwardIcon,
  EditIcon,
  CheckIcon,
} from "../components/icons";
import { useSessionStore } from "../stores/sessionStore";

type ModalType =
  | "editProfile"
  | "orders"
  | "details"
  | "address"
  | "payment"
  | "promo"
  | "notifications"
  | "help"
  | "about"
  | "logoutConfirm"
  | null;

/**
 * Account / Profile screen matching the Figma reference design.
 *
 * - Profile header with avatar, user name, email, and quick edit control.
 * - Structured menu list with standard account actions:
 *   Orders, My Details, Delivery Address, Payment Methods, Promo Card,
 *   Notifications, Help, and About.
 * - Reusable modals for interactive previews without complex backend auth.
 * - Log Out action with confirmation dialog.
 */
function AccountPage() {
  const navigate = useNavigate();

  // ── Session & Profile state ───────────────────────────────────────────────
  const user = useSessionStore((s) => s.user);
  const deliveryAddress = useSessionStore((s) => s.deliveryAddress);
  const setDeliveryAddress = useSessionStore((s) => s.setDeliveryAddress);
  const logout = useSessionStore((s) => s.logout);
  const setUser = useSessionStore((s) => s.setUser);

  const [userName, setUserName] = useState(user?.name || "Afsar Hossen");
  const [userEmail, setUserEmail] = useState(user?.email || "imranhossen@gmail.com");
  const [tempName, setTempName] = useState(userName);
  const [tempEmail, setTempEmail] = useState(userEmail);
  const [tempAddress, setTempAddress] = useState(
    deliveryAddress || "7/A, Green Road, Dhanmondi, Dhaka",
  );

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [copiedPromo, setCopiedPromo] = useState<string | null>(null);

  // Notification toggles
  const [notifOrder, setNotifOrder] = useState(true);
  const [notifPromo, setNotifPromo] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  // ── Profile save handler ──────────────────────────────────────────────────
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = tempName.trim() || userName;
    const finalEmail = tempEmail.trim() || userEmail;
    setUserName(finalName);
    setUserEmail(finalEmail);
    setUser({ name: finalName, email: finalEmail });
    setActiveModal(null);
  };

  // ── Address save handler ──────────────────────────────────────────────────
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempAddress.trim()) {
      setDeliveryAddress(tempAddress.trim());
    }
    setActiveModal(null);
  };

  const handleCopyPromo = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedPromo(code);
    setTimeout(() => setCopiedPromo(null), 2000);
  };

  const handleLogout = () => {
    setActiveModal(null);
    logout();
    navigate("/sign-in", { replace: true });
  };

  // ── Menu configuration ────────────────────────────────────────────────────
  const menuItems = [
    {
      id: "orders",
      label: "Orders",
      subtext: "Recent deliveries & status",
      icon: BagIcon,
      action: () => setActiveModal("orders"),
    },
    {
      id: "details",
      label: "My Details",
      subtext: "Personal information",
      icon: UserIcon,
      action: () => {
        setTempName(userName);
        setTempEmail(userEmail);
        setActiveModal("details");
      },
    },
    {
      id: "address",
      label: "Delivery Address",
      subtext: deliveryAddress || "7/A, Green Road, Dhanmondi, Dhaka",
      icon: LocationIcon,
      action: () => {
        setTempAddress(deliveryAddress || "7/A, Green Road, Dhanmondi, Dhaka");
        setActiveModal("address");
      },
    },
    {
      id: "payment",
      label: "Payment Methods",
      subtext: "Mastercard •••• 4242",
      icon: CreditCardIcon,
      action: () => setActiveModal("payment"),
    },
    {
      id: "promo",
      label: "Promo Card",
      subtext: "2 active discount vouchers",
      icon: TagIcon,
      action: () => setActiveModal("promo"),
    },
    {
      id: "notifications",
      label: "Notifications",
      subtext: "Orders & promotional alerts",
      icon: BellIcon,
      action: () => setActiveModal("notifications"),
    },
    {
      id: "help",
      label: "Help",
      subtext: "FAQs & customer support",
      icon: HelpIcon,
      action: () => setActiveModal("help"),
    },
    {
      id: "about",
      label: "About",
      subtext: "FreshCart v1.0.0",
      icon: InfoIcon,
      action: () => setActiveModal("about"),
    },
  ];

  return (
    <div className="account-page">
      {/* ── User Profile Header Card ─────────────────────────────────────── */}
      <div className="account-hero-card">
        <div className="account-header">
          <div className="account-avatar-wrapper">
            <div className="account-avatar" aria-hidden="true">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span className="account-verified-badge" title="Verified Member">✓</span>
          </div>

          <div className="account-profile-info">
            <div className="account-name-row">
              <h1 className="account-user-name">{userName}</h1>
              <span className="account-tier-badge">Fresh Member</span>
              <button
                type="button"
                className="account-edit-btn"
                onClick={() => {
                  setTempName(userName);
                  setTempEmail(userEmail);
                  setActiveModal("editProfile");
                }}
                aria-label="Edit user profile"
                title="Edit Profile"
              >
                <EditIcon size={16} />
              </button>
            </div>
            <p className="account-user-email">{userEmail}</p>
          </div>
        </div>

        {/* Quick Stat Highlights */}
        <div className="account-quick-stats">
          <div className="account-stat-chip" onClick={() => setActiveModal("orders")} role="button" tabIndex={0}>
            <span className="account-stat-val">2</span>
            <span className="account-stat-lbl">Orders</span>
          </div>
          <div className="account-stat-divider" />
          <div className="account-stat-chip" onClick={() => setActiveModal("promo")} role="button" tabIndex={0}>
            <span className="account-stat-val">2</span>
            <span className="account-stat-lbl">Vouchers</span>
          </div>
          <div className="account-stat-divider" />
          <div className="account-stat-chip" onClick={() => setActiveModal("address")} role="button" tabIndex={0}>
            <span className="account-stat-val">1</span>
            <span className="account-stat-lbl">Address</span>
          </div>
        </div>
      </div>

      {/* ── Menu List ──────────────────────────────────────────────────────── */}
      <div className="account-menu-container">
        <ul className="account-menu" role="list" aria-label="Account options">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="account-menu-item" role="listitem">
                <button
                  type="button"
                  className="account-menu-btn"
                  onClick={item.action}
                  aria-label={item.label}
                >
                  <div className="account-menu-left">
                    <span className={`account-menu-icon account-menu-icon--${item.id}`} aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    <div className="account-menu-text">
                      <span className="account-menu-label">{item.label}</span>
                      <span className="account-menu-sub">{item.subtext}</span>
                    </div>
                  </div>
                  <span className="account-menu-right" aria-hidden="true">
                    <ForwardIcon size={16} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Log Out CTA ────────────────────────────────────────────────────── */}
      <div className="account-logout-container">
        <button
          type="button"
          className="account-logout-btn"
          onClick={() => setActiveModal("logoutConfirm")}
          aria-label="Log Out"
        >
          <LogoutIcon size={18} />
          <span>Log Out</span>
        </button>
      </div>

      {/* ── Modals / Dialogs ───────────────────────────────────────────────── */}

      {/* Edit Profile Modal */}
      <Modal
        open={activeModal === "editProfile" || activeModal === "details"}
        onClose={() => setActiveModal(null)}
        title="Edit Profile"
      >
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="edit-name"
              className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1"
            >
              Full Name
            </label>
            <input
              id="edit-name"
              type="text"
              className="w-full px-3 py-2.5 rounded-[var(--radius-action)] border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-brand)]"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-email"
              className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1"
            >
              Email Address
            </label>
            <input
              id="edit-email"
              type="email"
              className="w-full px-3 py-2.5 rounded-[var(--radius-action)] border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-brand)]"
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 mt-4">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Orders Modal */}
      <Modal
        open={activeModal === "orders"}
        onClose={() => setActiveModal(null)}
        title="Order History"
      >
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-[var(--radius-card)] bg-[var(--color-surface-alt)] border border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-[var(--color-text-primary)]">
                Order #FC-8921
              </span>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-[#e8f5e9] text-[var(--color-brand)]">
                Delivered
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] m-0">
              Bananas, Bell Peppers, Ginger • $14.49
            </p>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
              Delivered to Dhaka, Banasree
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-card)] bg-[var(--color-surface-alt)] border border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-[var(--color-text-primary)]">
                Order #FC-8740
              </span>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-[#e8f5e9] text-[var(--color-brand)]">
                Delivered
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] m-0">
              Diet Coke, Sprite Can • $4.50
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => {
              setActiveModal(null);
              navigate("/cart");
            }}
          >
            Go to Cart
          </Button>
        </div>
      </Modal>

      {/* Delivery Address Modal */}
      <Modal
        open={activeModal === "address"}
        onClose={() => setActiveModal(null)}
        title="Delivery Address"
      >
        <form onSubmit={handleSaveAddress} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="edit-address"
              className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1"
            >
              Current Address
            </label>
            <textarea
              id="edit-address"
              rows={3}
              className="w-full px-3 py-2.5 rounded-[var(--radius-action)] border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-brand)]"
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <Button type="submit">Update Address</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setActiveModal(null);
                navigate("/select-location");
              }}
            >
              Select Zone / Area
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payment Methods Modal */}
      <Modal
        open={activeModal === "payment"}
        onClose={() => setActiveModal(null)}
        title="Payment Methods"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3.5 rounded-[var(--radius-card)] border border-[var(--color-brand)] bg-[#e8f5e9]/30">
            <div className="flex items-center gap-3">
              <CreditCardIcon size={24} className="text-[var(--color-brand)]" />
              <div>
                <p className="text-sm font-bold m-0 text-[var(--color-text-primary)]">
                  Mastercard
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] m-0">
                  •••• •••• •••• 4242 (Default)
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[var(--color-brand)]">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-[var(--radius-card)] border border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <CreditCardIcon size={24} className="text-[var(--color-text-secondary)]" />
              <div>
                <p className="text-sm font-bold m-0 text-[var(--color-text-primary)]">
                  Cash on Delivery
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] m-0">
                  Pay with cash upon arrival
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Promo Card Modal */}
      <Modal
        open={activeModal === "promo"}
        onClose={() => setActiveModal(null)}
        title="Promo Codes"
      >
        <div className="flex flex-col gap-3">
          <div className="p-3.5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm text-[var(--color-brand)]">
                FRESH10
              </span>
              <button
                type="button"
                className="text-xs font-semibold text-[var(--color-brand)] hover:underline"
                onClick={() => handleCopyPromo("FRESH10")}
              >
                {copiedPromo === "FRESH10" ? "Copied!" : "Copy Code"}
              </button>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] m-0">
              Get $10 off your entire order with no minimum spend.
            </p>
          </div>

          <div className="p-3.5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm text-[var(--color-brand)]">
                SAVE20
              </span>
              <button
                type="button"
                className="text-xs font-semibold text-[var(--color-brand)] hover:underline"
                onClick={() => handleCopyPromo("SAVE20")}
              >
                {copiedPromo === "SAVE20" ? "Copied!" : "Copy Code"}
              </button>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] m-0">
              Get $20 off on grocery orders above $40.
            </p>
          </div>
        </div>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        open={activeModal === "notifications"}
        onClose={() => setActiveModal(null)}
        title="Notifications"
      >
        <div className="flex flex-col gap-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)] m-0">
                Order Updates
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] m-0">
                Real-time delivery notifications
              </p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-[var(--color-brand)]"
              checked={notifOrder}
              onChange={(e) => setNotifOrder(e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)] m-0">
                Promotions & Discounts
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] m-0">
                Special offers and coupon vouchers
              </p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-[var(--color-brand)]"
              checked={notifPromo}
              onChange={(e) => setNotifPromo(e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)] m-0">
                Email Newsletter
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] m-0">
                Weekly recipes and grocery deals
              </p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-[var(--color-brand)]"
              checked={notifEmail}
              onChange={(e) => setNotifEmail(e.target.checked)}
            />
          </label>
        </div>
      </Modal>

      {/* Help Modal */}
      <Modal
        open={activeModal === "help"}
        onClose={() => setActiveModal(null)}
        title="Help & Support"
      >
        <div className="flex flex-col gap-3 text-sm text-[var(--color-text-secondary)]">
          <div className="p-3 bg-[var(--color-input-bg)] rounded-[var(--radius-card)]">
            <p className="font-semibold text-[var(--color-text-primary)] m-0 mb-1">
              How do I track my delivery?
            </p>
            <p className="text-xs m-0">
              You can check real-time order status via the Orders tab or upon checkout confirmation.
            </p>
          </div>
          <div className="p-3 bg-[var(--color-input-bg)] rounded-[var(--radius-card)]">
            <p className="font-semibold text-[var(--color-text-primary)] m-0 mb-1">
              Customer Support
            </p>
            <p className="text-xs m-0">
              Email us at support@freshcart.example or call toll-free +1 (800) 555-CART.
            </p>
          </div>
        </div>
      </Modal>

      {/* About Modal */}
      <Modal
        open={activeModal === "about"}
        onClose={() => setActiveModal(null)}
        title="About FreshCart"
      >
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <span className="text-4xl" aria-hidden="true">
            🥕
          </span>
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] m-0">
            FreshCart Grocery Delivery
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] m-0">
            Version 1.0.0 • Modern, fresh groceries delivered directly to your doorstep in minutes.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-brand)] font-semibold mt-2">
            <CheckIcon size={16} /> All systems operational
          </div>
        </div>
      </Modal>

      {/* Log Out Confirmation Dialog */}
      <Modal
        open={activeModal === "logoutConfirm"}
        onClose={() => setActiveModal(null)}
        title="Log Out"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-text-secondary)] m-0">
            Are you sure you want to log out of your FreshCart account?
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AccountPage;
