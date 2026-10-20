// The email the feedback form sends: a subject line, an HTML body and a plain-text body.
// The HTML is tables and inline styles only, the way mail clients need it, and stays light in every client.

export const TYPES = {
  feedback: { label: "Feedback", color: "#2563eb", soft: "#e8efff" },
  bug: { label: "Bug report", color: "#dc2626", soft: "#fdecec" },
  feature: { label: "Feature request", color: "#7c3aed", soft: "#f1eafe" },
  question: { label: "Question", color: "#b45309", soft: "#fdf2e2" },
};

export const AREAS = {
  plotter: "Grid Plotter",
  calculator: "Grid Calculator",
  files: "Opening files",
  website: "This website",
  other: "Something else",
};

export const SETUPS = {
  windows: "Windows app",
  html: "HTML file in a browser",
  unsure: "Not sure",
};

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const paragraphs = (s) => escape(s).replace(/\r?\n/g, "<br>");

// Submissions are timestamped in Jakarta time, where the developers are
function when(date) {
  return (
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      weekday: "short", day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(date) + " WIB"
  );
}

export function buildEmail(entry) {
  const type = TYPES[entry.type];
  const sender = entry.name || "an anonymous visitor";
  const subject = `[Swingbus · ${type.label}] ${entry.subject}`;

  const rows = [
    ["From", entry.name || "Not given"],
    ["Email", entry.email || "Not given, so no reply is possible"],
    ["About", AREAS[entry.area]],
    ...(entry.setup ? [["Runs it as", SETUPS[entry.setup]]] : []),
    ["Sent", when(entry.date)],
  ];

  const rowHtml = rows
    .map(([k, v], i) => `
              <tr>
                <td style="padding:10px 0;${i ? "border-top:1px solid #eef1f5;" : ""}width:110px;font-size:13px;color:#6b7280;vertical-align:top;">${k}</td>
                <td style="padding:10px 0;${i ? "border-top:1px solid #eef1f5;" : ""}font-size:14px;color:#111827;vertical-align:top;">${
                  k === "Email" && entry.email
                    ? `<a href="mailto:${escape(entry.email)}" style="color:#2563eb;text-decoration:none;">${escape(entry.email)}</a>`
                    : escape(v)
                }</td>
              </tr>`)
    .join("");

  const reply = entry.email
    ? `
          <tr>
            <td style="padding:0 32px 32px;">
              <a href="mailto:${escape(entry.email)}?subject=${encodeURIComponent("Re: " + entry.subject)}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:10px;">${entry.name ? "Reply to " + escape(entry.name) : "Reply by email"}</a>
            </td>
          </tr>`
    : "";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escape(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f6f7f9;">
  <div style="display:none;max-height:0;overflow:hidden;">${escape(type.label)} from ${escape(sender)}: ${escape(entry.message.slice(0, 120))}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #dfe3ea;border-radius:14px;font-family:'Segoe UI',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif;">
          <tr>
            <td style="padding:22px 32px;border-bottom:1px solid #eef1f5;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size:16px;font-weight:700;color:#111827;">
                    <span style="display:inline-block;width:22px;height:22px;border-radius:6px;background:#2563eb;vertical-align:-5px;margin-right:8px;text-align:center;line-height:22px;color:#ffffff;font-size:13px;font-weight:700;">S</span>Swingbus
                  </td>
                  <td align="right" style="font-size:12px;color:#6b7280;">Website feedback</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 6px;">
              <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${type.soft};color:${type.color};font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">${type.label}</span>
              <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:#eef1f5;color:#4b5563;font-size:12px;font-weight:600;margin-left:6px;">${escape(AREAS[entry.area])}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 32px 4px;font-size:22px;line-height:1.3;font-weight:700;color:#111827;">${escape(entry.subject)}</td>
          </tr>
          <tr>
            <td style="padding:0 32px 22px;font-size:14px;color:#4b5563;">from ${escape(sender)}</td>
          </tr>
          <tr>
            <td style="padding:0 32px 26px;">
              <div style="border-left:3px solid ${type.color};background:#f8fafc;border-radius:0 10px 10px 0;padding:18px 20px;font-size:15px;line-height:1.65;color:#111827;">${paragraphs(entry.message)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 26px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowHtml}
              </table>
            </td>
          </tr>${reply}
          <tr>
            <td style="padding:18px 32px;border-top:1px solid #eef1f5;background:#fafbfc;border-radius:0 0 14px 14px;font-size:12px;line-height:1.6;color:#6b7280;">
              Sent by the feedback form on swingbus-present.vercel.app &middot; Reference ${entry.ref}<br>
              ${entry.email ? "Replying to this email goes to the sender." : "The sender left no email address."}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const pad = (k) => (k + ":").padEnd(12);
  const text = [
    `${type.label.toUpperCase()} · ${AREAS[entry.area]}`,
    "",
    entry.subject,
    "=".repeat(Math.min(entry.subject.length, 60)),
    "",
    entry.message,
    "",
    "-".repeat(40),
    ...rows.map(([k, v]) => pad(k) + v),
    "-".repeat(40),
    `Sent by the feedback form on swingbus-present.vercel.app · Reference ${entry.ref}`,
  ].join("\n");

  return { subject, html, text };
}
