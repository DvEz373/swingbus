"use client";

// A small working copy of the Grid Plotter: two traces of one LVRT test, cursors A and B to drag
// (or move with the arrow keys), a zoom to the fault, and the error between the traces as a signal of its own.
import { animate, AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DT, FAULT_OFF, FAULT_ON, T_END, TRACES, valueAt, type SignalKey } from "@/lib/lvrt";
import { Reset, Zoom } from "./icons";

type Domain = [number, number];
type CursorKey = "a" | "b";

const FULL: Domain = [0, T_END];
const FAULT: Domain = [0.4, 1.45];
const SIGNALS: Record<SignalKey, { label: string; file: string }> = {
  voltage: { label: "Voltage", file: "V_pu" },
  power: { label: "Active power", file: "P_pu" },
};
const M = { left: 44, right: 14, top: 30, bottom: 26 };

const niceStep = (span: number, px: number) => {
  const raw = span / Math.max(2, px / 90);
  return [0.05, 0.1, 0.2, 0.5, 1].find((s) => s >= raw) ?? 1;
};

function tracePath(series: Float64Array, [d0, d1]: Domain, [y0, y1]: Domain, w: number, h: number) {
  const i0 = Math.max(0, Math.floor(d0 / DT)), i1 = Math.min(series.length - 1, Math.ceil(d1 / DT));
  const step = Math.max(1, Math.floor((i1 - i0) / (w * 1.5)));
  let d = "";
  for (let i = i0; i <= i1; i += step) {
    const x = ((i * DT - d0) / (d1 - d0)) * w;
    const y = h - ((series[i] - y0) / (y1 - y0)) * h;
    d += (d ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
  }
  return d;
}

// Signed to three decimals, with a figure space in place of "+" so the columns line up, and never "−0.000"
const fmt = (v: number, digits = 3) => {
  const r = Math.abs(v) < 0.5 * 10 ** -digits ? 0 : v;
  return (r >= 0 ? "\u2007" : "") + r.toFixed(digits).replace("-", "−");
};

function Plot({
  width, height, domain, yRange, yTicks, lines, cursors, onCursor, showFault, label, children,
}: {
  width: number; height: number; domain: Domain; yRange: Domain; yTicks: number[];
  lines: { d: string; color: string; width: number; dash?: string }[];
  cursors: Record<CursorKey, number>; onCursor: (k: CursorKey, t: number) => void;
  showFault?: boolean; label: string; children?: React.ReactNode;
}) {
  const w = Math.max(10, width - M.left - M.right), h = height - M.top - M.bottom;
  const x = (t: number) => ((t - domain[0]) / (domain[1] - domain[0])) * w;
  const y = (v: number) => h - ((v - yRange[0]) / (yRange[1] - yRange[0])) * h;
  const step = niceStep(domain[1] - domain[0], w);
  const xTicks: number[] = [];
  for (let t = Math.ceil(domain[0] / step) * step; t <= domain[1] + 1e-9; t += step) xTicks.push(+t.toFixed(3));
  // A mouse moves the cursor at once. A finger only once it slides sideways, or on a tap, so that
  // scrolling the page past the plot (which the browser takes over, and cancels) leaves the cursors alone.
  const drag = useRef<{ k: CursorKey; startX: number; active: boolean } | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clipId = `clip-${label.replace(/\W/g, "")}`;
  const yDigits = yTicks.some((v) => Math.abs(v * 10 - Math.round(v * 10)) > 1e-6) ? 2 : 1;

  const timeAt = (clientX: number) => {
    const r = svg.current!.getBoundingClientRect();
    const px = ((clientX - r.left) / r.width) * width - M.left;
    return Math.min(domain[1], Math.max(domain[0], domain[0] + (px / w) * (domain[1] - domain[0])));
  };

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      className="block cursor-crosshair touch-pan-y select-none"
      role="group"
      aria-label={label}
      onPointerDown={(e) => {
        const t = timeAt(e.clientX);
        const k: CursorKey = Math.abs(t - cursors.a) <= Math.abs(t - cursors.b) ? "a" : "b";
        const active = e.pointerType !== "touch";
        drag.current = { k, startX: e.clientX, active };
        if (active) {
          e.currentTarget.setPointerCapture(e.pointerId);
          onCursor(k, t);
        }
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        if (!d.active) {
          if (Math.abs(e.clientX - d.startX) < 6) return;
          d.active = true;
        }
        onCursor(d.k, timeAt(e.clientX));
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        if (d && !d.active) onCursor(d.k, timeAt(e.clientX)); // a tap
        drag.current = null;
      }}
      onPointerCancel={() => (drag.current = null)}
    >
      <defs>
        <clipPath id={clipId}><rect width={w} height={h} /></clipPath>
      </defs>
      <g transform={`translate(${M.left},${M.top})`}>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={0} x2={w} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray={v === 0 ? undefined : "3 4"} />
            <text x={-8} y={y(v)} dy="0.32em" textAnchor="end" className="fill-muted font-mono text-[11px]">{v.toFixed(yDigits)}</text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={h + 18} textAnchor="middle" className="fill-muted font-mono text-[11px]">{t.toFixed(step < 0.1 ? 2 : 1)}</text>
        ))}
        <g clipPath={`url(#${clipId})`}>
          {showFault && (
            <g>
              <rect x={x(FAULT_ON)} y={0} width={x(FAULT_OFF) - x(FAULT_ON)} height={h} fill="var(--accent)" opacity={0.07} />
              <text x={(x(FAULT_ON) + x(FAULT_OFF)) / 2} y={14} textAnchor="middle" className="fill-accent text-[11px] font-semibold">fault</text>
            </g>
          )}
          {lines.map((l, i) => (
            <path key={i} d={l.d} fill="none" stroke={l.color} strokeWidth={l.width} strokeDasharray={l.dash} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          ))}
          {children}
        </g>
        {(["a", "b"] as const).map((k) => {
          const t = cursors[k];
          if (t < domain[0] || t > domain[1]) return null;
          return <line key={k} x1={x(t)} x2={x(t)} y1={-8} y2={h} stroke="var(--fg)" strokeOpacity={0.75} strokeWidth={1.25} strokeDasharray={k === "b" ? "5 4" : undefined} />;
        })}
      </g>
    </svg>
  );
}

