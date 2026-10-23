import { ChartIcon, CircuitIcon, Laptop, Lock, User, Wifi } from "./icons";
import { Reveal } from "./Reveal";
import { SectionHead, panel } from "./ui";

const TOOLS = [
  {
    icon: ChartIcon,
    tag: "Grid Plotter",
    title: "Compare the simulation with the field",
    points: [
      "Overlay PSCAD, PSS®E, COMTRADE, MATLAB and CSV runs on the same axes",
      "Zoom with the wheel, a drag or a box; a crosshair and two cursors read every signal, with the difference",
      "Turn the error between two signals into a signal of its own",
      "Name each signal, and set the ticks and the labels of each axis",
      "Min, max and mean per signal, and one tab for each test case",
    ],
    href: "#plotter",
    more: "Try the Plotter",
  },
  {
    icon: CircuitIcon,
    tag: "Grid Calculator",
    title: "Work out the grid behind the test",
    points: [
      "SCR and X/R to the source impedance Zs, in ohms and per unit",
      "The fault impedance Zf for a voltage dip or swell, with AEMO DMAT values",
      "1PG, 2PG and LL faults by symmetrical components",
      "The SCR the machine sees at its terminal, through the transformer",
      "The voltage along the circuit, against Zf and over the fault",
    ],
    href: "#calculator",
    more: "Try the Calculator",
  },
];

const STEPS = [
  { title: "Open what you have", text: "Simulator outputs and recorder files, as they come. Nothing to convert first." },
  { title: "Compare and measure", text: "Overlay the simulation on the measurement, zoom to the event and read the cursors." },
  { title: "Work out the grid", text: "Get Zs and Zf for the test, and see the voltage along the circuit." },
];

const PROMISES = [
  { icon: Wifi, title: "Offline", text: "No internet needed" },
  { icon: User, title: "No account", text: "Open it and start" },
  { icon: Lock, title: "Private", text: "Your data stays on your PC" },
  { icon: Laptop, title: "Two ways to run", text: "A Windows app or one HTML file" },
];

export function Overview() {
  return (
    <section id="overview" aria-labelledby="overview-title" className="py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <SectionHead eyebrow="What Swingbus does" title="Two tools for one study" id="overview-title">
          A grid-connection study asks two things: does the plant&apos;s simulation model behave like the real plant, and what grid did each test see? The Grid
          Plotter answers the first and the Grid Calculator the second.
        </SectionHead>

        <div className="grid gap-6 md:grid-cols-2">
          {TOOLS.map((t, i) => (
            <Reveal as="article" key={t.tag} delay={i * 0.08} className={`${panel} group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift md:p-8`}>
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent to-transparent" />
              <div aria-hidden="true" className="absolute -top-24 -right-24 size-56 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="grid size-12 place-items-center rounded-xl bg-accent-soft text-accent">
                <t.icon className="size-6" />
              </span>
              <p className="mt-5 text-sm font-semibold text-accent">{t.tag}</p>
              <h3 className="mt-1 text-[22px] leading-snug font-semibold tracking-[-0.015em]">{t.title}</h3>
              <ul className="mt-5 grid gap-3">
                {t.points.map((p) => (
                  <li key={p} className="grid grid-cols-[20px_1fr] gap-2.5 text-[15px] text-muted">
                    <span aria-hidden="true" className="mt-[3px] grid size-[18px] place-items-center rounded-full bg-accent-soft text-accent">
                      <svg viewBox="0 0 18 18" className="size-[18px]"><path d="M5 9.5l2.6 2.5L13 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <a href={t.href} className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-accent hover:underline hover:underline-offset-4">
                {t.more} <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">↓</span>
              </a>
            </Reveal>
          ))}
        </div>

        <ol className="mt-14 grid gap-7 md:grid-cols-3 md:gap-6">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.1} className="relative grid grid-cols-[40px_1fr] gap-4 md:block md:pt-14">
              <span className="grid size-10 place-items-center rounded-full bg-accent font-semibold text-accent-fg shadow-[0_8px_20px_-8px_var(--accent)] md:absolute md:top-0 md:left-0">
                {i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-12 bottom-[-22px] left-[19px] w-0.5 bg-[repeating-linear-gradient(180deg,var(--line)_0_8px,transparent_8px_14px)] md:top-5 md:right-[-12px] md:bottom-auto md:left-[52px] md:h-0.5 md:w-auto md:bg-[repeating-linear-gradient(90deg,var(--line)_0_8px,transparent_8px_14px)]"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-[15px] text-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal>
          <ul aria-label="How it runs" className={`${panel} mt-14 grid grid-cols-2 overflow-hidden lg:grid-cols-4`}>
            {PROMISES.map((p, i) => (
              <li
                key={p.title}
                className={`flex items-start gap-3 p-5 md:p-6 ${i % 2 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
              >
                <span className="hidden size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-accent sm:grid">
                  <p.icon className="size-[18px]" />
                </span>
                <span className="grid gap-0.5">
                  <strong className="font-semibold">{p.title}</strong>
                  <span className="text-sm text-muted">{p.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
