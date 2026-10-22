"use client";

import { useEffect, useRef } from "react";
import { DOWNLOAD, VERSION } from "@/lib/release";
import { DownloadIcon, PlayIcon } from "./icons";
import { button } from "./ui";

const FACTS = ["Grid Plotter and Grid Calculator", "Runs offline", "No account"];

// Each line of the hero rises in a moment after the one before (the .enter animation in globals.css)
const delay = (s: number) => ({ "--delay": `${s}s` }) as React.CSSProperties;

export function Hero() {
  const video = useRef<HTMLVideoElement>(null);

  // The video arrives with a play button, which is what people who ask for less motion, and browsers
  // without JavaScript, keep. Everyone else gets the silent loop instead.
  useEffect(() => {
    const v = video.current;
    if (!v || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.controls = false;
    v.muted = true;
    v.play().catch(() => {
      v.controls = true;
    });
  }, []);

  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="paper absolute inset-0 -z-10" />
      <div aria-hidden="true" className="absolute top-[-180px] right-[-120px] -z-10 size-[620px] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] blur-2xl" />
      <div aria-hidden="true" className="absolute top-0 left-[-280px] -z-10 size-[520px] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] opacity-60 blur-2xl" />

      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 pt-12 pb-16 sm:px-6 md:pt-20 md:pb-24 lg:grid-cols-[7fr_6fr]">
        <div>
          <span style={delay(0)} className="enter inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[13px] font-medium text-muted shadow-sm">
            <span className="size-1.5 rounded-full bg-success" />
            A toolkit for grid-connection studies
          </span>
          <h1 style={delay(0.06)} className="enter mt-6 text-[clamp(38px,5.2vw,64px)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
            Benchmark the simulation.{" "}
            <span className="bg-gradient-to-r from-accent to-[color-mix(in_srgb,var(--accent)_45%,#06b6d4)] bg-clip-text text-transparent">Size the grid.</span>
          </h1>
          <p style={delay(0.12)} className="enter mt-6 max-w-[52ch] text-lg text-muted md:text-xl">
            PSCAD results next to field data, and the grid behind every test. Offline, on your PC, with the files you already have.
          </p>
          <div style={delay(0.18)} className="enter mt-8 flex flex-wrap gap-3">
            <a href={DOWNLOAD.installer} className={`${button.base} ${button.md} ${button.primary}`}>
              <DownloadIcon className="size-4" /> Download for Windows
            </a>
            <a href="#tour" className={`${button.base} ${button.md} ${button.secondary}`}>
              <PlayIcon className="size-4" /> Watch the tour
            </a>
          </div>
          <p style={delay(0.21)} className="enter mt-3 text-sm text-muted">
            Beta {VERSION}, Windows 10 and 11. Or the{" "}
            <a href={DOWNLOAD.portable} className="font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-accent">
              portable version
            </a>
            , which runs without installing; both are on the{" "}
            <a href={DOWNLOAD.release} className="font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-accent">
              release page
            </a>
            .
          </p>
          <ul style={delay(0.24)} aria-label="At a glance" className="enter mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {FACTS.map((f) => (
              <li key={f} className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" /> {f}
              </li>
            ))}
          </ul>
        </div>

        <div style={delay(0.15)} className="enter relative">
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
              controls
              preload="metadata"
              width={1920}
              height={1080}
              className="block h-auto w-full"
              aria-label="Swingbus in 30 seconds: a simulation and a measurement overlaid, the error between them, then the Grid Calculator and its voltage plots"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
