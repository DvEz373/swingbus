# Swingbus

The showcase page of Swingbus, an offline toolkit for grid-connection studies. The Grid Plotter benchmarks simulation results against field measurements; the Grid Calculator works out the grid behind a single-machine test.

Live at **[swingbus-present.vercel.app](https://swingbus-present.vercel.app/)**.

Swingbus is a personal project by two fresh electrical engineering graduates from Universitas Indonesia: Satria Wibawa Hadiwijaya ([taio11k.github.io](https://taio11k.github.io/)) and Devin Ezekiel Purba ([dvez373.github.io](https://dvez373.github.io/)). The app's code is private. This repository holds the page, its pictures, two demo videos and the feedback form.

## What is here

- `index.html`: the whole page, styles and script included
- `img/`, `video/`: the pictures (light and dark) and the demo videos
- `api/feedback.js`: a Vercel function that takes the feedback form and emails it to both developers
- `api/_email.js`: the email itself, in HTML and plain text

## The feedback form

The form at `#feedback` posts to `/api/feedback`, which checks the message and emails it to both developers with Nodemailer. The email is labelled by type (feedback, bug report, feature request, question), carries the visitor's message and details, and has a reply button. When the visitor left an address, replying goes straight to them. A hidden field and a minimum fill time keep most bots out.

It needs a mailbox to send from. In Vercel, under **Settings → Environment Variables**, add:

| Name | Value |
| --- | --- |
| `SMTP_USER` | the sending address, e.g. a Gmail address |
| `SMTP_PASS` | its password. For Gmail, an app password: Google account → Security → 2-Step Verification → App passwords |
| `SMTP_HOST` | optional, `smtp.gmail.com` by default |
| `SMTP_PORT` | optional, `465` by default |
| `FEEDBACK_DRY_RUN` | optional, `1` writes the email to the function logs instead of sending it |

Then redeploy. Until `SMTP_USER` and `SMTP_PASS` are set, the form tells visitors it is not set up yet. The two addresses it sends to are in `RECIPIENTS` at the top of `api/feedback.js`.

© 2026 Swingbus. PSCAD, PSS®E and MATLAB are trademarks of their owners.
