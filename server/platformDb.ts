import { and, asc, desc, eq } from "drizzle-orm";
import {
  cycleBosses,
  guildChannels,
  guildCycleBossKills,
  guildNotificationLogs,
  guilds,
  InsertGuildCycleBossKill,
} from "../drizzle/schema";
import { getDb } from "./db";

export type Platform = "discord" | "line" | "wechat" | "telegram" | "web";
export type NotifyType = "before10" | "before5" | "spawned";

export async function ensureGuildForPlatform(input: {
  platform: Platform;
  platformGuildId: string;
  channelId: string;
  channelName?: string | null;
  guildName?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existingChannel = await db
    .select()
    .from(guildChannels)
    .where(and(eq(guildChannels.platform, input.platform), eq(guildChannels.platformGuildId, input.platformGuildId)))
    .limit(1);

  if (existingChannel[0]) {
    await db
      .update(guildChannels)
      .set({ channelId: input.channelId, channelName: input.channelName ?? null })
      .where(eq(guildChannels.id, existingChannel[0].id));
    const guild = await db.select().from(guilds).where(eq(guilds.id, existingChannel[0].guildId)).limit(1);
    return guild[0];
  }

  const inserted = await db.insert(guilds).values({ name: input.guildName || `${input.platform}:${input.platformGuildId}` });
  const guildId = inserted[0].insertId;
  await db.insert(guildChannels).values({
    guildId,
    platform: input.platform,
    platformGuildId: input.platformGuildId,
    channelId: input.channelId,
    channelName: input.channelName ?? null,
  });
  const guild = await db.select().from(guilds).where(eq(guilds.id, guildId)).limit(1);
  return guild[0];
}

export async function setNotifyChannel(input: {
  platform: Platform;
  platformGuildId: string;
  channelId: string;
  channelName?: string | null;
  guildName?: string | null;
}) {
  return ensureGuildForPlatform(input);
}

export async function findCycleBossByName(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const normalized = name.trim().toLowerCase();
  const bosses = await db.select().from(cycleBosses).where(eq(cycleBosses.isActive, true));
  return bosses.find(b => b.bossName.toLowerCase() === normalized) || bosses.find(b => b.bossName.includes(name.trim())) || null;
}

export async function listCycleBosses() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(cycleBosses).where(eq(cycleBosses.isActive, true)).orderBy(asc(cycleBosses.region), asc(cycleBosses.bossName));
}

