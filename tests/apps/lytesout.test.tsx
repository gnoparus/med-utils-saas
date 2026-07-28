import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LytesOut from "../../src/apps/LytesOut/index";
import { vi } from "vitest";

describe("LytesOut UI", () => {
  beforeEach(() => {
    // stub clipboard writeText and ensure vibrate exists
    const clipboard = { writeText: vi.fn() };
    // keep existing navigator if any, but ensure clipboard and vibrate are present
    // @ts-expect-error -- jsdom's Navigator type forbids reassignment
    if (typeof globalThis.navigator === "undefined") globalThis.navigator = {};
    // @ts-expect-error -- clipboard isn't part of jsdom's Navigator type
    globalThis.navigator.clipboard = clipboard;
    // @ts-expect-error -- vibrate isn't part of jsdom's Navigator type
    globalThis.navigator.vibrate =
      typeof globalThis.navigator.vibrate === "function"
        ? globalThis.navigator.vibrate
        : () => true;
  });

  afterEach(() => {
    // @ts-expect-error -- clipboard isn't part of jsdom's Navigator type
    if (
      globalThis.navigator &&
      globalThis.navigator.clipboard &&
      typeof globalThis.navigator.clipboard.writeText === "function"
    ) {
      // restore mock calls
      const writeText = globalThis.navigator.clipboard.writeText as unknown as ReturnType<typeof vi.fn>;
      writeText.mockClear?.();
    }
  });

  it("renders, switches tabs, interacts with presets & numpad, and copies chart note", async () => {
    render(
      <MemoryRouter>
        <LytesOut />
      </MemoryRouter>,
    );

    // Header visible (use heading role to avoid matching the Pro teaser)
    expect(screen.getByRole("heading", { name: /Shiftside Lytes/i })).toBeTruthy();

    // Click Magnesium tab (label in UI is 'Mg²⁺')
    const mgTab = screen.getByText("Mg²⁺");
    fireEvent.click(mgTab);

    // Page shows Magnesium fullName somewhere (allow multiple matches)
    const magnesiumMatches = screen.getAllByText(/Magnesium/i);
    expect(magnesiumMatches.length).toBeGreaterThan(0);

    // Attempt to click a quick preset button (first numeric-labeled button found)
    const numericButtons = screen.getAllByRole("button", { name: /[0-9]/i });
    // find one that looks like a preset (we pick the first numeric button that's not the header/back button)
    if (numericButtons.length > 0) {
      // Click the first numeric-looking button (likely a preset)
      fireEvent.click(numericButtons[0]);
    }

    // Open the bottom input deck (collapsed trigger shows "Serum {FullName}")
    // Use a regex to match "Serum Magnesium" (case-insensitive)
    const serumTrigger = screen.getByText(/Serum\s+Magnesium/i);
    fireEvent.click(serumTrigger);

    // Now numpad should be visible; click a digit key '1'
    const keyOne = await screen.findByText("1");
    fireEvent.click(keyOne);

    // Click Done · Analyze to close numpad / trigger analysis
    const doneBtn = screen.getByText(/Done\s*·\s*Analyze/i);
    fireEvent.click(doneBtn);

    // Click Copy Chart Note button at the bottom (text reads 'Copy Chart Note' or 'Copied for Chart')
    const copyBtn = screen.getByRole("button", {
      name: /Copy Chart Note|Copied for Chart/i,
    });
    fireEvent.click(copyBtn);

    // Ensure clipboard writeText was invoked with some string
    await waitFor(() => {
      const writeText = navigator.clipboard.writeText as unknown as ReturnType<typeof vi.fn>;
      expect(writeText).toHaveBeenCalled();
      // Optionally assert it was called with a non-empty string
      const calledWith = writeText.mock.calls[0][0];
      expect(typeof calledWith).toBe("string");
      expect(calledWith.length).toBeGreaterThan(0);
    });
  });
});
