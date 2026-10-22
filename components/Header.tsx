"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { DOWNLOAD } from "@/lib/release";
import { Close, Mark, Menu } from "./icons";
import { ThemeToggle } from "./ThemeToggle";
import { button } from "./ui";

const LINKS = [
  { id: "overview", label: "What it does" },
  { id: "plotter", label: "Plotter" },
  { id: "calculator", label: "Calculator" },
  { id: "inside", label: "Inside the app" },
  { id: "tour", label: "Tour" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  // The link of the section in view is marked as current
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter((s): s is HTMLElement => !!s);
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        setActive(LINKS.find((l) => seen.get(l.id))?.id ?? "");
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 ${
        scrolled || open ? "border-line bg-[color-mix(in_srgb,var(--page)_82%,transparent)]" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="inline-flex items-center gap-2.5 text-lg font-bold" aria-label="Swingbus, back to the top">
          <span className="grid size-7 place-items-center rounded-[7px] bg-accent text-white shadow-[0_6px_16px_-6px_var(--accent)]">
            <Mark className="size-[18px]" />
          </span>
          Swingbus
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              aria-current={active === l.id ? "location" : undefined}
              className="relative rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-fg aria-[current=location]:text-fg"
            >
              {active === l.id && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-lg bg-surface-2" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              )}
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="hidden sm:block">
            <a href="#feedback" className={`${button.base} ${button.sm} ${button.secondary}`}>
              Send feedback
            </a>
          </span>
          <span className="hidden sm:block">
            <a href={DOWNLOAD.installer} className={`${button.base} ${button.sm} ${button.primary}`}>
              Download
            </a>
          </span>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg border border-line bg-surface lg:hidden"
            aria-expanded={open}
            aria-controls={open ? "mobile-menu" : undefined}
            aria-label={open ? "Close the menu" : "Open the menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <Close className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* The phone menu lies over the page rather than pushing it down, and only fades and slides:
          animating its height would make Motion measure the page and cancel the scroll to the link */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Sections"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full border-y border-line bg-page shadow-lift lg:hidden"
          >
            <ul className="mx-auto grid max-w-[1200px] gap-1 px-4 py-3 sm:px-6">
              {[...LINKS, { id: "feedback", label: "Send feedback" }].map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-surface-2 ${active === l.id ? "bg-surface-2 text-fg" : "text-muted"}`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      <motion.div aria-hidden="true" className="absolute inset-x-0 bottom-[-1px] h-[2px] origin-left bg-accent" style={{ scaleX: progress }} />
    </header>
  );
}
