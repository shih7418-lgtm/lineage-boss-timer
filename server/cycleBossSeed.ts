/**
 * 週期王預設資料 - 根據用戶提供的圖片整理
 * 每隻 Boss 有固定的重生時數
 */

export interface CycleBossSeedEntry {
  region: string;
  location: string;
  bossName: string;
  respawnHours: number;
}

export const CYCLE_BOSS_SEED_DATA: CycleBossSeedEntry[] = [
  // 說話之島
  { region: "說話之島", location: "說話之島", bossName: "獻上祭品的庫約", respawnHours: 6 },

  // 古魯丁領地
  { region: "古魯丁領地", location: "死亡廢墟", bossName: "殺戮者", respawnHours: 4 },
  { region: "古魯丁領地", location: "死亡廢墟", bossName: "飛龍一區", respawnHours: 4 },
  { region: "古魯丁領地", location: "死亡廢墟", bossName: "飛龍二區", respawnHours: 4 },

  // 風木領地
  { region: "風木領地", location: "龍之谷", bossName: "飛龍三區", respawnHours: 4 },
  { region: "風木領地", location: "龍之谷", bossName: "飛龍四區", respawnHours: 4 },
  { region: "風木領地", location: "風木東部沙漠", bossName: "卡爾迪修", respawnHours: 4 },
  { region: "風木領地", location: "波若斯妖魔部落", bossName: "尼羅德", respawnHours: 4 },

  // 妖魔森林
  { region: "妖魔森林", location: "妖魔城堡", bossName: "奈克倍斯", respawnHours: 8 },
  { region: "妖魔森林", location: "妖魔城堡", bossName: "烏勒庫斯", respawnHours: 8 },

  // 妖精森林
  { region: "妖精森林", location: "死亡森林", bossName: "卡司特王", respawnHours: 4 },
  { region: "妖精森林", location: "亞丁農場", bossName: "黑虎恰姆帕瓦特", respawnHours: 4 },
  { region: "妖精森林", location: "光與影子森林", bossName: "屠殺者莫利提亞", respawnHours: 4 },

  // 亞丁領地
  { region: "亞丁領地", location: "遺忘的春之庭院", bossName: "審判者拉馬修", respawnHours: 8 },
  { region: "亞丁領地", location: "巨人峽谷", bossName: "嚎叫山峰的烏爾森", respawnHours: 12 },
  { region: "亞丁領地", location: "巨人峽谷", bossName: "吞噬岩石的艾爾森", respawnHours: 12 },
  { region: "亞丁領地", location: "亞丁城堡地下監獄", bossName: "黑蛇騎士團麥肯", respawnHours: 4 },
  { region: "亞丁領地", location: "悲哀森林", bossName: "庫爾託", respawnHours: 8 },

  // 奇岩領地
  { region: "奇岩領地", location: "影子山賊頭目居處", bossName: "頭目哈格瑪", respawnHours: 4 },
  { region: "奇岩領地", location: "影子山賊頭目居處", bossName: "乾渴的德雷克", respawnHours: 4 },
  { region: "奇岩領地", location: "海賊墳墓", bossName: "巴爾博薩夫人", respawnHours: 4 },

  // 歐瑞領地
  { region: "歐瑞領地", location: "瑪幽雪壁", bossName: "大腳瑪幽", respawnHours: 4 },

  // 海音領地
  { region: "海音領地", location: "霧月島", bossName: "史前巨鱷", respawnHours: 8 },

  // 古魯丁地監
  { region: "古魯丁地監", location: "古3或4樓", bossName: "四色", respawnHours: 12 },
  { region: "古魯丁地監", location: "古4樓", bossName: "奧杜亞", respawnHours: 4 },
  { region: "古魯丁地監", location: "古6樓", bossName: "乞洛", respawnHours: 8 },
];
