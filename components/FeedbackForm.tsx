"use client";

// The feedback form: checked here first, then sent to /api/feedback, which emails both developers.
// Without JavaScript it still posts, and the server redirects back to #feedback-sent or #feedback-error.
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Bug, Bulb, Chat, Check, Question } from "./icons";
import { button } from "./ui";

const KINDS = [
  { value: "feedback", label: "Feedback", icon: Chat, placeholder: "What did you like, what got in your way, what should come next?", tip: "Plain text is fine. Line breaks are kept." },
  { value: "bug", label: "Bug report", icon: Bug, placeholder: "1. What I did\n2. What I expected\n3. What happened instead", tip: "The file type you opened and any error text help a lot." },
  { value: "feature", label: "Feature idea", icon: Bulb, placeholder: "What would you like Swingbus to do, and in which study would it help?", tip: "A short example from your work helps us size it." },
  { value: "question", label: "Question", icon: Question, placeholder: "Ask away.", tip: "Leave your email so we can answer." },
] as const;

type Kind = (typeof KINDS)[number]["value"];
type Errors = Partial<Record<"email" | "message", string>>;

const MAX = 5000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ id, text }: { id: string; text?: string }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div id={id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-[13px] text-danger">
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function FeedbackForm() {
  const [kind, setKind] = useState<Kind>("feedback");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [failure, setFailure] = useState("");
  const [ref, setRef] = useState("");
  const form = useRef<HTMLFormElement>(null);
  // When the form was shown, on the visitor's own clock; the server only sees the time it took
  const startedAt = useRef(0);
  const done = useRef<HTMLDivElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const messageInput = useRef<HTMLTextAreaElement>(null);
  const refocus = useRef(false);
  const current = KINDS.find((k) => k.value === kind)!;

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFailure("");
    const found: Errors = {};
    if (email.trim() && !EMAIL.test(email.trim())) found.email = "That email address does not look right.";
    if (message.trim().length < 10) found.message = "Write at least 10 characters.";
    // The errors are in the page before the cursor moves, so a screen reader reads the field with its error
    flushSync(() => setErrors(found));
    if (found.email) return emailInput.current?.focus();
    if (found.message) return messageInput.current?.focus();

    setState("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(e.currentTarget)), elapsed: Date.now() - startedAt.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (data.fields) setErrors(data.fields);
        // A field to fix needs no waiting; anything else might pass in a minute
        const retry = res.status === 400 || res.status === 413 || res.status === 429 ? "" : " Please try again in a minute.";
        throw new Error((data.error || "The message could not be sent.") + retry);
      }
      setRef(data.ref || "");
      setState("sent");
    } catch (err) {
      const text = err instanceof TypeError ? "The message could not be sent: no connection. Please try again in a minute." : (err as Error).message;
      setFailure(text);
      setState("idle");
    }
  };

  const again = (e: React.MouseEvent) => {
    e.preventDefault();
    form.current?.reset();
    setKind("feedback");
    setMessage("");
    setEmail("");
    setErrors({});
    setFailure("");
    setState("idle");
    startedAt.current = Date.now();
    if (location.hash === "#feedback-sent" || location.hash === "#feedback-error") history.replaceState(null, "", "#feedback");
    refocus.current = true;
  };

  // The form comes back once the thank-you has gone; when it has settled, the cursor goes to the first field
  const onFormShown = () => {
    if (!refocus.current) return;
    refocus.current = false;
    document.getElementById("fb-name")?.focus();
  };

  return (
    <div className="form-card relative overflow-hidden rounded-panel border border-line bg-surface p-5 shadow-lift sm:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {state !== "sent" ? (
          <motion.form
            key="form"
            ref={form}
            action="/api/feedback"
            method="post"
            noValidate
            onSubmit={submit}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onAnimationComplete={onFormShown}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid gap-5"
          >
            <fieldset className="min-w-0">
              <legend className="mb-2 text-sm font-semibold">What is it about?</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {KINDS.map((k) => (
                  <label key={k.value} className="relative cursor-pointer">
                    <input type="radio" name="type" value={k.value} checked={kind === k.value} onChange={() => setKind(k.value)} className="peer absolute inset-0 opacity-0" />
                    <span className="grid justify-items-center gap-1 rounded-[10px] border border-line bg-surface-2 px-2 py-3 text-center text-sm font-semibold text-muted transition-colors peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent peer-hover:border-accent peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                      <k.icon className="size-5" />
                      {k.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fb-name" className="mb-2 block text-sm font-semibold">Name <small className="font-normal text-muted">(optional)</small></label>
                <input id="fb-name" name="name" type="text" maxLength={80} autoComplete="name" placeholder="Your name" className="field" />
              </div>
              <div>
                <label htmlFor="fb-email" className="mb-2 block text-sm font-semibold">Email <small className="font-normal text-muted">(optional, for a reply)</small></label>
                <input
                  ref={emailInput}
                  id="fb-email"
                  name="email"
                  type="email"
                  maxLength={200}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="field"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); }}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby="fb-email-error"
                />
                <FieldError id="fb-email-error" text={errors.email} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fb-area" className="mb-2 block text-sm font-semibold">Which part?</label>
                <select id="fb-area" name="area" defaultValue="other" className="field">
                  <option value="plotter">Grid Plotter</option>
                  <option value="calculator">Grid Calculator</option>
                  <option value="files">Opening files</option>
                  <option value="website">This website</option>
                  <option value="other">Something else</option>
                </select>
              </div>
              <AnimatePresence initial={false}>
                {kind === "bug" && (
                  <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <label htmlFor="fb-setup" className="mb-2 block text-sm font-semibold">How do you run it?</label>
                    <select id="fb-setup" name="setup" defaultValue="unsure" className="field">
                      <option value="windows">Windows app</option>
                      <option value="html">HTML file in a browser</option>
                      <option value="unsure">Not sure</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label htmlFor="fb-subject" className="mb-2 block text-sm font-semibold">Subject <small className="font-normal text-muted">(optional)</small></label>
              <input id="fb-subject" name="subject" type="text" maxLength={120} placeholder="In a few words" className="field" />
            </div>

            <div>
              <label htmlFor="fb-message" className="mb-2 block text-sm font-semibold">Message</label>
              <textarea
                ref={messageInput}
                id="fb-message"
                name="message"
                required
                minLength={10}
                maxLength={MAX}
                placeholder={current.placeholder}
                className="field min-h-[160px] resize-y leading-relaxed"
                value={message}
                onChange={(e) => { setMessage(e.target.value); if (e.target.value.trim().length >= 10) setErrors((x) => ({ ...x, message: undefined })); }}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby="fb-message-error fb-count"
              />
              <FieldError id="fb-message-error" text={errors.message} />
              <div className="mt-1.5 flex justify-between gap-3 text-[13px] text-muted">
                <span>{current.tip}</span>
                <span id="fb-count" className={`whitespace-nowrap tabular-nums ${message.length > MAX * 0.9 ? "text-danger" : ""}`}>{message.length} / {MAX}</span>
              </div>
            </div>

            {/* Only bots fill this in */}
            <div className="absolute -left-[10000px] size-px overflow-hidden" aria-hidden="true">
              <label htmlFor="fb-website">Leave this empty</label>
              <input id="fb-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <AnimatePresence>
              {failure && (
                <motion.div role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[10px] bg-danger-soft px-4 py-3.5 text-[15px] text-danger">
                  {failure}
                </motion.div>
              )}
            </AnimatePresence>
            <div id="feedback-error" className="hidden rounded-[10px] bg-danger-soft px-4 py-3.5 text-[15px] text-danger">
              Your message could not be sent. Check that it has at least 10 characters, then try again in a minute.
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[13px] text-muted">Sent by email to Satria and Devin.</p>
              <button type="submit" disabled={state === "sending"} className={`${button.base} ${button.md} ${button.primary} w-full cursor-pointer disabled:cursor-progress disabled:opacity-70 sm:w-auto`}>
                {state === "sending" && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
                {state === "sending" ? "Sending…" : "Send to the developers"}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onAnimationStart={() => done.current?.focus()}
          >
            <Done ref={done} reference={ref} onAgain={again} />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Always in the page, so screen readers hear the result when it changes */}
      <p role="status" className="sr-only">
        {state === "sent" ? `Message sent.${ref ? ` Reference ${ref}.` : ""}` : state === "sending" ? "Sending…" : ""}
      </p>
      {/* The page as the server sends it also carries the thank-you, shown by #feedback-sent:target when JavaScript is off */}
      {state !== "sent" && (
        <div id="feedback-sent" className="hidden">
          <Done reference="" />
        </div>
      )}
    </div>
  );
}

function Done({ ref, reference, onAgain }: { ref?: React.Ref<HTMLDivElement>; reference: string; onAgain?: (e: React.MouseEvent) => void }) {
  return (
    <div ref={ref} tabIndex={-1} className="px-3 py-10 text-center outline-none">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-success-soft text-success"
      >
        <Check className="size-8" strokeWidth={2.4} />
      </motion.div>
      <h3 className="text-xl font-semibold">Thank you, it is on its way</h3>
      <p className="mx-auto mt-2.5 max-w-[42ch] text-muted">Your message is in both our inboxes.{reference && ` Reference ${reference}.`}</p>
      <a href="#feedback" onClick={onAgain} className={`${button.base} ${button.md} ${button.secondary} mt-6`}>
        Send another
      </a>
    </div>
  );
}
