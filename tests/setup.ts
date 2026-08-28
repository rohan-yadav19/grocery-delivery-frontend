import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";
import { useSessionStore } from "../src/stores/sessionStore";

beforeEach(() => {
  // Default to authenticated returning user for general page and component unit tests
  useSessionStore.setState({
    user: { name: "Afsar Hossen", email: "imranhossen@gmail.com" },
    isAuthenticated: true,
    hasSeenOnboarding: true,
    phoneNumber: "+8801712345678",
    zone: "Bengaluru",
    area: "Koramangala",
    deliveryAddress: "Koramangala, Bengaluru, Karnataka, India",
    locationSet: true,
  });
});
