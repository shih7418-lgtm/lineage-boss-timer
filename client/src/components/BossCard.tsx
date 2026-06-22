/**
 * BossCard - 固定王時間卡片
 * 顯示 Boss 名稱、時間、倒數、通知開關
 */

import { BossScheduleEntry, getTimeUntilNextSpawn, formatCountdown, getCategoryColor, getCategoryLabel } from "@/lib/bossData";
import { useLocale } from "@/contexts/LocaleContext";
import { Clock, Bell, BellOff, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

interface BossCardProps {
  entry: BossScheduleEntry;
  isEnabled: boolean;
  onToggle: (id: string) => void;
  index: number;
}

export function BossCard({ entry, isEnabled, onToggle, index }: BossCardProps) {
  const { locale } = useLocale();
  const timeInfo = getTimeUntilNextSpawn(entry);

  const getUrgencyClass = () => {
    if (!isEnabled) return "border-border opacity-50";
    if (timeInfo.totalMinutes <= 5) return "border-[oklch(0.55_0.22_25)] shadow-[0_0_15px_oklch(0.55_0.22_25/0.5)] animate-pulse";
    if (timeInfo.totalMinutes <= 30) return "border-[oklch(0.65_0.22_30)] shadow-[0_0_12px_oklch(0.65_0.22_30/0.3)]";
    if (timeInfo.isToday) return "border-[oklch(0.72_0.19_160)] shadow-[0_0_8px_oklch(0.72_0.19_160/0.2)]";
    return "border-border";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className={`
        relative rounded-lg border-2 p-3 transition-all duration-300
        bg-card hover:translate-y-[-1px]
        ${getUrgencyClass()}
      `}
    >
      {/* 頂部：時間 + 分類 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-primary">{entry.time}</span>
          {entry.maySkip && (
            <AlertTriangle className="w-3.5 h-3.5 text-[oklch(0.82_0.16_85)]" />
          )}
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded bg-secondary ${getCategoryColor(entry.category)}`}>
          {getCategoryLabel(entry.category, locale)}
        </span>
      </div>

      {/* Boss 名稱 */}
      <div className="mb-2">
        <p className="text-sm font-medium text-foreground leading-relaxed">{entry.name}</p>
        {entry.note && (
          <p className="text-xs text-muted-foreground mt-0.5">({entry.note})</p>
        )}
      </div>

      {/* 倒數計時 */}
      <div className="flex items-center gap-1.5 mb-3">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <span className={`text-sm font-mono ${
          timeInfo.totalMinutes <= 5
            ? "text-[oklch(0.55_0.22_25)] font-bold"
            : timeInfo.totalMinutes <= 30
              ? "text-[oklch(0.65_0.22_30)]"
              : timeInfo.isToday
                ? "text-[oklch(0.72_0.19_160)]"
                : "text-muted-foreground"
        }`}>
          {formatCountdown(timeInfo.totalMinutes, locale)}
        </span>
        {timeInfo.isToday && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-[oklch(0.72_0.19_160/0.15)] text-[oklch(0.72_0.19_160)]">
            {locale === "en" ? "Today" : locale === "ko" ? "오늘" : "今天"}
          </span>
        )}
      </div>

      {/* 通知開關 */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isEnabled ? (
            <Bell className="w-3.5 h-3.5 text-primary" />
          ) : (
            <BellOff className="w-3.5 h-3.5" />
          )}
          <span>{isEnabled
            ? (locale === "en" ? "Notify ON" : locale === "ko" ? "알림 켜짐" : "通知開啟")
            : (locale === "en" ? "Notify OFF" : locale === "ko" ? "알림 꺼짐" : "通知關閉")
          }</span>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={() => onToggle(entry.id)}
          className="scale-75"
        />
      </div>
    </motion.div>
  );
}
