"use client";

// Cycles system → light → dark. The choice is kept in localStorage and applied by the script in the layout.
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "./icons";

type Pref = "system" | "light" | "dark";
const NEXT: Record<Pref, Pref> = { system: "light", light: "dark", dark: "system" };
const LABEL: Record<Pref, string> = { system: "Theme: follows the system", light: "Theme: light", dark: "Theme: dark" };

export function ThemeToggle() {
  const [pref, setPref] = useState<Pref>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the saved choice once, after hydration
      if (saved === "light" || saved === "dark") setPref(saved);
    } catch {
      // Storage can be blocked; the system setting then decides
    }
  }, []);

  const choose = () => {
    const next = NEXT[pref];
    setPref(next);
    const root = document.documentElement;
    if (next === "system") delete root.dataset.theme;
    else root.dataset.theme = next;
    try {
      if (next === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch {
      // Not saved, but applied for this visit
    }
  };

  const Icon = pref === "light" ? Sun : pref === "dark" ? Moon : Monitor;
  return (
    <button
      type="button"
      onClick={choose}
      className="grid size-9 place-items-center rounded-lg border border-line bg-surface text-muted transition-colors hover:text-fg"
      aria-label={`${LABEL[pref]}. Change it`}
      title={LABEL[pref]}
    >
      <Icon className="size-[18px]" />
    </button>
  );
}
