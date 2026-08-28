import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { QuantityStepper } from "../../src/components/QuantityStepper";

describe("QuantityStepper", () => {
  it("displays the current quantity value", () => {
    render(
      <QuantityStepper value={3} onIncrement={vi.fn()} onDecrement={vi.fn()} />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls onIncrement when the plus button is clicked", async () => {
    const onIncrement = vi.fn();
    const user = userEvent.setup();

    render(
      <QuantityStepper value={1} onIncrement={onIncrement} onDecrement={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: /increase/i }));
    expect(onIncrement).toHaveBeenCalledOnce();
  });

  it("calls onDecrement when the minus button is clicked", async () => {
    const onDecrement = vi.fn();
    const user = userEvent.setup();

    render(
      <QuantityStepper value={3} onIncrement={vi.fn()} onDecrement={onDecrement} />,
    );

    await user.click(screen.getByRole("button", { name: /decrease/i }));
    expect(onDecrement).toHaveBeenCalledOnce();
  });

  it("disables the minus button at the minimum value", () => {
    render(
      <QuantityStepper value={1} min={1} onIncrement={vi.fn()} onDecrement={vi.fn()} />,
    );

    const minusButton = screen.getByRole("button", { name: /decrease/i });
    expect(minusButton).toBeDisabled();
  });

  it("does not disable minus when value is above minimum", () => {
    render(
      <QuantityStepper value={2} min={1} onIncrement={vi.fn()} onDecrement={vi.fn()} />,
    );

    const minusButton = screen.getByRole("button", { name: /decrease/i });
    expect(minusButton).not.toBeDisabled();
  });

  it("disables the plus button at the maximum value", () => {
    render(
      <QuantityStepper value={5} max={5} onIncrement={vi.fn()} onDecrement={vi.fn()} />,
    );

    const plusButton = screen.getByRole("button", { name: /increase/i });
    expect(plusButton).toBeDisabled();
  });

  it("has an accessible group role", () => {
    render(
      <QuantityStepper value={1} onIncrement={vi.fn()} onDecrement={vi.fn()} />,
    );

    expect(screen.getByRole("group", { name: /quantity/i })).toBeInTheDocument();
  });
});
