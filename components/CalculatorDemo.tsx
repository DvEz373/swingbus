"use client";

// A small working slice of the Grid Calculator: the source impedance behind an SCR and X/R,
// and the fault impedance that gives a chosen dip, with the voltage drawn along the circuit.
import { motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { sig, solveGrid, type GridInput } from "@/lib/grid";

const VOLTAGES = [20, 33, 66, 132, 150, 220, 275, 330, 500];

function Slider({ label, unit, value, min, max, step, onChange, hint }: {
  label: string; unit?: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; hint?: string;
}) {
  const id = useId();
  // What is being typed stays as typed; only a number in range reaches the calculation
  const [draft, setDraft] = useState<string | null>(null);
  const decimals = (String(step).split(".")[1] ?? "").length;
  const outOfRange = draft !== null && (draft === "" || !(Number(draft) >= min && Number(draft) <= max));
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold">{label}</label>
        <span className="inline-flex items-center gap-1.5">
          <input
            type="number"
            aria-label={`${label}, exact value`}
            className="field w-[84px] px-2 py-1 text-right font-mono text-sm tabular-nums"
            value={draft ?? value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              setDraft(e.target.value);
              const n = Number(e.target.value);
              // A typed value lands on the slider's step, so the number and the slider always agree
              if (e.target.value !== "" && n >= min && n <= max) onChange(Number((Math.round(n / step) * step).toFixed(decimals)));
            }}
            onBlur={() => setDraft(null)}
            aria-invalid={outOfRange || undefined}
            aria-describedby={outOfRange ? `${id}-range` : undefined}
          />
          <span className="w-8 text-xs text-muted">{unit}</span>
        </span>
      </div>
      <input id={id} type="range" className="mt-2 w-full" min={min} max={max} step={step} value={value} onChange={(e) => { setDraft(null); onChange(Number(e.target.value)); }} />
      {outOfRange ? (
        <p id={`${id}-range`} className="text-xs text-danger">
          Use a value from {min} to {max}{unit ? ` ${unit}` : ""}.
        </p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

function Result({ label, value, unit, sub }: { label: string; value: string; unit: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <motion.span key={value} initial={{ opacity: 0.4, y: 2 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="font-mono text-[22px] font-semibold tracking-tight tabular-nums">
          {value}
        </motion.span>
        <span className="text-sm text-muted">{unit}</span>
      </div>
      {sub && <div className="mt-1 font-mono text-xs text-muted tabular-nums">{sub}</div>}
    </div>
  );
}

const complex = (r: number, x: number) => `${sig(r)} + j${sig(x)} Ω`;

export function CalculatorDemo() {
  const [input, setInput] = useState<GridInput>({ kv: 66, mva: 100, scr: 3, xr: 10, retained: 0.2 });
  const set = <K extends keyof GridInput>(k: K) => (v: GridInput[K]) => setInput((s) => ({ ...s, [k]: v }));
  const r = solveGrid(input);
  const v = input.retained;

  // The circuit, then the voltage along it: 1 pu at the source, falling across Zs to v at the fault point
  // Drawn at the figure's real width so the labels keep their size on a phone; the circuit stretches instead
  const fig = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(560);
  useEffect(() => {
    const el = fig.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const X0 = 30, XP = W - 30, XF = Math.round(Math.min(X0 + (XP - X0) * 0.7, W - 110)), Y_TOP = 100, Y_BOT = 200;
  const ZW = Math.min(120, (XF - X0) * 0.5), ZC = (X0 + 16 + XF) / 2;
  const yOf = (pu: number) => Y_BOT - pu * 62;
  const profile = `M${X0} ${yOf(1)} L${XF} ${yOf(v)} L${XP} ${yOf(v)}`;
  const area = `${profile} L${XP} ${Y_BOT} L${X0} ${Y_BOT} Z`;

  return (
    <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-lift">
      <div className="grid lg:grid-cols-[340px_1fr]">
        <div className="grid content-start gap-5 border-b border-line bg-surface-2/60 p-5 sm:p-6 lg:border-r lg:border-b-0">
          <div>
            <label htmlFor="calc-kv" className="text-sm font-semibold">Voltage at the connection point</label>
            <select id="calc-kv" className="field mt-2" value={input.kv} onChange={(e) => set("kv")(Number(e.target.value))}>
              {VOLTAGES.map((kv) => <option key={kv} value={kv}>{kv} kV</option>)}
            </select>
          </div>
          <Slider label="Machine rating" unit="MVA" value={input.mva} min={5} max={500} step={1} onChange={set("mva")} />
          <Slider label="SCR" value={input.scr} min={1} max={20} step={0.1} onChange={set("scr")} hint="Short-circuit ratio at the connection point" />
          <Slider label="X/R" value={input.xr} min={0.5} max={20} step={0.1} onChange={set("xr")} />
          <Slider label="Retained voltage" unit="pu" value={input.retained} min={0} max={0.9} step={0.01} onChange={set("retained")} hint="The dip you want the test to make, 0 for a bolted fault" />
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Result label="Fault level" value={sig(r.sk)} unit="MVA" sub={`SCR × rating`} />
            <Result label="Source impedance |Zs|" value={sig(r.zs)} unit="Ω" sub={`${complex(r.rs, r.xs)} · ∠${r.angle.toFixed(1)}°`} />
            <Result label="Zs in per unit" value={sig(r.zsPu)} unit="pu" sub={`${sig(r.zsPu100)} pu on 100 MVA`} />
            <Result label={`Fault impedance |Zf| for ${v.toFixed(2)} pu`} value={v === 0 ? "0" : sig(r.zf)} unit="Ω" sub={v === 0 ? "bolted fault" : `${complex(r.rf, r.xf)} · ${sig(r.zfPu)} pu`} />
          </div>

          <figure className="mt-5 rounded-xl border border-line bg-surface p-3 sm:p-4">
            <div ref={fig}>
              <svg viewBox={`0 0 ${W} 234`} width="100%" height={234} className="block" role="img" aria-label={`The circuit: source, Zs, the fault point F with Zf to ground, and the plant. The voltage falls from 1 pu at the source to ${v.toFixed(2)} pu at F.`}>
                <defs>
                  <linearGradient id="calc-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="var(--accent)" stopOpacity="0.28" />
                    <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Circuit */}
                <g stroke="var(--fg)" strokeWidth="1.6" fill="none">
                  <circle cx={X0} cy={36} r={16} />
                  <path d={`M${X0 - 8} 36 q4 -7 8 0 t8 0`} />
                  <path d={`M${X0 + 16} 36 H${ZC - ZW / 2} M${ZC + ZW / 2} 36 H${XP - 26}`} />
                  <rect x={ZC - ZW / 2} y={24} width={ZW} height={24} rx={4} fill="var(--accent-soft)" stroke="var(--accent)" />
                  <path d={`M${XF} 36 V54 M${XF} 82 V88 M${XF - 12} 88 H${XF + 12} M${XF - 7} 92 H${XF + 7} M${XF - 3} 96 H${XF + 3}`} />
                  <rect x={XF - 11} y={54} width={22} height={28} rx={3} fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" />
                  <rect x={XP - 26} y={22} width={44} height={28} rx={6} fill="var(--surface-2)" />
                </g>
                <circle cx={XF} cy={36} r={4.5} fill="var(--danger)" />
                <g className="text-[12px]" fill="var(--fg)">
                  <text x={ZC} y={40} textAnchor="middle" className="font-mono font-semibold" fill="var(--accent)">Zs</text>
                  <text x={XF + 18} y={72} className="font-mono font-semibold" fill="var(--danger)">Zf</text>
                  <text x={XF} y={18} textAnchor="middle" className="font-semibold">F</text>
                  <text x={XP - 4} y={40} textAnchor="middle" className="text-[11px]">Plant</text>
                  <text x={X0} y={70} textAnchor="middle" className="text-[11px]" fill="var(--muted)">grid</text>
                </g>
                {/* Voltage along the circuit */}
                <g>
                  <line x1={X0} x2={XP} y1={Y_BOT} y2={Y_BOT} stroke="var(--line)" />
                  <line x1={X0} x2={XP} y1={yOf(1)} y2={yOf(1)} stroke="var(--line)" strokeDasharray="3 4" />
                  <motion.path d={area} animate={{ d: area }} transition={{ duration: 0.35 }} fill="url(#calc-fill)" />
                  <motion.path d={profile} animate={{ d: profile }} transition={{ duration: 0.35 }} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" />
                  <motion.circle cx={XF} cy={yOf(v)} animate={{ cy: yOf(v) }} transition={{ duration: 0.35 }} r={4.5} fill="var(--danger)" />
                  <text x={XP} y={yOf(1) - 6} textAnchor="end" className="font-mono text-[11px]" fill="var(--muted)">1.00 pu</text>
                  <motion.text x={XF + 10} y={yOf(v) - 8} animate={{ attrY: yOf(v) - 8 }} transition={{ duration: 0.35 }} className="font-mono text-[11px] font-semibold" fill="var(--danger)">
                    {v.toFixed(2)} pu at F
                  </motion.text>
                  <text x={X0} y={Y_BOT + 18} className="text-[11px]" fill="var(--muted)">source</text>
                  <text x={XF} y={Y_BOT + 18} textAnchor="middle" className="text-[11px]" fill="var(--muted)">F</text>
                  <text x={XP} y={Y_BOT + 18} textAnchor="end" className="text-[11px]" fill="var(--muted)">plant</text>
                </g>
                <text x={X0} y={Y_TOP + 8} className="text-[11px] font-semibold" fill="var(--fg)">Voltage along the circuit</text>
              </svg>
            </div>
          </figure>
          <p className="mt-3 text-xs text-muted">
            Simplified for this page: a balanced fault whose Zf takes the grid&apos;s X/R. The app also gives Zf with AEMO DMAT values, on four bases, for 1PG, 2PG and LL
            faults, and through the transformer.
          </p>
        </div>
      </div>
    </div>
  );
}
