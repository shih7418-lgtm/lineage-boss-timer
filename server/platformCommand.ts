import {
  clearLatestGuildKill,
  ensureGuildForPlatform,
  guildKillHistory,
  listGuildBossStatus,
  recordGuildKill,
  resetGuildCycleBosses,
  setNotifyChannel,
  updateLatestGuildKill,
  Platform,
} from "./platformDb";

function pad(n: number) { return n.toString().padStart(2, "0"); }
function fmt(date: Date) { return `${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`; }
function left(respawnAt: Date) {
  const ms = respawnAt.getTime() - Date.now();
  if (ms <= 0) return "已重生";
  const min = Math.ceil(ms / 60000);
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}時${m}分` : `${m}分`;
}
function parseKillTime(parts: string[]) {
  const text = parts.join(" ").trim();
  if (!text) return new Date();
  const hm = text.match(/^(\d{1,2}):(\d{2})$/);
  if (hm) {
    const d = new Date();
    d.setHours(Number(hm[1]), Number(hm[2]), 0, 0);
    return d;
  }
  const full = new Date(text.replace(" ", "T"));
  if (!Number.isNaN(full.getTime())) return full;
  throw new Error("時間格式錯誤，可用：K 庫約 19:45");
}
function topStatuses(statuses: any[], limit?: number) {
  const now = Date.now();
  return statuses
    .map((b: any) => ({ ...b, sortTime: b.latestKill?.respawnAt?.getTime?.() ?? Number.MAX_SAFE_INTEGER }))
    .sort((a: any, b: any) => a.sortTime - b.sortTime)
    .slice(0, limit || statuses.length)
    .map((b: any, i: number) => {
      if (!b.latestKill) return `${i + 1}. ⚫ ${b.bossName} 未登記`;
      const spawned = b.latestKill.respawnAt.getTime() <= now;
      const icon = spawned ? "🟢" : (b.latestKill.respawnAt.getTime() - now <= 10 * 60000 ? "🟡" : "🔴");
      return `${i + 1}. ${icon} ${b.bossName} ${left(b.latestKill.respawnAt)}｜重生 ${fmt(b.latestKill.respawnAt)}`;
    })
    .join("\n");
}

export async function executePlatformCommand(input: {
  platform: Platform;
  platformGuildId: string;
  channelId: string;
  channelName?: string | null;
  guildName?: string | null;
  userId?: string | null;
  userName?: string | null;
  text: string;
  isAdmin?: boolean;
}) {
  const parts = input.text.trim().replace(/\s+/g, " ").split(" ");
  const cmd = (parts.shift() || "").toUpperCase();
  const guild = await ensureGuildForPlatform(input);

  if (cmd === "KSET") {
    if (!input.isAdmin) return "此指令限管理員使用。";
    await setNotifyChannel(input);
    return "✅ 已設定本群組為重生通知群組";
  }
  if (cmd === "K") {
    const bossName = parts.shift();
    if (!bossName) return "用法：K 王名 或 K 王名 19:45";
    const killedAt = parseKillTime(parts);
    const result = await recordGuildKill({ guildId: guild.id, bossName, killedAt, sourcePlatform: input.platform, sourceUserId: input.userId, sourceUserName: input.userName });
    return `✅ ${result.boss.bossName} 已登記\n死亡：${fmt(result.killedAt)}\n重生：${fmt(result.respawnAt)}\n剩餘：${left(result.respawnAt)}`;
  }
  if (cmd === "KB") return `📋 全部週期王\n${topStatuses(await listGuildBossStatus(guild.id))}`;
  if (cmd === "KN") return `⏭️ 即將重生 TOP 10\n${topStatuses((await listGuildBossStatus(guild.id)).filter((s: any) => s.latestKill), 10) || "目前沒有已登記的週期王"}`;
  if (cmd === "KF") {
    const bossName = parts.join(" ").trim();
    const found = (await listGuildBossStatus(guild.id)).find((b: any) => b.bossName === bossName || b.bossName.includes(bossName));
    if (!found) return `找不到 Boss：${bossName}`;
    if (!found.latestKill) return `⚫ ${found.bossName}\n尚未登記擊殺`;
    return `🔥 ${found.bossName}\n死亡：${fmt(found.latestKill.killedAt)}\n重生：${fmt(found.latestKill.respawnAt)}\n剩餘：${left(found.latestKill.respawnAt)}`;
  }
  if (cmd === "KH") {
    const bossName = parts.join(" ").trim();
    const { boss, rows } = await guildKillHistory(guild.id, bossName, 10);
    return `📜 ${boss.bossName} 最近紀錄\n${rows.map((r: any, i: number) => `${i + 1}. 死亡 ${fmt(r.killedAt)}｜重生 ${fmt(r.respawnAt)}`).join("\n") || "沒有紀錄"}`;
  }
  if (cmd === "KC" || cmd === "KU") {
    const result = await clearLatestGuildKill(guild.id, parts.join(" ").trim());
    return result.deleted ? `✅ 已清除 ${result.boss.bossName} 最新紀錄` : `⚫ ${result.boss.bossName} 沒有可清除紀錄`;
  }
  if (cmd === "KE") {
    const bossName = parts.shift();
    if (!bossName) return "用法：KE 王名 19:45";
    const result = await updateLatestGuildKill(guild.id, bossName, parseKillTime(parts));
    return `✅ 已修正 ${result.boss.bossName}\n死亡：${fmt(result.killedAt)}\n重生：${fmt(result.respawnAt)}\n剩餘：${left(result.respawnAt)}`;
  }
  if (cmd === "KS") {
    const statuses = await listGuildBossStatus(guild.id);
    const scheduled = statuses.filter((s: any) => s.latestKill).length;
    const spawned = statuses.filter((s: any) => s.latestKill && s.latestKill.respawnAt.getTime() <= Date.now()).length;
    return `📊 系統狀態\n週期王：${statuses.length}\n已排程：${scheduled}\n已重生未確認：${spawned}\n下一隻：\n${topStatuses(statuses.filter((s: any) => s.latestKill), 1) || "無"}`;
  }
  if (cmd === "RESTART") {
    if (!input.isAdmin) return "此指令限管理員使用。";
    if (!["CONFIRM", "YES"].includes((parts[0] || "").toUpperCase())) return "⚠️ 確定重置全部週期王時間？\n請輸入：Restart CONFIRM";
    await resetGuildCycleBosses(guild.id);
    return "✅ 已重置本群組全部週期王時間，固定王不受影響。";
  }
  return null;
}
