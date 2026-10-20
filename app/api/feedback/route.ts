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
export const maxDuration = 30;

const RECIPIENTS = ["satria.w.hadiwijaya@gmail.com", "ezekiel.devin@gmail.com"];

const LIMITS = { name: 80, email: 200, subject: 120, message: 5000 };
const MIN_MESSAGE = 10;
// A person takes longer than this to fill in the form; most bots do not
const MIN_FILL_MS = 3000;
const MAX_BODY_BYTES = 64 * 1024;
// Per visitor (by IP) and per server instance: enough for real use, too little for a flood
const RATE = { perIp: 5, ipWindowMs: 10 * 60 * 1000, perDay: 100 };

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

// The page sends how long the form was open, timed by the visitor's own clock, so a clock
// that is off does not matter. A plain form post (no JavaScript) has no timing to send.
// "bot": the hidden field is filled, or a script posted JSON without the page's timing.
// "fast": sent sooner than a person could write; told to wait, so a real person never loses a message.
function screen(body: Body, fromPage: boolean): "bot" | "fast" | null {
  if (body.website) return "bot";
  if (!fromPage) return null;
  const elapsed = Number(body.elapsed);
  if (body.elapsed === undefined || !Number.isFinite(elapsed)) return "bot";
  return elapsed < MIN_FILL_MS ? "fast" : null;
}

// A best-effort limit kept in memory: it resets when Vercel starts a new instance, so a firewall
// rule in Vercel is the stronger guard (see the README). It still stops a script hammering one instance.
const hits = new Map<string, number[]>();
let today = { day: "", count: 0 };
function overLimit(ip: string) {
  const now = Date.now();
  const day = new Date(now).toISOString().slice(0, 10);
  if (today.day !== day) today = { day, count: 0 };
  if (today.count >= RATE.perDay) return true;
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE.ipWindowMs);
  if (recent.length >= RATE.perIp) return true;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  today.count++;
  return false;
}

// Browsers name the page a post comes from; one from another website is refused
function fromOtherSite(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== (req.headers.get("x-forwarded-host") || req.headers.get("host"));
  } catch {
    return true;
  }
}

export async function POST(req: Request) {
  const fromPage = (req.headers.get("content-type") || "").includes("application/json");
  const reply = (status: number, payload: object, anchor: string) =>
    fromPage ? Response.json(payload, { status }) : Response.redirect(new URL(`/#${anchor}`, req.url), 303);

  if (fromOtherSite(req)) return reply(403, { ok: false, error: "This form only takes messages from its own page." }, "feedback-error");
  if (Number(req.headers.get("content-length") || 0) > MAX_BODY_BYTES) return reply(413, { ok: false, error: "The message is too long." }, "feedback-error");

  let body: Body = {};
  try {
    body = fromPage ? await req.json() : Object.fromEntries(await req.formData());
  } catch {
    // An unreadable body is checked like an empty one
  }
  if (!body || typeof body !== "object") body = {};

  // A bot gets the answer a sent message gets, so it learns nothing; a send that came too quickly is asked to wait
  const suspect = screen(body, fromPage);
  if (suspect === "bot") return reply(200, { ok: true, ref: newRef() }, "feedback-sent");
  if (suspect === "fast") return reply(429, { ok: false, error: "That was quick. Please wait a few seconds, then send it again." }, "feedback-error");

  const { entry: fields, errors } = read(body);
  if (Object.keys(errors).length) return reply(400, { ok: false, error: "Some fields need a look.", fields: errors }, "feedback-error");

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  if (overLimit(ip)) return reply(429, { ok: false, error: "Too many messages in a short time. Please wait a few minutes." }, "feedback-error");

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
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
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
