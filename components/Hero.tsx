"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { ArrowDown, PlayIcon } from "./icons";
import { button } from "./ui";

const FACTS = ["Grid Plotter and Grid Calculator", "Runs offline", "No account"];

export function Hero() {
  const reduce = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);

  // People who ask for less motion get the poster and a play button instead of an autoplaying loop
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (reduce) {
      v.pause();
      v.controls = true;
    } else {
      v.play().catch(() => {});
    }
  }, [reduce]);

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="paper absolute inset-0 -z-10" />
      <div aria-hidden="true" className="absolute top-[-180px] right-[-120px] -z-10 size-[620px] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] blur-2xl" />
      <div aria-hidden="true" className="absolute top-0 left-[-280px] -z-10 size-[520px] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] opacity-60 blur-2xl" />

      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 pt-12 pb-16 sm:px-6 md:pt-20 md:pb-24 lg:grid-cols-[7fr_6fr]">
        <div>
          <motion.span {...rise(0)} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[13px] font-medium text-muted shadow-sm">
            <span className="size-1.5 rounded-full bg-success" />
            A toolkit for grid-connection studies
          </motion.span>
          <motion.h1 {...rise(0.06)} className="mt-6 text-[clamp(38px,5.2vw,64px)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
            Benchmark the simulation.{" "}
            <span className="bg-gradient-to-r from-accent to-[color-mix(in_srgb,var(--accent)_45%,#06b6d4)] bg-clip-text text-transparent">Size the grid.</span>
          </motion.h1>
          <motion.p {...rise(0.12)} className="mt-6 max-w-[52ch] text-lg text-muted md:text-xl">
            PSCAD results next to field data, and the grid behind every test. Offline, on your PC, with the files you already have.
          </motion.p>
          <motion.div {...rise(0.18)} className="mt-8 flex flex-wrap gap-3">
            <a href="#tour" className={`${button.base} ${button.primary}`}>
              <PlayIcon className="size-4" /> Watch the tour
            </a>
            <a href="#plotter" className={`${button.base} ${button.secondary}`}>
              Try it on this page <ArrowDown className="size-4" />
            </a>
          </motion.div>
          <motion.ul {...rise(0.24)} aria-label="At a glance" className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {FACTS.map((f) => (
              <li key={f} className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" /> {f}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative [perspective:1200px]"
        >
          <div aria-hidden="true" className="absolute -inset-4 -z-10 rounded-[24px] bg-[radial-gradient(60%_60%_at_50%_50%,var(--glow),transparent)]" />
          <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-lift">
            <div className="flex items-center gap-1.5 border-b border-line bg-surface-2 px-3 py-2" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-[#ef4444]/70" />
              <span className="size-2.5 rounded-full bg-[#f59e0b]/70" />
              <span className="size-2.5 rounded-full bg-[#22c55e]/70" />
              <span className="ml-2 text-xs text-muted">Swingbus</span>
            </div>
            <video
              ref={video}
              src="/video/swingbus-demo-30s.mp4"
              poster="/video/swingbus-demo-30s-poster.jpg"
              muted
              loop
              playsInline
              autoPlay={!reduce}
              preload="metadata"
              width={1920}
              height={1080}
              className="block h-auto w-full"
              aria-label="Swingbus in 30 seconds: a simulation and a measurement overlaid, the error between them, then the Grid Calculator and its voltage plots"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
