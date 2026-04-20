import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import NeoDose from "../../src/apps/NeoDose";
import TippingPoint from "../../src/apps/TippingPoint";
import DripDrop from "../../src/apps/DripDrop";
import LytesOut from "../../src/apps/LytesOut";
import NeuroSnap from "../../src/apps/NeuroSnap";
import ChartNinja from "../../src/apps/ChartNinja";

const appCases = [
  {
    route: "/neodose",
    heading: /Shiftside Dose/i,
    currentLink: /Open Shiftside Dose/i,
    alternateLink: /Open Shiftside ABG/i,
    Component: NeoDose,
  },
  {
    route: "/tippingpoint",
    heading: /Shiftside ABG/i,
    currentLink: /Open Shiftside ABG/i,
    alternateLink: /Open Shiftside Dose/i,
    Component: TippingPoint,
  },
  {
    route: "/dripdrop",
    heading: /Shiftside Drips/i,
    currentLink: /Open Shiftside Drips/i,
    alternateLink: /Open Shiftside Neuro/i,
    Component: DripDrop,
  },
  {
    route: "/lytesout",
    heading: /Shiftside Lytes/i,
    currentLink: /Open Shiftside Lytes/i,
    alternateLink: /Open Shiftside Notes/i,
    Component: LytesOut,
  },
  {
    route: "/neurosnap",
    heading: /Shiftside Neuro/i,
    currentLink: /Open Shiftside Neuro/i,
    alternateLink: /Open Shiftside Drips/i,
    Component: NeuroSnap,
  },
  {
    route: "/chartninja",
    heading: /Shiftside Notes/i,
    currentLink: /Open Shiftside Notes/i,
    alternateLink: /Open Shiftside Dose/i,
    Component: ChartNinja,
  },
] as const;

describe("App shell header", () => {
  describe.each(appCases)("$route", ({ route, heading, currentLink, alternateLink, Component }) => {
    it("renders the shared tool switcher with the active route highlighted", () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <Component />
        </MemoryRouter>,
      );

      expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
      expect(
        screen.getByRole("navigation", { name: /Switch Shiftside tools/i }),
      ).toBeTruthy();

      expect(screen.getByRole("link", { name: alternateLink })).toBeTruthy();
      expect(screen.getByRole("link", { name: currentLink })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  });

  it("navigates to another tool route from the shared switcher", () => {
    render(
      <MemoryRouter initialEntries={["/lytesout"]}>
        <Routes>
          <Route path="/lytesout" element={<LytesOut />} />
          <Route path="/dripdrop" element={<div>Drips destination</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("link", { name: /Open Shiftside Drips/i }));

    expect(screen.getByText("Drips destination")).toBeTruthy();
  });
});
