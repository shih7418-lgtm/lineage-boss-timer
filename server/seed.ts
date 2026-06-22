/**
 * Seed script - 將固定王時間表資料寫入資料庫
 * 可透過 admin API bulkCreate 呼叫，或直接 SQL 插入
 */

export interface SeedBossEntry {
  time: string;
  dayOfWeek: number;
  bossNames: string;
  category: "server" | "world" | "arena";
  maySkip: boolean;
  notes?: string | null;
}

// 完整的固定王時間表資料
export const SEED_BOSS_DATA: SeedBossEntry[] = [
  // ===== 星期一 (dayOfWeek=1) =====
  { time: "12:00", dayOfWeek: 1, bossNames: "樂園精靈王(%)", category: "server", maySkip: true },
  { time: "15:00", dayOfWeek: 1, bossNames: "巨蟻女皇、象5死亡(%)", category: "server", maySkip: true },
  { time: "18:10", dayOfWeek: 1, bossNames: "克特、做1傑尼斯王、做2幻象眼魔", category: "server", maySkip: false },
  { time: "18:15", dayOfWeek: 1, bossNames: "阿勒尼亞、做3吸血鬼、做4殭屍王", category: "server", maySkip: false },
  { time: "18:20", dayOfWeek: 1, bossNames: "做5黑豹、做6木乃伊、地底馬托爾、火窟不死鳥", category: "server", maySkip: false },
  { time: "19:10", dayOfWeek: 1, bossNames: "巫師、阿爾斯卡利亞", category: "world", maySkip: false },
  { time: "19:15", dayOfWeek: 1, bossNames: "做7艾莉絲、做8騎士乖德、做9巫妖", category: "server", maySkip: false },
  { time: "19:20", dayOfWeek: 1, bossNames: "萊奧斯、鑽石高薩、死亡騎士(%)、做10烏格奴斯", category: "world", maySkip: true },
  { time: "20:00", dayOfWeek: 1, bossNames: "活動：魔族戰", category: "arena", maySkip: false },
  { time: "21:30", dayOfWeek: 1, bossNames: "拉洞四大軍王、中央亡靈(~21:35)", category: "world", maySkip: false, notes: "~21:35" },
  { time: "23:00", dayOfWeek: 1, bossNames: "樂園精靈王(%)", category: "server", maySkip: true },

  // ===== 星期二 (dayOfWeek=2) =====
  { time: "12:00", dayOfWeek: 2, bossNames: "樂園精靈王(%)", category: "server", maySkip: true },
  { time: "15:00", dayOfWeek: 2, bossNames: "巨蟻女皇、象5古拉(%)", category: "server", maySkip: true },
  { time: "18:10", dayOfWeek: 2, bossNames: "克特、做1傑尼斯女王、做2幻象眼魔", category: "server", maySkip: false },
  { time: "18:15", dayOfWeek: 2, bossNames: "阿勒尼亞、做3吸血鬼、做4殭屍王", category: "server", maySkip: false },
  { time: "18:20", dayOfWeek: 2, bossNames: "做5黑豹、做6木乃伊、地底馬托爾、地底塔坤", category: "server", maySkip: false },
  { time: "19:10", dayOfWeek: 2, bossNames: "巫師、阿爾斯卡利亞", category: "world", maySkip: false },
  { time: "19:15", dayOfWeek: 2, bossNames: "做7艾莉絲、做8騎士乖德、做9巫妖", category: "server", maySkip: false },
  { time: "19:20", dayOfWeek: 2, bossNames: "萊奧斯、船長卡利索、死亡騎士(%)、做10烏格奴斯", category: "world", maySkip: true },
  { time: "20:00", dayOfWeek: 2, bossNames: "活動：魔族戰", category: "arena", maySkip: false },
  { time: "20:00", dayOfWeek: 2, bossNames: "冰洞冰之女王", category: "world", maySkip: false },
  { time: "21:30", dayOfWeek: 2, bossNames: "拉洞四大軍王、中央亡靈(~21:35)", category: "world", maySkip: false, notes: "~21:35" },
  { time: "23:00", dayOfWeek: 2, bossNames: "樂園精靈王(%)", category: "server", maySkip: true },

  // ===== 星期三 (dayOfWeek=3) =====
  { time: "12:00", dayOfWeek: 3, bossNames: "樂園精靈王(%)", category: "server", maySkip: true },
  { time: "15:00", dayOfWeek: 3, bossNames: "巨蟻女皇", category: "server", maySkip: false },
  { time: "18:10", dayOfWeek: 3, bossNames: "克特、做1傑尼斯女王、做2幻象眼魔", category: "server", maySkip: false },
  { time: "18:15", dayOfWeek: 3, bossNames: "阿勒尼亞、做3吸血鬼、做4殭屍王", category: "server", maySkip: false },
  { time: "18:20", dayOfWeek: 3, bossNames: "做5黑豹、做6木乃伊、地底馬托爾、地底塔坤", category: "server", maySkip: false },
  { time: "19:10", dayOfWeek: 3, bossNames: "巫師、阿爾斯卡利亞", category: "world", maySkip: false },
  { time: "19:15", dayOfWeek: 3, bossNames: "做7艾莉絲、做8騎士乖德、做9巫妖", category: "server", maySkip: false },
  { time: "19:20", dayOfWeek: 3, bossNames: "萊奧斯、巨大飛龍、死亡騎士(%)、做10烏格奴斯", category: "world", maySkip: true },
  { time: "20:00", dayOfWeek: 3, bossNames: "仙國狂神夜、仙國露華", category: "world", maySkip: false },
  { time: "21:00", dayOfWeek: 3, bossNames: "遺忘牛雞(~21:40)、深淵拉克沙爾", category: "world", maySkip: false, notes: "~21:40" },
  { time: "23:00", dayOfWeek: 3, bossNames: "樂園精靈王(%)", category: "server", maySkip: true },
  { time: "23:10", dayOfWeek: 3, bossNames: "遺忘飛龍王(%)", category: "server", maySkip: true },

  // ===== 星期四 (dayOfWeek=4) =====
  { time: "07:10", dayOfWeek: 4, bossNames: "遺忘飛龍王(%)", category: "server", maySkip: true },
  { time: "12:00", dayOfWeek: 4, bossNames: "樂園精靈王(%)", category: "server", maySkip: true },
  { time: "15:00", dayOfWeek: 4, bossNames: "巨蟻女皇、象5古拉(%)", category: "server", maySkip: true },
  { time: "15:10", dayOfWeek: 4, bossNames: "遺忘飛龍王(%)", category: "server", maySkip: true },
  { time: "18:10", dayOfWeek: 4, bossNames: "克特、做1傑尼斯女王、做2幻象眼魔", category: "server", maySkip: false },
  { time: "18:15", dayOfWeek: 4, bossNames: "阿勒尼亞、做3吸血鬼、做4殭屍王", category: "server", maySkip: false },
  { time: "18:20", dayOfWeek: 4, bossNames: "做5黑豹、做6木乃伊、地底馬托爾、地底塔坤", category: "server", maySkip: false },
  { time: "19:10", dayOfWeek: 4, bossNames: "巫師、阿爾斯卡利亞", category: "world", maySkip: false },
  { time: "19:15", dayOfWeek: 4, bossNames: "做7艾莉絲、做8騎士乖德、做9巫妖", category: "server", maySkip: false },
  { time: "19:20", dayOfWeek: 4, bossNames: "萊奧斯、巨大蜈蚣、死亡騎士(%)、做10烏格奴斯", category: "world", maySkip: true },
  { time: "20:00", dayOfWeek: 4, bossNames: "哈汀、地龍安塔瑞斯", category: "world", maySkip: false },
  { time: "21:00", dayOfWeek: 4, bossNames: "深淵乖特莫爾", category: "world", maySkip: false },
  { time: "22:00", dayOfWeek: 4, bossNames: "底比歐西里斯", category: "world", maySkip: false },
  { time: "23:00", dayOfWeek: 4, bossNames: "樂園精靈王(%)", category: "server", maySkip: true },
  { time: "23:10", dayOfWeek: 4, bossNames: "遺忘飛龍王(%)", category: "server", maySkip: true },

  // ===== 星期五 (dayOfWeek=5) =====
  { time: "07:10", dayOfWeek: 5, bossNames: "遺忘飛龍王(%)", category: "server", maySkip: true },
  { time: "12:00", dayOfWeek: 5, bossNames: "樂園精靈王(%)", category: "server", maySkip: true },
  { time: "15:00", dayOfWeek: 5, bossNames: "巨蟻女皇、象8墮落惡魔(%)", category: "server", maySkip: true },
  { time: "15:10", dayOfWeek: 5, bossNames: "遺忘飛龍王(%)", category: "server", maySkip: true },
  { time: "18:10", dayOfWeek: 5, bossNames: "克特、做1傑尼斯女王、做2幻象眼魔", category: "server", maySkip: false },
  { time: "18:15", dayOfWeek: 5, bossNames: "阿勒尼亞、做3吸血鬼、做4殭屍王", category: "server", maySkip: false },
  { time: "18:20", dayOfWeek: 5, bossNames: "做5黑豹、做6木乃伊、地底馬托爾、火窟不死鳥", category: "server", maySkip: false },
  { time: "19:00", dayOfWeek: 5, bossNames: "活動：大花草", category: "arena", maySkip: false },
  { time: "19:10", dayOfWeek: 5, bossNames: "巫師、阿爾斯卡利亞", category: "world", maySkip: false },
  { time: "19:15", dayOfWeek: 5, bossNames: "做7艾莉絲、做8騎士乖德、做9巫妖", category: "server", maySkip: false },
  { time: "19:20", dayOfWeek: 5, bossNames: "萊奧斯、大黑長者、死亡騎士(%)、做10烏格奴斯", category: "world", maySkip: true },
  { time: "20:00", dayOfWeek: 5, bossNames: "水龍法利昂", category: "world", maySkip: false },
  { time: "21:10", dayOfWeek: 5, bossNames: "遺忘守護者", category: "world", maySkip: false },
  { time: "22:00", dayOfWeek: 5, bossNames: "提卡杰弗雷庫", category: "world", maySkip: false },
  { time: "23:00", dayOfWeek: 5, bossNames: "樂園精靈王(%)", category: "server", maySkip: true },

  // ===== 星期六 (dayOfWeek=6) =====
  { time: "12:00", dayOfWeek: 6, bossNames: "樂園精靈王(%)", category: "server", maySkip: true },
  { time: "18:00", dayOfWeek: 6, bossNames: "黃昏巨人", category: "world", maySkip: false },
  { time: "18:10", dayOfWeek: 6, bossNames: "克特、做1傑尼斯女王、做2幻象眼魔", category: "server", maySkip: false },
  { time: "18:15", dayOfWeek: 6, bossNames: "阿勒尼亞、做3吸血鬼、做4殭屍王", category: "server", maySkip: false },
  { time: "18:20", dayOfWeek: 6, bossNames: "做5黑豹、做6木乃伊、地底馬托爾、地底塔坤", category: "server", maySkip: false },
  { time: "19:00", dayOfWeek: 6, bossNames: "活動：激戰地", category: "arena", maySkip: false },
  { time: "19:10", dayOfWeek: 6, bossNames: "巫師、阿爾斯卡利亞", category: "world", maySkip: false },
  { time: "19:15", dayOfWeek: 6, bossNames: "做7艾莉絲、做8騎士乖德、做9巫妖", category: "server", maySkip: false },
  { time: "19:20", dayOfWeek: 6, bossNames: "萊奧斯、狂風夏斯奇、死亡騎士(%)、做10烏格奴斯", category: "world", maySkip: true },
  { time: "20:00", dayOfWeek: 6, bossNames: "支配艾奇德娜、頂樓死神", category: "world", maySkip: false },
  { time: "21:00", dayOfWeek: 6, bossNames: "神界梅塔特隆", category: "world", maySkip: false },
  { time: "23:00", dayOfWeek: 6, bossNames: "樂園精靈王(%)、肥肥的席小琳", category: "server", maySkip: true },

  // ===== 星期日 (dayOfWeek=0) =====
  { time: "12:00", dayOfWeek: 0, bossNames: "樂園精靈王(%)", category: "server", maySkip: true },
  { time: "18:10", dayOfWeek: 0, bossNames: "克特、做1傑尼斯女王、做2幻象眼魔", category: "server", maySkip: false },
  { time: "18:15", dayOfWeek: 0, bossNames: "阿勒尼亞、做3吸血鬼、做4殭屍王", category: "server", maySkip: false },
  { time: "18:20", dayOfWeek: 0, bossNames: "做5黑豹、做6木乃伊、地底馬托爾、火窟不死鳥", category: "server", maySkip: false },
  { time: "19:10", dayOfWeek: 0, bossNames: "巫師、阿爾斯卡利亞", category: "world", maySkip: false },
  { time: "19:15", dayOfWeek: 0, bossNames: "做7艾莉絲、做8騎士乖德、做9巫妖", category: "server", maySkip: false },
  { time: "19:20", dayOfWeek: 0, bossNames: "萊奧斯、漆黑的死亡騎士、死亡騎士(%)、做10烏格奴斯", category: "world", maySkip: true },
  { time: "21:30", dayOfWeek: 0, bossNames: "風龍迪亞勒(~10:30)", category: "world", maySkip: false, notes: "~10:30" },
  { time: "23:00", dayOfWeek: 0, bossNames: "樂園精靈王(%)", category: "server", maySkip: true },
];
