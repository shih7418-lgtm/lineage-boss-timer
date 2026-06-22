CREATE TABLE `cycle_boss_kills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cycleBossId` int NOT NULL,
	`killedAt` timestamp NOT NULL,
	`respawnAt` timestamp NOT NULL,
	`killedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cycle_boss_kills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cycle_bosses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`region` varchar(100) NOT NULL,
	`location` varchar(100) NOT NULL,
	`bossName` varchar(100) NOT NULL,
	`respawnHours` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cycle_bosses_id` PRIMARY KEY(`id`)
);
