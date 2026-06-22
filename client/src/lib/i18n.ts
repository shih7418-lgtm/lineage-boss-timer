/**
 * 多語系支援 - 繁體中文 / 韓文 / 英文
 */

export type Locale = "zh-TW" | "ko" | "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  "zh-TW": "繁體中文",
  ko: "한국어",
  en: "English",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  "zh-TW": "🇹🇼",
  ko: "🇰🇷",
  en: "🇺🇸",
};

type TranslationKeys = {
  // Header
  appTitle: string;
  appSubtitle: string;
  helpBtn: string;
  adminBtn: string;

  // Command input
  commandPlaceholder: string;

  // System status
  cycleBoss: string;
  fixedBoss: string;
  scheduled: string;
  unscheduled: string;
  nextRespawn: string;
  none: string;
  unit: string;

  // View modes
  viewAll: string;
  viewUpcoming: string;
  viewRespawned: string;
  bossCount: string;

  // Boss card
  cycle: string;
  fixed: string;
  respawnCycle: string;
  hour: string;
  minute: string;
  notRegistered: string;
  killTime: string;
  expectedRespawn: string;
  respawned: string;
  killBtn: string;

  // Commands
  cmdKillDesc: string;
  cmdKillTimeDesc: string;
  cmdAllDesc: string;
  cmdFindDesc: string;
  cmdNextDesc: string;
  cmdClearDesc: string;
  cmdStatusDesc: string;
  cmdRestartDesc: string;
  cmdHelpDesc: string;
  cmdAddDesc: string;
  cmdDelDesc: string;

  // Help panel
  helpTitle: string;
  playerCommands: string;
  adminCommands: string;
  helpNote1: string;
  helpNote2: string;

  // Admin panel
  adminTitle: string;
  addBoss: string;
  resetAll: string;
  resetConfirm: string;
  resetYes: string;
  cancel: string;
  editBoss: string;
  bossName: string;
  respawnMinutes: string;
  bossType: string;
  bossMap: string;
  mapOptional: string;
  save: string;
  add: string;

  // Toasts
  toastKilled: string;
  toastCleared: string;
  toastAdded: string;
  toastEdited: string;
  toastDeleted: string;
  toastResetDone: string;
  toastResetAsk: string;
  toastResetHint: string;
  toastNotFound: string;
  toastShowAll: string;
  toastSearch: string;
  toastUpcoming: string;
  toastStatus: string;
  toastHelp: string;
  toastUnknownCmd: string;
  toastHelpHint: string;
  toastNeedName: string;
  toastNeedFormat: string;
  toastInvalidMinutes: string;
  toastFillRequired: string;
  toastPositiveInt: string;
  toastNameEmpty: string;
  toastTimeLogged: string;
  toastCurrentTime: string;

  // Footer
  footerLine1: string;
  footerLine2: string;

  // Search
  searchLabel: string;
  noResults: string;
  noMatchingBoss: string;
};

