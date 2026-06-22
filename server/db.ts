import { eq, and, asc, desc, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, bossSchedules, InsertBossSchedule, userNotificationSettings, cycleBosses, InsertCycleBoss, cycleBossKills, InsertCycleBossKill } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Boss Schedule Queries ============

export async function getAllBossSchedules() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bossSchedules).orderBy(asc(bossSchedules.dayOfWeek), asc(bossSchedules.time));
}

export async function getBossSchedulesByDay(dayOfWeek: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bossSchedules)
    .where(eq(bossSchedules.dayOfWeek, dayOfWeek))
    .orderBy(asc(bossSchedules.time));
}

export async function createBossSchedule(data: InsertBossSchedule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bossSchedules).values(data);
  return result[0].insertId;
}

export async function updateBossSchedule(id: number, data: Partial<InsertBossSchedule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bossSchedules).set(data).where(eq(bossSchedules.id, id));
}

export async function deleteBossSchedule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(bossSchedules).where(eq(bossSchedules.id, id));
  await db.delete(userNotificationSettings).where(eq(userNotificationSettings.bossScheduleId, id));
}

// ============ User Notification Settings ============

export async function getUserNotificationSettings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userNotificationSettings)
    .where(eq(userNotificationSettings.userId, userId));
}

export async function upsertNotificationSetting(userId: number, bossScheduleId: number, enabled: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(userNotificationSettings)
    .where(and(
      eq(userNotificationSettings.userId, userId),
      eq(userNotificationSettings.bossScheduleId, bossScheduleId)
    ))
    .limit(1);

  if (existing.length > 0) {
    await db.update(userNotificationSettings)
      .set({ enabled })
      .where(eq(userNotificationSettings.id, existing[0].id));
  } else {
    await db.insert(userNotificationSettings).values({
      userId,
      bossScheduleId,
      enabled,
    });
  }
}

export async function bulkUpdateNotificationSettings(userId: number, bossScheduleIds: number[], enabled: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (const bossScheduleId of bossScheduleIds) {
    await upsertNotificationSetting(userId, bossScheduleId, enabled);
  }
}

// ============ User Management ============

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(asc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ============ Cycle Boss Queries ============

export async function getAllCycleBosses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cycleBosses).orderBy(asc(cycleBosses.region), asc(cycleBosses.bossName));
}

export async function createCycleBoss(data: InsertCycleBoss) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cycleBosses).values(data);
  return result[0].insertId;
}

export async function updateCycleBoss(id: number, data: Partial<InsertCycleBoss>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cycleBosses).set(data).where(eq(cycleBosses.id, id));
}

export async function deleteCycleBoss(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cycleBossKills).where(eq(cycleBossKills.cycleBossId, id));
  await db.delete(cycleBosses).where(eq(cycleBosses.id, id));
}

// ============ Cycle Boss Kill Records ============

export async function getLatestKillForBoss(cycleBossId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(cycleBossKills)
    .where(eq(cycleBossKills.cycleBossId, cycleBossId))
    .orderBy(desc(cycleBossKills.killedAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllLatestKills() {
  const db = await getDb();
  if (!db) return [];
  // Get all cycle bosses with their latest kill record
  const bosses = await db.select().from(cycleBosses).where(eq(cycleBosses.isActive, true));
  const results = [];
  for (const boss of bosses) {
    const latestKill = await getLatestKillForBoss(boss.id);
    results.push({
      ...boss,
      latestKill,
    });
  }
  return results;
}

export async function recordKill(data: InsertCycleBossKill) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cycleBossKills).values(data);
  return result[0].insertId;
}

export async function getKillHistory(cycleBossId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cycleBossKills)
    .where(eq(cycleBossKills.cycleBossId, cycleBossId))
    .orderBy(desc(cycleBossKills.killedAt))
    .limit(limit);
}

export async function deleteKillRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cycleBossKills).where(eq(cycleBossKills.id, id));
}

export async function clearAllCycleBosses() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cycleBossKills);
  await db.delete(cycleBosses);
}