export function PlotterDemo() {
  const reduce = useReducedMotion();
  const [signal, setSignal] = useState<SignalKey>("voltage");
  const [showError, setShowError] = useState(true);
  const [domain, setDomain] = useState<Domain>(FULL);
  const [zoomed, setZoomed] = useState(false);
  const [cursors, setCursors] = useState<Record<CursorKey, number>>({ a: 0.42, b: 0.7 });
  const [width, setWidth] = useState(760);
  const box = useRef<HTMLDivElement>(null);
  const zoomAnim = useRef<{ stop: () => void } | null>(null);
  const trace = TRACES[signal];

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => () => zoomAnim.current?.stop(), []);

  const zoomTo = (target: Domain) => {
    // A second click mid-zoom takes over from where the view is now
    zoomAnim.current?.stop();
    setZoomed(target === FAULT);
    const from = domain;
    const keepInside = (d: Domain) =>
      setCursors((c) => {
        const span = d[1] - d[0];
        const inside = (t: number) => t >= d[0] && t <= d[1];
        return inside(c.a) && inside(c.b) ? c : { a: d[0] + span * 0.2, b: d[0] + span * 0.45 };
      });
    if (reduce) {
      setDomain(target);
      keepInside(target);
      return;
    }
    zoomAnim.current = animate(0, 1, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (k) => setDomain([from[0] + (target[0] - from[0]) * k, from[1] + (target[1] - from[1]) * k]),
      onComplete: () => keepInside(target),
    });
  };

  const setCursor = (k: CursorKey, t: number) => setCursors((c) => ({ ...c, [k]: Math.round(t / DT) * DT }));
  const nudge = (k: CursorKey, e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.01;
    const by = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step } as Record<string, number>;
    if (e.key in by) {
      e.preventDefault();
      setCursor(k, Math.min(domain[1], Math.max(domain[0], cursors[k] + by[e.key])));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setCursor(k, e.key === "Home" ? domain[0] : domain[1]);
    }
  };

  // One height for every screen, so the plot does not jump once the page has measured itself
  const mainH = 270;
  const errRange = useMemo<Domain>(() => {
    const i0 = Math.floor(domain[0] / DT), i1 = Math.ceil(domain[1] / DT);
    let m = 0;
    for (let i = i0; i <= i1 && i < trace.err.length; i++) m = Math.max(m, Math.abs(trace.err[i]));
    const lim = Math.max(0.05, Math.ceil(m * 12) / 10);
    return [-lim, lim];
  }, [trace, domain]);
  const plotW = width - M.left - M.right;

  const rows = [
    { name: `sim_lvrt05: ${SIGNALS[signal].file}`, color: "var(--sim)", s: trace.sim },
    { name: `meas_lvrt05: ${SIGNALS[signal].file}`, color: "var(--meas)", s: trace.meas },
    ...(showError ? [{ name: "error = sim − meas", color: "var(--err)", s: trace.err }] : []),
  ];

  return (
    <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-lift">
      {/* Toolbar, styled after the app's */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-2 px-3 py-2.5 sm:px-4">
        <div role="group" aria-label="Signal" className="flex rounded-lg border border-line bg-surface p-0.5">
          {(Object.keys(SIGNALS) as SignalKey[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={signal === k}
              onClick={() => setSignal(k)}
              className="relative rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors aria-pressed:text-accent-fg"
            >
              {signal === k && <motion.span layoutId="signal-pill" className="absolute inset-0 -z-0 rounded-md bg-accent" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{SIGNALS[k].label}</span>
            </button>
          ))}
        </div>
        <label className="ml-1 inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-fg">
          <span className="relative inline-flex">
            <input type="checkbox" className="peer sr-only" checked={showError} onChange={(e) => setShowError(e.target.checked)} />
            <span className="h-5 w-9 rounded-full bg-control transition-colors peer-checked:bg-success peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" />
            <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4 peer-checked:bg-surface" />
          </span>
          Error signal
        </label>
        <button
          type="button"
          onClick={() => zoomTo(zoomed ? FULL : FAULT)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium hover:border-accent"
        >
          {zoomed ? <Reset className="size-4" /> : <Zoom className="size-4" />}
          {zoomed ? "Full view" : "Zoom to fault"}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 p-3 pb-4 sm:p-4">
          <div className="mb-1 flex flex-wrap items-center gap-x-4 gap-y-1 pl-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-sim" /> sim_lvrt05.psout</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-meas" /> meas_lvrt05.csv</span>
            <span className="ml-auto font-mono">time_s (s)</span>
          </div>
          <div ref={box} className="relative">
            <Plot
              width={width}
              height={mainH}
              domain={domain}
              yRange={[0, 1.2]}
              yTicks={[0, 0.2, 0.4, 0.6, 0.8, 1, 1.2]}
              lines={[
                { d: tracePath(trace.meas, domain, [0, 1.2], plotW, mainH - M.top - M.bottom), color: "var(--meas)", width: 1.5 },
                { d: tracePath(trace.sim, domain, [0, 1.2], plotW, mainH - M.top - M.bottom), color: "var(--sim)", width: 2 },
              ]}
              cursors={cursors}
              onCursor={setCursor}
              showFault
              label={`${SIGNALS[signal].label} of the simulation and the measurement. Drag on the plot to move the cursors.`}
            />
            {/* Cursor handles: draggable through the plot, focusable and moved with the arrow keys */}
            {(["a", "b"] as const).map((k) => {
              const t = cursors[k];
              if (t < domain[0] || t > domain[1]) return null;
              const left = M.left + ((t - domain[0]) / (domain[1] - domain[0])) * plotW;
              const [lo, hi, now] = [domain[0], domain[1], t].map((n) => Math.round(n * 1000) / 1000);
              return (
                <div
                  key={k}
                  role="slider"
                  tabIndex={0}
                  aria-label={`Cursor ${k.toUpperCase()}`}
                  aria-valuemin={lo}
                  aria-valuemax={hi}
                  aria-valuenow={now}
                  aria-valuetext={`${t.toFixed(3)} seconds`}
                  onKeyDown={(e) => nudge(k, e)}
                  className="absolute top-1 grid h-5 min-w-6 -translate-x-1/2 place-items-center rounded-md bg-fg px-1.5 font-mono text-[11px] font-bold text-page shadow-md outline-offset-2 pointer-events-none"
                  style={{ left }}
                >
                  {k.toUpperCase()}
                </div>
              );
            })}
          </div>

          <AnimatePresence initial={false}>
            {showError && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                <div className="mt-2 border-t border-line pt-2">
                  <div className="mb-1 flex items-center gap-1.5 pl-1 text-xs text-muted"><span className="h-0.5 w-4 rounded bg-err" /> error = sim − meas</div>
                  <Plot
                    width={width}
                    height={130}
                    domain={domain}
                    yRange={errRange}
                    yTicks={[errRange[0], 0, errRange[1]]}
                    lines={[{ d: tracePath(trace.err, domain, errRange, plotW, 130 - M.top - M.bottom), color: "var(--err)", width: 1.5 }]}
                    cursors={cursors}
                    onCursor={setCursor}
                    label="The error between the simulation and the measurement"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="mt-2 pl-1 text-xs text-muted">Drag across the plot to move the nearer cursor. Focus a cursor flag and use the arrow keys for 10 ms steps, Shift for 100 ms.</p>
        </div>

        {/* The Inspector: every signal at both cursors and the difference */}
        <section aria-label="Inspector" className="border-t border-line bg-surface-2/60 p-4 lg:border-t-0 lg:border-l">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Inspector</h3>
            <span className="text-xs text-muted">cursors A and B</span>
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center font-mono text-xs">
            {[
              ["A", `${cursors.a.toFixed(3)} s`],
              ["B", `${cursors.b.toFixed(3)} s`],
              ["Δt", `${Math.round((cursors.b - cursors.a) * 1000)} ms`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-line bg-surface px-2 py-2">
                <dt className="text-[11px] text-muted">{k}</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 grid gap-3">
            {rows.map((r) => {
              const a = valueAt(r.s, cursors.a), b = valueAt(r.s, cursors.b);
              return (
                <div key={r.name} className="rounded-lg border border-line bg-surface p-3">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="h-0.5 w-3.5 shrink-0 rounded" style={{ background: r.color }} />
                    <span className="truncate">{r.name}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 font-mono text-[12.5px] tabular-nums">
                    {[["A", a], ["B", b], ["B − A", b - a]].map(([k, v]) => (
                      <div key={k as string}>
                        <div className="text-[10.5px] text-muted">{k}</div>
                        <div className="whitespace-pre">{fmt(v as number)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">Values in pu. The traces are made up for this page; the app reads your own files.</p>
        </section>
      </div>
    </div>
  );
}
