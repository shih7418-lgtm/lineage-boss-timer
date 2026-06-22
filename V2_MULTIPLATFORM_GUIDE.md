# 天堂W打王計時器 V2 多平台升級說明

本版已加入「同一套網站資料庫，串接 Discord / LINE / 微信」的基礎架構。

## 已完成

- 多盟/多群組資料隔離：`guilds`
- 平台綁定資料表：`guild_channels`
- 各盟獨立週期王擊殺紀錄：`guild_cycle_boss_kills`
- 通知去重紀錄：`guild_notification_logs`
- Discord Bot 純文字指令
- Generic Webhook API，可給 LINE / 微信 Adapter 呼叫

## Discord 指令

```txt
K 王名              登記擊殺
K 王名 19:45        補登擊殺時間
KB                  查看全部週期王
KF 王名             查詢單一王
KN                  即將重生 TOP 10
KC 王名             清除該王最新紀錄
KH 王名             擊殺歷史
KE 王名 19:45       修正最新擊殺時間
KU 王名             撤銷最新紀錄
KS                  系統狀態
KSET                設定目前頻道為通知頻道
Restart             重置確認
Restart CONFIRM     重置本盟全部週期王時間
```

## LINE / 微信串接方式

目前不直接綁死 LINE 或微信 SDK，而是提供同一個入口：

```http
POST /api/platform/command
x-platform-token: PLATFORM_WEBHOOK_TOKEN
Content-Type: application/json
```

Body 範例：

```json
{
  "platform": "line",
  "platformGuildId": "LINE_GROUP_ID",
  "channelId": "LINE_GROUP_ID",
  "channelName": "戰神盟LINE群",
  "guildName": "戰神盟",
  "userId": "USER_ID",
  "userName": "血夢",
  "text": "K 庫約 19:45",
  "isAdmin": true
}
```

回傳：

```json
{
  "reply": "✅ 庫約 已登記\n死亡：6/22 19:45\n重生：6/22 23:45\n剩餘：4時0分"
}
```

LINE Bot 或微信 Bot 只要把群組訊息轉成這個 API 呼叫，再把 `reply` 回覆到群組即可。

## 部署步驟

1. 安裝依賴

```bash
npm install
```

2. 建立 `.env`

```bash
cp .env.example .env
```

3. 填入資料庫與 Discord Token。

4. 建立資料表

```bash
npm run db:push
```

5. 啟動

```bash
npm run dev
```

Production：

```bash
npm run build
npm start
```

## Discord Developer Portal 必開

Bot 需要讀取 `K 庫約` 這種純文字訊息，所以要開：

- MESSAGE CONTENT INTENT
- SERVER MEMBERS INTENT 可不開
- PRESENCE INTENT 可不開

## 注意

目前網站 UI 仍使用原本全站週期王資料。V2 的 Discord / LINE / 微信會使用新的 guild-scoped 紀錄，避免 A盟與 B盟互相污染。下一階段可以把網站前端也加上「選擇盟/群組」畫面，讓 Web UI 同步顯示同一份 guild 紀錄。
