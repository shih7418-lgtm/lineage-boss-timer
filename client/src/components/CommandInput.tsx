/**
 * CommandInput - 遊戲風格的指令輸入框
 * 模擬遊戲聊天框，支援 K/KB/KF/KN/KC/KS/Restart 指令
 */

import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Terminal } from "lucide-react";

interface CommandInputProps {
  onCommand: (command: string, args: string[]) => void;
}

export function CommandInput({ onCommand }: CommandInputProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLocale();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setHistory((prev) => [trimmed, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toUpperCase();
    const args = parts.slice(1);

    onCommand(cmd, args);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center gap-2 bg-[oklch(0.1_0.01_280)] border border-border rounded-lg px-4 py-3 focus-within:border-primary/50 focus-within:shadow-[0_0_10px_oklch(0.65_0.22_30/0.2)] transition-all duration-200">
        <Terminal className="w-4 h-4 text-primary shrink-0" />
        <span className="text-primary font-mono text-sm shrink-0">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("commandPlaceholder")}
          className="flex-1 bg-transparent border-none outline-none text-foreground font-mono text-sm placeholder:text-muted-foreground/50"
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="px-1.5 py-0.5 rounded bg-secondary font-mono">K Boss</span>
        <span className="px-1.5 py-0.5 rounded bg-secondary font-mono">KB</span>
        <span className="px-1.5 py-0.5 rounded bg-secondary font-mono">KF Boss</span>
        <span className="px-1.5 py-0.5 rounded bg-secondary font-mono">KN</span>
        <span className="px-1.5 py-0.5 rounded bg-secondary font-mono">KC Boss</span>
        <span className="px-1.5 py-0.5 rounded bg-secondary font-mono">KS</span>
        <span className="px-1.5 py-0.5 rounded bg-secondary font-mono">Help</span>
      </div>
    </form>
  );
}
