/**
 * 天堂W固定王重生時間表
 * 一週七天固定時間重生模式
 * 
 * 星期：0=日, 1=一, 2=二, 3=三, 4=四, 5=五, 6=六
 */

// Boss 分類
export type BossCategory = "server" | "world" | "arena";

// 單一 Boss 排程項目
export interface BossScheduleEntry {
  id: string;
  name: string;
  time: string; // HH:MM 格式
  day: number; // 0-6 (日-六)
  category: BossCategory; // 服內/世界/競技場
  maySkip: boolean; // (%) 可能輪空
  note?: string; // 備註（如 ~21:40）
}

// 通知設定
export interface NotificationSettings {
  [bossId: string]: boolean; // true=開啟通知, false=關閉
}

// 取得星期幾的名稱
export function getDayName(day: number, locale: string = "zh-TW"): string {
  const names: Record<string, string[]> = {
    "zh-TW": ["日", "一", "二", "三", "四", "五", "六"],
    "ko": ["일", "월", "화", "수", "목", "금", "토"],
    "en": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  };
  return (names[locale] || names["zh-TW"])[day];
}

// 取得分類顏色
export function getCategoryColor(cat: BossCategory): string {
  switch (cat) {
    case "server": return "text-muted-foreground";
    case "world": return "text-[oklch(0.65_0.15_250)]";
    case "arena": return "text-[oklch(0.65_0.22_25)]";
  }
}

export function getCategoryLabel(cat: BossCategory, locale: string = "zh-TW"): string {
  const labels: Record<string, Record<BossCategory, string>> = {
    "zh-TW": { server: "服內", world: "世界", arena: "競技場" },
    "ko": { server: "서버", world: "월드", arena: "아레나" },
    "en": { server: "Server", world: "World", arena: "Arena" },
  };
  return (labels[locale] || labels["zh-TW"])[cat];
}

// 計算到下一次出現的剩餘時間
export function getTimeUntilNextSpawn(entry: BossScheduleEntry): {
  totalMinutes: number;
  hours: number;
  minutes: number;
  isToday: boolean;
  nextDate: Date;
} {
  const now = new Date();
  const [h, m] = entry.time.split(":").map(Number);
  const currentDay = now.getDay();
  
  let dayDiff = entry.day - currentDay;
  if (dayDiff < 0) dayDiff += 7;
  
  if (dayDiff === 0) {
    const targetMinutes = h * 60 + m;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    if (currentMinutes >= targetMinutes) {
      dayDiff = 7;
    }
  }
  
  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + dayDiff);
  nextDate.setHours(h, m, 0, 0);
  
  const diffMs = nextDate.getTime() - now.getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  
  return {
    totalMinutes,
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    isToday: dayDiff === 0,
    nextDate,
  };
}

// 格式化剩餘時間
export function formatCountdown(totalMinutes: number, locale: string = "zh-TW"): string {
  if (totalMinutes <= 0) return "NOW!";
  const d = Math.floor(totalMinutes / 1440);
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  if (locale === "en") {
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
  if (d > 0) return `${d}天 ${h}時 ${m}分`;
  if (h > 0) return `${h}時 ${m}分`;
  return `${m}分`;
}

// localStorage 鍵
const NOTIFICATION_KEY = "lineage_boss_notifications";

export function loadNotificationSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(NOTIFICATION_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load notification settings:", e);
  }
  return {};
}

export function saveNotificationSettings(settings: NotificationSettings) {
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(settings));
}

export function isBossNotificationEnabled(settings: NotificationSettings, bossId: string): boolean {
  return settings[bossId] !== false;
}

/**
 * 完整的固定王時間表
 * 根據 2026/05/01 更新 by 天狂月
 */
