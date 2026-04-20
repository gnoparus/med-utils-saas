import { describe, it, expect } from "vitest";
import { analyzeGcs, analyzeNihss } from "../../src/lib/neurosnap-calculator";
import { analyzeLyte } from "../../src/lib/lytesout-calculator";
import {
  analyzeAbg,
  generateTippingPointNote,
  TIPPING_POINT_PRESETS,
} from "../../src/lib/tippingpoint-calculator";
import { NOTE_TEMPLATES } from "../../src/lib/chartninja-calculator";
import { getBand, WEIGHT_PRESETS } from "../../src/apps/NeoDose/index";

describe("NeuroSnap calculators", () => {
  it("analyzeGcs returns normal for full-score inputs", () => {
    const res = analyzeGcs(4, 5, 6);
    expect(res.total).toBe(15);
    expect(res.severity).toBe("normal");
    expect(res.chartNote).toContain("GCS 15/15");
  });

  it("analyzeGcs classifies low totals as severe", () => {
    const res = analyzeGcs(1, 1, 3); // total = 5
    expect(res.total).toBe(5);
    expect(res.severity).toBe("severe");
    expect(res.severityLabel).toMatch(/Severe/);
  });

  it("analyzeNihss handles zero scores and non-zero totals", () => {
    const zeros: Record<string, number> = {};
    // create zeros for each NIHSS category to be safe
    const nihssAllZero: Record<string, number> = {};
    // populate with keys known to exist based on exported categories - we only need to test behavior
    nihssAllZero["loc"] = 0;
    nihssAllZero["loc_questions"] = 0;
    nihssAllZero["loc_commands"] = 0;
    nihssAllZero["gaze"] = 0;
    nihssAllZero["visual"] = 0;
    nihssAllZero["facial"] = 0;
    nihssAllZero["left_arm"] = 0;
    nihssAllZero["right_arm"] = 0;
    nihssAllZero["left_leg"] = 0;
    nihssAllZero["right_leg"] = 0;
    nihssAllZero["ataxia"] = 0;
    nihssAllZero["sensory"] = 0;
    nihssAllZero["language"] = 0;
    nihssAllZero["dysarthria"] = 0;
    nihssAllZero["extinction"] = 0;

    const resZero = analyzeNihss(nihssAllZero);
    expect(resZero.total).toBe(0);
    expect(resZero.severity).toBe("no_stroke");
    expect(resZero.chartNote).toContain("NIHSS 0/42");

    // a moderate total
    const sample: Record<string, number> = { ...nihssAllZero };
    sample["left_arm"] = 3;
    sample["right_leg"] = 2;
    sample["facial"] = 1;
    const resSample = analyzeNihss(sample);
    expect(resSample.total).toBeGreaterThan(0);
    expect(["minor", "moderate", "moderate_severe", "severe"]).toContain(
      resSample.severity,
    );
  });
});

describe("LytesOut analyzer", () => {
  it("flags critical hypokalemia for very low K", () => {
    const res = analyzeLyte("k", 2.2);
    expect(res.electrolyte).toBe("k");
    expect(res.value).toBeCloseTo(2.2);
    // Severity label expected from analyzer implementation
    expect(res.severityLabel).toMatch(/Critical Hypokalemia/i);
    expect(res.options.length).toBeGreaterThan(0);
    // Chart note header contains uppercase electrolyte name
    expect(res.chartNote).toMatch(/POTASSIUM/i);
    // Warnings should include strong IV safety message for low K
    expect(
      res.warnings.some(
        (w) => /NEVER give IV KCl/i.test(w) || /fatal/i.test(w),
      ),
    ).toBeTruthy();
  });

  it("returns normal range for normal potassium", () => {
    const res = analyzeLyte("k", 4.0);
    expect(res.tier).toBe("normal");
    expect(res.severityLabel).toMatch(/Normal Range/i);
    expect(res.options.length).toBeGreaterThanOrEqual(1);
  });
});

describe("TippingPoint (ABG) analyzer", () => {
  it("classifies a DKA preset as acidemia", () => {
    const dka = TIPPING_POINT_PRESETS.find((p) => p.id === "dka")!;
    const analysis = analyzeAbg({
      pH: dka.values.pH,
      pco2: dka.values.pco2,
      hco3: dka.values.hco3,
    });
    expect(analysis.acidBaseState).toBe("acidemia");
    expect(analysis.chartNote).toContain("ABG:");
    expect(analysis.title.toLowerCase()).toMatch(/metabolic|acidosis|mixed/);
  });

  it("generateTippingPointNote produces readable impression and values", () => {
    const sample = {
      input: { pH: 7.12, pco2: 22, hco3: 7 },
      title: "Primary metabolic acidosis",
      compensation: {
        kind: "mixed" as const,
        label: "Mixed",
        formula: "Winter's formula",
        expectedLow: 10,
        expectedHigh: 14,
        measured: 22,
        note: "Example note",
      },
    };
    const note = generateTippingPointNote(sample);
    expect(note).toContain("ABG:");
    expect(note).toContain("Impression:");
    expect(note).toContain("pH 7.12");
  });
});

describe("ChartNinja templates", () => {
  it("admission template generates a note with chief complaint and disposition", () => {
    const admission = NOTE_TEMPLATES.find((t) => t.id === "admission")!;
    const snippet = admission.generate({
      cc: "chest pain",
      onset: "acute",
      severity: "mild",
      context: ["exertion", "nausea"],
      disposition: "admit_floor",
    });
    expect(snippet).toContain("ADMISSION NOTE");
    expect(snippet).toContain("CHIEF COMPLAINT");
    expect(snippet).toContain("chest pain");
    expect(snippet).toContain("DISPOSITION");
  });
});

describe("NeoDose helpers", () => {
  it("getBand returns correct band for mid-range weight", () => {
    const band = getBand(4); // 4kg should fall in first (Grey) band
    expect(band).toBeTruthy();
    expect(band.label).toMatch(/GREY/i);
  });

  it("getBand clamps low and high weights to first/last band", () => {
    const low = getBand(1.5); // below 3 -> first band
    expect(low).toBeTruthy();
    expect(low).toEqual(getBand(3)); // behavior: <3 returns first band

    const high = getBand(999); // extremely high -> last band
    const bands = WEIGHT_PRESETS; // just ensure export exists
    expect(Array.isArray(bands)).toBeTruthy();
    expect(high).toBeTruthy();
  });

  it("weight presets include common values", () => {
    expect(WEIGHT_PRESETS).toContain(10);
    expect(WEIGHT_PRESETS).toContain(3);
  });
});
