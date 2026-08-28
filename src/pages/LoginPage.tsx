import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CarrotIcon, EyeIcon, EyeOffIcon } from "../components/icons";
import { useSessionStore } from "../stores/sessionStore";

/**
 * Log In screen matching log in.png.
 */
function LoginPage() {
  const navigate = useNavigate();
  const login = useSessionStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    setError("");
    const displayName = email.split("@")[0] || "FreshCart User";
    login(email.trim(), displayName);
    navigate("/");
  };

  return (
    <div
      className="login-page min-h-screen flex flex-col justify-between max-w-md mx-auto px-6 py-8"
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
            Loging
          </h1>
          <p className="text-base text-[#7C7C7C] font-normal m-0">
            Enter your emails and password
          </p>
        </div>

        {/* Login Form */}
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-base font-semibold text-[#7C7C7C] mb-1"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="imshuvo97@gmail.com"
              className="w-full py-2.5 bg-transparent border-b border-[#E2E2E2] focus:border-[#53B175] text-lg font-medium text-[#181725] outline-none transition-colors placeholder:text-[#B1B1B1]"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-base font-semibold text-[#7C7C7C] mb-1"
            >
              Password
            </label>
            <div className="relative border-b border-[#E2E2E2] focus-within:border-[#53B175] transition-colors">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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

          {/* Forgot Password */}
          <div className="flex justify-end -mt-1">
            <button
              type="button"
              onClick={() => alert("Password reset link sent to your email!")}
              className="text-sm font-medium text-[#181725] hover:text-[#53B175] bg-transparent border-none cursor-pointer p-0"
            >
              Forgot Password?
            </button>
          </div>

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
              aria-label="Log In"
            >
              Log In
            </button>
          </div>
        </form>
      </div>

      {/* Footer Link to Signup */}
      <div className="text-center pt-8 pb-2">
        <p className="text-sm font-semibold text-[#181725] m-0">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-[#53B175] font-bold hover:underline no-underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