export const FIXED_BOSS_SCHEDULE: BossScheduleEntry[] = [
  // === 07:10 ===
  { id: "0710-thu-fly-dragon", name: "遺忘飛龍王(%)", time: "07:10", day: 4, category: "server", maySkip: true },
  { id: "0710-fri-fly-dragon", name: "遺忘飛龍王(%)", time: "07:10", day: 5, category: "server", maySkip: true },

  // === 12:00 ===
  { id: "1200-mon-paradise", name: "樂園精靈王(%)", time: "12:00", day: 1, category: "server", maySkip: true },
  { id: "1200-tue-paradise", name: "樂園精靈王(%)", time: "12:00", day: 2, category: "server", maySkip: true },
  { id: "1200-wed-paradise", name: "樂園精靈王(%)", time: "12:00", day: 3, category: "server", maySkip: true },
  { id: "1200-thu-paradise", name: "樂園精靈王(%)", time: "12:00", day: 4, category: "server", maySkip: true },
  { id: "1200-fri-paradise", name: "樂園精靈王(%)", time: "12:00", day: 5, category: "server", maySkip: true },
  { id: "1200-sat-paradise", name: "樂園精靈王(%)", time: "12:00", day: 6, category: "server", maySkip: true },
  { id: "1200-sun-paradise", name: "樂園精靈王(%)", time: "12:00", day: 0, category: "server", maySkip: true },

  // === 15:00 ===
  { id: "1500-mon-ant", name: "巨蟻女皇、象5死亡(%)", time: "15:00", day: 1, category: "server", maySkip: true },
  { id: "1500-tue-ant", name: "巨蟻女皇、象5古拉(%)", time: "15:00", day: 2, category: "server", maySkip: true },
  { id: "1500-wed-ant", name: "巨蟻女皇", time: "15:00", day: 3, category: "server", maySkip: false },
  { id: "1500-thu-ant", name: "巨蟻女皇、象5古拉(%)", time: "15:00", day: 4, category: "server", maySkip: true },
  { id: "1500-fri-ant", name: "巨蟻女皇、象8墮落惡魔(%)", time: "15:00", day: 5, category: "server", maySkip: true },

  // === 15:10 ===
  { id: "1510-thu-fly-dragon", name: "遺忘飛龍王(%)", time: "15:10", day: 4, category: "server", maySkip: true },
  { id: "1510-fri-fly-dragon", name: "遺忘飛龍王(%)", time: "15:10", day: 5, category: "server", maySkip: true },

  // === 18:00 ===
  { id: "1800-fri-dusk", name: "黃昏巨人", time: "18:00", day: 5, category: "world", maySkip: false },
  { id: "1800-sat-dusk", name: "黃昏巨人", time: "18:00", day: 6, category: "world", maySkip: false },

  // === 18:10 ===
  { id: "1810-mon", name: "克特、做1傑尼斯王", time: "18:10", day: 1, category: "server", maySkip: false },
  { id: "1810-tue", name: "克特、做1傑尼斯女王、做2幻象眼魔", time: "18:10", day: 2, category: "server", maySkip: false },
  { id: "1810-wed", name: "克特、做1傑尼斯女王、做2幻象眼魔", time: "18:10", day: 3, category: "server", maySkip: false },
  { id: "1810-thu", name: "克特、做1傑尼斯女王、做2幻象眼魔", time: "18:10", day: 4, category: "server", maySkip: false },
  { id: "1810-fri", name: "克特、做1傑尼斯女王、做2幻象眼魔", time: "18:10", day: 5, category: "server", maySkip: false },
  { id: "1810-sat", name: "克特、做1傑尼斯女王、做2幻象眼魔", time: "18:10", day: 6, category: "server", maySkip: false },
  { id: "1810-sun", name: "克特、做1傑尼斯女王、做2幻象眼魔", time: "18:10", day: 0, category: "server", maySkip: false },

  // === 18:15 ===
  { id: "1815-mon", name: "阿勒尼亞、做3吸血鬼、做4殭屍王", time: "18:15", day: 1, category: "server", maySkip: false },
  { id: "1815-tue", name: "阿勒尼亞、做3吸血鬼、做4殭屍王", time: "18:15", day: 2, category: "server", maySkip: false },
  { id: "1815-wed", name: "阿勒尼亞、做3吸血鬼、做4殭屍王", time: "18:15", day: 3, category: "server", maySkip: false },
  { id: "1815-thu", name: "阿勒尼亞、做3吸血鬼、做4殭屍王", time: "18:15", day: 4, category: "server", maySkip: false },
  { id: "1815-fri", name: "阿勒尼亞、做3吸血鬼、做4殭屍王", time: "18:15", day: 5, category: "server", maySkip: false },
  { id: "1815-sat", name: "阿勒尼亞、做3吸血鬼、做4殭屍王", time: "18:15", day: 6, category: "server", maySkip: false },
  { id: "1815-sun", name: "阿勒尼亞、做3吸血鬼、做4殭屍王", time: "18:15", day: 0, category: "server", maySkip: false },

  // === 18:20 ===
  { id: "1820-mon", name: "做5黑豹、做6木乃伊、地底馬托爾、火窟不死鳥", time: "18:20", day: 1, category: "server", maySkip: false },
  { id: "1820-tue", name: "做5黑豹、做6木乃伊、地底馬托爾、地底塔坤", time: "18:20", day: 2, category: "server", maySkip: false },
  { id: "1820-wed", name: "做5黑豹、做6木乃伊、地底馬托爾、火窟不死鳥", time: "18:20", day: 3, category: "server", maySkip: false },
  { id: "1820-thu", name: "做5黑豹、做6木乃伊、地底馬托爾、地底塔坤", time: "18:20", day: 4, category: "server", maySkip: false },
  { id: "1820-fri", name: "做5黑豹、做6木乃伊、地底馬托爾、火窟不死鳥", time: "18:20", day: 5, category: "server", maySkip: false },
  { id: "1820-sat", name: "做5黑豹、做6木乃伊、地底馬托爾、地底塔坤", time: "18:20", day: 6, category: "server", maySkip: false },
  { id: "1820-sun", name: "做5黑豹、做6木乃伊、地底馬托爾、火窟不死鳥", time: "18:20", day: 0, category: "server", maySkip: false },

  // === 19:00 ===
  { id: "1900-fri-event", name: "活動：大花草", time: "19:00", day: 5, category: "world", maySkip: false },
  { id: "1900-sat-event", name: "活動：激戰地", time: "19:00", day: 6, category: "world", maySkip: false },

  // === 19:10 ===
  { id: "1910-mon", name: "巫師、阿爾斯卡利亞", time: "19:10", day: 1, category: "world", maySkip: false },
  { id: "1910-tue", name: "巫師、阿爾斯卡利亞", time: "19:10", day: 2, category: "world", maySkip: false },
  { id: "1910-wed", name: "巫師、阿爾斯卡利亞", time: "19:10", day: 3, category: "world", maySkip: false },
  { id: "1910-thu", name: "巫師、阿爾斯卡利亞", time: "19:10", day: 4, category: "world", maySkip: false },
  { id: "1910-fri", name: "巫師、阿爾斯卡利亞", time: "19:10", day: 5, category: "world", maySkip: false },
  { id: "1910-sat", name: "巫師、阿爾斯卡利亞", time: "19:10", day: 6, category: "world", maySkip: false },
  { id: "1910-sun", name: "巫師、阿爾斯卡利亞", time: "19:10", day: 0, category: "world", maySkip: false },

  // === 19:15 ===
  { id: "1915-mon", name: "做7艾莉絲、做8騎士范德、做9巫妖", time: "19:15", day: 1, category: "server", maySkip: false },
  { id: "1915-tue", name: "做7艾莉絲、做8騎士范德、做9巫妖", time: "19:15", day: 2, category: "server", maySkip: false },
  { id: "1915-wed", name: "做7艾莉絲、做8騎士范德、做9巫妖", time: "19:15", day: 3, category: "server", maySkip: false },
  { id: "1915-thu", name: "做7艾莉絲、做8騎士范德、做9巫妖", time: "19:15", day: 4, category: "server", maySkip: false },
  { id: "1915-fri", name: "做7艾莉絲、做8騎士范德、做9巫妖", time: "19:15", day: 5, category: "server", maySkip: false },
  { id: "1915-sat", name: "做7艾莉絲、做8騎士范德、做9巫妖", time: "19:15", day: 6, category: "server", maySkip: false },
  { id: "1915-sun", name: "做7艾莉絲、做8騎士范德、做9巫妖", time: "19:15", day: 0, category: "server", maySkip: false },

  // === 19:20 ===
  { id: "1920-mon", name: "萊奧斯、鑽石高爺、死亡騎士(%)、做10烏格奴斯", time: "19:20", day: 1, category: "world", maySkip: true },
  { id: "1920-tue", name: "萊奧斯、船長卡利索、死亡騎士(%)、做10烏格奴斯", time: "19:20", day: 2, category: "world", maySkip: true },
  { id: "1920-wed", name: "萊奧斯、巨大飛龍、死亡騎士(%)、做10烏格奴斯", time: "19:20", day: 3, category: "world", maySkip: true },
  { id: "1920-thu", name: "萊奧斯、巨大蜈蚣、死亡騎士(%)、做10烏格奴斯", time: "19:20", day: 4, category: "world", maySkip: true },
  { id: "1920-fri", name: "萊奧斯、大黑長者、死亡騎士(%)、做10烏格奴斯", time: "19:20", day: 5, category: "world", maySkip: true },
  { id: "1920-sat", name: "萊奧斯、狂風夏斯奇、死亡騎士(%)、做10烏格奴斯", time: "19:20", day: 6, category: "world", maySkip: true },
  { id: "1920-sun", name: "萊奧斯、漆黑的死亡騎士、死亡騎士(%)、做10烏格奴斯", time: "19:20", day: 0, category: "world", maySkip: true },

  // === 20:00 活動 ===
  { id: "2000-mon-event", name: "活動：魔族戰", time: "20:00", day: 1, category: "arena", maySkip: false },
  { id: "2000-tue-event", name: "活動：魔族戰", time: "20:00", day: 2, category: "arena", maySkip: false },
  { id: "2000-thu-hadin", name: "哈汀", time: "20:00", day: 4, category: "world", maySkip: false },

  // === 20:00 Boss ===
  { id: "2000-tue-ice", name: "冰洞冰之女王", time: "20:00", day: 2, category: "world", maySkip: false },
  { id: "2000-wed-fairy", name: "仙國狂神夜、仙國露華", time: "20:00", day: 3, category: "world", maySkip: false },
  { id: "2000-thu-dragon", name: "地龍安塔瑞斯", time: "20:00", day: 4, category: "world", maySkip: false },
  { id: "2000-fri-water", name: "水龍法利昂", time: "20:00", day: 5, category: "world", maySkip: false },
  { id: "2000-sat-echidna", name: "支配艾奇德娜、頂樓死神", time: "20:00", day: 6, category: "world", maySkip: false },

  // === 21:00 ===
  { id: "2100-wed", name: "遺忘牛雞(~21:40)、深淵拉克沙爾", time: "21:00", day: 3, category: "world", maySkip: false, note: "牛雞~21:40" },
  { id: "2100-thu", name: "深淵茲特莫爾", time: "21:00", day: 4, category: "world", maySkip: false },
  { id: "2100-sat", name: "神界梅塔特隆", time: "21:00", day: 6, category: "world", maySkip: false },

  // === 21:10 ===
  { id: "2110-fri", name: "遺忘守護者", time: "21:10", day: 5, category: "server", maySkip: false },

  // === 21:30 ===
  { id: "2130-mon", name: "拉洞四大軍王、中央亡靈(~21:35)", time: "21:30", day: 1, category: "world", maySkip: false, note: "亡靈~21:35" },
  { id: "2130-tue", name: "拉洞四大軍王、中央亡靈(~21:35)", time: "21:30", day: 2, category: "world", maySkip: false, note: "亡靈~21:35" },
  { id: "2130-sun", name: "風龍迪亞勒(~10:30)", time: "21:30", day: 0, category: "world", maySkip: false, note: "~10:30" },

  // === 22:00 ===
  { id: "2200-thu", name: "底比歐西里斯", time: "22:00", day: 4, category: "world", maySkip: false },
  { id: "2200-fri", name: "提卡杰弗雷庫", time: "22:00", day: 5, category: "world", maySkip: false },

  // === 23:00 ===
  { id: "2300-mon-paradise", name: "樂園精靈王(%)", time: "23:00", day: 1, category: "server", maySkip: true },
  { id: "2300-tue-paradise", name: "樂園精靈王(%)", time: "23:00", day: 2, category: "server", maySkip: true },
  { id: "2300-wed-paradise", name: "樂園精靈王(%)", time: "23:00", day: 3, category: "server", maySkip: true },
  { id: "2300-thu-paradise", name: "樂園精靈王(%)", time: "23:00", day: 4, category: "server", maySkip: true },
  { id: "2300-fri-paradise", name: "樂園精靈王(%)", time: "23:00", day: 5, category: "server", maySkip: true },
  { id: "2300-sat-paradise", name: "樂園精靈王(%)、肥肥的席小琳", time: "23:00", day: 6, category: "server", maySkip: true },
  { id: "2300-sun-paradise", name: "樂園精靈王(%)", time: "23:00", day: 0, category: "server", maySkip: true },

  // === 23:10 ===
  { id: "2310-thu-fly-dragon", name: "遺忘飛龍王(%)", time: "23:10", day: 4, category: "server", maySkip: true },
  { id: "2310-fri-fly-dragon", name: "遺忘飛龍王(%)", time: "23:10", day: 5, category: "server", maySkip: true },
];

// 取得今天的 Boss 列表
export function getTodayBosses(): BossScheduleEntry[] {
  const today = new Date().getDay();
  return FIXED_BOSS_SCHEDULE.filter((b) => b.day === today).sort((a, b) => a.time.localeCompare(b.time));
}

// 取得指定星期幾的 Boss 列表
export function getBossesByDay(day: number): BossScheduleEntry[] {
  return FIXED_BOSS_SCHEDULE.filter((b) => b.day === day).sort((a, b) => a.time.localeCompare(b.time));
}

// 取得即將到來的 Boss（跨天排序）
export function getUpcomingBosses(count: number = 10): BossScheduleEntry[] {
  const sorted = [...FIXED_BOSS_SCHEDULE].sort((a, b) => {
    const aTime = getTimeUntilNextSpawn(a).totalMinutes;
    const bTime = getTimeUntilNextSpawn(b).totalMinutes;
    return aTime - bTime;
  });
  return sorted.slice(0, count);
}
