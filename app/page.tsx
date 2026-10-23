import { CalculatorDemo } from "@/components/CalculatorDemo";
import { FeatureTour } from "@/components/FeatureTour";
import { FeedbackForm } from "@/components/FeedbackForm";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Chat, File, Flask, Mail, Mark } from "@/components/icons";
import { Overview } from "@/components/Overview";
import { PlotterDemo } from "@/components/PlotterDemo";
import { MotionProvider, Reveal } from "@/components/Reveal";
import { SectionHead, panel } from "@/components/ui";

const FORMATS = [
  { name: "PSCAD", ext: ".psout" },
  { name: "PSCAD", ext: ".inf + .out" },
  { name: "PSS®E", ext: ".out / .outx" },
  { name: "COMTRADE", ext: ".cfg + .dat" },
  { name: "MATLAB", ext: ".mat" },
  { name: "CSV and TSV", ext: ".csv / .tsv" },
  { name: "NumPy", ext: "arrays" },
];

const PEOPLE = [
  { initials: "SH", name: "Satria Wibawa Hadiwijaya", role: "Fresh graduate in electrical engineering", site: "taio11k.github.io" },
  { initials: "DP", name: "Devin Ezekiel Purba", role: "Fresh graduate in electrical engineering, power-system engineer", site: "dvez373.github.io" },
];

const NOTES = [
  { icon: Chat, title: "Read by people", text: "Every message lands on our list, and the two of us read each one." },
  { icon: Flask, title: "Bugs we can reproduce get fixed first", text: "Say what you did, what you expected, and which file type you opened." },
  { icon: Mail, title: "Want a reply?", text: "Leave your email address. We use it only to answer you." },
];

const wrap = "mx-auto max-w-[1200px] px-4 sm:px-6";

