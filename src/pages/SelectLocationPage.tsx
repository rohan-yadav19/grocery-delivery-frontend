import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackIcon, ChevronDownIcon } from "../components/icons";
import { ResilientImage } from "../components";
import { useSessionStore } from "../stores/sessionStore";

const ZONES = [
  "Banasree",
  "Bengaluru",
  "Bengaluru East",
  "Bengaluru South",
  "Bengaluru North",
  "Bengaluru Central",
];

const AREAS_BY_ZONE: Record<string, string[]> = {
  Banasree: [
    "Types of your area",
    "Block A",
    "Block B",
    "Block C",
    "Block D",
    "Block E",
  ],
  Bengaluru: [
    "Koramangala",
    "Indiranagar",
    "HSR Layout",
    "BTM Layout",
    "Jayanagar",
    "Whitefield",
  ],
  "Bengaluru East": [
    "Whitefield",
    "Marathahalli",
    "Bellandur",
    "CV Raman Nagar",
    "KR Puram",
  ],
  "Bengaluru South": [
    "Koramangala",
    "HSR Layout",
    "JP Nagar",
    "Jayanagar",
    "Bannerghatta Road",
    "Electronic City",
  ],
  "Bengaluru North": [
    "Hebbal",
    "Yelahanka",
    "Malleshwaram",
    "RT Nagar",
    "Sadashivanagar",
  ],
  "Bengaluru Central": [
    "MG Road",
    "Brigade Road",
    "Indiranagar",
    "Richmond Town",
    "Frazer Town",
  ],
};

/**
 * Location selection screen matching select location.png.
 */
function SelectLocationPage() {
  const navigate = useNavigate();
  const setLocation = useSessionStore((s) => s.setLocation);
  const currentZone = useSessionStore((s) => s.zone);
  const currentArea = useSessionStore((s) => s.area);

  const [zone, setZone] = useState(currentZone || "Banasree");
  const [area, setArea] = useState(currentArea || "Types of your area");

  const handleZoneChange = (newZone: string) => {
    setZone(newZone);
    const availableAreas = AREAS_BY_ZONE[newZone] || ["Types of your area"];
    const firstArea = availableAreas[0] || "Types of your area";
    setArea(firstArea);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalArea = area === "Types of your area" ? "Block A" : area;
    setLocation(zone, finalArea);
    const currentUser = useSessionStore.getState().user;
    useSessionStore
      .getState()
      .login(
        currentUser?.email || "user@freshcart.com",
        currentUser?.name || "Afsar Hossen"
      );
    navigate("/");
  };

  const availableAreas = AREAS_BY_ZONE[zone] || ["Types of your area"];

  return (
    <div
      className="select-location-page min-h-screen flex flex-col justify-between max-w-md mx-auto px-6 py-6"
      style={{
        background:
          "radial-gradient(circle at 85% 8%, rgba(255, 120, 70, 0.08) 0%, transparent 45%), radial-gradient(circle at 15% 92%, rgba(83, 177, 117, 0.08) 0%, transparent 45%), #FFFFFF",
      }}
    >
      <div>
        {/* Back navigation */}
        <div className="mb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 -ml-2 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-full hover:bg-[var(--color-input-bg)] text-[#181725]"
            aria-label="Go back"
          >
            <BackIcon size={24} />
          </button>
        </div>

        {/* Map Pinboard Illustration */}
        <div className="flex justify-center my-4">
          <div className="w-56 h-44 flex items-center justify-center">
            <ResilientImage
              src="/assets/illustrations/select-location-map.png"
              alt="Select Location Map"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-[26px] font-bold text-[#181725] mb-2 leading-tight">
            Select Your Location
          </h1>
          <p className="text-sm text-[#7C7C7C] leading-relaxed max-w-xs mx-auto m-0">
            Swithch on your location to stay in tune with what’s happening in your area
          </p>
        </div>

        {/* Location Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Zone Dropdown */}
          <div>
            <label
              htmlFor="zone-select"
              className="block text-base font-semibold text-[#7C7C7C] mb-1"
            >
              Your Zone
            </label>
            <div className="relative border-b border-[#E2E2E2] focus-within:border-[#53B175] transition-colors">
              <select
                id="zone-select"
                value={zone}
                onChange={(e) => handleZoneChange(e.target.value)}
                className="w-full py-2.5 bg-transparent text-lg font-medium text-[#181725] outline-none appearance-none cursor-pointer pr-8"
              >
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-[#7C7C7C]">
                <ChevronDownIcon size={18} />
              </div>
            </div>
          </div>

          {/* Area Dropdown */}
          <div>
            <label
              htmlFor="area-select"
              className="block text-base font-semibold text-[#7C7C7C] mb-1"
            >
              Your Area
            </label>
            <div className="relative border-b border-[#E2E2E2] focus-within:border-[#53B175] transition-colors">
              <select
                id="area-select"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full py-2.5 bg-transparent text-lg font-medium text-[#181725] outline-none appearance-none cursor-pointer pr-8"
              >
                {availableAreas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-[#7C7C7C]">
                <ChevronDownIcon size={18} />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              className="w-full py-4 rounded-[19px] bg-[#53B175] hover:bg-[#489e67] text-white font-semibold text-lg border-none cursor-pointer shadow-sm transition-all active:scale-[0.99]"
              aria-label="Submit location and continue"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SelectLocationPage;
