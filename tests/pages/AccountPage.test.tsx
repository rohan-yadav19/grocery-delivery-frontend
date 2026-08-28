import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import App from "../../src/App";
import { useSessionStore } from "../../src/stores/sessionStore";

describe("AccountPage", () => {
  beforeEach(() => {
    useSessionStore.setState({
      deliveryAddress: "",
      locationSet: false,
    });
  });

  function renderAccount() {
    return render(
      <MemoryRouter initialEntries={["/account"]}>
        <App />
      </MemoryRouter>,
    );
  }

  // ── 1. Header & Profile Rendering ─────────────────────────────────────────

  it("renders user profile information and avatar", () => {
    renderAccount();

    expect(screen.getByRole("heading", { level: 1, name: /afsar hossen/i })).toBeInTheDocument();
    expect(screen.getByText("imranhossen@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("AH")).toBeInTheDocument();
  });

  it("renders all account menu options", () => {
    renderAccount();

    const menuList = screen.getByRole("list", { name: /account options/i });
    expect(within(menuList).getByRole("button", { name: "Orders" })).toBeInTheDocument();
    expect(within(menuList).getByRole("button", { name: "My Details" })).toBeInTheDocument();
    expect(within(menuList).getByRole("button", { name: "Delivery Address" })).toBeInTheDocument();
    expect(within(menuList).getByRole("button", { name: "Payment Methods" })).toBeInTheDocument();
    expect(within(menuList).getByRole("button", { name: "Promo Card" })).toBeInTheDocument();
    expect(within(menuList).getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    expect(within(menuList).getByRole("button", { name: "Help" })).toBeInTheDocument();
    expect(within(menuList).getByRole("button", { name: "About" })).toBeInTheDocument();
  });

  // ── 2. Profile Editing ────────────────────────────────────────────────────

  it("allows editing and saving user profile name and email", async () => {
    const user = userEvent.setup();
    renderAccount();

    const editBtn = screen.getByRole("button", { name: /edit user profile/i });
    await user.click(editBtn);

    expect(screen.getByRole("heading", { level: 2, name: /edit profile/i })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);

    await user.clear(nameInput);
    await user.type(nameInput, "Jane Doe");
    await user.clear(emailInput);
    await user.type(emailInput, "jane.doe@example.com");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(screen.getByRole("heading", { level: 1, name: /jane doe/i })).toBeInTheDocument();
    expect(screen.getByText("jane.doe@example.com")).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  // ── 3. Orders Modal ───────────────────────────────────────────────────────

  it("opens Orders modal with recent delivery history", async () => {
    const user = userEvent.setup();
    renderAccount();

    const menuList = screen.getByRole("list", { name: /account options/i });
    await user.click(within(menuList).getByRole("button", { name: "Orders" }));

    expect(screen.getByRole("heading", { level: 2, name: /order history/i })).toBeInTheDocument();
    expect(screen.getByText("Order #FC-8921")).toBeInTheDocument();
    expect(screen.getByText("Bananas, Bell Peppers, Ginger • $14.49")).toBeInTheDocument();
  });

  // ── 4. Delivery Address Modal ─────────────────────────────────────────────

  it("opens Delivery Address modal and updates session store address", async () => {
    const user = userEvent.setup();
    useSessionStore.setState({ deliveryAddress: "123 Market St, Apt 4" });
    renderAccount();

    const menuList = screen.getByRole("list", { name: /account options/i });
    await user.click(within(menuList).getByRole("button", { name: "Delivery Address" }));

    expect(screen.getByRole("heading", { level: 2, name: /delivery address/i })).toBeInTheDocument();
    const addressInput = screen.getByLabelText(/current address/i);
    expect(addressInput).toHaveValue("123 Market St, Apt 4");

    await user.clear(addressInput);
    await user.type(addressInput, "456 Ocean Ave, Suite 10");
    await user.click(screen.getByRole("button", { name: /update address/i }));

    expect(useSessionStore.getState().deliveryAddress).toBe("456 Ocean Ave, Suite 10");
  });

  // ── 5. Payment Methods Modal ──────────────────────────────────────────────

  it("opens Payment Methods modal displaying available methods", async () => {
    const user = userEvent.setup();
    renderAccount();

    const menuList = screen.getByRole("list", { name: /account options/i });
    await user.click(within(menuList).getByRole("button", { name: "Payment Methods" }));

    expect(screen.getByRole("heading", { level: 2, name: /payment methods/i })).toBeInTheDocument();
    expect(screen.getByText("Mastercard")).toBeInTheDocument();
    expect(screen.getByText(/•••• •••• •••• 4242/i)).toBeInTheDocument();
    expect(screen.getByText("Cash on Delivery")).toBeInTheDocument();
  });

  // ── 6. Promo Card Modal ───────────────────────────────────────────────────

  it("opens Promo Card modal showing available coupon codes", async () => {
    const user = userEvent.setup();
    renderAccount();

    const menuList = screen.getByRole("list", { name: /account options/i });
    await user.click(within(menuList).getByRole("button", { name: "Promo Card" }));

    expect(screen.getByRole("heading", { level: 2, name: /promo codes/i })).toBeInTheDocument();
    expect(screen.getByText("FRESH10")).toBeInTheDocument();
    expect(screen.getByText("SAVE20")).toBeInTheDocument();
  });

  // ── 7. Notifications Modal ────────────────────────────────────────────────

  it("opens Notifications modal and allows toggling checkboxes", async () => {
    const user = userEvent.setup();
    renderAccount();

    const menuList = screen.getByRole("list", { name: /account options/i });
    await user.click(within(menuList).getByRole("button", { name: "Notifications" }));

    expect(screen.getByRole("heading", { level: 2, name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByText("Order Updates")).toBeInTheDocument();
    expect(screen.getByText("Promotions & Discounts")).toBeInTheDocument();
    expect(screen.getByText("Email Newsletter")).toBeInTheDocument();

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(3);
    const firstCheckbox = checkboxes[0]!;
    expect(firstCheckbox).toBeChecked();

    await user.click(firstCheckbox);
    expect(firstCheckbox).not.toBeChecked();
  });

  // ── 8. Help & About Modals ────────────────────────────────────────────────

  it("opens Help and Support modal", async () => {
    const user = userEvent.setup();
    renderAccount();

    const menuList = screen.getByRole("list", { name: /account options/i });
    await user.click(within(menuList).getByRole("button", { name: "Help" }));

    expect(screen.getByRole("heading", { level: 2, name: /help & support/i })).toBeInTheDocument();
    expect(screen.getByText(/how do i track my delivery\?/i)).toBeInTheDocument();
  });

  it("opens About modal", async () => {
    const user = userEvent.setup();
    renderAccount();

    const menuList = screen.getByRole("list", { name: /account options/i });
    await user.click(within(menuList).getByRole("button", { name: "About" }));

    expect(screen.getByRole("heading", { level: 2, name: /about freshcart/i })).toBeInTheDocument();
    expect(screen.getByText(/version 1\.0\.0/i)).toBeInTheDocument();
  });

  // ── 9. Log Out ────────────────────────────────────────────────────────────

  it("opens log out confirmation and navigates to sign-in on confirm", async () => {
    const user = userEvent.setup();
    renderAccount();

    // Click main logout button
    await user.click(screen.getByRole("button", { name: "Log Out" }));

    const dialog = screen.getByRole("dialog", { name: "Log Out" });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/are you sure you want to log out/i)).toBeInTheDocument();

    // Click modal confirm button
    await user.click(within(dialog).getByRole("button", { name: "Log Out" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /get your groceries/i,
        }),
      ).toBeInTheDocument();
    });
  });

  // ── 10. Accessibility ─────────────────────────────────────────────────────

  it("has accessible menu list and items", () => {
    renderAccount();

    const menuList = screen.getByRole("list", { name: /account options/i });
    expect(menuList).toBeInTheDocument();
    const items = within(menuList).getAllByRole("listitem");
    expect(items.length).toBe(8);
  });
});
