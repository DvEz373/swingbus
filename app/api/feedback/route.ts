// POST /api/feedback: the website's feedback form, sent by email to both developers.
// Takes JSON from the page, or a plain form post when JavaScript is off (answered with a redirect).
//
// Environment (Vercel → Settings → Environment Variables):
//   SMTP_USER   the mailbox that sends, e.g. a Gmail address
//   SMTP_PASS   its password; for Gmail an app password (Google account → Security → App passwords)
//   SMTP_HOST   optional, smtp.gmail.com by default
//   SMTP_PORT   optional, 465 by default (TLS)
//   FEEDBACK_DRY_RUN=1   optional, builds the email and logs it instead of sending (for previews)

import { randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { AREAS, SETUPS, TYPES, buildEmail, type Entry } from "@/lib/feedback-email";

export const runtime = "nodejs";

const RECIPIENTS = ["satria.w.hadiwijaya@gmail.com", "ezekiel.devin@gmail.com"];

const LIMITS = { name: 80, email: 200, subject: 120, message: 5000 };
const MIN_MESSAGE = 10;
// A person takes longer than this to fill in the form; most bots do not
const MIN_FILL_MS = 3000;

type Body = Record<string, unknown>;

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const pick = (v: unknown, table: Record<string, unknown>, fallback: string) =>
  typeof v === "string" && Object.hasOwn(table, v) ? v : fallback;
const newRef = () => "SB-" + randomBytes(3).toString("hex").toUpperCase();

function read(body: Body) {
  const entry = {
    type: pick(body.type, TYPES, ""),
    area: pick(body.area, AREAS, "other"),
    setup: body.type === "bug" ? pick(body.setup, SETUPS, "") : "",
    name: clean(body.name, LIMITS.name).replace(/[\r\n]+/g, " "),
    email: clean(body.email, LIMITS.email),
    subject: clean(body.subject, LIMITS.subject).replace(/[\r\n]+/g, " "),
    message: clean(body.message, LIMITS.message),
  };
  const errors: Record<string, string> = {};
  if (!entry.type) errors.type = "Choose what kind of message this is.";
  if (entry.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) errors.email = "That email address does not look right.";
  if (entry.message.length < MIN_MESSAGE) errors.message = `Write at least ${MIN_MESSAGE} characters.`;
  if (!entry.subject && entry.message) {
    const first = entry.message.split(/\r?\n/)[0];
    entry.subject = first.length > 60 ? first.slice(0, 57).trimEnd() + "…" : first;
  }
  return { entry, errors };
}

function looksLikeBot(body: Body) {
  if (body.website) return true; // the hidden field only bots fill in
  const started = Number(body.started);
  return Number.isFinite(started) && started > 0 && Date.now() - started < MIN_FILL_MS;
}

export async function POST(req: Request) {
  const fromPage = (req.headers.get("content-type") || "").includes("application/json");
  const reply = (status: number, payload: object, anchor: string) =>
    fromPage ? Response.json(payload, { status }) : Response.redirect(new URL(`/#${anchor}`, req.url), 303);

  let body: Body = {};
  try {
    body = fromPage ? await req.json() : Object.fromEntries(await req.formData());
  } catch {
    // An unreadable body is checked like an empty one
  }
  if (!body || typeof body !== "object") body = {};

  // Bots get the same answer as people, so they learn nothing
  if (looksLikeBot(body)) return reply(200, { ok: true, ref: newRef() }, "feedback-sent");

  const { entry: fields, errors } = read(body);
  if (Object.keys(errors).length) return reply(400, { ok: false, error: "Some fields need a look.", fields: errors }, "feedback-error");

  const entry: Entry = { ...fields, date: new Date(), ref: newRef() };
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
