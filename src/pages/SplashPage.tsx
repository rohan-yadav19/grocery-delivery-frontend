import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CarrotIcon } from "../components/icons";

/**
 * Splash screen matching splash Screen.png.
 *
 * Full-bleed brand green backdrop with white carrot logo and tagline.
 * Automatically advances to /welcome after a brief animation delay,
 * or on user click for immediate progression.
 */
function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/welcome");
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      onClick={() => navigate("/welcome")}
      className="splash-page flex flex-col items-center justify-center min-h-screen bg-[var(--color-brand)] text-white cursor-pointer select-none p-6"
      role="region"
      aria-label="FreshCart Splash Screen"
    >
      <div className="flex items-center gap-4 animate-fade-in">
        <div className="text-white flex-shrink-0">
          <CarrotIcon size={54} monochrome />
        </div>
        <div className="flex flex-col">
          <span className="text-5xl font-bold tracking-tight leading-none">
            nectar
          </span>
          <span className="text-sm font-medium tracking-[0.2em] opacity-90 mt-1">
            online groceriet
          </span>
        </div>
      </div>
    </div>
  );
}

export default SplashPage;
