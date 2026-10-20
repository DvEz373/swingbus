// The arithmetic behind the page's small Grid Calculator. A simplified slice of the app's:
// a Thevenin source behind Zs, and a balanced fault through Zf with the same X/R as the grid.

export type GridInput = {
  kv: number; // line-to-line voltage at the connection point, kV
  mva: number; // the machine's rating, the per-unit base, MVA
  scr: number; // short-circuit ratio
  xr: number; // X/R of the grid
  retained: number; // the voltage wanted at the fault point during the dip, pu (0 = bolted fault)
};

export type GridResult = {
  sk: number; // fault level at the connection point, MVA
  zs: number; // |Zs|, ohm
  rs: number;
  xs: number;
  angle: number; // impedance angle, degrees
  zsPu: number; // Zs on the machine's base
  zsPu100: number; // Zs on a 100 MVA base
  zf: number; // |Zf| for the retained voltage, ohm
  rf: number;
  xf: number;
  zfPu: number; // Zf on the machine's base
};

export function solveGrid({ kv, mva, scr, xr, retained }: GridInput): GridResult {
  const sk = scr * mva;
  const zs = (kv * kv) / sk;
  const phi = Math.atan(xr);
  const zbase = (kv * kv) / mva;
  // With Zf in phase with Zs the dip is a plain divider: V = Zf / (Zs + Zf)
  const v = Math.min(Math.max(retained, 0), 0.99);
  const zf = (zs * v) / (1 - v);
  return {
    sk,
    zs,
    rs: zs * Math.cos(phi),
    xs: zs * Math.sin(phi),
    angle: (phi * 180) / Math.PI,
    zsPu: zs / zbase,
    zsPu100: (zs * 100) / (kv * kv),
    zf,
    rf: zf * Math.cos(phi),
    xf: zf * Math.sin(phi),
    zfPu: zf / zbase,
  };
}

// Four significant figures, the way an engineer would write the result down
export function sig(x: number, digits = 4): string {
  if (!Number.isFinite(x)) return "—";
  if (x === 0) return "0";
  const d = Math.max(0, digits - 1 - Math.floor(Math.log10(Math.abs(x))));
  return x.toFixed(Math.min(d, 6));
}
