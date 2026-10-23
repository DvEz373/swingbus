// Line icons on a 24 px grid, drawn in currentColor
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

// The Swingbus mark, "Swing on the bus": the same drawing as APP_MARK in the app (app/src/lib/about.js of
// Taio11k/SwingBus-App) and desktop/build/icon.svg there. The square takes the accent, the bus line and the wave
// the accent's text colour, as the app's top bar draws it; size it with a class (size-7, size-5, …)
export const Mark = (p: IconProps) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" {...p}>
    <rect x="2" y="2" width="60" height="60" rx="15" fill="var(--accent)" />
    <g fill="none" stroke="var(--accent-fg)" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="33" x2="52" y2="33" strokeWidth="5" strokeOpacity="0.38" />
      <path d="M12 33 C 19 33, 19.5 15, 26 15 S 32 51, 38 51 S 45 33, 52 33" strokeWidth="6.5" />
    </g>
  </svg>
);

export const ChartIcon = (p: IconProps) => <Icon {...p}><path d="M3 3v18h18" /><path d="M6 15l4-6 3 4 3-7 3 5" /></Icon>;
export const CircuitIcon = (p: IconProps) => <Icon {...p}><path d="M2 12h3" /><rect x="5" y="9" width="6" height="6" rx="1" /><path d="M11 12h4" /><circle cx="15" cy="12" r="1.2" fill="currentColor" /><path d="M15 12v4" /><rect x="13" y="16" width="4" height="4" rx="1" /><path d="M15 12h7" /></Icon>;
export const PlayIcon = (p: IconProps) => <Icon {...p}><path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none" /></Icon>;
export const ArrowDown = (p: IconProps) => <Icon {...p}><path d="M12 5v14" /><path d="M6 13l6 6 6-6" /></Icon>;
export const ArrowRight = (p: IconProps) => <Icon {...p}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></Icon>;
export const Check = (p: IconProps) => <Icon {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Icon>;
export const Sun = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>;
export const Moon = (p: IconProps) => <Icon {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></Icon>;
export const Monitor = (p: IconProps) => <Icon {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></Icon>;
export const Menu = (p: IconProps) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>;
export const Close = (p: IconProps) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18" /></Icon>;
export const Expand = (p: IconProps) => <Icon {...p}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></Icon>;
export const Zoom = (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4M8 11h6M11 8v6" /></Icon>;
export const Reset = (p: IconProps) => <Icon {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Icon>;
export const Wifi = (p: IconProps) => <Icon {...p}><path d="M2 2l20 20" /><path d="M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.2-2.8M19 13a10 10 0 0 0-2.3-1.7M2 8.8a15 15 0 0 1 4.2-2.7M22 8.8A15 15 0 0 0 11 5" /><path d="M12 20h.01" /></Icon>;
export const User = (p: IconProps) => <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icon>;
export const Lock = (p: IconProps) => <Icon {...p}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Icon>;
export const Laptop = (p: IconProps) => <Icon {...p}><rect x="4" y="5" width="16" height="11" rx="2" /><path d="M2 20h20" /></Icon>;
export const Mail = (p: IconProps) => <Icon {...p}><path d="M4 6h16v12H4z" /><path d="M4 7l8 6 8-6" /></Icon>;
export const Flask = (p: IconProps) => <Icon {...p}><path d="M9 3h6" /><path d="M10 3v3.5L5 18a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3L14 6.5V3" /><path d="M7.5 14h9" /></Icon>;
export const Chat = (p: IconProps) => <Icon {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></Icon>;
export const Bug = (p: IconProps) => <Icon {...p}><rect x="7" y="7" width="10" height="13" rx="5" /><path d="M12 11v9M7 12H3M21 12h-4M7 17l-3 2M17 17l3 2M7 8 4 6M17 8l3-2M9 7a3 3 0 0 1 6 0" /></Icon>;
export const Bulb = (p: IconProps) => <Icon {...p}><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z" /></Icon>;
export const Question = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6" /><path d="M12 17.5h.01" /></Icon>;
export const File = (p: IconProps) => <Icon {...p}><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" /><path d="M14 3v5h5" /></Icon>;
export const DownloadIcon = (p: IconProps) => <Icon {...p}><path d="M12 4v11" /><path d="M7 10l5 5 5-5" /><path d="M4 20h16" /></Icon>;
