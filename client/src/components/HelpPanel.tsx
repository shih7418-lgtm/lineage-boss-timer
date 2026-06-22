/**
 * HelpPanel - 使用說明面板
 */

import { useLocale } from "@/contexts/LocaleContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Bell, BellOff, Eye, Clock, Calendar } from "lucide-react";

export function HelpPanel() {
  const { locale } = useLocale();

  const content = getContent(locale);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">{content.btnLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-card border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground font-display text-xl">{content.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 text-sm">
          {/* 功能說明 */}
          <div>
            <h4 className="font-bold text-primary mb-3">{content.featuresTitle}</h4>
            <div className="space-y-2">
              <FeatureRow icon={<Eye className="w-4 h-4 text-primary" />} title={content.todayTitle} desc={content.todayDesc} />
              <FeatureRow icon={<Clock className="w-4 h-4 text-primary" />} title={content.upcomingTitle} desc={content.upcomingDesc} />
              <FeatureRow icon={<Calendar className="w-4 h-4 text-primary" />} title={content.weekTitle} desc={content.weekDesc} />
              <FeatureRow icon={<Bell className="w-4 h-4 text-primary" />} title={content.notifyOnTitle} desc={content.notifyOnDesc} />
              <FeatureRow icon={<BellOff className="w-4 h-4 text-muted-foreground" />} title={content.notifyOffTitle} desc={content.notifyOffDesc} />
            </div>
          </div>

          {/* 分類說明 */}
          <div>
            <h4 className="font-bold text-[oklch(0.82_0.16_85)] mb-3">{content.categoryTitle}</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-muted-foreground/50" />
                <span className="text-muted-foreground">{content.catServer}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[oklch(0.65_0.15_250)]" />
                <span className="text-[oklch(0.65_0.15_250)]">{content.catWorld}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[oklch(0.65_0.22_25)]" />
                <span className="text-[oklch(0.65_0.22_25)]">{content.catArena}</span>
              </div>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="text-xs text-muted-foreground border-t border-border pt-3">
            <p>{content.note1}</p>
            <p className="mt-1">{content.note2}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-2 rounded-md bg-secondary/30">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function getContent(locale: string) {
  if (locale === "en") {
    return {
      btnLabel: "Help",
      title: "How to Use",
      featuresTitle: "Features",
      todayTitle: "Today View",
      todayDesc: "Shows all bosses scheduled for today, sorted by spawn time.",
      upcomingTitle: "Upcoming View",
      upcomingDesc: "Shows the next 15 bosses across all days, sorted by countdown.",
      weekTitle: "By Day View",
      weekDesc: "View boss schedule for any specific day of the week.",
      notifyOnTitle: "Notification ON",
      notifyOnDesc: "Toggle on to receive alerts before boss spawns.",
      notifyOffTitle: "Notification OFF",
      notifyOffDesc: "Toggle off for bosses you don't plan to fight.",
      categoryTitle: "Boss Categories",
      catServer: "Server Boss (gray) — instanced, server-level",
      catWorld: "World Boss (blue) — open world",
      catArena: "Arena / Event (red) — PvP or scheduled events",
      note1: "Data is stored locally in your browser (localStorage).",
      note2: "Schedule based on 2026/05/01 update by 天狂月. (%) means boss may not spawn.",
    };
  }
  if (locale === "ko") {
    return {
      btnLabel: "도움말",
      title: "사용 방법",
      featuresTitle: "기능",
      todayTitle: "오늘 보기",
      todayDesc: "오늘 예정된 모든 보스를 출현 시간순으로 표시합니다.",
      upcomingTitle: "다가오는 보기",
      upcomingDesc: "모든 요일의 다음 15개 보스를 카운트다운순으로 표시합니다.",
      weekTitle: "요일별 보기",
      weekDesc: "특정 요일의 보스 일정을 확인합니다.",
      notifyOnTitle: "알림 켜기",
      notifyOnDesc: "보스 출현 전 알림을 받으려면 켜세요.",
      notifyOffTitle: "알림 끄기",
      notifyOffDesc: "싸우지 않을 보스는 끄세요.",
      categoryTitle: "보스 분류",
      catServer: "서버 보스 (회색) — 인스턴스, 서버 레벨",
      catWorld: "월드 보스 (파랑) — 오픈 월드",
      catArena: "아레나/이벤트 (빨강) — PvP 또는 예정된 이벤트",
      note1: "데이터는 브라우저 로컬에 저장됩니다 (localStorage).",
      note2: "일정 기준: 2026/05/01 업데이트 by 天狂月. (%)는 보스가 출현하지 않을 수 있음을 의미합니다.",
    };
  }
  // zh-TW
  return {
    btnLabel: "使用說明",
    title: "使用說明",
    featuresTitle: "功能介紹",
    todayTitle: "今天檢視",
    todayDesc: "顯示今天所有排程的 Boss，依出現時間排序。",
    upcomingTitle: "即將到來",
    upcomingDesc: "顯示跨天最近的 15 隻 Boss，依倒數時間排序。",
    weekTitle: "按星期檢視",
    weekDesc: "查看指定星期幾的 Boss 排程。",
    notifyOnTitle: "通知開啟",
    notifyOnDesc: "開啟後會在 Boss 出現前提醒您。",
    notifyOffTitle: "通知關閉",
    notifyOffDesc: "不打的 Boss 可以關閉通知，減少干擾。",
    categoryTitle: "Boss 分類",
    catServer: "服內 Boss（灰色）— 副本/伺服器級",
    catWorld: "世界 Boss（藍色）— 開放世界",
    catArena: "競技場/活動（紅色）— PvP 或定時活動",
    note1: "資料儲存於瀏覽器本地（localStorage），清除瀏覽器資料會重置設定。",
    note2: "王表依據 2026/05/01 天狂月 更新。(%) 代表可能輪空。",
  };
}
