// Small pieces every section uses: the heading block, a light/dark picture, and the button styles
import Image from "next/image";
import { Reveal } from "./Reveal";

export function SectionHead({ eyebrow, title, id, children, center }: { eyebrow: string; title: React.ReactNode; id: string; children?: React.ReactNode; center?: boolean }) {
  return (
    <Reveal className={`mb-10 grid gap-4 md:mb-12 ${center ? "justify-items-center text-center" : ""}`}>
      <span className="text-[13px] font-bold tracking-[0.08em] text-accent uppercase">{eyebrow}</span>
      <h2 id={id} className="max-w-[22ch] text-[clamp(28px,3.6vw,44px)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance">
        {title}
      </h2>
      {children && <p className={`max-w-[62ch] text-[17px] text-muted md:text-lg ${center ? "mx-auto" : ""}`}>{children}</p>}
    </Reveal>
  );
}

export type Shot = { name: string; width: number; height: number; alt: string };

export function ThemedImage({ shot, sizes, priority, className = "" }: { shot: Shot; sizes: string; priority?: boolean; className?: string }) {
  const common = { width: shot.width, height: shot.height, sizes, priority };
  return (
    <>
      <Image {...common} alt={shot.alt} src={`/img/light/${shot.name}.webp`} className={`only-light h-auto w-full ${className}`} />
      <Image {...common} alt={shot.alt} src={`/img/dark/${shot.name}.webp`} className={`only-dark h-auto w-full ${className}`} />
    </>
  );
}

// base + one size + one look; the sizes are kept apart so that no two height or padding classes ever meet
export const button = {
  base: "inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold whitespace-nowrap transition duration-150 active:translate-y-px",
  md: "h-11 px-5 text-[15px]",
  sm: "h-9 px-4 text-sm",
  primary: "bg-accent text-accent-fg shadow-[0_8px_24px_-8px_var(--accent)] hover:brightness-110",
  secondary: "border border-line bg-surface text-fg hover:border-accent",
};

export const panel = "rounded-panel border border-line bg-surface";
