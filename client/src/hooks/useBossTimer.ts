/**
 * useBossTimer - 固定王時間表管理 Hook
 * 優先從資料庫 API 讀取，fallback 到本地資料
 * 通知開關存在 localStorage（未登入）或資料庫（已登入）
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  FIXED_BOSS_SCHEDULE,
  BossScheduleEntry,
  NotificationSettings,
  loadNotificationSettings,
  saveNotificationSettings,
  isBossNotificationEnabled,
  getTimeUntilNextSpawn,
} from "@/lib/bossData";

export function useBossTimer() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(loadNotificationSettings);
  const [tick, setTick] = useState(0);

  // 從 API 讀取 Boss 排程
  const { data: apiBosses } = trpc.boss.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 分鐘快取
    refetchOnWindowFocus: false,
  });

  // 將 API 資料轉換為前端格式
  const schedule: BossScheduleEntry[] = useMemo(() => {
    if (apiBosses && apiBosses.length > 0) {
      return apiBosses
        .filter((b) => b.isActive)
        .map((b) => ({
          id: `db-${b.id}`,
          name: b.bossNames,
          time: b.time,
          day: b.dayOfWeek,
          category: b.category as "server" | "world" | "arena",
          maySkip: b.maySkip,
          note: b.notes || undefined,
        }));
    }
    // Fallback 到本地資料
    return FIXED_BOSS_SCHEDULE;
  }, [apiBosses]);

  // 每分鐘更新一次倒數計時
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // 切換 Boss 通知開關
  const toggleNotification = useCallback((bossId: string) => {
    setNotificationSettings((prev) => {
      const current = isBossNotificationEnabled(prev, bossId);
      const updated = { ...prev, [bossId]: !current };
      saveNotificationSettings(updated);
      return updated;
    });
  }, []);

  // 批量切換（按時間段或星期幾）
  const toggleAllByDay = useCallback((day: number, enabled: boolean) => {
    setNotificationSettings((prev) => {
      const updated = { ...prev };
      const bosses = schedule.filter((b) => b.day === day);
      bosses.forEach((b) => {
        updated[b.id] = enabled;
      });
      saveNotificationSettings(updated);
      return updated;
    });
  }, [schedule]);

  // 全部開啟/關閉
  const toggleAll = useCallback((enabled: boolean) => {
    setNotificationSettings((prev) => {
      const updated = { ...prev };
      schedule.forEach((b) => {
        updated[b.id] = enabled;
      });
      saveNotificationSettings(updated);
      return updated;
    });
  }, [schedule]);

  // 取得今天的 Boss
  const todayBosses = useCallback((): BossScheduleEntry[] => {
    const today = new Date().getDay();
    return schedule
      .filter((b) => b.day === today)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [schedule, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  // 取得指定天的 Boss
  const bossesByDay = useCallback((day: number): BossScheduleEntry[] => {
    return schedule
      .filter((b) => b.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [schedule]);

  // 取得即將到來的 Boss（跨天排序）
  const upcoming = useCallback((count: number = 10): BossScheduleEntry[] => {
    const sorted = [...schedule].sort((a, b) => {
      const timeA = getTimeUntilNextSpawn(a);
      const timeB = getTimeUntilNextSpawn(b);
      return timeA.totalMinutes - timeB.totalMinutes;
    });
    return sorted.slice(0, count);
  }, [schedule, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  // 判斷某 Boss 通知是否開啟
  const isEnabled = useCallback((bossId: string): boolean => {
    return isBossNotificationEnabled(notificationSettings, bossId);
  }, [notificationSettings]);

  // 取得統計
  const getStats = useCallback(() => {
    const today = new Date().getDay();
    const todayList = schedule.filter((b) => b.day === today);
    const enabledToday = todayList.filter((b) => isBossNotificationEnabled(notificationSettings, b.id));
    const disabledToday = todayList.filter((b) => !isBossNotificationEnabled(notificationSettings, b.id));

    return {
      totalBosses: schedule.length,
      todayBosses: todayList.length,
      enabledToday: enabledToday.length,
      disabledToday: disabledToday.length,
      currentDay: today,
    };
  }, [schedule, notificationSettings, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    schedule,
    notificationSettings,
    toggleNotification,
    toggleAllByDay,
    toggleAll,
    todayBosses,
    bossesByDay,
    upcoming,
    isEnabled,
    getStats,
    tick,
    getTimeUntilNextSpawn,
  };
}
