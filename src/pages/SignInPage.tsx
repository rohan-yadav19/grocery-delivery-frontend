import { useNavigate, Link } from "react-router-dom";
import { GoogleIcon, FacebookIcon, IndiaFlagIcon } from "../components/icons";
import { ResilientImage } from "../components";
import { useSessionStore } from "../stores/sessionStore";

/**
 * Social sign-in landing screen matching Sing in .png with Indian localization.
 */
function SignInPage() {
  const navigate = useNavigate();
  const login = useSessionStore((s) => s.login);

  const handleSocialLogin = (provider: string) => {
    login(`${provider.toLowerCase()}user@freshcart.in`, `${provider} User`);
    navigate("/select-location");
  };

  return (
    <div
      className="signin-landing-page min-h-screen flex flex-col justify-between max-w-md mx-auto bg-white"
      style={{
        background:
          "radial-gradient(circle at 85% 8%, rgba(255, 120, 70, 0.06) 0%, transparent 45%), radial-gradient(circle at 15% 92%, rgba(83, 177, 117, 0.06) 0%, transparent 45%), #FFFFFF",
      }}
    >
      {/* Top Banner illustration with smooth gradient fade */}
      <div className="w-full h-64 sm:h-72 relative overflow-hidden bg-gradient-to-b from-[#E6F2EA]/60 to-transparent flex items-center justify-center">
        <ResilientImage
          src="/assets/illustrations/sign-in-groceries.png"
          alt="Fresh Groceries"
          className="w-full h-full object-cover object-bottom"
        />
        {/* Soft bottom blend gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>

      {/* Main Content */}
      <div className="px-6 pb-8 flex-1 flex flex-col justify-between pt-4">
        <div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-[#181725] leading-tight mb-6">
            Get your groceries
            <br />
            with nectar
          </h1>

          {/* Indian Phone Number Field Trigger */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate("/phone-number")}
              className="w-full flex items-center gap-3.5 pb-3 border-b border-[#E2E2E2] text-left cursor-pointer hover:border-[#53B175] transition-colors focus:outline-none focus:border-[#53B175] bg-transparent group"
              aria-label="Enter phone number to sign in"
            >
              <div className="flex items-center gap-2.5">
                <IndiaFlagIcon width={30} height={20} />
                <span className="text-lg font-semibold text-[#181725] tracking-tight">
                  +91
                </span>
              </div>
              <span className="text-base text-[#7C7C7C] group-hover:text-[#181725] transition-colors">
                Enter your mobile number
              </span>
            </button>
          </div>

          {/* Social Divider */}
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-[#7C7C7C] m-0">
              Or connect with social media
            </p>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col gap-3.5">
            <button
              type="button"
              onClick={() => handleSocialLogin("Google")}
              className="w-full flex items-center justify-center gap-4 py-4 px-4 rounded-[19px] bg-[#5383EC] hover:bg-[#4373DC] text-white font-semibold text-base transition-all border-none cursor-pointer shadow-sm active:scale-[0.99]"
              aria-label="Continue with Google"
            >
              <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full p-1 shadow-sm">
                <GoogleIcon size={16} />
              </div>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("Facebook")}
              className="w-full flex items-center justify-center gap-4 py-4 px-4 rounded-[19px] bg-[#4A66AC] hover:bg-[#3B579D] text-white font-semibold text-base transition-all border-none cursor-pointer shadow-sm active:scale-[0.99]"
              aria-label="Continue with Facebook"
            >
              <FacebookIcon size={20} className="text-white" />
              <span>Continue with Facebook</span>
            </button>
          </div>
        </div>

        {/* Alternate auth links */}
        <div className="mt-8 text-center flex flex-col gap-2">
          <Link
            to="/login"
            className="text-sm font-semibold text-[#53B175] hover:underline no-underline"
          >
            Sign in with Email and Password
          </Link>
          <p className="text-sm text-[#7C7C7C] m-0">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="font-bold text-[#53B175] hover:underline no-underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
