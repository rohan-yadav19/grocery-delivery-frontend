import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ResilientImage } from "./ResilientImage";
import { BackIcon, ForwardIcon } from "./icons";

// ---------------------------------------------------------------------------
// Slide definitions
// ---------------------------------------------------------------------------

export interface BannerSlide {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly linkTo: string;
  readonly image?: string;
  readonly bannerType: "full-image" | "composed";
  readonly bgGradient: string;
  readonly accentBadge?: string;
  readonly badgeBg?: string;
  readonly products?: readonly string[];
}

export const BANNER_SLIDES: readonly BannerSlide[] = [
  {
    id: "fresh-vegetables",
    title: "Fresh Vegetables",
    subtitle: "Get Up To 40% OFF",
    linkTo: "/category/cat-fruits-vegetables",
    image: "/assets/banners/fresh-vegetables-banner.png",
    bannerType: "full-image",
    bgGradient: "linear-gradient(135deg, #F3F9F2 0%, #FFFFFF 100%)",
  },
  {
    id: "fresh-fruits",
    title: "Daily Fresh Fruits",
    subtitle: "Farm Picked • Up to 30% OFF",
    linkTo: "/category/cat-fruits-vegetables",
    bannerType: "composed",
    bgGradient: "linear-gradient(120deg, #FFF5EB 0%, #FFFDF9 50%, #FFEFE0 100%)",
    accentBadge: "FRESH HARVEST",
    badgeBg: "#FF7846",
    products: [
      "/assets/products/banana.png",
      "/assets/products/red-apple.png",
      "/assets/products/orange.png",
    ],
  },
  {
    id: "bakery-beverages",
    title: "Bakery & Beverages",
    subtitle: "Fresh Breads & Cool Sips",
    linkTo: "/category/cat-bakery-snacks",
    bannerType: "composed",
    bgGradient: "linear-gradient(120deg, #EDF5FF 0%, #F8FBFF 50%, #E3EFFF 100%)",
    accentBadge: "BEST DEALS",
    badgeBg: "#3878E8",
    products: [
      "/assets/products/bread.png",
      "/assets/products/cookies.png",
      "/assets/products/diet-coke.png",
    ],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PromoBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideCount = BANNER_SLIDES.length;
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // Autoplay timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const clientX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const diffX = touchStartX.current - clientX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="promo-banner-wrapper relative w-full select-none my-1"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Promotional banner carousel"
    >
      {/* Slider Viewport */}
      <div className="overflow-hidden rounded-[18px] relative shadow-sm border border-[#EBEBEB]">
        <div
          className="flex transition-transform duration-600 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {BANNER_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className="w-full flex-shrink-0 relative h-36 sm:h-40 md:h-48"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${slideCount}: ${slide.title}`}
            >
              {slide.bannerType === "full-image" ? (
                <Link
                  to={slide.linkTo}
                  className="block w-full h-full relative no-underline overflow-hidden"
                  style={{ background: slide.bgGradient }}
                  tabIndex={activeIndex === idx ? 0 : -1}
                >
                  <img
                    src={slide.image}
                    alt={`${slide.title} - ${slide.subtitle}`}
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                </Link>
              ) : (
                <Link
                  to={slide.linkTo}
                  className="w-full h-full flex items-center justify-between px-5 sm:px-8 md:px-12 no-underline relative overflow-hidden group"
                  style={{ background: slide.bgGradient }}
                  tabIndex={activeIndex === idx ? 0 : -1}
                >
                  {/* Left Side: Product Showcase */}
                  <div className="relative flex items-center shrink-0 w-36 sm:w-44 md:w-56 h-full py-2">
                    {slide.products?.map((prodImg, pIdx) => (
                      <div
                        key={pIdx}
                        className={`absolute transition-transform duration-300 group-hover:scale-105 ${
                          pIdx === 0
                            ? "left-0 top-3 w-16 sm:w-20 md:w-24 z-10 drop-shadow-md"
                            : pIdx === 1
                            ? "left-12 sm:left-16 bottom-2 w-14 sm:w-18 md:w-22 z-20 drop-shadow-lg"
                            : "left-24 sm:left-32 top-4 w-12 sm:w-16 md:w-20 z-0 opacity-90 drop-shadow-sm"
                        }`}
                      >
                        <ResilientImage
                          src={prodImg}
                          alt="Featured Product"
                          className="w-full h-auto object-contain max-h-24 sm:max-h-28"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Right Side: Promotion Details */}
                  <div className="text-right flex flex-col justify-center items-end z-10 max-w-[55%]">
                    {slide.accentBadge && (
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold text-white tracking-wider uppercase mb-1.5 shadow-xs"
                        style={{ backgroundColor: slide.badgeBg }}
                      >
                        {slide.accentBadge}
                      </span>
                    )}
                    <h2 className="text-base sm:text-xl md:text-2xl font-bold m-0 text-[#181725] tracking-tight leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base font-semibold m-0 mt-1 text-[#53B175]">
                      {slide.subtitle}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 text-xs sm:text-sm font-bold text-[#181725] group-hover:text-[#53B175] transition-colors">
                      Shop Now
                      <span className="text-base leading-none">→</span>
                    </span>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Previous / Next Desktop Hover Controls */}
        <button
          type="button"
          onClick={prevSlide}
          className="hidden sm:flex absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#181725] items-center justify-center shadow-md transition-all border-none cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Previous slide"
        >
          <BackIcon size={16} />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#181725] items-center justify-center shadow-md transition-all border-none cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Next slide"
        >
          <ForwardIcon size={16} />
        </button>
      </div>

      {/* Pagination dots below carousel */}
      <div
        className="carousel-dots flex items-center justify-center gap-1.5 mt-3"
        role="tablist"
        aria-label="Carousel pagination"
      >
        {BANNER_SLIDES.map((slide, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${i + 1}: ${slide.title}`}
              className={`h-1.5 rounded-full transition-all duration-300 border-none cursor-pointer p-0 ${
                isActive
                  ? "w-6 bg-[#53B175]"
                  : "w-1.5 bg-[#DCDCDC] hover:bg-[#B0B0B0]"
              }`}
              onClick={() => setActiveIndex(i)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default PromoBanner;
