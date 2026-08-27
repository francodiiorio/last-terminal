import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import PowerApp from "@/os/apps/PowerApp";
import { useGameStore } from "@/store";

function powerRow(name: string) {
  return screen.getByText(name).closest(".power-row") as HTMLElement;
}

describe("PowerApp", () => {
  beforeEach(() => {
    useGameStore.getState().newGame();
  });

  it("shows the default power allocation", () => {
    render(<PowerApp />);
    expect(within(powerRow("Life Support")).getByRole("button")).toHaveTextContent("ON");
    expect(within(powerRow("Security")).getByRole("button")).toHaveTextContent("OFF");
  });

  it("denies enabling Security while there isn't enough headroom", () => {
    render(<PowerApp />);
    fireEvent.click(within(powerRow("Security")).getByRole("button"));
    expect(screen.getByText(/INSUFFICIENT HEADROOM/)).toBeInTheDocument();
    expect(within(powerRow("Security")).getByRole("button")).toHaveTextContent("OFF");
  });

  it("allows enabling Security after switching Cameras off", () => {
    render(<PowerApp />);
    fireEvent.click(within(powerRow("Cameras")).getByRole("button"));
    fireEvent.click(within(powerRow("Security")).getByRole("button"));
    expect(within(powerRow("Security")).getByRole("button")).toHaveTextContent("ON");
  });

  it("a locked system's toggle is disabled", () => {
    render(<PowerApp />);
    expect(within(powerRow("Navigation")).getByRole("button")).toBeDisabled();
  });
});