const translations: Record<Locale, TranslationKeys> = {
  "zh-TW": {
    appTitle: "打王計時器",
    appSubtitle: "天堂W Boss 重生追蹤",
    helpBtn: "指令說明",
    adminBtn: "管理",

    commandPlaceholder: "輸入指令 (K 王名 / KB / KN / KS / Help)",

    cycleBoss: "週期王",
    fixedBoss: "固定王",
    scheduled: "已排程",
    unscheduled: "未排程",
    nextRespawn: "下一隻重生",
    none: "無",
    unit: "隻",

    viewAll: "全部",
    viewUpcoming: "即將重生",
    viewRespawned: "已重生",
    bossCount: "隻 Boss",

    cycle: "週期",
    fixed: "固定",
    respawnCycle: "重生週期",
    hour: "小時",
    minute: "分",
    notRegistered: "尚未登記擊殺",
    killTime: "擊殺時間",
    expectedRespawn: "預計重生",
    respawned: "已重生！",
    killBtn: "擊殺",

    cmdKillDesc: "登記擊殺（自動記錄當前時間）",
    cmdKillTimeDesc: "補登指定時間的擊殺",
    cmdAllDesc: "查看全部王（依重生時間排序）",
    cmdFindDesc: "查詢單一王的狀態",
    cmdNextDesc: "顯示即將重生 TOP 10",
    cmdClearDesc: "清除單一王的計時",
    cmdStatusDesc: "顯示系統狀態",
    cmdRestartDesc: "重置所有週期王",
    cmdHelpDesc: "顯示此說明",
    cmdAddDesc: "新增 Boss（類型：cycle/fixed）",
    cmdDelDesc: "刪除 Boss",

    helpTitle: "指令說明",
    playerCommands: "玩家指令",
    adminCommands: "管理員指令",
    helpNote1: "也可以直接點擊 Boss 卡片上的「擊殺」按鈕來登記。",
    helpNote2: "資料儲存在瀏覽器本地，清除瀏覽器資料會遺失紀錄。",

    adminTitle: "Boss 管理面板",
    addBoss: "新增 Boss",
    resetAll: "重置所有週期王",
    resetConfirm: "確定要重置所有週期王的計時嗎？此操作無法復原。",
    resetYes: "確定重置",
    cancel: "取消",
    editBoss: "編輯 Boss",
    bossName: "Boss 名稱",
    respawnMinutes: "重生時間（分鐘）",
    bossType: "類型",
    bossMap: "地圖",
    mapOptional: "地圖（選填）",
    save: "儲存變更",
    add: "新增",

    toastKilled: "已登記擊殺",
    toastCleared: "已清除",
    toastAdded: "已新增 Boss",
    toastEdited: "已更新 Boss",
    toastDeleted: "已刪除 Boss",
    toastResetDone: "已重置所有週期王計時",
    toastResetAsk: "確定要重置所有週期王嗎？",
    toastResetHint: "輸入 RESTART YES 確認重置",
    toastNotFound: "找不到 Boss",
    toastShowAll: "顯示全部 Boss",
    toastSearch: "搜尋",
    toastUpcoming: "顯示即將重生 TOP 10",
    toastStatus: "系統狀態已更新",
    toastHelp: "請查看右上角「指令說明」按鈕",
    toastUnknownCmd: "未知指令",
    toastHelpHint: "輸入 HELP 查看可用指令",
    toastNeedName: "請指定 Boss 名稱",
    toastNeedFormat: "格式：ADD 王名 分鐘 類型(cycle/fixed) [地圖]",
    toastInvalidMinutes: "分鐘數必須為數字",
    toastFillRequired: "請填寫 Boss 名稱和重生時間",
    toastPositiveInt: "重生時間必須為正整數（分鐘）",
    toastNameEmpty: "Boss 名稱不可為空",
    toastTimeLogged: "補登時間",
    toastCurrentTime: "已記錄當前時間",

    footerLine1: "天堂W打王重生計時器 — 資料儲存於瀏覽器本地",
    footerLine2: "掌握重生節奏，搶先一步到位",

    searchLabel: "搜尋",
    noResults: "目前沒有符合條件的 Boss",
    noMatchingBoss: "找不到包含「{query}」的 Boss",
  },

  ko: {
    appTitle: "보스 타이머",
    appSubtitle: "리니지W 보스 리젠 추적",
    helpBtn: "명령어 도움말",
    adminBtn: "관리",

    commandPlaceholder: "명령어 입력 (K 보스명 / KB / KN / KS / Help)",

    cycleBoss: "주기 보스",
    fixedBoss: "고정 보스",
    scheduled: "예약됨",
    unscheduled: "미예약",
    nextRespawn: "다음 리젠",
    none: "없음",
    unit: "마리",

    viewAll: "전체",
    viewUpcoming: "리젠 예정",
    viewRespawned: "리젠 완료",
    bossCount: "마리 보스",

    cycle: "주기",
    fixed: "고정",
    respawnCycle: "리젠 주기",
    hour: "시간",
    minute: "분",
    notRegistered: "처치 미등록",
    killTime: "처치 시간",
    expectedRespawn: "예상 리젠",
    respawned: "리젠 완료!",
    killBtn: "처치",

    cmdKillDesc: "처치 등록 (현재 시간 자동 기록)",
    cmdKillTimeDesc: "지정 시간으로 처치 등록",
    cmdAllDesc: "전체 보스 보기 (리젠 시간순 정렬)",
    cmdFindDesc: "단일 보스 상태 조회",
    cmdNextDesc: "리젠 예정 TOP 10 표시",
    cmdClearDesc: "단일 보스 타이머 초기화",
    cmdStatusDesc: "시스템 상태 표시",
    cmdRestartDesc: "모든 주기 보스 초기화",
    cmdHelpDesc: "도움말 표시",
    cmdAddDesc: "보스 추가 (유형: cycle/fixed)",
    cmdDelDesc: "보스 삭제",

    helpTitle: "명령어 도움말",
    playerCommands: "플레이어 명령어",
    adminCommands: "관리자 명령어",
    helpNote1: "보스 카드의 '처치' 버튼을 직접 클릭하여 등록할 수도 있습니다.",
    helpNote2: "데이터는 브라우저에 저장되며, 브라우저 데이터 삭제 시 기록이 사라집니다.",

    adminTitle: "보스 관리 패널",
    addBoss: "보스 추가",
    resetAll: "모든 주기 보스 초기화",
    resetConfirm: "모든 주기 보스의 타이머를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    resetYes: "초기화 확인",
    cancel: "취소",
    editBoss: "보스 편집",
    bossName: "보스 이름",
    respawnMinutes: "리젠 시간 (분)",
    bossType: "유형",
    bossMap: "맵",
    mapOptional: "맵 (선택사항)",
    save: "변경 저장",
    add: "추가",

    toastKilled: "처치 등록 완료",
    toastCleared: "초기화 완료",
    toastAdded: "보스 추가 완료",
    toastEdited: "보스 업데이트 완료",
    toastDeleted: "보스 삭제 완료",
    toastResetDone: "모든 주기 보스 타이머 초기화 완료",
    toastResetAsk: "모든 주기 보스를 초기화하시겠습니까?",
    toastResetHint: "RESTART YES 입력으로 확인",
    toastNotFound: "보스를 찾을 수 없습니다",
    toastShowAll: "전체 보스 표시",
    toastSearch: "검색",
    toastUpcoming: "리젠 예정 TOP 10 표시",
    toastStatus: "시스템 상태 업데이트됨",
    toastHelp: "우측 상단의 '명령어 도움말' 버튼을 확인하세요",
    toastUnknownCmd: "알 수 없는 명령어",
    toastHelpHint: "HELP 입력으로 사용 가능한 명령어 확인",
    toastNeedName: "보스 이름을 지정하세요",
    toastNeedFormat: "형식: ADD 보스명 분 유형(cycle/fixed) [맵]",
    toastInvalidMinutes: "분은 숫자여야 합니다",
    toastFillRequired: "보스 이름과 리젠 시간을 입력하세요",
    toastPositiveInt: "리젠 시간은 양의 정수여야 합니다 (분)",
    toastNameEmpty: "보스 이름은 비어있을 수 없습니다",
    toastTimeLogged: "시간 등록",
    toastCurrentTime: "현재 시간 기록됨",

    footerLine1: "리니지W 보스 리젠 타이머 — 데이터는 브라우저에 저장됩니다",
    footerLine2: "리젠 타이밍을 장악하고, 한 발 앞서 도착하세요",

    searchLabel: "검색",
    noResults: "조건에 맞는 보스가 없습니다",
    noMatchingBoss: "'{query}'를 포함하는 보스를 찾을 수 없습니다",
  },

  en: {
    appTitle: "Boss Timer",
    appSubtitle: "Lineage W Boss Respawn Tracker",
    helpBtn: "Commands",
    adminBtn: "Admin",

    commandPlaceholder: "Enter command (K BossName / KB / KN / KS / Help)",

    cycleBoss: "Cycle Boss",
    fixedBoss: "Fixed Boss",
    scheduled: "Scheduled",
    unscheduled: "Unscheduled",
    nextRespawn: "Next Respawn",
    none: "None",
    unit: "",

    viewAll: "All",
    viewUpcoming: "Upcoming",
    viewRespawned: "Respawned",
    bossCount: "Bosses",

    cycle: "Cycle",
    fixed: "Fixed",
    respawnCycle: "Respawn Cycle",
    hour: "h",
    minute: "m",
    notRegistered: "Not registered",
    killTime: "Kill Time",
    expectedRespawn: "Expected Respawn",
    respawned: "Respawned!",
    killBtn: "Kill",

    cmdKillDesc: "Register kill (auto-record current time)",
    cmdKillTimeDesc: "Register kill with specified time",
    cmdAllDesc: "View all bosses (sorted by respawn time)",
    cmdFindDesc: "Query single boss status",
    cmdNextDesc: "Show upcoming TOP 10 respawns",
    cmdClearDesc: "Clear single boss timer",
    cmdStatusDesc: "Show system status",
    cmdRestartDesc: "Reset all cycle bosses",
    cmdHelpDesc: "Show this help",
    cmdAddDesc: "Add Boss (type: cycle/fixed)",
    cmdDelDesc: "Delete Boss",

    helpTitle: "Command Reference",
    playerCommands: "Player Commands",
    adminCommands: "Admin Commands",
    helpNote1: "You can also click the 'Kill' button on boss cards to register.",
    helpNote2: "Data is stored locally in the browser. Clearing browser data will erase records.",

    adminTitle: "Boss Admin Panel",
    addBoss: "Add Boss",
    resetAll: "Reset All Cycle Bosses",
    resetConfirm: "Are you sure you want to reset all cycle boss timers? This cannot be undone.",
    resetYes: "Confirm Reset",
    cancel: "Cancel",
    editBoss: "Edit Boss",
    bossName: "Boss Name",
    respawnMinutes: "Respawn Time (minutes)",
    bossType: "Type",
    bossMap: "Map",
    mapOptional: "Map (optional)",
    save: "Save Changes",
    add: "Add",

    toastKilled: "Kill registered",
    toastCleared: "Cleared",
    toastAdded: "Boss added",
    toastEdited: "Boss updated",
    toastDeleted: "Boss deleted",
    toastResetDone: "All cycle boss timers reset",
    toastResetAsk: "Reset all cycle bosses?",
    toastResetHint: "Type RESTART YES to confirm",
    toastNotFound: "Boss not found",
    toastShowAll: "Showing all bosses",
    toastSearch: "Search",
    toastUpcoming: "Showing upcoming TOP 10",
    toastStatus: "System status updated",
    toastHelp: "Check the 'Commands' button in the top right",
    toastUnknownCmd: "Unknown command",
    toastHelpHint: "Type HELP to see available commands",
    toastNeedName: "Please specify boss name",
    toastNeedFormat: "Format: ADD BossName Minutes Type(cycle/fixed) [Map]",
    toastInvalidMinutes: "Minutes must be a number",
    toastFillRequired: "Please fill in boss name and respawn time",
    toastPositiveInt: "Respawn time must be a positive integer (minutes)",
    toastNameEmpty: "Boss name cannot be empty",
    toastTimeLogged: "Time logged",
    toastCurrentTime: "Current time recorded",

    footerLine1: "Lineage W Boss Respawn Timer — Data stored locally in browser",
    footerLine2: "Master the respawn rhythm, arrive one step ahead",

    searchLabel: "Search",
    noResults: "No bosses match the current filter",
    noMatchingBoss: "No boss found matching '{query}'",
  },
};

const LOCALE_STORAGE_KEY = "lineage_boss_locale";

export function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && (stored === "zh-TW" || stored === "ko" || stored === "en")) {
      return stored;
    }
  } catch (e) {
    console.error("Failed to load locale:", e);
  }
  return "zh-TW";
}

export function setStoredLocale(locale: Locale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function t(locale: Locale, key: keyof TranslationKeys, params?: Record<string, string>): string {
  let text = translations[locale][key] || translations["zh-TW"][key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }
  return text;
}

export type { TranslationKeys };
