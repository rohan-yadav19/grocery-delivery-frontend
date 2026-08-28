import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CarrotIcon, EyeIcon, EyeOffIcon, CheckIcon } from "../components/icons";
import { useSessionStore } from "../stores/sessionStore";

/**
 * Registration / Sign Up screen matching sign up.png.
 */
function SignupPage() {
  const navigate = useNavigate();
  const login = useSessionStore((s) => s.login);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const isEmailValid = email.includes("@") && email.includes(".");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }

    if (!isEmailValid) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    setError("");
    login(email.trim(), username.trim());
    navigate("/select-location");
  };

  return (
    <div
      className="signup-page min-h-screen flex flex-col justify-between max-w-md mx-auto px-6 py-8"
      style={{
        background:
          "radial-gradient(circle at 85% 8%, rgba(255, 120, 70, 0.08) 0%, transparent 45%), radial-gradient(circle at 15% 92%, rgba(83, 177, 117, 0.08) 0%, transparent 45%), #FFFFFF",
      }}
    >
      <div>
        {/* Top Carrot Logo */}
        <div className="flex justify-center pt-4 pb-10" aria-hidden="true">
          <CarrotIcon size={48} />
        </div>

        {/* Heading & Subtitle */}
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-[#181725] mb-2 leading-tight">
            Sign Up
          </h1>
          <p className="text-base text-[#7C7C7C] font-normal m-0">
            Enter your credentials to continue
          </p>
        </div>

        {/* Signup Form */}
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Username */}
          <div>
            <label
              htmlFor="signup-username"
              className="block text-base font-semibold text-[#7C7C7C] mb-1"
            >
              Username
            </label>
            <input
              id="signup-username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError("");
              }}
              placeholder="Afsar Hossen Shuvo"
              className="w-full py-2.5 bg-transparent border-b border-[#E2E2E2] focus:border-[#53B175] text-lg font-medium text-[#181725] outline-none transition-colors placeholder:text-[#B1B1B1]"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="signup-email"
              className="block text-base font-semibold text-[#7C7C7C] mb-1"
            >
              Email
            </label>
            <div className="relative border-b border-[#E2E2E2] focus-within:border-[#53B175] transition-colors">
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="imshuvo97@gmail.com"
                className="w-full py-2.5 bg-transparent text-lg font-medium text-[#181725] outline-none pr-8 placeholder:text-[#B1B1B1]"
              />
              {isEmailValid && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[#53B175] pointer-events-none">
                  <CheckIcon size={20} />
                </div>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="signup-password"
              className="block text-base font-semibold text-[#7C7C7C] mb-1"
            >
              Password
            </label>
            <div className="relative border-b border-[#E2E2E2] focus-within:border-[#53B175] transition-colors">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="••••••••"
                className="w-full py-2.5 bg-transparent text-lg font-medium text-[#181725] outline-none pr-10 placeholder:text-[#B1B1B1]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-transparent border-none p-1 text-[#7C7C7C] hover:text-[#181725] cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
          </div>

          {/* Terms & Privacy */}
          <p className="text-sm text-[#7C7C7C] leading-relaxed m-0 mt-1">
            By continuing you agree to our{" "}
            <span className="text-[#53B175] font-semibold cursor-pointer hover:underline">
              Terms of Service
            </span>
            <br />
            and{" "}
            <span className="text-[#53B175] font-semibold cursor-pointer hover:underline">
              Privacy Policy.
            </span>
          </p>

          {error && (
            <p className="text-xs text-[var(--color-error)] font-medium -mt-2">
              {error}
            </p>
          )}

          {/* CTA Button */}
          <div className="mt-4">
            <button
              type="submit"
              className="w-full py-4 rounded-[19px] bg-[#53B175] hover:bg-[#489e67] text-white font-semibold text-lg border-none cursor-pointer shadow-sm transition-all active:scale-[0.99]"
              aria-label="Sign Up"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>

      {/* Footer Link to Login */}
      <div className="text-center pt-8 pb-2">
        <p className="text-sm font-semibold text-[#181725] m-0">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#53B175] font-bold hover:underline no-underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
