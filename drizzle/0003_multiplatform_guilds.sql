CREATE TABLE `guilds` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(120) NOT NULL,
  `timezone` varchar(64) NOT NULL DEFAULT 'Asia/Taipei',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `guilds_id` PRIMARY KEY(`id`)
);

CREATE TABLE `guild_channels` (
  `id` int AUTO_INCREMENT NOT NULL,
  `guildId` int NOT NULL,
  `platform` enum('discord','line','wechat','telegram','web') NOT NULL,
  `platformGuildId` varchar(128) NOT NULL,
  `channelId` varchar(128) NOT NULL,
  `channelName` varchar(128),
  `isNotifyEnabled` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `guild_channels_id` PRIMARY KEY(`id`)
);

CREATE TABLE `guild_cycle_boss_kills` (
  `id` int AUTO_INCREMENT NOT NULL,
  `guildId` int NOT NULL,
  `cycleBossId` int NOT NULL,
  `killedAt` timestamp NOT NULL,
  `respawnAt` timestamp NOT NULL,
  `sourcePlatform` enum('discord','line','wechat','telegram','web') NOT NULL DEFAULT 'web',
  `sourceUserId` varchar(128),
  `sourceUserName` varchar(128),
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `guild_cycle_boss_kills_id` PRIMARY KEY(`id`)
);

CREATE TABLE `guild_notification_logs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `guildId` int NOT NULL,
  `guildCycleBossKillId` int NOT NULL,
  `notifyType` enum('before10','before5','spawned') NOT NULL,
  `sentAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `guild_notification_logs_id` PRIMARY KEY(`id`)
);
