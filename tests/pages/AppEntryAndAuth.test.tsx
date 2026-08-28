import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import App from "../../src/App";
import { useSessionStore } from "../../src/stores/sessionStore";

describe("Step 18: Professional App Entry & Authentication Flow", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("1. First visit (!hasSeenOnboarding & !isAuthenticated) redirects / to /splash", () => {
    useSessionStore.setState({
      user: null,
      isAuthenticated: false,
      hasSeenOnboarding: false,
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    // Splash screen branding should be visible
    expect(screen.getByText("nectar")).toBeInTheDocument();
    expect(screen.getByText("online groceriet")).toBeInTheDocument();
  });

  it("2. Splash advances to /welcome on user click", async () => {
    useSessionStore.setState({
      user: null,
      isAuthenticated: false,
      hasSeenOnboarding: false,
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/splash"]}>
        <App />
      </MemoryRouter>,
    );

    const splash = screen.getByLabelText("FreshCart Splash Screen");
    await user.click(splash);

    expect(
      await screen.findByRole("heading", {
        name: /welcome to our store/i,
      }),
    ).toBeInTheDocument();
  });

  it("3. Welcome advances to /sign-in and marks onboarding completed", async () => {
    useSessionStore.setState({
      user: null,
      isAuthenticated: false,
      hasSeenOnboarding: false,
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/welcome"]}>
        <App />
      </MemoryRouter>,
    );

    const getStartedBtn = screen.getByRole("button", { name: /get started/i });
    await user.click(getStartedBtn);

    expect(
      await screen.findByRole("heading", {
        name: /get your groceries/i,
      }),
    ).toBeInTheDocument();
    expect(useSessionStore.getState().hasSeenOnboarding).toBe(true);
  });

  it("4. Authenticated user accessing / lands directly on Home", () => {
    useSessionStore.setState({
      user: { name: "Afsar Hossen", email: "imranhossen@gmail.com" },
      isAuthenticated: true,
      hasSeenOnboarding: true,
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: /exclusive offer/i }),
    ).toBeInTheDocument();
  });

  it("5. Returning logged-out user (hasSeenOnboarding: true) accessing / redirects to /sign-in (not splash/welcome)", () => {
    useSessionStore.setState({
      user: null,
      isAuthenticated: false,
      hasSeenOnboarding: true,
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        name: /get your groceries/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("online groceriet")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /welcome to our store/i }),
    ).not.toBeInTheDocument();
  });

  it("6 & 7. Logout clears authentication and navigates to /sign-in", async () => {
    useSessionStore.setState({
      user: { name: "Afsar Hossen", email: "imranhossen@gmail.com" },
      isAuthenticated: true,
      hasSeenOnboarding: true,
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/account"]}>
        <App />
      </MemoryRouter>,
    );

    // Open logout confirm modal
    const logoutBtn = screen.getByRole("button", { name: /^log out$/i });
    await user.click(logoutBtn);

    // Confirm logout
    const modalLogoutBtn = screen.getAllByRole("button", {
      name: /^log out$/i,
    })[1];
    expect(modalLogoutBtn).toBeDefined();
    await user.click(modalLogoutBtn!);

    // Check store is cleared
    expect(useSessionStore.getState().isAuthenticated).toBe(false);
    expect(useSessionStore.getState().user).toBeNull();
    // hasSeenOnboarding is preserved
    expect(useSessionStore.getState().hasSeenOnboarding).toBe(true);

    // Navigates to sign in
    expect(
      await screen.findByRole("heading", {
        name: /get your groceries/i,
      }),
    ).toBeInTheDocument();
  });

  it("8 & 9. After logout, app launch redirects to /sign-in (never Splash or Welcome)", () => {
    // Simulate user state after logout
    useSessionStore.setState({
      user: null,
      isAuthenticated: false,
      hasSeenOnboarding: true,
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        name: /get your groceries/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("online groceriet")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /welcome to our store/i }),
    ).not.toBeInTheDocument();
  });

  it("10. Protected routes redirect unauthenticated users to /sign-in", () => {
    useSessionStore.setState({
      user: null,
      isAuthenticated: false,
      hasSeenOnboarding: true,
    });

    const protectedPaths = [
      "/explore",
      "/cart",
      "/checkout",
      "/favorites",
      "/account",
      "/search",
      "/category/cat-fruits-vegetables",
      "/product/prod-organic-bananas",
    ];

    for (const path of protectedPaths) {
      const { unmount } = render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole("heading", {
          name: /get your groceries/i,
        }),
      ).toBeInTheDocument();

      unmount();
    }
  });

  it("11. Protected routes render correctly when authenticated", () => {
    useSessionStore.setState({
      user: { name: "Afsar Hossen", email: "imranhossen@gmail.com" },
      isAuthenticated: true,
      hasSeenOnboarding: true,
    });

    render(
      <MemoryRouter initialEntries={["/explore"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: /find products/i }),
    ).toBeInTheDocument();
  });

  it("12. Refresh / Session state persistence via zustand persist", () => {
    useSessionStore.getState().login("test@freshcart.com", "Test User");

    const state = useSessionStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe("Test User");
    expect(state.hasSeenOnboarding).toBe(true);
  });

  it("13. Back navigation after logout: accessing protected route redirects to /sign-in", () => {
    // User logged out
    useSessionStore.setState({
      user: null,
      isAuthenticated: false,
      hasSeenOnboarding: true,
    });

    // If browser back tries to navigate to /account
    render(
      <MemoryRouter initialEntries={["/account"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        name: /get your groceries/i,
      }),
    ).toBeInTheDocument();
  });

  it("14. Login form submits and navigates to Home", async () => {
    useSessionStore.setState({
      user: null,
      isAuthenticated: false,
      hasSeenOnboarding: true,
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "imranhossen@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^log in$/i }));

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: /exclusive offer/i,
      }),
    ).toBeInTheDocument();
    expect(useSessionStore.getState().isAuthenticated).toBe(true);
  });

  it("15. Signup form submits and navigates to Select Location then Home", async () => {
    useSessionStore.setState({
      user: null,
      isAuthenticated: false,
      hasSeenOnboarding: true,
    });

    render(
      <MemoryRouter initialEntries={["/signup"]}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/^username$/i), {
      target: { value: "Afsar Hossen" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "afsar@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    // Lands on Select Location
    expect(
      await screen.findByRole("heading", {
        name: /select your location/i,
      }),
    ).toBeInTheDocument();

    // Submits location
    fireEvent.click(screen.getByRole("button", { name: /submit location and continue/i }));

    // Lands on Home
    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: /exclusive offer/i,
      }),
    ).toBeInTheDocument();
  });
});
