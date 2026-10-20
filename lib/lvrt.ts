// A made-up LVRT test for the page's Plotter demo: a 450 ms dip to about 0.2 pu, seen by a
// measurement (noisy, with a ringing transient) and by its simulation (clean, slightly off).
// The noise comes from a seeded generator, so the server and the browser draw the same traces.

export const DT = 0.001; // s
export const T_END = 2; // s
export const FAULT_ON = 0.5;
export const FAULT_OFF = 0.95;

export type SignalKey = "voltage" | "power";

export type Trace = { sim: Float64Array; meas: Float64Array; err: Float64Array };

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296 - 0.5;
  };
}

const N = Math.round(T_END / DT) + 1;

function build(simAt: (t: number) => number, measAt: (t: number) => number, noise: number, seed: number): Trace {
  const r = rng(seed);
  const sim = new Float64Array(N), meas = new Float64Array(N), err = new Float64Array(N);
  let smooth = 0;
  for (let i = 0; i < N; i++) {
    const t = i * DT;
    smooth = 0.7 * smooth + 0.3 * r(); // coloured rather than white noise, like a real recorder
    sim[i] = simAt(t);
    meas[i] = measAt(t) + noise * smooth * 2;
    err[i] = sim[i] - meas[i];
  }
  return { sim, meas, err };
}

const ring = (t: number, f: number, tau: number) => Math.exp(-t / tau) * Math.cos(2 * Math.PI * f * t);

const voltage = build(
  (t) => {
    if (t < FAULT_ON) return 1;
    if (t < FAULT_OFF) return 0.215 + 0.785 * Math.exp(-(t - FAULT_ON) / 0.004);
    return 1 - 0.785 * Math.exp(-(t - FAULT_OFF) / 0.045);
  },
  (t) => {
    if (t < FAULT_ON) return 1.002;
    if (t < FAULT_OFF) return 0.198 + 0.8 * Math.exp(-(t - FAULT_ON) / 0.006) + 0.06 * ring(t - FAULT_ON, 45, 0.03);
    return 1.004 - 0.806 * Math.exp(-(t - FAULT_OFF) / 0.06) + 0.05 * ring(t - FAULT_OFF, 18, 0.08);
  },
  0.006,
  7,
);

const power = build(
  (t) => {
    if (t < FAULT_ON) return 1;
    if (t < FAULT_OFF) return 0.22 + 0.78 * Math.exp(-(t - FAULT_ON) / 0.008);
    return Math.min(1, 0.22 + 3.2 * (t - FAULT_OFF - 0.01 > 0 ? t - FAULT_OFF - 0.01 : 0));
  },
  (t) => {
    if (t < FAULT_ON) return 0.995;
    if (t < FAULT_OFF) return 0.19 + 0.8 * Math.exp(-(t - FAULT_ON) / 0.012) + 0.08 * ring(t - FAULT_ON, 30, 0.04);
    const ramp = 0.19 + 2.6 * Math.max(0, t - FAULT_OFF - 0.025);
    return Math.min(0.997, ramp) + 0.03 * ring(t - FAULT_OFF, 12, 0.1);
  },
  0.012,
  11,
);

export const TRACES: Record<SignalKey, Trace> = { voltage, power };

export const valueAt = (series: Float64Array, t: number) =>
  series[Math.min(series.length - 1, Math.max(0, Math.round(t / DT)))];
