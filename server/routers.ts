import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllBossSchedules,
  getBossSchedulesByDay,
  createBossSchedule,
  updateBossSchedule,
  deleteBossSchedule,
  getUserNotificationSettings,
  upsertNotificationSetting,
  bulkUpdateNotificationSettings,
  getAllUsers,
  updateUserRole,
  getAllCycleBosses,
  createCycleBoss,
  updateCycleBoss,
  deleteCycleBoss,
  getAllLatestKills,
  recordKill,
  getKillHistory,
  deleteKillRecord,
  clearAllCycleBosses,
} from "./db";
import { SEED_BOSS_DATA } from "./seed";
import { CYCLE_BOSS_SEED_DATA } from "./cycleBossSeed";
import { getDb } from "./db";
import { bossSchedules, cycleBosses, cycleBossKills } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Boss Schedule CRUD
  boss: router({
    // 取得所有排程（公開）
    list: publicProcedure.query(async () => {
      return getAllBossSchedules();
    }),

    // 取得指定星期的排程（公開）
    byDay: publicProcedure
      .input(z.object({ dayOfWeek: z.number().min(0).max(6) }))
      .query(async ({ input }) => {
        return getBossSchedulesByDay(input.dayOfWeek);
      }),

    // 新增排程（管理員）
    create: adminProcedure
      .input(z.object({
        time: z.string().regex(/^\d{2}:\d{2}$/),
        dayOfWeek: z.number().min(0).max(6),
        bossNames: z.string().min(1),
        category: z.enum(["server", "world", "arena"]),
        maySkip: z.boolean().default(false),
        notes: z.string().nullable().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await createBossSchedule({
          ...input,
          createdBy: ctx.user.id,
        });
        return { id };
      }),

    // 更新排程（管理員）
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        dayOfWeek: z.number().min(0).max(6).optional(),
        bossNames: z.string().min(1).optional(),
        category: z.enum(["server", "world", "arena"]).optional(),
        maySkip: z.boolean().optional(),
        notes: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateBossSchedule(id, data);
        return { success: true };
      }),

    // 刪除排程（管理員）
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBossSchedule(input.id);
        return { success: true };
      }),

    // 初始化預設資料（管理員 - 清空後重新寫入）
    seed: adminProcedure
      .mutation(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        // 清空現有排程
        await db.delete(bossSchedules);
        // 寫入預設資料
        const ids: number[] = [];
        for (const item of SEED_BOSS_DATA) {
          const id = await createBossSchedule({
            ...item,
            createdBy: ctx.user.id,
          });
          ids.push(id);
        }
        return { count: ids.length };
      }),

    // 批量新增排程（管理員 - 用於初始化資料）
    bulkCreate: adminProcedure
      .input(z.array(z.object({
        time: z.string().regex(/^\d{2}:\d{2}$/),
        dayOfWeek: z.number().min(0).max(6),
        bossNames: z.string().min(1),
        category: z.enum(["server", "world", "arena"]),
        maySkip: z.boolean().default(false),
        notes: z.string().nullable().optional(),
      })))
      .mutation(async ({ input, ctx }) => {
        const ids: number[] = [];
        for (const item of input) {
          const id = await createBossSchedule({
            ...item,
            createdBy: ctx.user.id,
          });
          ids.push(id);
        }
        return { ids, count: ids.length };
      }),
  }),

  // 使用者通知設定
  notification: router({
    // 取得當前使用者的通知設定
    mySettings: protectedProcedure.query(async ({ ctx }) => {
      return getUserNotificationSettings(ctx.user.id);
    }),

    // 切換單一 Boss 通知
    toggle: protectedProcedure
      .input(z.object({
        bossScheduleId: z.number(),
        enabled: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        await upsertNotificationSetting(ctx.user.id, input.bossScheduleId, input.enabled);
        return { success: true };
      }),

    // 批量更新通知設定
    bulkToggle: protectedProcedure
      .input(z.object({
        bossScheduleIds: z.array(z.number()),
        enabled: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        await bulkUpdateNotificationSettings(ctx.user.id, input.bossScheduleIds, input.enabled);
        return { success: true };
      }),
  }),

  // 使用者管理（管理員）
  users: router({
    list: adminProcedure.query(async () => {
      return getAllUsers();
    }),

    updateRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      }))
      .mutation(async ({ input }) => {
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),
  }),

  // 週期王管理
  cycleBoss: router({
    // 取得所有週期王（含最新擊殺紀錄）
    listWithKills: publicProcedure.query(async () => {
      return getAllLatestKills();
    }),

    // 取得所有週期王定義
    list: publicProcedure.query(async () => {
      return getAllCycleBosses();
    }),

    // 新增週期王（管理員）
    create: adminProcedure
      .input(z.object({
        region: z.string().min(1),
        location: z.string().min(1),
        bossName: z.string().min(1),
        respawnHours: z.number().min(1),
      }))
      .mutation(async ({ input }) => {
        const id = await createCycleBoss(input);
        return { id };
      }),

    // 更新週期王（管理員）
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        region: z.string().min(1).optional(),
        location: z.string().min(1).optional(),
        bossName: z.string().min(1).optional(),
        respawnHours: z.number().min(1).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateCycleBoss(id, data);
        return { success: true };
      }),

    // 刪除週期王（管理員）
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCycleBoss(input.id);
        return { success: true };
      }),

    // 登記擊殺（登入用戶）
    recordKill: protectedProcedure
      .input(z.object({
        cycleBossId: z.number(),
        killedAt: z.string(), // ISO date string
        notes: z.string().nullable().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const boss = (await getAllCycleBosses()).find(b => b.id === input.cycleBossId);
        if (!boss) throw new Error("Boss not found");

        const killedAtDate = new Date(input.killedAt);
        const respawnAtDate = new Date(killedAtDate.getTime() + boss.respawnHours * 60 * 60 * 1000);

        const id = await recordKill({
          cycleBossId: input.cycleBossId,
          killedAt: killedAtDate,
          respawnAt: respawnAtDate,
          killedBy: ctx.user.id,
          notes: input.notes || null,
        });
        return { id, respawnAt: respawnAtDate };
      }),

    // 取得擊殺歷史
    killHistory: publicProcedure
      .input(z.object({ cycleBossId: z.number(), limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return getKillHistory(input.cycleBossId, input.limit);
      }),

    // 刪除擊殺紀錄（管理員）
    deleteKill: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteKillRecord(input.id);
        return { success: true };
      }),

    // 重置預設週期王資料（管理員）
    seed: adminProcedure
      .mutation(async () => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(cycleBossKills);
        await db.delete(cycleBosses);
        const ids: number[] = [];
        for (const item of CYCLE_BOSS_SEED_DATA) {
          const id = await createCycleBoss(item);
          ids.push(id);
        }
        return { count: ids.length };
      }),
  }),
});

export type AppRouter = typeof appRouter;
