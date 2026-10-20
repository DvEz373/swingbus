// POST /api/feedback: the website's feedback form, sent by email to both developers.
// Takes JSON from the page's script, or a plain form post when JavaScript is off (answered with a redirect).
//
// Environment (Vercel → Settings → Environment Variables):
//   SMTP_USER   the mailbox that sends, e.g. a Gmail address
//   SMTP_PASS   its password; for Gmail an app password (Google account → Security → App passwords)
//   SMTP_HOST   optional, smtp.gmail.com by default
//   SMTP_PORT   optional, 465 by default (TLS)
//   FEEDBACK_DRY_RUN=1   optional, builds the email and logs it instead of sending (for previews)

import { randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { AREAS, SETUPS, TYPES, buildEmail } from "./_email.js";

const RECIPIENTS = ["satria.w.hadiwijaya@gmail.com", "ezekiel.devin@gmail.com"];

const LIMITS = { name: 80, email: 200, subject: 120, message: 5000 };
const MIN_MESSAGE = 10;
// A person takes longer than this to fill in the form; most bots do not
const MIN_FILL_MS = 3000;

const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const pick = (v, table, fallback) => (Object.hasOwn(table, v) ? v : fallback);

function read(body) {
  const entry = {
    type: pick(body.type, TYPES, ""),
    area: pick(body.area, AREAS, "other"),
    setup: body.type === "bug" ? pick(body.setup, SETUPS, "") : "",
    name: clean(body.name, LIMITS.name).replace(/[\r\n]+/g, " "),
    email: clean(body.email, LIMITS.email),
    subject: clean(body.subject, LIMITS.subject).replace(/[\r\n]+/g, " "),
    message: clean(body.message, LIMITS.message),
  };
  const errors = {};
  if (!entry.type) errors.type = "Choose what kind of message this is.";
  if (entry.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) errors.email = "That email address does not look right.";
  if (entry.message.length < MIN_MESSAGE) errors.message = `Write at least ${MIN_MESSAGE} characters.`;
  if (!entry.subject && entry.message) {
    const first = entry.message.split(/\r?\n/)[0];
    entry.subject = first.length > 60 ? first.slice(0, 57).trimEnd() + "…" : first;
  }
  return { entry, errors };
}

function looksLikeBot(body) {
  if (body.website) return true; // the hidden field only bots fill in
  const started = Number(body.started);
  return Number.isFinite(started) && started > 0 && Date.now() - started < MIN_FILL_MS;
}

export default async function handler(req, res) {
  const fromPage = (req.headers["content-type"] || "").includes("application/json");
  const reply = (status, payload, anchor) =>
    fromPage ? res.status(status).json(payload) : res.redirect(303, `/#${anchor}`);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Use POST." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};

  // Bots get the same answer as people, so they learn nothing
  if (looksLikeBot(body)) return reply(200, { ok: true, ref: "SB-" + randomBytes(3).toString("hex").toUpperCase() }, "feedback-sent");

  const { entry, errors } = read(body);
  if (Object.keys(errors).length) return reply(400, { ok: false, error: "Some fields need a look.", fields: errors }, "feedback-error");

  entry.date = new Date();
  entry.ref = "SB-" + randomBytes(3).toString("hex").toUpperCase();
  const { subject, html, text } = buildEmail(entry);

  if (process.env.FEEDBACK_DRY_RUN === "1") {
    console.log("Feedback (dry run, not sent)", { to: RECIPIENTS, subject, text });
    return reply(200, { ok: true, ref: entry.ref }, "feedback-sent");
  }

  const { SMTP_USER, SMTP_PASS, SMTP_HOST = "smtp.gmail.com", SMTP_PORT = "465" } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    console.error("Feedback: SMTP_USER and SMTP_PASS are not set");
    return reply(503, { ok: false, error: "The feedback form is not set up yet." }, "feedback-error");
  }

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transport.sendMail({
      from: { name: "Swingbus Feedback", address: SMTP_USER },
      to: RECIPIENTS,
      replyTo: entry.email ? { name: entry.name || entry.email, address: entry.email } : undefined,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("Feedback: sending failed", err);
    return reply(502, { ok: false, error: "The message could not be sent." }, "feedback-error");
  }

  return reply(200, { ok: true, ref: entry.ref }, "feedback-sent");
}
