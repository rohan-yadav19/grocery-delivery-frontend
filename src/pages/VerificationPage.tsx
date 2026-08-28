import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BackIcon, ForwardIcon } from "../components/icons";
import { useSessionStore } from "../stores/sessionStore";

/**
 * OTP Verification screen matching Verification .png.
 */
function VerificationPage() {
  const navigate = useNavigate();
  const phoneNumber = useSessionStore((s) => s.phoneNumber);
  const login = useSessionStore((s) => s.login);

  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [resendStatus, setResendStatus] = useState("");

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);
    setError("");

    // Auto-advance
    if (clean && index < 3) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    } else if (e.key === "Enter") {
      handleVerify();
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === "backspace") {
      const lastFilledIndex = digits.reduce((last, d, i) => (d ? i : last), -1);
      if (lastFilledIndex >= 0) {
        const newDigits = [...digits];
        newDigits[lastFilledIndex] = "";
        setDigits(newDigits);
        inputRefs[lastFilledIndex]?.current?.focus();
      }
      return;
    }

    const firstEmptyIndex = digits.findIndex((d) => !d);
    if (firstEmptyIndex >= 0) {
      const newDigits = [...digits];
      newDigits[firstEmptyIndex] = val;
      setDigits(newDigits);
      setError("");
      if (firstEmptyIndex < 3) {
        inputRefs[firstEmptyIndex + 1]?.current?.focus();
      }
    }
  };

  const handleVerify = () => {
    const code = digits.join("");
    if (code.length < 4) {
      setError("Please enter the complete 4-digit code");
      return;
    }

    setError("");
    login(
      phoneNumber ? `user-${phoneNumber}@freshcart.example` : "user@freshcart.example",
      "FreshCart User"
    );
    navigate("/select-location");
  };

  const handleResend = () => {
    setDigits(["", "", "", ""]);
    setError("");
    setResendStatus("New 4-digit code sent!");
    inputRefs[0]?.current?.focus();
    setTimeout(() => setResendStatus(""), 3000);
  };

  return (
    <div
      className="verification-page min-h-screen flex flex-col justify-between max-w-md mx-auto px-6 py-6"
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
            onClick={() => navigate("/phone-number")}
            className="w-10 h-10 -ml-2 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-full hover:bg-[var(--color-input-bg)] text-[#181725]"
            aria-label="Back to phone number entry"
          >
            <BackIcon size={24} />
          </button>
        </div>

        {/* Title & Prompt */}
        <h1 className="text-[26px] font-bold text-[#181725] mb-2 leading-tight">
          Enter your 4-digit code
        </h1>
        <p className="text-sm text-[#7C7C7C] mb-8">
          Code sent to{" "}
          <span className="font-semibold text-[#181725]">
            +91 {phoneNumber || "98765 43210"}
          </span>
        </p>

        {/* Code Input */}
        <div className="mb-8">
          <label className="block text-base font-semibold text-[#7C7C7C] mb-3">
            Code
          </label>
          <div className="flex items-center gap-6 pb-2 border-b border-[#E2E2E2]">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                autoFocus={idx === 0}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                placeholder="-"
                className="w-8 text-left text-2xl font-bold text-[#181725] bg-transparent border-none outline-none placeholder:text-[#B1B1B1]"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs text-[var(--color-error)] mt-2 font-medium">
              {error}
            </p>
          )}

          {resendStatus && (
            <p className="text-xs text-[#53B175] mt-2 font-semibold">
              {resendStatus}
            </p>
          )}
        </div>
      </div>

      {/* Floating Action / Keypad Section */}
      <div>
        {/* Resend Code & FAB next button row */}
        <div className="flex items-center justify-between py-4 mb-4">
          <button
            type="button"
            onClick={handleResend}
            className="text-lg font-medium text-[#53B175] hover:underline bg-transparent border-none cursor-pointer p-0"
          >
            Resend Code
          </button>

          <button
            type="button"
            onClick={handleVerify}
            className="w-16 h-16 rounded-full bg-[#53B175] hover:bg-[#489e67] text-white border-none cursor-pointer flex items-center justify-center shadow-lg transition-transform active:scale-95"
            aria-label="Verify and continue"
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
              className="h-12 flex flex-col items-center justify-center rounded-xl bg-white/70 hover:bg-white active:bg-gray-100 border border-gray-100 shadow-sm transition-colors cursor-pointer text-[#181725]"
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

export default VerificationPage;
