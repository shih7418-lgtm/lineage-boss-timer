/**
 * CycleBoss - 週期王頁面
 * 顯示所有週期王的重生倒數計時，支援登記擊殺
 */

import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocale } from "@/contexts/LocaleContext";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Flame, Clock, MapPin, Skull, Timer, ArrowLeft,
  Bell, BellOff, Search, RefreshCw, Settings
} from "lucide-react";
import { getLoginUrl } from "@/const";

export default function CycleBoss() {
  const { user, isAuthenticated } = useAuth();
  const { locale } = useLocale();
  const [tick, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [killDialogOpen, setKillDialogOpen] = useState(false);
  const [selectedBossId, setSelectedBossId] = useState<number | null>(null);
  const [killTime, setKillTime] = useState("");
  const [killNotes, setKillNotes] = useState("");

  const utils = trpc.useUtils();

  const { data: bossesWithKills, isLoading } = trpc.cycleBoss.listWithKills.useQuery(undefined, {
    refetchInterval: 60000, // 每分鐘自動刷新
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

  // 每分鐘更新倒數
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // 計算倒數時間
  const getCountdown = (respawnAt: string | Date | null) => {
    if (!respawnAt) return null;
    const respawnTime = new Date(respawnAt).getTime();
    const now = Date.now();
    const diff = respawnTime - now;
    if (diff <= 0) return { text: locale === "en" ? "SPAWNED!" : locale === "ko" ? "출현!" : "已重生！", isReady: true, totalMinutes: 0 };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return {
      text: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      isReady: false,
      totalMinutes: hours * 60 + minutes,
    };
  };

  // 過濾與排序
  const filteredBosses = useMemo(() => {
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
    // 排序：有重生時間的優先（按倒數排序），沒有的排後面
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
  }, [bossesWithKills, searchQuery, tick]);

  const handleKillClick = (bossId: number) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setSelectedBossId(bossId);
    // 預設為現在時間
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

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景 */}
      <div
        className="fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663403389158/f7hUsL6pbzxxEFk2hTuTvY/hero-bg-n3UfJzdvCo7r5wHgHASJMZ.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-50">
          <div className="container py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  {locale === "en" ? "Fixed" : locale === "ko" ? "고정" : "固定王"}
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-lg font-bold text-foreground tracking-wide">
                  {locale === "en" ? "Cycle Boss Timer" : locale === "ko" ? "주기 보스 타이머" : "週期王計時器"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {locale === "en" ? "Track respawn by kill time" : locale === "ko" ? "처치 시간으로 리스폰 추적" : "登記擊殺追蹤重生"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <LocaleSwitcher />
            </div>
          </div>
        </header>

        {/* 搜尋列 */}
        <div className="container py-4">
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
        <div className="container pb-4">
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
                {filteredBosses.filter((b) => {
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
                {filteredBosses.filter((b) => b.latestKill).length}
              </div>
            </div>
          </div>
        </div>

        {/* Boss 列表 */}
        <div className="container pb-8">
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">
                {locale === "en" ? "Loading..." : locale === "ko" ? "로딩중..." : "載入中..."}
              </p>
            </div>
          ) : filteredBosses.length === 0 ? (
            <div className="text-center py-12">
              <Flame className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {bossesWithKills?.length === 0
                  ? (locale === "en" ? "No cycle bosses configured. Admin can seed default data." : locale === "ko" ? "주기 보스가 없습니다. 관리자가 기본 데이터를 설정할 수 있습니다." : "尚無週期王資料。管理員可在後台重置預設資料。")
                  : (locale === "en" ? "No matching bosses" : locale === "ko" ? "일치하는 보스 없음" : "無符合的 Boss")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredBosses.map((boss) => {
                const countdown = boss.latestKill ? getCountdown(boss.latestKill.respawnAt) : null;
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
                    {/* Header */}
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

                    {/* 倒數計時 */}
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

                    {/* 最後擊殺資訊 */}
                    {boss.latestKill && (
                      <div className="text-xs text-muted-foreground mb-3">
                        <Skull className="w-3 h-3 inline mr-1" />
                        {locale === "en" ? "Killed: " : locale === "ko" ? "처치: " : "擊殺: "}
                        {new Date(boss.latestKill.killedAt).toLocaleString()}
                      </div>
                    )}

                    {/* 登記按鈕 */}
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

        {/* Footer */}
        <footer className="border-t border-border/30 py-4">
          <div className="container text-center text-xs text-muted-foreground">
            <p>
              {locale === "en"
                ? "Cycle Boss Timer - Track respawn by recording kill time"
                : locale === "ko"
                ? "주기 보스 타이머 - 처치 시간 기록으로 리스폰 추적"
                : "週期王計時器 - 登記擊殺時間自動計算重生"}
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
