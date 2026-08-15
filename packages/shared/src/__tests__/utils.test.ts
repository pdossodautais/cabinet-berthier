import { describe, it, expect } from "vitest";
import { formatPrice, formatSurface, slugify, getPropertyTypeLabel, getTransactionTypeLabel, getContactStatusLabel, getEstimationStatusLabel, getAgentRoleLabel, getDocumentTypeLabel } from "../utils";

describe("formatPrice", () => {
  it("formats price in EUR", () => {
    expect(formatPrice(250000)).toContain("250");
    expect(formatPrice(250000)).toContain("€");
  });
  it("handles zero", () => {
    expect(formatPrice(0)).toContain("0");
  });
  it("formats large numbers with spacing", () => {
    const result = formatPrice(1500000);
    expect(result).toContain("€");
  });
});

describe("formatSurface", () => {
  it("formats surface with m²", () => {
    expect(formatSurface(85)).toBe("85 m²");
  });
  it("handles zero", () => {
    expect(formatSurface(0)).toBe("0 m²");
  });
});

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("removes accents", () => {
    expect(slugify("Appartement à Châtelet")).toBe("appartement-a-chatelet");
  });
  it("replaces special chars with hyphens", () => {
    expect(slugify("hello & world!")).toBe("hello-world");
  });
  it("removes leading/trailing hyphens", () => {
    expect(slugify("-hello-")).toBe("hello");
  });
  it("handles multiple spaces/special chars", () => {
    expect(slugify("a   b---c")).toBe("a-b-c");
  });
  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("getPropertyTypeLabel", () => {
  it("returns label for known type", () => {
    expect(getPropertyTypeLabel("appartement")).toBe("Appartement");
    expect(getPropertyTypeLabel("maison")).toBe("Maison");
    expect(getPropertyTypeLabel("terrain")).toBe("Terrain");
    expect(getPropertyTypeLabel("commerce")).toBe("Commerce");
    expect(getPropertyTypeLabel("bureau")).toBe("Bureau");
  });
  it("returns raw value for unknown type", () => {
    expect(getPropertyTypeLabel("unknown")).toBe("unknown");
  });
});

describe("getTransactionTypeLabel", () => {
  it("returns label for known type", () => {
    expect(getTransactionTypeLabel("vente")).toBe("Vente");
    expect(getTransactionTypeLabel("location")).toBe("Location");
  });
  it("returns raw value for unknown type", () => {
    expect(getTransactionTypeLabel("unknown")).toBe("unknown");
  });
});

describe("getContactStatusLabel", () => {
  it("returns label for known status", () => {
    expect(getContactStatusLabel("nouveau")).toBe("Nouveau");
    expect(getContactStatusLabel("lu")).toBe("Lu");
    expect(getContactStatusLabel("traité")).toBe("Traité");
    expect(getContactStatusLabel("archivé")).toBe("Archivé");
  });
  it("returns raw value for unknown status", () => {
    expect(getContactStatusLabel("unknown")).toBe("unknown");
  });
});

describe("getEstimationStatusLabel", () => {
  it("returns label for known status", () => {
    expect(getEstimationStatusLabel("nouveau")).toBe("Nouveau");
    expect(getEstimationStatusLabel("en_cours")).toBe("En cours");
    expect(getEstimationStatusLabel("terminé")).toBe("Terminé");
  });
  it("returns raw value for unknown status", () => {
    expect(getEstimationStatusLabel("xyz")).toBe("xyz");
  });
});

describe("getAgentRoleLabel", () => {
  it("returns label for known role", () => {
    expect(getAgentRoleLabel("admin")).toBe("Administrateur");
    expect(getAgentRoleLabel("agent")).toBe("Agent");
  });
  it("returns raw value for unknown role", () => {
    expect(getAgentRoleLabel("superadmin")).toBe("superadmin");
  });
});

describe("getDocumentTypeLabel", () => {
  it("returns label for known type", () => {
    expect(getDocumentTypeLabel("plan")).toBe("Plan");
    expect(getDocumentTypeLabel("diagnostic")).toBe("Diagnostic");
    expect(getDocumentTypeLabel("document")).toBe("Document");
  });
  it("returns raw value for unknown type", () => {
    expect(getDocumentTypeLabel("other")).toBe("other");
  });
});
