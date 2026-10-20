# Swingbus

The showcase site of Swingbus, an offline toolkit for grid-connection studies. The Grid Plotter benchmarks simulation results against field measurements; the Grid Calculator works out the grid behind a single-machine test.

Live at **[swingbus-present.vercel.app](https://swingbus-present.vercel.app/)**.

Swingbus is a personal project by two fresh electrical engineering graduates from Universitas Indonesia: Satria Wibawa Hadiwijaya ([taio11k.github.io](https://taio11k.github.io/)) and Devin Ezekiel Purba ([dvez373.github.io](https://dvez373.github.io/)). The app's code is private. This repository holds the site, its pictures, two demo videos and the feedback form.

## The site

A [Next.js](https://nextjs.org/) app (App Router, TypeScript), styled with Tailwind CSS and animated with Motion. The page is prerendered as static HTML; only the feedback form runs on the server.

On the page, besides the overview and the pictures:

- **A working Plotter**: one made-up LVRT test, simulation over measurement, with cursors A and B to drag (or move with the arrow keys), a zoom to the fault, and the error between the traces
- **A working Calculator**: SCR, X/R and the dip you want, giving the fault level, Zs and Zf, with the voltage drawn along the circuit
- **Inside the app**: the app's screens in tabs, each one full size on a click
- A light/dark switch (it follows the system until you choose), and the feedback form

```sh
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build      # what Vercel runs
```

| Path | What it is |
| --- | --- |
| `app/page.tsx` | the page, section by section |
| `app/layout.tsx`, `app/globals.css` | metadata, fonts, and the colour tokens for light and dark |
| `components/` | the header, hero, overview, the Plotter and Calculator demos, the screen tour and the form |
| `lib/lvrt.ts`, `lib/grid.ts` | the demo's test traces, and the Calculator's arithmetic |
| `app/api/feedback/route.ts` | takes the feedback form and emails it to both developers |
| `lib/feedback-email.ts` | the email itself, in HTML and plain text |
| `public/img`, `public/video` | the pictures (light and dark) and the demo videos |

## The feedback form

The form at `#feedback` posts to `/api/feedback`, which checks the message and emails it to both developers with Nodemailer. The email is labelled by type (feedback, bug report, feature request, question), carries the visitor's message and details, and has a reply button. When the visitor left an address, replying goes straight to them. A hidden field and a minimum fill time keep most bots out. It works without JavaScript too.

It needs a mailbox to send from. In Vercel, under **Settings → Environment Variables**, add:

| Name | Value |
| --- | --- |
| `SMTP_USER` | the sending address, e.g. a Gmail address |
| `SMTP_PASS` | its password. For Gmail, an app password: Google account → Security → 2-Step Verification → App passwords |
| `SMTP_HOST` | optional, `smtp.gmail.com` by default |
| `SMTP_PORT` | optional, `465` by default |
| `FEEDBACK_DRY_RUN` | optional, `1` writes the email to the function logs instead of sending it |

Then redeploy. Until `SMTP_USER` and `SMTP_PASS` are set, the form tells visitors it is not set up yet. The two addresses it sends to are in `RECIPIENTS` at the top of `app/api/feedback/route.ts`. For local work, put the same variables in `.env.local`.

© 2026 Swingbus. PSCAD, PSS®E and MATLAB are trademarks of their owners.
