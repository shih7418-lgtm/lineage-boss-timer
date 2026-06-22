/**
 * Home - 天堂W打王計時器主頁面
 * 合併固定王與週期王在同一頁面，支援通知提醒
 */

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useBossTimer } from "@/hooks/useBossTimer";
import { useLocale } from "@/contexts/LocaleContext";
import { useNotification } from "@/hooks/useNotification";
import { trpc } from "@/lib/trpc";
import { BossCard } from "@/components/BossCard";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { HelpPanel } from "@/components/HelpPanel";
import { getDayName, BossScheduleEntry } from "@/lib/bossData";
import {
  Flame, Eye, Clock, Calendar, Bell, BellOff, LogIn, Settings, LogOut,
  Timer, Skull, MapPin, Search, RefreshCw, BellRing, Trash2
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type MainTab = "fixed" | "cycle";
type FixedViewMode = "today" | "upcoming" | "week";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { locale, t } = useLocale();
  const notification = useNotification();

  // 主 Tab 切換
  const [mainTab, setMainTab] = useState<MainTab>("fixed");

  // ===== 固定王相關 =====
  const {
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
  } = useBossTimer();

  const [fixedViewMode, setFixedViewMode] = useState<FixedViewMode>("today");
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());

  const stats = useMemo(() => getStats(), [getStats, tick]);
  const todayList = useMemo(() => todayBosses(), [todayBosses, tick]);
  const upcomingList = useMemo(() => upcoming(15), [upcoming, tick]);
  const dayList = useMemo(() => bossesByDay(selectedDay), [bossesByDay, selectedDay]);

  const displayedBosses: BossScheduleEntry[] = useMemo(() => {
    switch (fixedViewMode) {
      case "today": return todayList;
      case "upcoming": return upcomingList;
      case "week": return dayList;
      default: return todayList;
    }
  }, [fixedViewMode, todayList, upcomingList, dayList]);

  const enabledCount = displayedBosses.filter((b) => isEnabled(b.id)).length;
  const disabledCount = displayedBosses.length - enabledCount;

  const handleToggleCurrentView = (enabled: boolean) => {
    if (fixedViewMode === "week") {
      toggleAllByDay(selectedDay, enabled);
    } else if (fixedViewMode === "today") {
      toggleAllByDay(new Date().getDay(), enabled);
    } else {
      toggleAll(enabled);
    }
    toast.success(enabled
      ? (locale === "en" ? "All notifications enabled" : locale === "ko" ? "모든 알림 켜짐" : "已全部開啟通知")
      : (locale === "en" ? "All notifications disabled" : locale === "ko" ? "모든 알림 꺼짐" : "已全部關閉通知")
    );
  };

  // ===== 週期王相關 =====
  const [cycleTick, setCycleTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [killDialogOpen, setKillDialogOpen] = useState(false);
  const [selectedBossId, setSelectedBossId] = useState<number | null>(null);
  const [killTime, setKillTime] = useState("");
  const [killNotes, setKillNotes] = useState("");

  const utils = trpc.useUtils();

  const { data: bossesWithKills, isLoading: cycleLoading } = trpc.cycleBoss.listWithKills.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const recordKillMutation = trpc.cycleBoss.recordKill.useMutation({
    onSuccess: () => {
      utils.cycleBoss.listWithKills.invalidate();
      toast.success(locale === "en" ? "Kill recorded!" : locale === "ko" ? "처치 기록됨!" : "已登記擊殺！");
      setKillDialogOpen(false);
      setKillTime("");
      setKillNotes("");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const deleteKillMutation = trpc.cycleBoss.deleteKill.useMutation({
    onSuccess: () => {
      utils.cycleBoss.listWithKills.invalidate();
      toast.success(locale === "en" ? "Kill record deleted!" : locale === "ko" ? "처치 기록 삭제됨!" : "已刪除擊殺紀錄！");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleDeleteKill = (killId: number) => {
    if (confirm(locale === "en" ? "Delete this kill record?" : locale === "ko" ? "이 처치 기록을 삭제하시겠습니까?" : "確定刪除此擊殺紀錄？")) {
      deleteKillMutation.mutate({ id: killId });
    }
  };

  // 每分鐘更新倒數
  useEffect(() => {
    const interval = setInterval(() => setCycleTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const getCountdown = (respawnAt: string | Date | null, killedAt?: string | Date | null) => {
    if (!respawnAt) return null;
    const respawnTime = new Date(respawnAt).getTime();
    const now = Date.now();
    let diff = respawnTime - now;
    
    // 5 分鐘不更新自動重置
    if (killedAt) {
      const killTime = new Date(killedAt).getTime();
      const timeSinceKill = now - killTime;
      const fiveMinutes = 5 * 60 * 1000;
      if (timeSinceKill > fiveMinutes && diff <= 0) {
        // 超過 5 分鐘且已重生，會自動重置
        return { text: locale === "en" ? "AUTO-RESET" : locale === "ko" ? "자동 리셋" : "自動重置", isReady: true, isAutoReset: true, totalMinutes: 0 };
      }
    }
    
    if (diff <= 0) return { text: locale === "en" ? "SPAWNED!" : locale === "ko" ? "출현!" : "已重生！", isReady: true, totalMinutes: 0 };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return {
      text: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      isReady: false,
      totalMinutes: hours * 60 + minutes,
    };
  };

  const filteredCycleBosses = useMemo(() => {
    if (!bossesWithKills) return [];
    let filtered = bossesWithKills;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.bossName.toLowerCase().includes(q) ||
          b.region.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q)
      );
    }
    return [...filtered].sort((a, b) => {
      const aKill = a.latestKill;
      const bKill = b.latestKill;
      if (!aKill && !bKill) return a.bossName.localeCompare(b.bossName);
      if (!aKill) return 1;
      if (!bKill) return -1;
      const aCountdown = getCountdown(aKill.respawnAt);
      const bCountdown = getCountdown(bKill.respawnAt);
      if (!aCountdown || !bCountdown) return 0;
      return aCountdown.totalMinutes - bCountdown.totalMinutes;
    });
  }, [bossesWithKills, searchQuery, cycleTick]);

  const handleKillClick = (bossId: number) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setSelectedBossId(bossId);
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setKillTime(localIso);
    setKillDialogOpen(true);
  };

  const handleSubmitKill = () => {
    if (!selectedBossId || !killTime) return;
    recordKillMutation.mutate({
      cycleBossId: selectedBossId,
      killedAt: new Date(killTime).toISOString(),
      notes: killNotes || null,
    });
  };

  // ===== 瀏覽器通知檢查 =====
  useEffect(() => {
    if (notification.permission !== "granted") return;

    const checkInterval = setInterval(() => {
      // 檢查固定王通知
      if (todayList && todayList.length > 0) {
        todayList.forEach((boss) => {
          if (isEnabled(boss.id)) {
            notification.checkFixedBossNotification(
              boss.id,
              boss.name,
              boss.time,
              boss.day
            );
          }
        });
      }

      // 檢查週期王通知
      if (bossesWithKills && bossesWithKills.length > 0) {
        bossesWithKills.forEach((boss) => {
          if (boss.latestKill?.respawnAt) {
            notification.checkCycleBossNotification(
              boss.id,
              boss.bossName,
              boss.latestKill.respawnAt
            );
          }
        });
      }
    }, 30000); // 每 30 秒檢查一次

    return () => clearInterval(checkInterval);
  }, [notification.permission, todayList, bossesWithKills, isEnabled]);

  // 通知權限請求
  const handleRequestNotification = async () => {
    const result = await notification.requestPermission();
    if (result === "granted") {
      toast.success(locale === "en" ? "Notifications enabled! You'll be reminded 5 min before boss spawn." : locale === "ko" ? "알림 활성화! 보스 출현 5분 전에 알려드립니다." : "通知已開啟！Boss 重生前 5 分鐘會彈出提醒。");
    } else if (result === "denied") {
      toast.error(locale === "en" ? "Notification permission denied" : locale === "ko" ? "알림 권한 거부됨" : "通知權限被拒絕，請在瀏覽器設定中允許");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景 */}
      <div
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663403389158/f7hUsL6pbzxxEFk2hTuTvY/hero-bg-n3UfJzdvCo7r5wHgHASJMZ.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />

      {/* 漂浮粒子 */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/60 animate-ember"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-10px`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      {/* 主內容 */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-50">
          <div className="container py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663403389158/f7hUsL6pbzxxEFk2hTuTvY/logo-fFJv4JxTCadmhG8spxUCyR.webp"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="font-display text-lg font-bold text-foreground tracking-wide">
                  {t("appTitle")}
                </h1>
                <p className="text-xs text-muted-foreground">{t("appSubtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* 通知按鈕 */}
              {notification.isSupported && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRequestNotification}
                  className={`gap-1 ${notification.permission === "granted" ? "text-green-400" : "text-muted-foreground hover:text-primary"}`}
                  title={notification.permission === "granted"
                    ? (locale === "en" ? "Notifications ON" : locale === "ko" ? "알림 켜짐" : "通知已開啟")
                    : (locale === "en" ? "Enable notifications" : locale === "ko" ? "알림 활성화" : "開啟通知")}
                >
                  <BellRing className="w-4 h-4" />
                </Button>
              )}
              {isAuthenticated && user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-primary">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {locale === "en" ? "Admin" : locale === "ko" ? "관리" : "管理"}
                    </span>
                  </Button>
                </Link>
              )}
              {isAuthenticated ? (
                <Button variant="ghost" size="sm" onClick={logout} className="gap-1 text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {locale === "en" ? "Logout" : locale === "ko" ? "로그아웃" : "登出"}
                  </span>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => window.location.href = getLoginUrl()} className="gap-1 text-muted-foreground hover:text-primary">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {locale === "en" ? "Login" : locale === "ko" ? "로그인" : "登入"}
                  </span>
                </Button>
              )}
              <LocaleSwitcher />
              <HelpPanel />
            </div>
          </div>
        </header>

        {/* 通知提示橫幅 */}
        {notification.isSupported && notification.permission === "default" && (
          <div className="container pt-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
              <BellRing className="w-5 h-5 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground flex-1">
                {locale === "en"
                  ? "Enable browser notifications to get reminded 5 minutes before boss spawn!"
                  : locale === "ko"
                  ? "보스 출현 5분 전 알림을 받으려면 브라우저 알림을 활성화하세요!"
                  : "開啟瀏覽器通知，Boss 重生前 5 分鐘自動彈出提醒！"}
              </p>
              <Button size="sm" variant="default" onClick={handleRequestNotification} className="shrink-0">
                {locale === "en" ? "Enable" : locale === "ko" ? "활성화" : "開啟"}
              </Button>
            </div>
          </div>
        )}

        {/* 主 Tab：固定王 / 週期王 */}
        <div className="container pt-4 pb-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mainTab === "fixed" ? "default" : "outline"}
              onClick={() => setMainTab("fixed")}
              className="gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              {locale === "en" ? "Fixed Boss" : locale === "ko" ? "고정 보스" : "固定王"}
            </Button>
            <Button
              size="sm"
              variant={mainTab === "cycle" ? "default" : "outline"}
              onClick={() => setMainTab("cycle")}
              className="gap-1.5"
            >
              <Timer className="w-4 h-4" />
              {locale === "en" ? "Cycle Boss" : locale === "ko" ? "주기 보스" : "週期王"}
            </Button>
          </div>
        </div>

        {/* ===== 固定王區塊 ===== */}
        {mainTab === "fixed" && (
          <div>
            {/* 統計摘要 */}
            <div className="container py-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-border bg-card/50">
                  <div className="text-xs text-muted-foreground mb-1">
                    {locale === "en" ? "Today's Bosses" : locale === "ko" ? "오늘 보스" : "今日 Boss"}
                  </div>
                  <div className="font-bold text-foreground">{stats.todayBosses}</div>
                </div>
                <div className="p-3 rounded-lg border border-primary/30 bg-card/50">
                  <div className="text-xs text-muted-foreground mb-1">
                    {locale === "en" ? "Notify ON" : locale === "ko" ? "알림 켜짐" : "通知開啟"}
                  </div>
                  <div className="font-bold text-primary">{stats.enabledToday}</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card/50">
                  <div className="text-xs text-muted-foreground mb-1">
                    {locale === "en" ? "Notify OFF" : locale === "ko" ? "알림 꺼짐" : "通知關閉"}
                  </div>
                  <div className="font-bold text-muted-foreground">{stats.disabledToday}</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card/50">
                  <div className="text-xs text-muted-foreground mb-1">
                    {locale === "en" ? "Total Schedule" : locale === "ko" ? "전체 일정" : "全部排程"}
                  </div>
                  <div className="font-bold text-foreground">{stats.totalBosses}</div>
                </div>
              </div>
            </div>

            {/* 檢視模式切換 */}
            <div className="container pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={fixedViewMode === "today" ? "default" : "outline"}
                  onClick={() => setFixedViewMode("today")}
                  className="gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {locale === "en" ? "Today" : locale === "ko" ? "오늘" : "今天"}
                </Button>
                <Button
                  size="sm"
                  variant={fixedViewMode === "upcoming" ? "default" : "outline"}
                  onClick={() => setFixedViewMode("upcoming")}
                  className="gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {locale === "en" ? "Upcoming" : locale === "ko" ? "다가오는" : "即將到來"}
                </Button>
                <Button
                  size="sm"
                  variant={fixedViewMode === "week" ? "default" : "outline"}
                  onClick={() => setFixedViewMode("week")}
                  className="gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {locale === "en" ? "By Day" : locale === "ko" ? "요일별" : "按星期"}
                </Button>

                <div className="ml-auto flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleCurrentView(true)}
                    className="gap-1 text-xs text-muted-foreground hover:text-primary"
                  >
                    <Bell className="w-3 h-3" />
                    {locale === "en" ? "All ON" : locale === "ko" ? "전체 켜기" : "全開"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleCurrentView(false)}
                    className="gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <BellOff className="w-3 h-3" />
                    {locale === "en" ? "All OFF" : locale === "ko" ? "전체 끄기" : "全關"}
                  </Button>
                </div>
              </div>
            </div>

            {/* 星期選擇器 */}
            <AnimatePresence>
              {fixedViewMode === "week" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="container pb-3"
                >
                  <div className="flex gap-1 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                      <Button
                        key={day}
                        size="sm"
                        variant={selectedDay === day ? "default" : "outline"}
                        onClick={() => setSelectedDay(day)}
                        className="min-w-[40px]"
                      >
                        {getDayName(day, locale)}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 顯示數量 */}
            <div className="container pb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {displayedBosses.length} {locale === "en" ? "bosses" : locale === "ko" ? "보스" : "隻 Boss"}
                    {fixedViewMode === "week" && ` (${getDayName(selectedDay, locale)})`}
                  </span>
                </div>
                <span>
                  <Bell className="w-3 h-3 inline mr-1" />{enabledCount} /
                  <BellOff className="w-3 h-3 inline mx-1" />{disabledCount}
                </span>
              </div>
            </div>

            {/* Boss 卡片網格 */}
            <div className="container pb-8">
              {displayedBosses.length === 0 ? (
                <div className="text-center py-12">
                  <Flame className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {locale === "en" ? "No bosses scheduled" : locale === "ko" ? "예정된 보스 없음" : "此時段無 Boss 排程"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {displayedBosses.map((entry, index) => (
                    <BossCard
                      key={entry.id}
                      entry={entry}
                      isEnabled={isEnabled(entry.id)}
                      onToggle={toggleNotification}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== 週期王區塊 ===== */}
        {mainTab === "cycle" && (
          <div>
            {/* 搜尋列 */}
            <div className="container py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === "en" ? "Search boss name, region..." : locale === "ko" ? "보스명, 지역 검색..." : "搜尋 Boss 名稱、地區..."}
                  className="pl-9 bg-card/50 border-border"
                />
              </div>
            </div>

            {/* 統計 */}
            <div className="container pb-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-border bg-card/50">
                  <div className="text-xs text-muted-foreground mb-1">
                    {locale === "en" ? "Total" : locale === "ko" ? "전체" : "總數"}
                  </div>
                  <div className="font-bold text-foreground">{bossesWithKills?.length || 0}</div>
                </div>
                <div className="p-3 rounded-lg border border-green-500/30 bg-card/50">
                  <div className="text-xs text-muted-foreground mb-1">
                    {locale === "en" ? "Spawned" : locale === "ko" ? "출현" : "已重生"}
                  </div>
                  <div className="font-bold text-green-400">
                    {filteredCycleBosses.filter((b) => {
                      if (!b.latestKill) return false;
                      const c = getCountdown(b.latestKill.respawnAt);
                      return c?.isReady;
                    }).length}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-primary/30 bg-card/50">
                  <div className="text-xs text-muted-foreground mb-1">
                    {locale === "en" ? "Tracked" : locale === "ko" ? "추적중" : "追蹤中"}
                  </div>
                  <div className="font-bold text-primary">
                    {filteredCycleBosses.filter((b) => b.latestKill).length}
                  </div>
                </div>
              </div>
            </div>

            {/* Boss 列表 */}
            <div className="container pb-8">
              {cycleLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {locale === "en" ? "Loading..." : locale === "ko" ? "로딩중..." : "載入中..."}
                  </p>
                </div>
              ) : filteredCycleBosses.length === 0 ? (
                <div className="text-center py-12">
                  <Flame className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {bossesWithKills?.length === 0
                      ? (locale === "en" ? "No cycle bosses configured. Admin can seed default data." : locale === "ko" ? "주기 보스가 없습니다." : "尚無週期王資料。管理員可在後台重置預設資料。")
                      : (locale === "en" ? "No matching bosses" : locale === "ko" ? "일치하는 보스 없음" : "無符合的 Boss")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredCycleBosses.map((boss) => {
                    const countdown = boss.latestKill ? getCountdown(boss.latestKill.respawnAt, boss.latestKill.killedAt) : null;
                    const isReady = countdown?.isReady;
                    const borderColor = isReady
                      ? "border-green-500/60"
                      : countdown
                      ? "border-primary/40"
                      : "border-border";

                    return (
                      <div
                        key={boss.id}
                        className={`p-4 rounded-lg border ${borderColor} bg-card/60 backdrop-blur-sm transition-all hover:bg-card/80`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground text-sm truncate">{boss.bossName}</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{boss.region} - {boss.location}</span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                            {boss.respawnHours}h
                          </div>
                        </div>

                        {countdown ? (
                          <div className={`flex items-center gap-2 mb-3 ${isReady ? "text-green-400" : "text-primary"}`}>
                            <Timer className="w-4 h-4" />
                            <span className="font-mono font-bold text-lg">{countdown.text}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-3 text-muted-foreground/50">
                            <Timer className="w-4 h-4" />
                            <span className="text-sm">
                              {locale === "en" ? "Not tracked" : locale === "ko" ? "미추적" : "未追蹤"}
                            </span>
                          </div>
                        )}

                        {boss.latestKill && (
                          <div className="text-xs text-muted-foreground mb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <Skull className="w-3 h-3 inline mr-1" />
                                {locale === "en" ? "Killed: " : locale === "ko" ? "처치: " : "擊殺: "}
                                {new Date(boss.latestKill.killedAt).toLocaleString()}
                              </div>
                              {user?.role === "admin" && (
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteKill(boss.latestKill!.id)}
                                  title={locale === "en" ? "Delete record" : locale === "ko" ? "기록 삭제" : "刪除紀錄"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant={isReady ? "default" : "outline"}
                          className="w-full gap-1.5"
                          onClick={() => handleKillClick(boss.id)}
                        >
                          <Skull className="w-3.5 h-3.5" />
                          {locale === "en" ? "Record Kill" : locale === "ko" ? "처치 기록" : "登記擊殺"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-border/30 py-4">
          <div className="container text-center text-xs text-muted-foreground">
            <p>{t("footerLine1")}</p>
            <p className="mt-1 text-muted-foreground/60">
              {locale === "en" ? "Schedule updated 2026/05/01 by 天狂月" : locale === "ko" ? "일정 업데이트 2026/05/01 by 天狂月" : "王表更新 2026/05/01 by 天狂月"}
            </p>
          </div>
        </footer>
      </div>

      {/* 登記擊殺 Dialog */}
      <Dialog open={killDialogOpen} onOpenChange={setKillDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {locale === "en" ? "Record Kill" : locale === "ko" ? "처치 기록" : "登記擊殺"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {locale === "en" ? "Kill Time" : locale === "ko" ? "처치 시간" : "擊殺時間"}
              </label>
              <Input
                type="datetime-local"
                value={killTime}
                onChange={(e) => setKillTime(e.target.value)}
                className="bg-secondary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {locale === "en" ? "Notes (optional)" : locale === "ko" ? "비고 (선택)" : "備註（選填）"}
              </label>
              <Input
                value={killNotes}
                onChange={(e) => setKillNotes(e.target.value)}
                placeholder={locale === "en" ? "e.g. Channel 3" : locale === "ko" ? "예: 3채널" : "如：3頻"}
                className="bg-secondary"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setKillDialogOpen(false)}>
                {locale === "en" ? "Cancel" : locale === "ko" ? "취소" : "取消"}
              </Button>
              <Button onClick={handleSubmitKill} disabled={recordKillMutation.isPending}>
                {recordKillMutation.isPending
                  ? (locale === "en" ? "Saving..." : locale === "ko" ? "저장중..." : "儲存中...")
                  : (locale === "en" ? "Confirm" : locale === "ko" ? "확인" : "確認")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
