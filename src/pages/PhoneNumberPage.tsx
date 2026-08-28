import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackIcon, ForwardIcon, IndiaFlagIcon } from "../components/icons";
import { useSessionStore } from "../stores/sessionStore";

/**
 * Phone number entry screen matching Number.png with Indian (+91) localization.
 */
function PhoneNumberPage() {
  const navigate = useNavigate();
  const setPhoneNumber = useSessionStore((s) => s.setPhoneNumber);
  const storedPhone = useSessionStore((s) => s.phoneNumber);

  const [phone, setPhone] = useState(storedPhone || "");
  const [error, setError] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNumber = phone.trim().replace(/\D/g, "");
    if (cleanNumber.length < 6) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");
    setPhoneNumber(phone.trim());
    navigate("/verification");
  };

  const handleKeypadPress = (val: string) => {
    if (val === "backspace") {
      setPhone((prev) => prev.slice(0, -1));
      return;
    }
    if (phone.length < 12) {
      setPhone((prev) => prev + val);
      if (error) setError("");
    }
  };

  return (
    <div
      className="phone-number-page min-h-screen flex flex-col justify-between max-w-md mx-auto px-6 py-6"
      style={{
        background:
          "radial-gradient(circle at 85% 8%, rgba(255, 120, 70, 0.08) 0%, transparent 45%), radial-gradient(circle at 15% 92%, rgba(83, 177, 117, 0.08) 0%, transparent 45%), #FFFFFF",
      }}
    >
      <div>
        {/* Back navigation */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/sign-in")}
            className="w-10 h-10 -ml-2 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-full hover:bg-[var(--color-input-bg)] text-[#181725]"
            aria-label="Back to sign in landing"
          >
            <BackIcon size={24} />
          </button>
        </div>

        {/* Title & Instructions */}
        <h1 className="text-[26px] font-bold text-[#181725] mb-8 leading-tight">
          Enter your mobile number
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <label
            htmlFor="phone-input"
            className="block text-base font-semibold text-[#7C7C7C] mb-3"
          >
            Mobile Number
          </label>

          <div className="flex items-center gap-3.5 pb-2 border-b border-[#E2E2E2] focus-within:border-[#53B175] transition-colors">
            <div className="flex items-center gap-2.5">
              <IndiaFlagIcon width={30} height={20} />
              <span className="text-lg font-semibold text-[#181725] tracking-tight">
                +91
              </span>
            </div>
            <input
              id="phone-input"
              type="tel"
              autoFocus
              className="flex-1 text-lg font-medium bg-transparent border-none outline-none ring-0 shadow-none text-[#181725] placeholder:text-[#B1B1B1] focus:ring-0 focus:outline-none"
              style={{ outline: "none", boxShadow: "none", border: "none" }}
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError("");
              }}
              aria-describedby={error ? "phone-error" : undefined}
            />
          </div>

          {error && (
            <p id="phone-error" className="text-xs text-[var(--color-error)] mt-2 font-medium">
              {error}
            </p>
          )}
        </form>
      </div>

      {/* Floating forward action button & Soft Numeric Keypad */}
      <div>
        <div className="flex justify-end py-4 mb-2">
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="w-16 h-16 rounded-full bg-[#53B175] hover:bg-[#489e67] text-white border-none cursor-pointer flex items-center justify-center shadow-lg transition-transform active:scale-95"
            aria-label="Continue to verification code"
          >
            <ForwardIcon size={24} />
          </button>
        </div>

        {/* Soft Numeric Keypad matching screenshot */}
        <div className="grid grid-cols-3 gap-2 pt-4 pb-2 border-t border-[#F2F3F2]">
          {[
            { num: "1", sub: "" },
            { num: "2", sub: "ABC" },
            { num: "3", sub: "DEF" },
            { num: "4", sub: "GHI" },
            { num: "5", sub: "JKL" },
            { num: "6", sub: "MNO" },
            { num: "7", sub: "PQRS" },
            { num: "8", sub: "TUV" },
            { num: "9", sub: "WXYZ" },
            { num: "+ * #", sub: "" },
            { num: "0", sub: "" },
            { num: "⌫", sub: "backspace" },
          ].map((keyItem, i) => (
            <button
              key={i}
              type="button"
              onClick={() =>
                keyItem.sub === "backspace"
                  ? handleKeypadPress("backspace")
                  : keyItem.num.length === 1
                  ? handleKeypadPress(keyItem.num)
                  : null
              }
              className="h-12 flex flex-col items-center justify-center rounded-xl bg-white/80 hover:bg-white active:bg-gray-100 border border-gray-100 shadow-xs transition-colors cursor-pointer text-[#181725]"
            >
              <span className="text-xl font-semibold leading-none">
                {keyItem.num}
              </span>
              {keyItem.sub && keyItem.sub !== "backspace" && (
                <span className="text-[9px] font-bold text-gray-400 tracking-wider">
                  {keyItem.sub}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PhoneNumberPage;
