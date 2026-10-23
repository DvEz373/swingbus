# Swingbus

The showcase site of Swingbus, an offline toolkit for grid-connection studies. The Grid Plotter benchmarks simulation results against field measurements; the Grid Calculator works out the grid behind a single-machine test.

Live at **[swingbus-present.vercel.app](https://swingbus-present.vercel.app/)**.

Swingbus is a personal project by two fresh electrical engineering graduates from Universitas Indonesia: Satria Wibawa Hadiwijaya ([taio11k.github.io](https://taio11k.github.io/)) and Devin Ezekiel Purba ([dvez373.github.io](https://dvez373.github.io/)). The app's code is private. This repository holds the site, its pictures, two demo videos and the feedback form.

## The site

A [Next.js](https://nextjs.org/) app (App Router, TypeScript), styled with Tailwind CSS and animated with Motion. The page is prerendered as static HTML; only the feedback form runs on the server.

On the page, besides the overview and the pictures:

- **A working Plotter**: one made-up LVRT test, simulation over measurement, with cursors A and B to drag (or move with the arrow keys), a zoom to the fault, and the error between the traces
- **A working Calculator**: SCR, X/R and the dip you want, giving the fault level, Zs and Zf, with the voltage drawn along the circuit
- **Inside the app**: six screens of the app in tabs, each one full size on a click
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
| `app/api/feedback/route.ts` | takes the feedback form and hands it to the Google script |
| `google-apps-script/Code.gs` | the Google Apps Script: saves each message as a row in a Sheet |
| `lib/feedback.ts` | the form's types and parts of the app, as the Sheet shows them |
| `public/img`, `public/video` | the pictures (light and dark, six screens) and the demo videos, both made with `docshots.js` and `demo-video.js` of the app's repository |
| `public/icon.svg`, `icon.png`, `apple-touch-icon.png` | the app's own mark (`desktop/build/icon.svg` of the app's repository), copied as it is; `Mark` in `components/icons.tsx` is the same drawing |

## The feedback form

The form at `#feedback` posts to `/api/feedback`, which checks the message and hands it to a small Google Apps Script (`google-apps-script/Code.gs`). The script adds it as a row to a Google Sheet in your Drive: when it came, a reference, the type (feedback, bug report, feature request, question), the part of the app, the visitor's name, email and subject, the message, and a **Status** dropdown (New, Read, Fixing, Done, Won't fix) for keeping track. Nothing is emailed, and no password is stored anywhere: Vercel only holds the script's address and a key. It works without JavaScript too.

Against spam: a hidden field only bots fill in, a minimum time the form must be open (timed on the visitor's own clock), posts from other websites refused, messages capped at 64 KB, and at most 5 messages per visitor in 10 minutes (100 a day) per server instance. That last limit lives in memory and resets when Vercel starts a new instance, so for a firm limit add a rate-limit rule for `/api/feedback` in Vercel's Firewall.

### Setting it up (once, about 5 minutes)

1. **Make the Sheet.** Signed in to your Google account, open [sheets.new](https://sheets.new) and name it, e.g. "Swingbus feedback". It is saved in your Drive.
2. **Add the script.** In the Sheet, open **Extensions → Apps Script**. Delete what is in `Code.gs`, paste the whole of [`google-apps-script/Code.gs`](google-apps-script/Code.gs), and press **Save** (the disk icon).
3. **Run setup once.** In the toolbar, choose the function **setup** and press **Run**. Google asks for permission: choose your account, then **Advanced → Go to (project name) (unsafe) → Allow**. (Google says "unsafe" for any script it has not reviewed; this one is yours.) When it finishes, the **Execution log** shows a line `FEEDBACK_SCRIPT_TOKEN for Vercel: …`. Copy that key. The Sheet now has a **Feedback** tab with headings.
4. **Deploy it as a web app.** Press **Deploy → New deployment**, click the gear next to "Select type" and pick **Web app**. Set **Execute as: Me** and **Who has access: Anyone**, then **Deploy**. Copy the **Web app URL** (it ends in `/exec`). Opening it in a browser should show `{"ok":true,"service":"Swingbus feedback",…}`.
5. **Tell Vercel.** In the Vercel project, **Settings → Environment Variables**, add for **Production** and **Preview**:

   | Name | Type | Value |
   | --- | --- | --- |
   | `FEEDBACK_SCRIPT_URL` | Config | the Web app URL from step 4 |
   | `FEEDBACK_SCRIPT_TOKEN` | Secret | the key from step 3 |

   Then **Deployments → ⋯ → Redeploy** on the latest deployment.
6. **Try it.** Send a message from the site: a row appears in the Sheet's **Feedback** tab within a few seconds.

Until both variables are set, the form tells visitors it is not set up yet. `FEEDBACK_DRY_RUN=1` writes the message to the function logs instead of saving it. To let someone else read the list, share the Sheet with them as you would any Google file. If you edit the script later, publish the change with **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**; the URL stays the same. For local work, put the variables in `.env.local`.

**If it does not work**, look at Vercel's **Logs** for lines starting with `Feedback:`. "refused the message: unauthorized" means the key in Vercel does not match the script's; "answered 200 with <!doctype html>… Sign in" means the deployment's access is not set to **Anyone**.

© 2026 Swingbus. PSCAD, PSS®E and MATLAB are trademarks of their owners.
