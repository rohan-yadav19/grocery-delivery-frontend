import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import App from "../../src/App";
import WelcomePage from "../../src/pages/WelcomePage";
import { useSessionStore } from "../../src/stores/sessionStore";

describe("WelcomePage Visual Fidelity & Structure", () => {
  beforeEach(() => {
    useSessionStore.setState({
      isAuthenticated: false,
      hasSeenOnboarding: false,
      user: null,
    });
  });

  it("renders exactly one 'Welcome to our store' heading", () => {
    render(
      <MemoryRouter initialEntries={["/welcome"]}>
        <WelcomePage />
      </MemoryRouter>,
    );

    const headings = screen.getAllByRole("heading", {
      name: /welcome to our store/i,
    });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toBeInTheDocument();
  });

  it("renders exactly one subtitle", () => {
    render(
      <MemoryRouter initialEntries={["/welcome"]}>
        <WelcomePage />
      </MemoryRouter>,
    );

    const subtitles = screen.getAllByText(
      /get your groceries in as fast as one hour/i,
    );
    expect(subtitles).toHaveLength(1);
    expect(subtitles[0]).toBeInTheDocument();
  });

  it("renders exactly one Get Started button", () => {
    render(
      <MemoryRouter initialEntries={["/welcome"]}>
        <WelcomePage />
      </MemoryRouter>,
    );

    const buttons = screen.getAllByRole("button", { name: /get started/i });
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toBeInTheDocument();
  });

  it("references the real onboarding asset /assets/illustrations/onboarding.png", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/welcome"]}>
        <WelcomePage />
      </MemoryRouter>,
    );

    const bgElement = container.querySelector(
      "[style*='onboarding.png']",
    );
    expect(bgElement).toBeInTheDocument();
    expect(bgElement?.getAttribute("style")).toContain(
      "/assets/illustrations/onboarding.png",
    );
  });

  it("clicking Get Started marks onboarding completed and navigates to /sign-in", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/welcome"]}>
        <App />
      </MemoryRouter>,
    );

    const getStartedBtn = screen.getByRole("button", { name: /get started/i });
    await user.click(getStartedBtn);

    expect(useSessionStore.getState().hasSeenOnboarding).toBe(true);
    expect(
      await screen.findByRole("heading", {
        name: /get your groceries/i,
      }),
    ).toBeInTheDocument();
  });
});
