import { useNavigate } from "react-router-dom";
import { Button } from "../components";
import { CarrotIcon } from "../components/icons";
import { useSessionStore } from "../stores/sessionStore";

/**
 * Onboarding / Welcome screen matching Figma onbording .png.
 *
 * Responsive hero composition:
 * - Full-height background container with dark aesthetic (#0F1411)
 * - Hero delivery illustration centered in viewport at top
 * - Smooth dark gradient overlay ensuring readability
 * - Centered bottom content card:
 *   - Exactly one white Carrot logo
 *   - Exactly one "Welcome to our store" heading
 *   - Exactly one "Get your groceries in as fast as one hour" subtitle
 *   - Exactly one "Get Started" full-width CTA button -> /sign-in
 */
function WelcomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    useSessionStore.getState().completeOnboarding();
    navigate("/sign-in");
  };

  return (
    <div className="welcome-page relative min-h-screen w-full flex flex-col justify-end items-center bg-[#0F1411] text-white overflow-x-hidden select-none">
      {/* Responsive background image layer */}
      <div
        className="absolute inset-0 bg-no-repeat bg-top md:bg-center bg-cover sm:bg-contain md:bg-cover max-w-lg md:max-w-2xl mx-auto opacity-90"
        style={{
          backgroundImage: "url('/assets/illustrations/onboarding.png')",
        }}
        aria-hidden="true"
      />

      {/* Dark gradient overlay for typography contrast and smooth blending */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/10 via-[#0F1411]/50 to-[#0F1411] pointer-events-none"
        aria-hidden="true"
      />

      {/* Hero content card */}
      <div className="relative z-10 max-w-md w-full mx-auto px-6 pb-12 pt-6 flex flex-col items-center text-center">
        {/* Carrot logo */}
        <div className="mb-5 text-white flex justify-center" aria-hidden="true">
          <CarrotIcon size={48} monochrome />
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-3 text-white max-w-xs tracking-tight">
          Welcome to our store
        </h1>

        {/* Subtitle */}
        <p className="text-base text-gray-300 mb-8 max-w-xs font-normal leading-relaxed">
          Get your groceries in as fast as one hour
        </p>

        {/* Action Button */}
        <div className="w-full">
          <Button
            onClick={handleGetStarted}
            className="welcome-get-started-btn w-full py-4 text-lg font-semibold rounded-[var(--radius-button)] shadow-lg"
            aria-label="Get Started"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
