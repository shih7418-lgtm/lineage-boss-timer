CREATE TABLE `boss_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`time` varchar(5) NOT NULL,
	`dayOfWeek` int NOT NULL,
	`bossNames` text NOT NULL,
	`category` enum('server','world','arena') NOT NULL DEFAULT 'server',
	`maySkip` boolean NOT NULL DEFAULT false,
	`notes` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `boss_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_notification_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bossScheduleId` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_notification_settings_id` PRIMARY KEY(`id`)
);
