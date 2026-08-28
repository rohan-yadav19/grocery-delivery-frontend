import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import App from "../../src/App";
import { useSessionStore } from "../../src/stores/sessionStore";

describe("Auth and Onboarding Flow", () => {
  beforeEach(() => {
    useSessionStore.setState({
      user: null,
      isAuthenticated: false,
      phoneNumber: "",
      zone: "Bengaluru",
      area: "Koramangala",
      deliveryAddress: "Koramangala, Bengaluru, Karnataka, India",
      locationSet: false,
    });
  });

  // ── 1. Splash Screen ──────────────────────────────────────────────────────

  describe("Splash Screen", () => {
    it("renders splash branding and navigates to welcome on click", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/splash"]}>
          <App />
        </MemoryRouter>,
      );

      expect(screen.getByText("nectar")).toBeInTheDocument();
      expect(screen.getByText("online groceriet")).toBeInTheDocument();

      const splashRegion = screen.getByRole("region", {
        name: /freshcart splash screen/i,
      });
      await user.click(splashRegion);

      expect(
        screen.getByRole("heading", { level: 1, name: /welcome to our store/i }),
      ).toBeInTheDocument();
    });
  });

  // ── 2. Welcome / Onboarding ───────────────────────────────────────────────

  describe("Welcome / Onboarding", () => {
    it("renders welcome heading, subtitle, and Get Started CTA", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/welcome"]}>
          <App />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole("heading", { level: 1, name: /welcome to our store/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/get your groceries in as fast as one hour/i),
      ).toBeInTheDocument();

      const getStartedBtn = screen.getByRole("button", { name: /get started/i });
      await user.click(getStartedBtn);

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /get your groceries/i,
        }),
      ).toBeInTheDocument();
    });
  });

  // ── 3. Sign In Landing ────────────────────────────────────────────────────

  describe("Sign In Landing", () => {
    it("navigates to phone number entry when clicking phone field", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/sign-in"]}>
          <App />
        </MemoryRouter>,
      );

      const phoneBtn = screen.getByRole("button", {
        name: /enter phone number to sign in/i,
      });
      await user.click(phoneBtn);

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /enter your mobile number/i,
        }),
      ).toBeInTheDocument();
    });

    it("logs in with Google and navigates to location selection", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/sign-in"]}>
          <App />
        </MemoryRouter>,
      );

      const googleBtn = screen.getByRole("button", {
        name: /continue with google/i,
      });
      await user.click(googleBtn);

      expect(useSessionStore.getState().isAuthenticated).toBe(true);
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /select your location/i,
        }),
      ).toBeInTheDocument();
    });

    it("links to email login and signup", () => {
      render(
        <MemoryRouter initialEntries={["/sign-in"]}>
          <App />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole("link", { name: /sign in with email and password/i }),
      ).toHaveAttribute("href", "/login");
      expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
        "href",
        "/signup",
      );
    });
  });

  // ── 4. Phone Number Flow ──────────────────────────────────────────────────

  describe("Phone Number Entry", () => {
    it("shows error for short or invalid phone number", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/phone-number"]}>
          <App />
        </MemoryRouter>,
      );

      const input = screen.getByLabelText(/mobile number/i);
      await user.type(input, "123");

      const nextBtn = screen.getByRole("button", {
        name: /continue to verification code/i,
      });
      await user.click(nextBtn);

      expect(
        screen.getByText(/please enter a valid phone number/i),
      ).toBeInTheDocument();
    });

    it("stores phone number and navigates to verification on valid submit", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/phone-number"]}>
          <App />
        </MemoryRouter>,
      );

      const input = screen.getByLabelText(/mobile number/i);
      await user.type(input, "1712345678");

      const nextBtn = screen.getByRole("button", {
        name: /continue to verification code/i,
      });
      await user.click(nextBtn);

      expect(useSessionStore.getState().phoneNumber).toBe("1712345678");
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /enter your 4-digit code/i,
        }),
      ).toBeInTheDocument();
    });
  });

  // ── 5. Verification / OTP Flow ────────────────────────────────────────────

  describe("Verification / OTP", () => {
    it("shows error for incomplete OTP digits", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/verification"]}>
          <App />
        </MemoryRouter>,
      );

      const verifyBtn = screen.getByRole("button", {
        name: /verify and continue/i,
      });
      await user.click(verifyBtn);

      expect(
        screen.getByText(/please enter the complete 4-digit code/i),
      ).toBeInTheDocument();
    });

    it("accepts 4 digits and navigates to location selection", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/verification"]}>
          <App />
        </MemoryRouter>,
      );

      const digit1 = screen.getByRole("textbox", { name: "Digit 1" });
      const digit2 = screen.getByRole("textbox", { name: "Digit 2" });
      const digit3 = screen.getByRole("textbox", { name: "Digit 3" });
      const digit4 = screen.getByRole("textbox", { name: "Digit 4" });

      await user.type(digit1, "1");
      await user.type(digit2, "2");
      await user.type(digit3, "3");
      await user.type(digit4, "4");

      const verifyBtn = screen.getByRole("button", {
        name: /verify and continue/i,
      });
      await user.click(verifyBtn);

      expect(useSessionStore.getState().isAuthenticated).toBe(true);
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /select your location/i,
        }),
      ).toBeInTheDocument();
    });

    it("handles Resend Code action", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/verification"]}>
          <App />
        </MemoryRouter>,
      );

      const resendBtn = screen.getByRole("button", { name: /resend code/i });
      await user.click(resendBtn);

      expect(screen.getByText(/new 4-digit code sent!/i)).toBeInTheDocument();
    });
  });

  // ── 6. Location Selection ─────────────────────────────────────────────────

  describe("Select Location", () => {
    it("updates location in session store and navigates to Home on submit", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/select-location"]}>
          <App />
        </MemoryRouter>,
      );

      const zoneSelect = screen.getByLabelText(/your zone/i);
      await user.selectOptions(zoneSelect, "Bengaluru East");

      const areaSelect = screen.getByLabelText(/your area/i);
      await user.selectOptions(areaSelect, "Whitefield");

      const submitBtn = screen.getByRole("button", {
        name: /submit location and continue/i,
      });
      await user.click(submitBtn);

      expect(useSessionStore.getState().zone).toBe("Bengaluru East");
      expect(useSessionStore.getState().area).toBe("Whitefield");
      expect(useSessionStore.getState().deliveryAddress).toBe(
        "Whitefield, Bengaluru East, Karnataka, India",
      );
      expect(useSessionStore.getState().locationSet).toBe(true);

      // Successfully reached Home Page
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 2, name: /exclusive offer/i }),
        ).toBeInTheDocument();
      });
    });
  });

  // ── 7. Log In Form ────────────────────────────────────────────────────────

  describe("Log In Form", () => {
    it("shows error for invalid email or short password", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/login"]}>
          <App />
        </MemoryRouter>,
      );

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitBtn = screen.getByRole("button", { name: /^log in$/i });

      // Invalid email
      await user.type(emailInput, "notanemail");
      await user.type(passwordInput, "12345");
      await user.click(submitBtn);
      expect(
        screen.getByText(/please enter a valid email address/i),
      ).toBeInTheDocument();

      // Short password
      await user.clear(emailInput);
      await user.type(emailInput, "user@test.com");
      await user.clear(passwordInput);
      await user.type(passwordInput, "12");
      await user.click(submitBtn);
      expect(
        screen.getByText(/password must be at least 4 characters/i),
      ).toBeInTheDocument();
    });

    it("toggles password visibility", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/login"]}>
          <App />
        </MemoryRouter>,
      );

      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute("type", "password");

      const toggleBtn = screen.getByRole("button", { name: /show password/i });
      await user.click(toggleBtn);
      expect(passwordInput).toHaveAttribute("type", "text");

      const hideBtn = screen.getByRole("button", { name: /hide password/i });
      await user.click(hideBtn);
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("submits valid credentials and navigates to Home", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/login"]}>
          <App />
        </MemoryRouter>,
      );

      await user.type(screen.getByLabelText(/^email$/i), "afsar@example.com");
      await user.type(screen.getByLabelText(/^password$/i), "secret123");
      await user.click(screen.getByRole("button", { name: /^log in$/i }));

      expect(useSessionStore.getState().isAuthenticated).toBe(true);
      expect(useSessionStore.getState().user?.email).toBe("afsar@example.com");

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 2, name: /exclusive offer/i }),
        ).toBeInTheDocument();
      });
    });
  });

  // ── 8. Sign Up Form ───────────────────────────────────────────────────────

  describe("Sign Up Form", () => {
    it("validates username, email, and password", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/signup"]}>
          <App />
        </MemoryRouter>,
      );

      const usernameInput = screen.getByLabelText(/^username$/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitBtn = screen.getByRole("button", { name: /^sign up$/i });

      // Missing username
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "pass123");
      await user.click(submitBtn);
      expect(
        screen.getByText(/please enter your username/i),
      ).toBeInTheDocument();

      // Invalid email
      await user.type(usernameInput, "Test User");
      await user.clear(emailInput);
      await user.type(emailInput, "invalidemail");
      await user.click(submitBtn);
      expect(
        screen.getByText(/please enter a valid email address/i),
      ).toBeInTheDocument();
    });

    it("submits registration and navigates to location selection", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/signup"]}>
          <App />
        </MemoryRouter>,
      );

      await user.type(screen.getByLabelText(/^username$/i), "New User");
      await user.type(screen.getByLabelText(/^email$/i), "newuser@example.com");
      await user.type(screen.getByLabelText(/^password$/i), "password123");

      await user.click(screen.getByRole("button", { name: /^sign up$/i }));

      expect(useSessionStore.getState().isAuthenticated).toBe(true);
      expect(useSessionStore.getState().user?.name).toBe("New User");
      expect(useSessionStore.getState().user?.email).toBe("newuser@example.com");

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /select your location/i,
        }),
      ).toBeInTheDocument();
    });
  });
});
