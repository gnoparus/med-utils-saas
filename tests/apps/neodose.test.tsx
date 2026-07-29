import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NeoDose from "../../src/apps/NeoDose/index";
import { vi } from "vitest";

describe("NeoDose numpad", () => {
  beforeEach(() => {
    // @ts-expect-error -- vibrate isn't part of jsdom's Navigator type
    if (typeof globalThis.navigator === "undefined") globalThis.navigator = {};
    // @ts-expect-error -- vibrate isn't part of jsdom's Navigator type
    globalThis.navigator.vibrate = vi.fn();
  });

  it("clamps an out-of-range typed weight instead of silently dosing for a stale digit", () => {
    render(
      <MemoryRouter>
        <NeoDose />
      </MemoryRouter>,
    );

    // Initial weight is 10kg; open the manual entry numpad via the weight badge.
    const weightBadge = screen.getByText("10.0").closest("button")!;
    fireEvent.click(weightBadge);

    // Type "9" then "9" -> "99", above the 50kg ceiling. Query by role so
    // this doesn't collide with the raw-entry display echoing the same digit.
    const nineKey = screen.getByRole("button", { name: "9" });
    fireEvent.click(nineKey);
    fireEvent.click(nineKey);

    // The out-of-range string must never be shown while the committed weight
    // has silently stayed at a stale digit — it must clamp and both the
    // manual-entry display and the weight badge must agree on 50. (Scoped to
    // the badge specifically: a couple of locked pro-tier med cards happen to
    // freeze on "50.0" too, from their mount-time spring value in jsdom.)
    expect(screen.queryByText("99")).toBeNull();
    expect(screen.getByText("50")).toBeTruthy();
    expect(weightBadge.textContent).toContain("50.0");
  });

  it("reverts the manual entry display to the committed weight after backspacing to empty", () => {
    render(
      <MemoryRouter>
        <NeoDose />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("10.0").closest("button")!);
    fireEvent.click(screen.getByRole("button", { name: "9" }));

    const entryPanel = screen.getByText("Manual Weight Entry").parentElement!;
    expect(entryPanel.textContent).toContain("9kg"); // typed digit, weight committed to 9

    fireEvent.click(screen.getByRole("button", { name: "Backspace" }));

    // Must fall back to the committed weight (9.0), never a bare "0" while
    // the med cards are still dosed for 9.
    expect(entryPanel.textContent).toContain("9.0");
    expect(entryPanel.textContent).not.toContain("0.0kg");
  });

  it("resets the manual entry buffer when the slider moves, so typing doesn't append onto a stale digit", () => {
    render(
      <MemoryRouter>
        <NeoDose />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("10.0").closest("button")!);
    fireEvent.click(screen.getByRole("button", { name: "2" }));

    const slider = screen.getByRole("slider", { name: /Estimated weight/i });
    fireEvent.change(slider, { target: { value: "20" } });

    fireEvent.click(screen.getByRole("button", { name: "5" }));

    const entryPanel = screen.getByText("Manual Weight Entry").parentElement!;
    expect(entryPanel.textContent).toContain("5kg"); // fresh entry, not "25"
    expect(entryPanel.textContent).not.toContain("25");
  });
});
