import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "../../src/components/Button";

describe("Button", () => {
  it("renders children text content", () => {
    render(<Button>Add To Cart</Button>);

    expect(screen.getByRole("button", { name: "Add To Cart" })).toBeInTheDocument();
  });

  it("fires click handler on click", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Click Me</Button>);
    await user.click(screen.getByRole("button", { name: "Click Me" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("fires click handler on Enter key press", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Press Enter</Button>);
    screen.getByRole("button", { name: "Press Enter" }).focus();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("fires click handler on Space key press", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Press Space</Button>);
    screen.getByRole("button", { name: "Press Space" }).focus();
    await user.keyboard(" ");

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire click handler when disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick} disabled>Disabled</Button>);
    await user.click(screen.getByRole("button", { name: "Disabled" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies the primary variant class by default", () => {
    render(<Button>Primary</Button>);

    const button = screen.getByRole("button", { name: "Primary" });
    expect(button.className).toContain("btn-primary");
  });

  it("applies the secondary variant class", () => {
    render(<Button variant="secondary">Secondary</Button>);

    const button = screen.getByRole("button", { name: "Secondary" });
    expect(button.className).toContain("btn-secondary");
  });

  it("applies the ghost variant class", () => {
    render(<Button variant="ghost">Ghost</Button>);

    const button = screen.getByRole("button", { name: "Ghost" });
    expect(button.className).toContain("btn-ghost");
  });
});
