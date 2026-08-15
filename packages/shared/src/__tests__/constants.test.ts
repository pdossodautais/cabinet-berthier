import { describe, it, expect } from "vitest";
import { PROPERTY_TYPES, TRANSACTION_TYPES, CONTACT_STATUSES, ESTIMATION_STATUSES, AGENT_ROLES, DOCUMENT_TYPES, ROOM_OPTIONS, ENERGY_RATINGS, DPE_COLORS, GES_COLORS } from "../constants";

describe("PROPERTY_TYPES", () => {
  it("has 5 types", () => {
    expect(PROPERTY_TYPES).toHaveLength(5);
  });
  it("each type has value and label", () => {
    PROPERTY_TYPES.forEach((t) => {
      expect(t).toHaveProperty("value");
      expect(t).toHaveProperty("label");
      expect(t.value).toBeTruthy();
      expect(t.label).toBeTruthy();
    });
  });
  it("contains expected values", () => {
    const values = PROPERTY_TYPES.map((t) => t.value);
    expect(values).toContain("appartement");
    expect(values).toContain("maison");
    expect(values).toContain("terrain");
  });
});

describe("TRANSACTION_TYPES", () => {
  it("has 2 types", () => {
    expect(TRANSACTION_TYPES).toHaveLength(2);
  });
  it("contains vente and location", () => {
    const values = TRANSACTION_TYPES.map((t) => t.value);
    expect(values).toContain("vente");
    expect(values).toContain("location");
  });
});

describe("CONTACT_STATUSES", () => {
  it("has 4 statuses", () => {
    expect(CONTACT_STATUSES).toHaveLength(4);
  });
  it("contains expected workflow", () => {
    const values = CONTACT_STATUSES.map((s) => s.value);
    expect(values).toEqual(["nouveau", "lu", "traité", "archivé"]);
  });
});

describe("ESTIMATION_STATUSES", () => {
  it("has 3 statuses", () => {
    expect(ESTIMATION_STATUSES).toHaveLength(3);
  });
  it("contains expected values", () => {
    const values = ESTIMATION_STATUSES.map((s) => s.value);
    expect(values).toContain("nouveau");
    expect(values).toContain("en_cours");
    expect(values).toContain("terminé");
  });
});

describe("AGENT_ROLES", () => {
  it("has 2 roles", () => {
    expect(AGENT_ROLES).toHaveLength(2);
  });
  it("contains admin and agent", () => {
    const values = AGENT_ROLES.map((r) => r.value);
    expect(values).toContain("admin");
    expect(values).toContain("agent");
  });
});

describe("DOCUMENT_TYPES", () => {
  it("has 3 types", () => {
    expect(DOCUMENT_TYPES).toHaveLength(3);
  });
  it("contains expected values", () => {
    const values = DOCUMENT_TYPES.map((d) => d.value);
    expect(values).toContain("plan");
    expect(values).toContain("diagnostic");
    expect(values).toContain("document");
  });
});

describe("ROOM_OPTIONS", () => {
  it("has 5 options", () => {
    expect(ROOM_OPTIONS).toHaveLength(5);
  });
});

describe("ENERGY_RATINGS", () => {
  it("has 7 ratings from A to G", () => {
    expect(ENERGY_RATINGS).toHaveLength(7);
    expect(ENERGY_RATINGS[0]).toBe("A");
    expect(ENERGY_RATINGS[6]).toBe("G");
  });
});

describe("DPE_COLORS", () => {
  it("has color for each energy rating", () => {
    ENERGY_RATINGS.forEach((rating) => {
      expect(DPE_COLORS[rating]).toHaveProperty("bg");
      expect(DPE_COLORS[rating]).toHaveProperty("text");
    });
  });
});

describe("GES_COLORS", () => {
  it("has color for each energy rating", () => {
    ENERGY_RATINGS.forEach((rating) => {
      expect(GES_COLORS[rating]).toHaveProperty("bg");
      expect(GES_COLORS[rating]).toHaveProperty("text");
    });
  });
});