export default function Home() {
  return (
    <MotionProvider>
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <a href="#top" className="sr-only z-50 rounded-lg bg-accent text-accent-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-4 focus:py-2">
        Skip to the content
      </a>
      <Header />

      <main id="top">
        <Hero />
        <Overview />

        <section id="plotter" aria-labelledby="plotter-title" className="border-y border-line bg-surface py-16 md:py-24">
          <div className={wrap}>
            <SectionHead eyebrow="Grid Plotter · try it" title="Simulation and measurement on one screen" id="plotter-title">
              The app opens PSCAD, PSS®E, COMTRADE, MATLAB and CSV files. Here is a small working copy with one LVRT test: drag the cursors, zoom to the fault, and
              watch the error between the traces.
            </SectionHead>
            <Reveal>
              <PlotterDemo />
            </Reveal>
          </div>
        </section>

        <section id="calculator" aria-labelledby="calculator-title" className="py-16 md:py-24">
          <div className={wrap}>
            <SectionHead eyebrow="Grid Calculator · try it" title="The grid behind your test, worked out" id="calculator-title">
              Set the connection point and the dip you want. The fault level, the source impedance and the fault impedance follow as you type.
            </SectionHead>
            <Reveal>
              <CalculatorDemo />
            </Reveal>
          </div>
        </section>

        <section id="inside" aria-labelledby="inside-title" className="border-y border-line bg-surface py-16 md:py-24">
          <div className={wrap}>
            <SectionHead eyebrow="Inside the app" title="The real thing, screen by screen" id="inside-title">
              Pictures of the app with real cases, in the theme you are reading this in.
            </SectionHead>
            <Reveal>
              <FeatureTour />
            </Reveal>
          </div>
        </section>

        <section aria-labelledby="files-title" className="py-16 md:py-24">
          <div className={wrap}>
            <SectionHead eyebrow="Files" title="Built for the files you already have" id="files-title">
              Simulator outputs and recorder files open as they are. Nothing to convert, nothing to upload.
            </SectionHead>
            <div className="grid gap-5 lg:grid-cols-[7fr_5fr]">
              <Reveal className={`${panel} p-6 md:p-8`}>
                <h3 className="text-lg font-semibold">Reads your simulators and recorders</h3>
                <ul aria-label="File types" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {FORMATS.map((f) => (
                    <li key={f.name + f.ext} className="group flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-3 transition hover:-translate-y-0.5 hover:border-accent">
                      <File className="hidden size-5 shrink-0 text-accent sm:block" />
                      <span className="grid min-w-0">
                        <span className="text-sm font-semibold">{f.name}</span>
                        <span className="font-mono text-xs text-muted">{f.ext}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.08} className="relative overflow-hidden rounded-panel bg-accent p-6 text-accent-fg md:p-8">
                <div aria-hidden="true" className="absolute -right-16 -bottom-16 size-64 rounded-full bg-white/10" />
                <div aria-hidden="true" className="absolute -right-4 -bottom-24 size-48 rounded-full bg-white/10" />
                <h3 className="relative text-2xl font-semibold tracking-tight">Offline, on your PC</h3>
                <p className="relative mt-3 max-w-[38ch]">
                  A Windows app, or one HTML file in a browser. No account, no server, and your data stays with you.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="tour" aria-labelledby="tour-title" className="border-y border-line bg-surface py-16 md:py-24">
          <div className={wrap}>
            <SectionHead eyebrow="The tour" title="See it in a minute" id="tour-title" center>
              An LVRT benchmark from the first file to the fault impedance.
            </SectionHead>
            <Reveal className="mx-auto max-w-[1000px] overflow-hidden rounded-panel border border-line bg-surface shadow-lift">
              <video
                src="/video/swingbus-demo.mp4"
                poster="/video/swingbus-demo-poster.jpg"
                controls
                preload="none"
                playsInline
                width={1920}
                height={1080}
                className="block h-auto w-full"
                aria-label="The Swingbus tour, about one minute"
              />
            </Reveal>
          </div>
        </section>

        <section aria-labelledby="about-title" className="py-16 md:py-24">
          <div className={wrap}>
            <Reveal className={`${panel} grid gap-9 p-6 md:p-12`}>
              <div>
                <span className="text-[13px] font-bold tracking-[0.08em] text-accent uppercase">Who makes it</span>
                <h2 id="about-title" className="mt-3 text-[clamp(28px,3.6vw,44px)] leading-[1.1] font-semibold tracking-[-0.025em]">A personal project</h2>
                <p className="mt-4 max-w-[62ch] text-[17px] text-muted">
                  Built by two fresh electrical engineering graduates from Universitas Indonesia, in our own time. We add a tool when grid-connection work calls for one.
                </p>
              </div>
              <ul aria-label="The developers" className="grid gap-5 md:grid-cols-2">
                {PEOPLE.map((p) => (
                  <li key={p.name} className="group grid grid-cols-[auto_1fr] items-start gap-4 rounded-panel border border-line bg-surface-2 p-5 transition hover:border-accent md:p-6">
                    <span aria-hidden="true" className="grid size-13 place-items-center rounded-full bg-gradient-to-br from-accent to-[color-mix(in_srgb,var(--accent)_40%,#06b6d4)] text-lg font-bold text-white shadow-[0_8px_20px_-8px_var(--accent)]">
                      {p.initials}
                    </span>
                    <div>
                      <h3 className="text-[19px] font-semibold">{p.name}</h3>
                      <p className="mt-1 text-[15px] text-muted">{p.role}</p>
                      <a href={`https://${p.site}/`} target="_blank" rel="noopener" className="mt-2.5 inline-block text-[15px] font-semibold text-accent hover:underline hover:underline-offset-4">
                        {p.site} ↗
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section id="feedback" aria-labelledby="feedback-title" className="pb-20 md:pb-28">
          <div className={`${wrap} grid items-start gap-8 lg:grid-cols-[4fr_6fr] lg:gap-14`}>
            <Reveal className="lg:sticky lg:top-24">
              <span className="text-[13px] font-bold tracking-[0.08em] text-accent uppercase">Feedback</span>
              <h2 id="feedback-title" className="mt-3 text-[clamp(28px,3.6vw,44px)] leading-[1.1] font-semibold tracking-[-0.025em]">Tell us what to fix next</h2>
              <p className="mt-4 text-[17px] text-muted">
                Found a bug, missing a feature, or not sure how something works? Write to us here. Every message goes straight to both developers.
              </p>
              <ul className="mt-7 grid gap-5">
                {NOTES.map((n) => (
                  <li key={n.title} className="grid grid-cols-[40px_1fr] items-start gap-3.5">
                    <span aria-hidden="true" className="grid size-10 place-items-center rounded-[10px] bg-accent-soft text-accent">
                      <n.icon className="size-5" />
                    </span>
                    <div>
                      <strong className="block font-semibold">{n.title}</strong>
                      <span className="text-[15px] text-muted">{n.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.08}>
              <FeedbackForm />
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8 text-sm text-muted">
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-4`}>
          <span className="inline-flex items-center gap-2">
            <Mark className="size-5 shrink-0" />
            © 2026 Swingbus
          </span>
          <span>PSCAD, PSS®E and MATLAB are trademarks of their owners.</span>
        </div>
      </footer>
    </MotionProvider>
  );
}
