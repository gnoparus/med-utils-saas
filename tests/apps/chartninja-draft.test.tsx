import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ChartNinja from "../../src/apps/ChartNinja";

const DRAFT_KEY = "shiftside:chartninja:draft";

describe("ChartNinja draft persistence", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("persists a selected field to localStorage and restores it after remount", () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={["/chartninja"]}>
        <ChartNinja />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Chest Pain/i }));

    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}");
    expect(draft.fieldValues.admission.cc).toBe("chest pain");

    unmount();

    render(
      <MemoryRouter initialEntries={["/chartninja"]}>
        <ChartNinja />
      </MemoryRouter>,
    );

    // Progress ring reflects the restored selection instead of resetting to 0.
    expect(screen.getByText("1/5")).toBeTruthy();
  });
});
