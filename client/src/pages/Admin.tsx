/**
 * Admin - 管理後台頁面
 * 支援 Boss 排程 CRUD 與使用者管理
 */

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Shield,
  Users,
  Calendar,
  LogIn,
  Loader2,
  Timer,
  RefreshCw,
} from "lucide-react";

const DAY_NAMES_ZH = ["日", "一", "二", "三", "四", "五", "六"];
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_KO = ["일", "월", "화", "수", "목", "금", "토"];

function getDayLabel(day: number, locale: string) {
  if (locale === "en") return DAY_NAMES_EN[day];
  if (locale === "ko") return DAY_NAMES_KO[day];
  return DAY_NAMES_ZH[day];
}

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useState<"boss" | "cycle" | "users">("boss");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Shield className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-xl font-bold text-foreground">
          {locale === "en" ? "Login Required" : locale === "ko" ? "로그인 필요" : "需要登入"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {locale === "en" ? "Please login to access the admin panel" : locale === "ko" ? "관리 패널에 접근하려면 로그인하세요" : "請登入以存取管理後台"}
        </p>
        <Button onClick={() => (window.location.href = getLoginUrl())} className="gap-2">
          <LogIn className="w-4 h-4" />
          {locale === "en" ? "Login" : locale === "ko" ? "로그인" : "登入"}
        </Button>
        <Link href="/">
          <Button variant="ghost" className="gap-2 mt-2">
            <ArrowLeft className="w-4 h-4" />
            {locale === "en" ? "Back to Home" : locale === "ko" ? "홈으로" : "返回首頁"}
          </Button>
        </Link>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Shield className="w-16 h-16 text-destructive" />
        <h1 className="text-xl font-bold text-foreground">
          {locale === "en" ? "Access Denied" : locale === "ko" ? "접근 거부" : "權限不足"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {locale === "en" ? "Admin access required" : locale === "ko" ? "관리자 권한이 필요합니다" : "需要管理員權限才能存取此頁面"}
        </p>
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {locale === "en" ? "Back to Home" : locale === "ko" ? "홈으로" : "返回首頁"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                {locale === "en" ? "Back" : locale === "ko" ? "뒤로" : "返回"}
              </Button>
            </Link>
            <h1 className="font-display text-lg font-bold text-foreground">
              {locale === "en" ? "Admin Panel" : locale === "ko" ? "관리 패널" : "管理後台"}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>{user.name || user.email || "Admin"}</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container py-4">
        <div className="flex gap-2 mb-6">
          <Button
            size="sm"
            variant={activeTab === "boss" ? "default" : "outline"}
            onClick={() => setActiveTab("boss")}
            className="gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            {locale === "en" ? "Boss Schedule" : locale === "ko" ? "보스 일정" : "王表管理"}
          </Button>
          <Button
            size="sm"
            variant={activeTab === "cycle" ? "default" : "outline"}
            onClick={() => setActiveTab("cycle")}
            className="gap-1.5"
          >
            <Timer className="w-4 h-4" />
            {locale === "en" ? "Cycle Boss" : locale === "ko" ? "주기 보스" : "週期王管理"}
          </Button>
          <Button
            size="sm"
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className="gap-1.5"
          >
            <Users className="w-4 h-4" />
            {locale === "en" ? "User Management" : locale === "ko" ? "사용자 관리" : "使用者管理"}
          </Button>
        </div>

        {activeTab === "boss" && <BossScheduleManager locale={locale} />}
        {activeTab === "cycle" && <CycleBossManager locale={locale} />}
        {activeTab === "users" && <UserManager locale={locale} />}
      </div>
    </div>
  );
}

// ============ Boss Schedule Manager ============

function BossScheduleManager({ locale }: { locale: string }) {
  const utils = trpc.useUtils();
  const { data: schedules, isLoading } = trpc.boss.list.useQuery();
  const createMutation = trpc.boss.create.useMutation({
    onSuccess: () => {
      utils.boss.list.invalidate();
      toast.success(locale === "en" ? "Boss added" : locale === "ko" ? "보스 추가됨" : "已新增 Boss");
    },
  });
  const updateMutation = trpc.boss.update.useMutation({
    onSuccess: () => {
      utils.boss.list.invalidate();
      toast.success(locale === "en" ? "Boss updated" : locale === "ko" ? "보스 업데이트됨" : "已更新 Boss");
    },
  });
  const seedMutation = trpc.boss.seed.useMutation({
    onSuccess: (data) => {
      utils.boss.list.invalidate();
      toast.success(locale === "en" ? `Seeded ${data.count} entries` : locale === "ko" ? `${data.count}개 초기화됨` : `已初始化 ${data.count} 筆資料`);
    },
  });
  const deleteMutation = trpc.boss.delete.useMutation({
    onSuccess: () => {
      utils.boss.list.invalidate();
      toast.success(locale === "en" ? "Boss deleted" : locale === "ko" ? "보스 삭제됨" : "已刪除 Boss");
    },
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterDay, setFilterDay] = useState<number | "all">("all");

  const filteredSchedules = schedules?.filter(
    (s) => filterDay === "all" || s.dayOfWeek === filterDay
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />
          {locale === "en" ? "Add Boss" : locale === "ko" ? "보스 추가" : "新增 Boss"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (confirm(locale === "en" ? "This will reset all boss data to defaults. Continue?" : locale === "ko" ? "모든 보스 데이터를 초기화하시겠습니까?" : "確定要重置為預設王表資料？這會清除現有所有資料。")) {
              seedMutation.mutate();
            }
          }}
          className="gap-1.5 text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
          disabled={seedMutation.isPending}
        >
          {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {locale === "en" ? "Reset to Defaults" : locale === "ko" ? "기본값 초기화" : "重置預設王表"}
        </Button>

        <Select
          value={filterDay === "all" ? "all" : String(filterDay)}
          onValueChange={(v) => setFilterDay(v === "all" ? "all" : Number(v))}
        >
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {locale === "en" ? "All Days" : locale === "ko" ? "모든 요일" : "全部星期"}
            </SelectItem>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <SelectItem key={d} value={String(d)}>
                {locale === "en" ? DAY_NAMES_EN[d] : locale === "ko" ? DAY_NAMES_KO[d] : `星期${DAY_NAMES_ZH[d]}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground ml-auto">
          {locale === "en" ? `${filteredSchedules?.length || 0} entries` : locale === "ko" ? `${filteredSchedules?.length || 0}개` : `共 ${filteredSchedules?.length || 0} 筆`}
        </span>
      </div>

      {/* Empty state - 提示初始化 */}
      {(!schedules || schedules.length === 0) && (
        <div className="border border-primary/30 rounded-lg p-8 mb-4 text-center bg-primary/5">
          <Calendar className="w-12 h-12 text-primary/50 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-2">
            {locale === "en" ? "No Boss Data" : locale === "ko" ? "보스 데이터 없음" : "尚無固定王資料"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {locale === "en" ? "Click the button below to import the default boss schedule (88 entries)." : locale === "ko" ? "아래 버튼을 클릭하여 기본 보스 일정(88개)을 가져오세요." : "點擊下方按鈕匯入預設固定王時間表（88 筆資料）。"}
          </p>
          <Button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="gap-2"
          >
            {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {locale === "en" ? "Import Default Schedule" : locale === "ko" ? "기본 일정 가져오기" : "匯入預設王表"}
          </Button>
        </div>
      )}

      {/* Schedule Table */}
      {schedules && schedules.length > 0 && (
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Day" : locale === "ko" ? "요일" : "星期"}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Time" : locale === "ko" ? "시간" : "時間"}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Boss Names" : locale === "ko" ? "보스명" : "Boss 名稱"}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Category" : locale === "ko" ? "분류" : "分類"}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">%</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Active" : locale === "ko" ? "활성" : "啟用"}
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Actions" : locale === "ko" ? "작업" : "操作"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSchedules?.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-3 py-2 text-xs">
                    {getDayLabel(schedule.dayOfWeek, locale)}
                  </td>
                  <td className="px-3 py-2 font-mono text-primary text-xs font-bold">
                    {schedule.time}
                  </td>
                  <td className="px-3 py-2 text-xs max-w-[200px] truncate">
                    {schedule.bossNames}
                  </td>
                  <td className="px-3 py-2">
                    <CategoryBadge category={schedule.category} locale={locale} />
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {schedule.maySkip ? "⚠️" : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={(checked) =>
                        updateMutation.mutate({ id: schedule.id, isActive: checked })
                      }
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setEditingId(schedule.id)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm(locale === "en" ? "Delete this boss?" : locale === "ko" ? "이 보스를 삭제하시겠습니까?" : "確定刪除此 Boss？")) {
                            deleteMutation.mutate({ id: schedule.id });
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Add Dialog */}
      <BossFormDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        locale={locale}
        onSubmit={(data) => {
          createMutation.mutate(data);
          setShowAdd(false);
        }}
      />

      {/* Edit Dialog */}
      {editingId && (
        <BossFormDialog
          open={true}
          onOpenChange={() => setEditingId(null)}
          locale={locale}
          initialData={schedules?.find((s) => s.id === editingId)}
          onSubmit={(data) => {
            updateMutation.mutate({ id: editingId, ...data });
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}

// ============ Boss Form Dialog ============

interface BossFormData {
  time: string;
  dayOfWeek: number;
  bossNames: string;
  category: "server" | "world" | "arena";
  maySkip: boolean;
  notes?: string | null;
}

function BossFormDialog({
  open,
  onOpenChange,
  locale,
  initialData,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
  initialData?: BossFormData & { id?: number };
  onSubmit: (data: BossFormData) => void;
}) {
  const [time, setTime] = useState(initialData?.time || "18:00");
  const [dayOfWeek, setDayOfWeek] = useState(initialData?.dayOfWeek ?? 1);
  const [bossNames, setBossNames] = useState(initialData?.bossNames || "");
  const [category, setCategory] = useState<"server" | "world" | "arena">(
    initialData?.category || "server"
  );
  const [maySkip, setMaySkip] = useState(initialData?.maySkip || false);
  const [notes, setNotes] = useState(initialData?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bossNames.trim()) {
      toast.error(locale === "en" ? "Boss name required" : locale === "ko" ? "보스명을 입력하세요" : "請輸入 Boss 名稱");
      return;
    }
    onSubmit({
      time,
      dayOfWeek,
      bossNames: bossNames.trim(),
      category,
      maySkip,
      notes: notes || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {initialData
              ? (locale === "en" ? "Edit Boss" : locale === "ko" ? "보스 편집" : "編輯 Boss")
              : (locale === "en" ? "Add Boss" : locale === "ko" ? "보스 추가" : "新增 Boss")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {locale === "en" ? "Time" : locale === "ko" ? "시간" : "時間"}
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-secondary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {locale === "en" ? "Day" : locale === "ko" ? "요일" : "星期"}
              </label>
              <Select value={String(dayOfWeek)} onValueChange={(v) => setDayOfWeek(Number(v))}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {locale === "en" ? DAY_NAMES_EN[d] : locale === "ko" ? DAY_NAMES_KO[d] : `星期${DAY_NAMES_ZH[d]}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {locale === "en" ? "Boss Names" : locale === "ko" ? "보스명" : "Boss 名稱"}
            </label>
            <Input
              value={bossNames}
              onChange={(e) => setBossNames(e.target.value)}
              placeholder={locale === "en" ? "Separate with commas" : locale === "ko" ? "쉼표로 구분" : "多隻用頓號分隔"}
              className="bg-secondary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {locale === "en" ? "Category" : locale === "ko" ? "분류" : "分類"}
              </label>
              <Select value={category} onValueChange={(v) => setCategory(v as "server" | "world" | "arena")}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="server">
                    {locale === "en" ? "Server" : locale === "ko" ? "서버" : "服內"}
                  </SelectItem>
                  <SelectItem value="world">
                    {locale === "en" ? "World" : locale === "ko" ? "월드" : "世界"}
                  </SelectItem>
                  <SelectItem value="arena">
                    {locale === "en" ? "Arena/Event" : locale === "ko" ? "아레나/이벤트" : "競技場/活動"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Switch checked={maySkip} onCheckedChange={setMaySkip} />
              <span className="text-xs text-muted-foreground">
                {locale === "en" ? "May skip (%)" : locale === "ko" ? "스킵 가능 (%)" : "可能輪空 (%)"}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {locale === "en" ? "Notes" : locale === "ko" ? "비고" : "備註"}
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={locale === "en" ? "Optional" : locale === "ko" ? "선택사항" : "選填"}
              className="bg-secondary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {locale === "en" ? "Cancel" : locale === "ko" ? "취소" : "取消"}
            </Button>
            <Button type="submit">
              {initialData
                ? (locale === "en" ? "Save" : locale === "ko" ? "저장" : "儲存")
                : (locale === "en" ? "Add" : locale === "ko" ? "추가" : "新增")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============ User Manager ============

function UserManager({ locale }: { locale: string }) {
  const utils = trpc.useUtils();
  const { data: usersList, isLoading } = trpc.users.list.useQuery();
  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success(locale === "en" ? "Role updated" : locale === "ko" ? "역할 업데이트됨" : "已更新角色");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Name" : locale === "ko" ? "이름" : "名稱"}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Email" : locale === "ko" ? "이메일" : "Email"}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Login Method" : locale === "ko" ? "로그인 방법" : "登入方式"}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Role" : locale === "ko" ? "역할" : "角色"}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Last Login" : locale === "ko" ? "마지막 로그인" : "最後登入"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usersList?.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-3 py-2 text-xs text-muted-foreground">{u.id}</td>
                  <td className="px-3 py-2 text-xs">{u.name || "-"}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{u.email || "-"}</td>
                  <td className="px-3 py-2 text-xs">{u.loginMethod || "-"}</td>
                  <td className="px-3 py-2">
                    <Select
                      value={u.role}
                      onValueChange={(v) =>
                        updateRoleMutation.mutate({ userId: u.id, role: v as "user" | "admin" })
                      }
                    >
                      <SelectTrigger className="h-7 w-[90px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ Category Badge ============

function CategoryBadge({ category, locale }: { category: string; locale: string }) {
  const labels: Record<string, Record<string, string>> = {
    server: { "zh-TW": "服內", en: "Server", ko: "서버" },
    world: { "zh-TW": "世界", en: "World", ko: "월드" },
    arena: { "zh-TW": "活動", en: "Event", ko: "이벤트" },
  };
  const colors: Record<string, string> = {
    server: "text-muted-foreground bg-muted",
    world: "text-[oklch(0.65_0.15_250)] bg-[oklch(0.65_0.15_250/0.1)]",
    arena: "text-[oklch(0.65_0.22_25)] bg-[oklch(0.65_0.22_25/0.1)]",
  };

  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${colors[category] || ""}`}>
      {labels[category]?.[locale] || labels[category]?.["zh-TW"] || category}
    </span>
  );
}

// ============ Cycle Boss Manager ============

function CycleBossManager({ locale }: { locale: string }) {
  const utils = trpc.useUtils();
  const { data: cycleBosses, isLoading } = trpc.cycleBoss.list.useQuery();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const createMutation = trpc.cycleBoss.create.useMutation({
    onSuccess: () => {
      utils.cycleBoss.list.invalidate();
      utils.cycleBoss.listWithKills.invalidate();
      toast.success(locale === "en" ? "Cycle boss added" : locale === "ko" ? "주기 보스 추가됨" : "已新增週期王");
      setAddDialogOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.cycleBoss.update.useMutation({
    onSuccess: () => {
      utils.cycleBoss.list.invalidate();
      utils.cycleBoss.listWithKills.invalidate();
      toast.success(locale === "en" ? "Updated" : locale === "ko" ? "업데이트됨" : "已更新");
      setEditingId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.cycleBoss.delete.useMutation({
    onSuccess: () => {
      utils.cycleBoss.list.invalidate();
      utils.cycleBoss.listWithKills.invalidate();
      toast.success(locale === "en" ? "Deleted" : locale === "ko" ? "삭제됨" : "已刪除");
    },
    onError: (err) => toast.error(err.message),
  });

  const seedMutation = trpc.cycleBoss.seed.useMutation({
    onSuccess: (data) => {
      utils.cycleBoss.list.invalidate();
      utils.cycleBoss.listWithKills.invalidate();
      toast.success(
        locale === "en"
          ? `Reset complete! ${data.count} cycle bosses loaded.`
          : locale === "ko"
          ? `초기화 완료! ${data.count}개 주기 보스 로드됨.`
          : `重置完成！已載入 ${data.count} 隻週期王。`
      );
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Button size="sm" className="gap-1.5" onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          {locale === "en" ? "Add Cycle Boss" : locale === "ko" ? "주기 보스 추가" : "新增週期王"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => {
            if (confirm(locale === "en" ? "Reset to default cycle bosses? This will clear all existing data." : locale === "ko" ? "기본 주기 보스로 초기화하시겠습니까?" : "重置為預設週期王資料？這將清除所有現有資料。")) {
              seedMutation.mutate();
            }
          }}
          disabled={seedMutation.isPending}
        >
          <RefreshCw className={`w-4 h-4 ${seedMutation.isPending ? "animate-spin" : ""}`} />
          {locale === "en" ? "Reset Default" : locale === "ko" ? "기본값 초기화" : "重置預設"}
        </Button>
        <span className="text-xs text-muted-foreground ml-auto">
          {locale === "en" ? `Total: ${cycleBosses?.length || 0}` : locale === "ko" ? `전체: ${cycleBosses?.length || 0}` : `共 ${cycleBosses?.length || 0} 筆`}
        </span>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Region" : locale === "ko" ? "지역" : "地區"}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Location" : locale === "ko" ? "위치" : "地點"}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Boss Name" : locale === "ko" ? "보스명" : "Boss 名稱"}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Respawn (h)" : locale === "ko" ? "리스폰 (h)" : "重生時數"}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Active" : locale === "ko" ? "활성" : "啟用"}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Actions" : locale === "ko" ? "작업" : "操作"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cycleBosses?.map((boss) => (
                <tr key={boss.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-3 py-2 text-xs">{boss.region}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{boss.location}</td>
                  <td className="px-3 py-2 text-xs font-medium">{boss.bossName}</td>
                  <td className="px-3 py-2 text-xs">{boss.respawnHours}h</td>
                  <td className="px-3 py-2">
                    <Switch
                      checked={boss.isActive}
                      onCheckedChange={(checked) =>
                        updateMutation.mutate({ id: boss.id, isActive: checked })
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => setEditingId(boss.id)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm(locale === "en" ? "Delete this boss?" : locale === "ko" ? "이 보스를 삭제하시겠습니까?" : "確定刪除此 Boss？")) {
                            deleteMutation.mutate({ id: boss.id });
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog */}
      {addDialogOpen && (
        <CycleBossFormDialog
          open={true}
          onOpenChange={setAddDialogOpen}
          locale={locale}
          onSubmit={(data) => createMutation.mutate(data)}
        />
      )}

      {/* Edit Dialog */}
      {editingId && (
        <CycleBossFormDialog
          open={true}
          onOpenChange={() => setEditingId(null)}
          locale={locale}
          initialData={cycleBosses?.find((b) => b.id === editingId)}
          onSubmit={(data) => updateMutation.mutate({ id: editingId, ...data })}
        />
      )}
    </div>
  );
}

// ============ Cycle Boss Form Dialog ============

interface CycleBossFormData {
  region: string;
  location: string;
  bossName: string;
  respawnHours: number;
}

function CycleBossFormDialog({
  open,
  onOpenChange,
  locale,
  initialData,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
  initialData?: CycleBossFormData & { id?: number };
  onSubmit: (data: CycleBossFormData) => void;
}) {
  const [region, setRegion] = useState(initialData?.region || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [bossName, setBossName] = useState(initialData?.bossName || "");
  const [respawnHours, setRespawnHours] = useState(initialData?.respawnHours || 4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!region.trim() || !location.trim() || !bossName.trim()) {
      toast.error(locale === "en" ? "All fields required" : locale === "ko" ? "모든 필드를 입력하세요" : "請填寫所有欄位");
      return;
    }
    onSubmit({ region: region.trim(), location: location.trim(), bossName: bossName.trim(), respawnHours });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {initialData
              ? (locale === "en" ? "Edit Cycle Boss" : locale === "ko" ? "주기 보스 편집" : "編輯週期王")
              : (locale === "en" ? "Add Cycle Boss" : locale === "ko" ? "주기 보스 추가" : "新增週期王")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {locale === "en" ? "Region" : locale === "ko" ? "지역" : "地區"}
            </label>
            <Input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder={locale === "en" ? "e.g. Aden Territory" : locale === "ko" ? "예: 아덴 영지" : "如：亞丁領地"}
              className="bg-secondary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {locale === "en" ? "Location" : locale === "ko" ? "위치" : "地點"}
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={locale === "en" ? "e.g. Giant's Cave" : locale === "ko" ? "예: 거인의 동굴" : "如：巨人峽谷"}
              className="bg-secondary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {locale === "en" ? "Boss Name" : locale === "ko" ? "보스명" : "Boss 名稱"}
            </label>
            <Input
              value={bossName}
              onChange={(e) => setBossName(e.target.value)}
              placeholder={locale === "en" ? "Boss name" : locale === "ko" ? "보스명" : "Boss 名稱"}
              className="bg-secondary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {locale === "en" ? "Respawn Hours" : locale === "ko" ? "리스폰 시간" : "重生時數"}
            </label>
            <Input
              type="number"
              min={1}
              value={respawnHours}
              onChange={(e) => setRespawnHours(Number(e.target.value))}
              className="bg-secondary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {locale === "en" ? "Cancel" : locale === "ko" ? "취소" : "取消"}
            </Button>
            <Button type="submit">
              {initialData
                ? (locale === "en" ? "Save" : locale === "ko" ? "저장" : "儲存")
                : (locale === "en" ? "Add" : locale === "ko" ? "추가" : "新增")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
