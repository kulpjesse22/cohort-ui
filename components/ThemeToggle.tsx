"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "cohort-theme";

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  // Rendered only after mount: the server cannot know the stored choice, and
  // guessing produces a flash plus a hydration mismatch.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function choose(next: Theme) {
    applyTheme(next);
    setTheme(next);
  }

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="flex items-center gap-0.5 rounded-md border border-sidebar-line-strong p-0.5"
    >
      <Option
        label="Light"
        icon={<SunIcon />}
        selected={theme === "light"}
        ready={theme !== null}
        onSelect={() => choose("light")}
      />
      <Option
        label="Dark"
        icon={<MoonIcon />}
        selected={theme === "dark"}
        ready={theme !== null}
        onSelect={() => choose("dark")}
      />
    </div>
  );
}

function Option({
  label,
  icon,
  selected,
  ready,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  ready: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={ready ? selected : undefined}
      title={`${label} theme`}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1 text-[11px] transition-colors ${
        ready && selected
          ? "bg-sidebar-active text-sidebar-ink"
          : "text-sidebar-ink-3 hover:text-sidebar-ink"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1.5v1.4M8 13.1v1.4M14.5 8h-1.4M2.9 8H1.5M12.6 3.4l-1 1M4.4 11.6l-1 1M12.6 12.6l-1-1M4.4 4.4l-1-1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.8 5.8 0 1 0 7.1 7.1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
