import { describe, expect, it } from "vitest";
import { SEED_BOSS_DATA } from "./seed";

describe("boss seed data", () => {
  it("has entries for all 7 days of the week", () => {
    const days = new Set(SEED_BOSS_DATA.map((b) => b.dayOfWeek));
    expect(days.size).toBe(7);
    expect(days).toContain(0); // Sunday
    expect(days).toContain(1); // Monday
    expect(days).toContain(2); // Tuesday
    expect(days).toContain(3); // Wednesday
    expect(days).toContain(4); // Thursday
    expect(days).toContain(5); // Friday
    expect(days).toContain(6); // Saturday
  });

  it("has valid time format (HH:MM) for all entries", () => {
    const timeRegex = /^\d{2}:\d{2}$/;
    for (const entry of SEED_BOSS_DATA) {
      expect(entry.time).toMatch(timeRegex);
      const [h, m] = entry.time.split(":").map(Number);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(23);
      expect(m).toBeGreaterThanOrEqual(0);
      expect(m).toBeLessThanOrEqual(59);
    }
  });

  it("has valid category for all entries", () => {
    const validCategories = ["server", "world", "arena"];
    for (const entry of SEED_BOSS_DATA) {
      expect(validCategories).toContain(entry.category);
    }
  });

  it("has valid dayOfWeek (0-6) for all entries", () => {
    for (const entry of SEED_BOSS_DATA) {
      expect(entry.dayOfWeek).toBeGreaterThanOrEqual(0);
      expect(entry.dayOfWeek).toBeLessThanOrEqual(6);
    }
  });

  it("has non-empty bossNames for all entries", () => {
    for (const entry of SEED_BOSS_DATA) {
      expect(entry.bossNames.length).toBeGreaterThan(0);
    }
  });

  it("contains expected total number of entries", () => {
    // Based on the boss schedule image, we expect around 88 entries
    expect(SEED_BOSS_DATA.length).toBeGreaterThanOrEqual(80);
    expect(SEED_BOSS_DATA.length).toBeLessThanOrEqual(100);
  });

  it("Saturday has 黃昏巨人 at 18:00", () => {
    const satDusk = SEED_BOSS_DATA.find(
      (b) => b.dayOfWeek === 6 && b.time === "18:00"
    );
    expect(satDusk).toBeDefined();
    expect(satDusk!.bossNames).toContain("黃昏巨人");
  });
});
