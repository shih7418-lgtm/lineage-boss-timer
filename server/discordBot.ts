import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import {
  clearLatestGuildKill,
  ensureGuildForPlatform,
  getDueNotifications,
  guildKillHistory,
  listGuildBossStatus,
  markNotificationSent,
  recordGuildKill,
  resetGuildCycleBosses,
  setNotifyChannel,
  updateLatestGuildKill,
} from "./platformDb";

let client: Client | null = null;
let started = false;
const pendingRestart = new Set<string>();

function pad(n: number) { return n.toString().padStart(2, "0"); }
function fmt(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
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
  const now = new Date();
  const hm = text.match(/^(\d{1,2}):(\d{2})$/);
  if (hm) {
    const d = new Date(now);
    d.setHours(Number(hm[1]), Number(hm[2]), 0, 0);
    return d;
  }
  const full = new Date(text.replace(" ", "T"));
  if (!Number.isNaN(full.getTime())) return full;
  throw new Error("時間格式錯誤，可用：K 庫約 19:45");
}
function splitCommand(content: string) {
  return content.trim().replace(/\s+/g, " ").split(" ");
}
async function getGuild(message: any) {
  const guild = await ensureGuildForPlatform({
    platform: "discord",
    platformGuildId: message.guildId,
    channelId: message.channelId,
    channelName: message.channel?.name,
    guildName: message.guild?.name,
  });
  return guild;
}
function isAdminLike(message: any) {
  return message.member?.permissions?.has?.("Administrator") || message.member?.permissions?.has?.("ManageGuild");
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
async function reply(message: any, text: string) {
  if (text.length <= 1900) return message.reply(text);
  const chunks = text.match(/[\s\S]{1,1800}/g) || [];
  for (const chunk of chunks) await message.reply(chunk);
}

async function handleMessage(message: any) {
  if (message.author.bot || !message.guildId) return;
  const parts = splitCommand(message.content);
  const cmd = (parts.shift() || "").toUpperCase();
  if (!["K", "KB", "KF", "KN", "KC", "KH", "KE", "KU", "KS", "KSET", "RESTART"].includes(cmd)) return;

  try {
    const guild = await getGuild(message);

    if (cmd === "KSET") {
      if (!isAdminLike(message)) return reply(message, "此指令限管理員使用。");
      await setNotifyChannel({
        platform: "discord",
        platformGuildId: message.guildId,
        channelId: message.channelId,
        channelName: message.channel?.name,
        guildName: message.guild?.name,
      });
      return reply(message, `✅ 已設定本頻道為重生通知頻道：#${message.channel?.name || message.channelId}`);
    }

    if (cmd === "K") {
      const bossName = parts.shift();
      if (!bossName) return reply(message, "用法：K 王名 或 K 王名 19:45");
      const killedAt = parseKillTime(parts);
      const result = await recordGuildKill({
        guildId: guild.id,
        bossName,
        killedAt,
        sourcePlatform: "discord",
        sourceUserId: message.author.id,
        sourceUserName: message.member?.displayName || message.author.username,
      });
      return reply(message, `✅ ${result.boss.bossName} 已登記\n死亡：${fmt(result.killedAt)}\n重生：${fmt(result.respawnAt)}\n剩餘：${left(result.respawnAt)}`);
    }

    if (cmd === "KB") {
      const statuses = await listGuildBossStatus(guild.id);
      return reply(message, `📋 全部週期王\n${topStatuses(statuses)}`);
    }

    if (cmd === "KN") {
      const statuses = await listGuildBossStatus(guild.id);
      return reply(message, `⏭️ 即將重生 TOP 10\n${topStatuses(statuses.filter((s: any) => s.latestKill), 10) || "目前沒有已登記的週期王"}`);
    }

    if (cmd === "KF") {
      const bossName = parts.join(" ").trim();
      if (!bossName) return reply(message, "用法：KF 王名");
      const statuses = await listGuildBossStatus(guild.id);
      const found = statuses.find((b: any) => b.bossName === bossName || b.bossName.includes(bossName));
      if (!found) return reply(message, `找不到 Boss：${bossName}`);
      if (!found.latestKill) return reply(message, `⚫ ${found.bossName}\n尚未登記擊殺`);
      return reply(message, `🔥 ${found.bossName}\n死亡：${fmt(found.latestKill.killedAt)}\n重生：${fmt(found.latestKill.respawnAt)}\n剩餘：${left(found.latestKill.respawnAt)}`);
    }

    if (cmd === "KH") {
      const bossName = parts.join(" ").trim();
      if (!bossName) return reply(message, "用法：KH 王名");
      const { boss, rows } = await guildKillHistory(guild.id, bossName, 10);
      return reply(message, `📜 ${boss.bossName} 最近紀錄\n${rows.map((r: any, i: number) => `${i + 1}. 死亡 ${fmt(r.killedAt)}｜重生 ${fmt(r.respawnAt)}`).join("\n") || "沒有紀錄"}`);
    }

    if (cmd === "KC" || cmd === "KU") {
      const bossName = parts.join(" ").trim();
      if (!bossName) return reply(message, `用法：${cmd} 王名`);
      const result = await clearLatestGuildKill(guild.id, bossName);
      return reply(message, result.deleted ? `✅ 已清除 ${result.boss.bossName} 最新紀錄` : `⚫ ${result.boss.bossName} 沒有可清除紀錄`);
    }

    if (cmd === "KE") {
      const bossName = parts.shift();
      if (!bossName || parts.length === 0) return reply(message, "用法：KE 王名 19:45");
      const killedAt = parseKillTime(parts);
      const result = await updateLatestGuildKill(guild.id, bossName, killedAt);
      return reply(message, `✅ 已修正 ${result.boss.bossName}\n死亡：${fmt(result.killedAt)}\n重生：${fmt(result.respawnAt)}\n剩餘：${left(result.respawnAt)}`);
    }

    if (cmd === "KS") {
      const statuses = await listGuildBossStatus(guild.id);
      const scheduled = statuses.filter((s: any) => s.latestKill).length;
      const spawned = statuses.filter((s: any) => s.latestKill && s.latestKill.respawnAt.getTime() <= Date.now()).length;
      return reply(message, `📊 系統狀態\n週期王：${statuses.length}\n已排程：${scheduled}\n已重生未確認：${spawned}\n下一隻：\n${topStatuses(statuses.filter((s: any) => s.latestKill), 1) || "無"}`);
    }

    if (cmd === "RESTART") {
      if (!isAdminLike(message)) return reply(message, "此指令限管理員使用。");
      const yes = (parts[0] || "").toUpperCase();
      if (yes !== "CONFIRM" && yes !== "YES") {
        pendingRestart.add(`${message.guildId}:${message.author.id}`);
        return reply(message, "⚠️ 確定重置本 Discord 伺服器全部週期王時間？\n請輸入：Restart CONFIRM");
      }
      pendingRestart.delete(`${message.guildId}:${message.author.id}`);
      await resetGuildCycleBosses(guild.id);
      return reply(message, "✅ 已重置本盟全部週期王時間，固定王不受影響。");
    }
  } catch (error: any) {
    console.error("[DiscordBot] command error", error);
    await reply(message, `❌ ${error?.message || "指令執行失敗"}`);
  }
}

async function notificationLoop() {
  if (!client) return;
  try {
    const due = await getDueNotifications();
    for (const item of due) {
      if (item.channel.platform !== "discord") continue;
      const channel = await client.channels.fetch(item.channel.channelId).catch(() => null);
      if (!channel || !(channel instanceof TextChannel)) continue;
      const text = item.notifyType === "spawned"
        ? `🔥 ${item.boss.bossName} 已重生！`
        : `⚠️ ${item.boss.bossName} ${item.notifyType === "before10" ? "10" : "5"} 分鐘後重生｜${fmt(item.kill.respawnAt)}`;
      await channel.send(text);
      await markNotificationSent(item.channel.guildId, item.kill.id, item.notifyType);
    }
  } catch (error) {
    console.error("[DiscordBot] notification error", error);
  }
}

export async function startDiscordBot() {
  if (started) return;
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.log("[DiscordBot] DISCORD_BOT_TOKEN not set, skipped.");
    return;
  }
  started = true;
  client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  });
  client.once("ready", () => {
    console.log(`[DiscordBot] logged in as ${client?.user?.tag}`);
    setInterval(notificationLoop, 60_000);
  });
  client.on("messageCreate", handleMessage);
  await client.login(token);
}
