/**
 * useNotification - 瀏覽器推播通知 Hook
 * 支援 Boss 重生前彈出提醒
 */

import { useState, useEffect, useCallback, useRef } from "react";

export type NotificationPermission = "default" | "granted" | "denied";

const NOTIFY_BEFORE_MINUTES = 5; // 重生前 5 分鐘通知

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const notifiedRef = useRef<Set<string>>(new Set());

  // 請求通知權限
  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "denied" as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermission);
    return result as NotificationPermission;
  }, []);

  // 發送通知
  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission !== "granted") return null;
      try {
        const notification = new Notification(title, {
          icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663403389158/f7hUsL6pbzxxEFk2hTuTvY/logo-fFJv4JxTCadmhG8spxUCyR.webp",
          badge: "https://d2xsxph8kpxj0f.cloudfront.net/310519663403389158/f7hUsL6pbzxxEFk2hTuTvY/logo-fFJv4JxTCadmhG8spxUCyR.webp",
          ...options,
        });
        // 點擊通知時聚焦視窗
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        return notification;
      } catch {
        return null;
      }
    },
    [permission]
  );

  // 檢查固定王是否需要通知（重生前 N 分鐘）
  const checkFixedBossNotification = useCallback(
    (bossId: string, bossName: string, spawnTime: string, dayOfWeek: number) => {
      if (permission !== "granted") return;

      const now = new Date();
      const today = now.getDay();
      if (today !== dayOfWeek) return;

      const [hours, minutes] = spawnTime.split(":").map(Number);
      const spawnDate = new Date();
      spawnDate.setHours(hours, minutes, 0, 0);

      const diff = spawnDate.getTime() - now.getTime();
      const minutesUntil = diff / (1000 * 60);

      // 在 NOTIFY_BEFORE_MINUTES 分鐘內且尚未通知
      const notifyKey = `fixed-${bossId}-${now.toDateString()}-${spawnTime}`;
      if (
        minutesUntil > 0 &&
        minutesUntil <= NOTIFY_BEFORE_MINUTES &&
        !notifiedRef.current.has(notifyKey)
      ) {
        notifiedRef.current.add(notifyKey);
        sendNotification(`⚔️ Boss 即將重生！`, {
          body: `${bossName} 將在 ${Math.ceil(minutesUntil)} 分鐘後重生 (${spawnTime})`,
          tag: notifyKey,
          requireInteraction: true,
        });
      }
    },
    [permission, sendNotification]
  );

  // 檢查週期王是否需要通知
  const checkCycleBossNotification = useCallback(
    (bossId: number, bossName: string, respawnAt: Date | string | null) => {
      if (permission !== "granted" || !respawnAt) return;

      const respawnTime = new Date(respawnAt).getTime();
      const now = Date.now();
      const diff = respawnTime - now;
      const minutesUntil = diff / (1000 * 60);

      const notifyKey = `cycle-${bossId}-${respawnTime}`;
      if (
        minutesUntil > 0 &&
        minutesUntil <= NOTIFY_BEFORE_MINUTES &&
        !notifiedRef.current.has(notifyKey)
      ) {
        notifiedRef.current.add(notifyKey);
        sendNotification(`⚔️ 週期王即將重生！`, {
          body: `${bossName} 將在 ${Math.ceil(minutesUntil)} 分鐘後重生`,
          tag: notifyKey,
          requireInteraction: true,
        });
      }
    },
    [permission, sendNotification]
  );

  // 清理過期的通知記錄（每小時清理一次）
  useEffect(() => {
    const cleanup = setInterval(() => {
      notifiedRef.current.clear();
    }, 60 * 60 * 1000);
    return () => clearInterval(cleanup);
  }, []);

  return {
    permission,
    requestPermission,
    sendNotification,
    checkFixedBossNotification,
    checkCycleBossNotification,
    isSupported: typeof Notification !== "undefined",
    NOTIFY_BEFORE_MINUTES,
  };
}
