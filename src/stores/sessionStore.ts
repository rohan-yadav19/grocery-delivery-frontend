import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface UserProfile {
  name: string;
  email: string;
}

interface SessionState {
  /** Current user profile if logged in. */
  user: UserProfile | null;

  /** Whether the user is authenticated in the session. */
  isAuthenticated: boolean;

  /** Whether the user has completed or seen initial onboarding. */
  hasSeenOnboarding: boolean;

  /** Temporary phone number entered during onboarding flow. */
  phoneNumber: string;

  /** Selected Zone during location setup. */
  zone: string;

  /** Selected Area during location setup. */
  area: string;

  /** Current delivery address (display string). */
  deliveryAddress: string;

  /** Whether the location picker / onboarding has been completed. */
  locationSet: boolean;

  setUser: (user: UserProfile | null) => void;
  setPhoneNumber: (phone: string) => void;
  setLocation: (zone: string, area: string) => void;
  setDeliveryAddress: (address: string) => void;
  setLocationSet: (value: boolean) => void;
  setHasSeenOnboarding: (value: boolean) => void;
  completeOnboarding: () => void;
  login: (email: string, name?: string) => void;
  logout: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasSeenOnboarding: false,
      phoneNumber: "",
      zone: "Bengaluru",
      area: "Koramangala",
      deliveryAddress: "Koramangala, Bengaluru, Karnataka, India",
      locationSet: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
          hasSeenOnboarding: user !== null ? true : undefined,
        }),

      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

      setLocation: (zone, area) =>
        set({
          zone,
          area,
          deliveryAddress: `${area}, ${zone}, Karnataka, India`,
          locationSet: true,
          hasSeenOnboarding: true,
        }),

      setDeliveryAddress: (address) => set({ deliveryAddress: address }),

      setLocationSet: (value) => set({ locationSet: value }),

      setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),

      completeOnboarding: () => set({ hasSeenOnboarding: true }),

      login: (email, name = "Afsar Hossen") =>
        set({
          user: { name, email },
          isAuthenticated: true,
          hasSeenOnboarding: true,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          // Preserves hasSeenOnboarding: true so returning logged-out user goes to /sign-in, not splash/welcome
        }),
    }),
    {
      name: "freshcart-session",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasSeenOnboarding: state.hasSeenOnboarding,
        deliveryAddress: state.deliveryAddress,
        locationSet: state.locationSet,
        zone: state.zone,
        area: state.area,
      }),
    },
  ),
);
