import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  it("clears the template's draft once the note is copied to the chart", async () => {
    const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    // @ts-expect-error -- clipboard isn't part of jsdom's Navigator type
    globalThis.navigator.clipboard = clipboard;

    render(
      <MemoryRouter initialEntries={["/chartninja"]}>
        <ChartNinja />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Chest Pain/i }));
    fireEvent.click(screen.getByRole("button", { name: /Acute \(<1h\)/i }));
    fireEvent.click(screen.getByRole("button", { name: /Disposition Plan/i })); // expand the collapsed card
    fireEvent.click(screen.getByRole("button", { name: /Admit Tele/i }));

    const copyButton = await screen.findByRole("button", { name: /Copy for Chart/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}");
      expect(draft.fieldValues.admission).toEqual({});
    });
  });

  it("does not recount a restored draft as a new first-result completion", () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ templateId: "admission", fieldValues: { admission: { cc: "chest pain" } } }),
    );
    const gtag = vi.fn();
    globalThis.window.gtag = gtag;

    render(
      <MemoryRouter initialEntries={["/chartninja"]}>
        <ChartNinja />
      </MemoryRouter>,
    );

    expect(gtag).not.toHaveBeenCalledWith("event", "first_result_completed", expect.anything());
  });

  it("does not treat an empty post-copy/reset template entry as a restored draft", () => {
    // Shape left behind by handleNoteCopied / handleReset: a template key
    // with no field values — this is NOT a draft and must not suppress the
    // next real completion's analytics event.
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ templateId: "admission", fieldValues: { admission: {} } }));
    const gtag = vi.fn();
    globalThis.window.gtag = gtag;

    render(
      <MemoryRouter initialEntries={["/chartninja"]}>
        <ChartNinja />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Chest Pain/i }));

    expect(gtag).toHaveBeenCalledWith("event", "first_result_completed", { tool_id: "notes" });
  });
});
