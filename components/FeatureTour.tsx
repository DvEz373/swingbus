"use client";

// Screens of the real app, one tab each. Click a picture to see it full size.
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Close, Expand } from "./icons";
import { ThemedImage, type Shot } from "./ui";

const SCREENS: { key: string; tab: string; title: string; text: string; shot: Shot }[] = [
  {
    key: "overlay",
    tab: "Overlay",
    title: "Simulation and measurement on one screen",
    text: "Three LVRT test cases in tabs: voltage, active and reactive power of the simulation drawn over the measurement, with cursor statistics in the Inspector.",
    shot: { name: "app-layout", width: 1400, height: 860, alt: "The Grid Plotter with three LVRT test cases in tabs: voltage, active and reactive power of a simulation overlaid on a measurement, with cursors A and B and their statistics" },
  },
  {
    key: "computed",
    tab: "Computed signals",
    title: "The error becomes a signal",
    text: "The difference between two signals is plotted and measured like the rest, so a mismatch has a number and a shape.",
    shot: { name: "app-computed", width: 1400, height: 860, alt: "A computed signal, the active power error between simulation and measurement, drawn in green under the two traces" },
  },
  {
    key: "cursors",
    tab: "Cursors",
    title: "Two cursors, every value",
    text: "Cursors A and B give the value of every signal at both points, and the difference, across all plots at once.",
    shot: { name: "app-plots-cursors", width: 1400, height: 860, alt: "Two plots with cursors A and B and the Inspector listing the value of each signal at both cursors and their difference" },
  },
  {
    key: "settings",
    tab: "Plot settings",
    title: "Your names, your ticks",
    text: "Each plotted signal can take a name of its own, and each axis its tick spacing, its label format and minor grid lines, all from one Plot settings dialog and kept in the project.",
    shot: { name: "app-plot-customized", width: 1400, height: 820, alt: "A plot of a simulated and a measured phase voltage with the signals named Simulation and Measurement in the legend and the Inspector, a tick every 5 ms on the time axis, whole volts on the Y axis and minor grid lines" },
  },
  {
    key: "pscad",
    tab: "PSCAD cases",
    title: "Straight from the simulator's output",
    text: "A PSCAD HVDC case opened from its output files: AC voltages, DC volts and DC currents of the rectifier and the inverter.",
    shot: { name: "app-pscad", width: 1400, height: 860, alt: "A PSCAD HVDC case opened from its output files: AC voltages, DC volts and DC currents of the rectifier and the inverter" },
  },
  {
    key: "fault",
    tab: "Fault impedance",
    title: "The Grid Calculator's fault page",
    text: "Inputs on the left, the circuit with the fault branch at F, the voltage along the circuit under it, and Zf in ohms and per unit.",
    shot: { name: "app-calc-fault", width: 1400, height: 1100, alt: "The Fault impedance page of the Grid Calculator: inputs on the left, the circuit with the fault branch hanging from the fault point F, the voltage along the circuit under it, and Zf in ohms and per unit" },
  },
];

export function FeatureTour() {
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const screen = SCREENS[index];

  const onKey = (e: React.KeyboardEvent) => {
    const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    let next = index;
    if (move) next = (index + move + SCREENS.length) % SCREENS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = SCREENS.length - 1;
    else return;
    e.preventDefault();
    setIndex(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:gap-8">
      <div role="tablist" aria-label="Screens of the app" onKeyDown={onKey} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:content-start lg:overflow-visible lg:px-0">
        {SCREENS.map((s, i) => (
          <button
            key={s.key}
            ref={(el) => { tabs.current[i] = el; }}
            role="tab"
            id={`tour-tab-${s.key}`}
            aria-selected={i === index}
            aria-controls="tour-panel"
            tabIndex={i === index ? 0 : -1}
            onClick={() => setIndex(i)}
            className="group relative shrink-0 rounded-xl border border-transparent px-4 py-3 text-left transition-colors hover:bg-surface aria-selected:border-line aria-selected:bg-surface aria-selected:shadow-sm lg:px-5 lg:py-4"
          >
            {i === index && <motion.span layoutId="tour-bar" className="absolute top-3 bottom-3 left-0 hidden w-[3px] rounded-full bg-accent lg:block" />}
            <span className="block text-[15px] font-semibold whitespace-nowrap text-muted group-aria-selected:text-fg">{s.tab}</span>
            <span className="mt-1 hidden text-sm text-muted lg:block">{s.title}</span>
          </button>
        ))}
      </div>

      <div id="tour-panel" role="tabpanel" aria-labelledby={`tour-tab-${screen.key}`} className="min-w-0">
        <button
          type="button"
          onClick={() => dialog.current?.showModal()}
          className="group relative block w-full overflow-hidden rounded-panel border border-line bg-surface text-left shadow-lift"
          aria-label={`See “${screen.title}” full size`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={screen.key} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
              <ThemedImage shot={screen.shot} sizes="(min-width: 1024px) 820px, 100vw" />
            </motion.div>
          </AnimatePresence>
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg bg-fg/80 px-2.5 py-1.5 text-xs font-semibold text-page opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <Expand className="size-3.5" /> Full size
          </span>
        </button>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={screen.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="mt-4 max-w-[70ch] text-[15px] text-muted">
            <strong className="font-semibold text-fg lg:hidden">{screen.title}. </strong>
            {screen.text}
          </motion.p>
        </AnimatePresence>
      </div>

      <dialog
        ref={dialog}
        aria-label={screen.title}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="m-auto max-h-[92vh] w-[min(1400px,94vw)] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        <div className="relative overflow-hidden rounded-panel border border-line bg-surface">
          <ThemedImage shot={screen.shot} sizes="94vw" className="max-h-[88vh] object-contain" />
        </div>
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="absolute -top-3 -right-3 grid size-10 place-items-center rounded-full border border-line bg-surface text-fg shadow-lg"
          aria-label="Close"
          autoFocus
        >
          <Close className="size-5" />
        </button>
      </dialog>
    </div>
  );
}