export async function recordGuildKill(input: {
  guildId: number;
  bossName: string;
  killedAt: Date;
  sourcePlatform: Platform;
  sourceUserId?: string | null;
  sourceUserName?: string | null;
  notes?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const boss = await findCycleBossByName(input.bossName);
  if (!boss) throw new Error(`找不到 Boss：${input.bossName}`);
  const respawnAt = new Date(input.killedAt.getTime() + boss.respawnHours * 60 * 60 * 1000);
  const values: InsertGuildCycleBossKill = {
    guildId: input.guildId,
    cycleBossId: boss.id,
    killedAt: input.killedAt,
    respawnAt,
    sourcePlatform: input.sourcePlatform,
    sourceUserId: input.sourceUserId ?? null,
    sourceUserName: input.sourceUserName ?? null,
    notes: input.notes ?? null,
  };
  const inserted = await db.insert(guildCycleBossKills).values(values);
  return { id: inserted[0].insertId, boss, killedAt: input.killedAt, respawnAt };
}

export async function getLatestGuildKill(guildId: number, cycleBossId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db
    .select()
    .from(guildCycleBossKills)
    .where(and(eq(guildCycleBossKills.guildId, guildId), eq(guildCycleBossKills.cycleBossId, cycleBossId)))
    .orderBy(desc(guildCycleBossKills.killedAt))
    .limit(1);
  return rows[0] || null;
}

export async function listGuildBossStatus(guildId: number) {
  const bosses = await listCycleBosses();
  const out = [];
  for (const boss of bosses) {
    const latestKill = await getLatestGuildKill(guildId, boss.id);
    out.push({ ...boss, latestKill });
  }
  return out;
}

export async function guildKillHistory(guildId: number, bossName: string, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const boss = await findCycleBossByName(bossName);
  if (!boss) throw new Error(`找不到 Boss：${bossName}`);
  const rows = await db
    .select()
    .from(guildCycleBossKills)
    .where(and(eq(guildCycleBossKills.guildId, guildId), eq(guildCycleBossKills.cycleBossId, boss.id)))
    .orderBy(desc(guildCycleBossKills.killedAt))
    .limit(limit);
  return { boss, rows };
}

export async function clearLatestGuildKill(guildId: number, bossName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const boss = await findCycleBossByName(bossName);
  if (!boss) throw new Error(`找不到 Boss：${bossName}`);
  const latest = await getLatestGuildKill(guildId, boss.id);
  if (!latest) return { boss, deleted: false };
  await db.delete(guildCycleBossKills).where(eq(guildCycleBossKills.id, latest.id));
  return { boss, deleted: true };
}

export async function updateLatestGuildKill(guildId: number, bossName: string, killedAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const boss = await findCycleBossByName(bossName);
  if (!boss) throw new Error(`找不到 Boss：${bossName}`);
  const latest = await getLatestGuildKill(guildId, boss.id);
  if (!latest) throw new Error(`${boss.bossName} 尚無擊殺紀錄`);
  const respawnAt = new Date(killedAt.getTime() + boss.respawnHours * 60 * 60 * 1000);
  await db.update(guildCycleBossKills).set({ killedAt, respawnAt }).where(eq(guildCycleBossKills.id, latest.id));
  return { boss, killedAt, respawnAt };
}

export async function resetGuildCycleBosses(guildId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(guildCycleBossKills).where(eq(guildCycleBossKills.guildId, guildId));
}

export async function getNotifyChannels() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(guildChannels).where(eq(guildChannels.isNotifyEnabled, true));
}

export async function getDueNotifications(now = new Date()) {
  const channels = await getNotifyChannels();
  const rows = [] as Array<{ channel: typeof channels[number]; kill: any; boss: any; notifyType: NotifyType }>;
  const statusesByGuild = new Map<number, Awaited<ReturnType<typeof listGuildBossStatus>>>();
  for (const channel of channels) {
    if (!statusesByGuild.has(channel.guildId)) {
      statusesByGuild.set(channel.guildId, await listGuildBossStatus(channel.guildId));
    }
    for (const item of statusesByGuild.get(channel.guildId)!) {
      const kill = item.latestKill;
      if (!kill) continue;
      const minutes = Math.floor((kill.respawnAt.getTime() - now.getTime()) / 60000);
      let notifyType: NotifyType | null = null;
      if (minutes <= 10 && minutes > 5) notifyType = "before10";
      if (minutes <= 5 && minutes > 0) notifyType = "before5";
      if (minutes <= 0 && minutes >= -3) notifyType = "spawned";
      if (!notifyType) continue;
      if (!(await hasNotificationLog(channel.guildId, kill.id, notifyType))) {
        rows.push({ channel, kill, boss: item, notifyType });
      }
    }
  }
  return rows;
}

export async function hasNotificationLog(guildId: number, killId: number, notifyType: NotifyType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db
    .select()
    .from(guildNotificationLogs)
    .where(and(eq(guildNotificationLogs.guildId, guildId), eq(guildNotificationLogs.guildCycleBossKillId, killId), eq(guildNotificationLogs.notifyType, notifyType)))
    .limit(1);
  return rows.length > 0;
}

export async function markNotificationSent(guildId: number, killId: number, notifyType: NotifyType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(guildNotificationLogs).values({ guildId, guildCycleBossKillId: killId, notifyType });
}
