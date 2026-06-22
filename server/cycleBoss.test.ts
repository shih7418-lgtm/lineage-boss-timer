import { describe, expect, it } from "vitest";
import { CYCLE_BOSS_SEED_DATA } from "./cycleBossSeed";

describe("cycleBoss seed data", () => {
  it("contains at least 25 cycle bosses", () => {
    expect(CYCLE_BOSS_SEED_DATA.length).toBeGreaterThanOrEqual(25);
  });

  it("each entry has required fields", () => {
    for (const entry of CYCLE_BOSS_SEED_DATA) {
      expect(entry.region).toBeTruthy();
      expect(entry.location).toBeTruthy();
      expect(entry.bossName).toBeTruthy();
      expect(entry.respawnHours).toBeGreaterThan(0);
    }
  });

  it("includes key bosses from the user's image", () => {
    const bossNames = CYCLE_BOSS_SEED_DATA.map((b) => b.bossName);
    // 說話之島
    expect(bossNames).toContain("獻上祭品的庫約");
    // 古魯丁領地
    expect(bossNames).toContain("殺戮者");
    // 妖魔森林
    expect(bossNames).toContain("奈克倍斯");
    // 亞丁領地
    expect(bossNames).toContain("審判者拉馬修");
    expect(bossNames).toContain("嚎叫山峰的烏爾森");
    // 奇岩領地
    expect(bossNames).toContain("頭目哈格瑪");
    // 海音領地
    expect(bossNames).toContain("史前巨鱷");
    // 古魯丁地監
    expect(bossNames).toContain("四色");
    expect(bossNames).toContain("奧杜亞");
    expect(bossNames).toContain("乞洛");
  });

  it("has correct respawn hours for key bosses", () => {
    const findBoss = (name: string) => CYCLE_BOSS_SEED_DATA.find((b) => b.bossName === name);
    expect(findBoss("獻上祭品的庫約")?.respawnHours).toBe(6);
    expect(findBoss("嚎叫山峰的烏爾森")?.respawnHours).toBe(12);
    expect(findBoss("四色")?.respawnHours).toBe(12);
    expect(findBoss("殺戮者")?.respawnHours).toBe(4);
    expect(findBoss("奈克倍斯")?.respawnHours).toBe(8);
    expect(findBoss("史前巨鱷")?.respawnHours).toBe(8);
  });

  it("has correct regions", () => {
    const regions = [...new Set(CYCLE_BOSS_SEED_DATA.map((b) => b.region))];
    expect(regions).toContain("說話之島");
    expect(regions).toContain("古魯丁領地");
    expect(regions).toContain("風木領地");
    expect(regions).toContain("妖魔森林");
    expect(regions).toContain("妖精森林");
    expect(regions).toContain("亞丁領地");
    expect(regions).toContain("奇岩領地");
    expect(regions).toContain("歐瑞領地");
    expect(regions).toContain("海音領地");
    expect(regions).toContain("古魯丁地監");
  });
});
