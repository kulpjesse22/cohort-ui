"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./Icons";

export type Theme = "light" | "dark";

const STORAGE_KEY = "cohort-theme";
/** Set by `?theme=` in the layout's init script; a choice made here replaces it. */
const VISIT_KEY = "cohort-theme-visit";

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    sessionStorage.removeItem(VISIT_KEY);
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked (some embeds, private modes): the choice holds for this page.
  }
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
    <div role="group" aria-label="Color theme" className="seg w-fit">
      <Option
        label="Light theme"
        icon={<SunIcon />}
        selected={theme === "light"}
        ready={theme !== null}
        onSelect={() => choose("light")}
      />
      <Option
        label="Dark theme"
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
      aria-label={label}
      data-tip={label}
      className={`tip flex h-7 w-8 items-center justify-center ${
        ready && selected ? "text-sidebar-ink" : "text-sidebar-ink-3 hover:text-sidebar-ink"
      }`}
    >
      {icon}
    </button>
  );
}
