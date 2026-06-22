import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Boss 排程表 - 固定王一週時間表
 * 每筆記錄代表一個時段的 Boss 出現資訊
 */
export const bossSchedules = mysqlTable("boss_schedules", {
  id: int("id").autoincrement().primaryKey(),
  /** 出現時間 (HH:MM 格式) */
  time: varchar("time", { length: 5 }).notNull(),
  /** 星期幾 (0=日, 1=一, ..., 6=六) */
  dayOfWeek: int("dayOfWeek").notNull(),
  /** Boss 名稱（多隻用頓號分隔） */
  bossNames: text("bossNames").notNull(),
  /** 分類: server=服內, world=世界, arena=競技場/活動 */
  category: mysqlEnum("category", ["server", "world", "arena"]).default("server").notNull(),
  /** 是否可能輪空 (%) */
  maySkip: boolean("maySkip").default(false).notNull(),
  /** 備註（如持續時間等） */
  notes: text("notes"),
  /** 是否啟用 */
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  /** 建立者 user id */
  createdBy: int("createdBy"),
});

export type BossSchedule = typeof bossSchedules.$inferSelect;
export type InsertBossSchedule = typeof bossSchedules.$inferInsert;

/**
 * 使用者通知設定 - 每個使用者可以個別設定每個 Boss 的通知開關
 */
export const userNotificationSettings = mysqlTable("user_notification_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Boss 排程 ID */
  bossScheduleId: int("bossScheduleId").notNull(),
  /** 是否開啟通知 */
  enabled: boolean("enabled").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserNotificationSetting = typeof userNotificationSettings.$inferSelect;
export type InsertUserNotificationSetting = typeof userNotificationSettings.$inferInsert;

/**
 * 週期王定義表 - 每隻週期王的基本資料
 */
export const cycleBosses = mysqlTable("cycle_bosses", {
  id: int("id").autoincrement().primaryKey(),
  /** 出現地區 */
  region: varchar("region", { length: 100 }).notNull(),
  /** 出現地點 */
  location: varchar("location", { length: 100 }).notNull(),
  /** Boss 名稱 */
  bossName: varchar("bossName", { length: 100 }).notNull(),
  /** 重生時數 */
  respawnHours: int("respawnHours").notNull(),
  /** 是否啟用 */
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CycleBoss = typeof cycleBosses.$inferSelect;
export type InsertCycleBoss = typeof cycleBosses.$inferInsert;

/**
 * 週期王擊殺紀錄 - 登記擊殺時間以計算重生
 */
export const cycleBossKills = mysqlTable("cycle_boss_kills", {
  id: int("id").autoincrement().primaryKey(),
  /** 週期王 ID */
  cycleBossId: int("cycleBossId").notNull(),
  /** 擊殺時間 (UTC timestamp) */
  killedAt: timestamp("killedAt").notNull(),
  /** 預計重生時間 (UTC timestamp) */
  respawnAt: timestamp("respawnAt").notNull(),
  /** 登記者 user id */
  killedBy: int("killedBy"),
  /** 備註 */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CycleBossKill = typeof cycleBossKills.$inferSelect;
export type InsertCycleBossKill = typeof cycleBossKills.$inferInsert;


/**
 * V2 多平台/多公會資料表
 * 一個 guild 代表一個盟/群組，可以同時綁 Discord、LINE、微信等頻道。
 */
export const guilds = mysqlTable("guilds", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  timezone: varchar("timezone", { length: 64 }).default("Asia/Taipei").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Guild = typeof guilds.$inferSelect;
export type InsertGuild = typeof guilds.$inferInsert;

export const guildChannels = mysqlTable("guild_channels", {
  id: int("id").autoincrement().primaryKey(),
  guildId: int("guildId").notNull(),
  platform: mysqlEnum("platform", ["discord", "line", "wechat", "telegram", "web"]).notNull(),
  /** Discord guild id / LINE group id / WeChat room id */
  platformGuildId: varchar("platformGuildId", { length: 128 }).notNull(),
  /** 通知頻道 id，可與 platformGuildId 相同 */
  channelId: varchar("channelId", { length: 128 }).notNull(),
  channelName: varchar("channelName", { length: 128 }),
  isNotifyEnabled: boolean("isNotifyEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GuildChannel = typeof guildChannels.$inferSelect;
export type InsertGuildChannel = typeof guildChannels.$inferInsert;

/**
 * 盟/群組專屬擊殺紀錄，不污染全站資料。
 */
export const guildCycleBossKills = mysqlTable("guild_cycle_boss_kills", {
  id: int("id").autoincrement().primaryKey(),
  guildId: int("guildId").notNull(),
  cycleBossId: int("cycleBossId").notNull(),
  killedAt: timestamp("killedAt").notNull(),
  respawnAt: timestamp("respawnAt").notNull(),
  sourcePlatform: mysqlEnum("sourcePlatform", ["discord", "line", "wechat", "telegram", "web"]).default("web").notNull(),
  sourceUserId: varchar("sourceUserId", { length: 128 }),
  sourceUserName: varchar("sourceUserName", { length: 128 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GuildCycleBossKill = typeof guildCycleBossKills.$inferSelect;
export type InsertGuildCycleBossKill = typeof guildCycleBossKills.$inferInsert;

export const guildNotificationLogs = mysqlTable("guild_notification_logs", {
  id: int("id").autoincrement().primaryKey(),
  guildId: int("guildId").notNull(),
  guildCycleBossKillId: int("guildCycleBossKillId").notNull(),
  notifyType: mysqlEnum("notifyType", ["before10", "before5", "spawned"]).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export type GuildNotificationLog = typeof guildNotificationLogs.$inferSelect;
export type InsertGuildNotificationLog = typeof guildNotificationLogs.$inferInsert;
