/**
 * Swingbus feedback: saves each message from the website's form as a row in this Google Sheet,
 * and emails it to both developers from the Google account that deploys this script.
 *
 * Set up once (the steps are in the repository's README):
 *   1. Paste this file into the Sheet's Extensions → Apps Script, replacing what is there.
 *   2. Run `setup` once and allow access. The log then shows the key for Vercel.
 *   3. Deploy → New deployment → Web app, execute as Me, access Anyone. Copy the /exec URL.
 *   4. In Vercel: FEEDBACK_SCRIPT_URL = that URL, FEEDBACK_SCRIPT_TOKEN = the key. Redeploy.
 *
 * Only the website knows the key, so nobody else can add rows or send mail through this script.
 */

// Who gets every message. The website cannot change this list.
var RECIPIENTS = ["satria.w.hadiwijaya@gmail.com", "ezekiel.devin@gmail.com"];
var SHEET_NAME = "Feedback";
var HEADERS = ["Received", "Reference", "Type", "About", "Runs it as", "Name", "Email", "Subject", "Message", "Emailed"];

/** Run once by hand: prepares the sheet, makes the key, and asks for the permissions the script needs. */
function setup() {
  var props = PropertiesService.getScriptProperties();
  var book = SpreadsheetApp.getActiveSpreadsheet();
  props.setProperty("SPREADSHEET_ID", book.getId());
  book.setSpreadsheetTimeZone("Asia/Jakarta");

  var sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#eef3ff");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(8, 220);
    sheet.setColumnWidth(9, 420);
    sheet.getRange("I:I").setWrap(true);
    sheet.getRange("A:A").setNumberFormat("ddd d mmm yyyy, hh:mm");
  }

  var token = props.getProperty("FEEDBACK_TOKEN");
  if (!token) {
    token = Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
    props.setProperty("FEEDBACK_TOKEN", token);
  }
  // Mentioning MailApp here makes Google ask for the email permission now, not on the first message
  Logger.log("Emails left today: " + MailApp.getRemainingDailyQuota());
  Logger.log("FEEDBACK_SCRIPT_TOKEN for Vercel: " + token);
}

/** Opening the /exec URL in a browser shows this, to check the deployment works. */
function doGet() {
  return json({ ok: true, service: "Swingbus feedback", hint: "The website posts messages here." });
}

/** The website posts: { token, entry: {...}, subject, html, text } */
function doPost(e) {
  var props = PropertiesService.getScriptProperties();
  var data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (err) {
    return json({ ok: false, error: "bad json" });
  }
  var token = props.getProperty("FEEDBACK_TOKEN");
  if (!token || data.token !== token) return json({ ok: false, error: "unauthorized" });

  var entry = data.entry || {};
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  var sheet, row;
  try {
    var book = SpreadsheetApp.openById(props.getProperty("SPREADSHEET_ID"));
    sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
    sheet.appendRow([
      new Date(entry.date || Date.now()),
      cell(entry.ref),
      cell(entry.typeLabel),
      cell(entry.areaLabel),
      cell(entry.setupLabel),
      cell(entry.name),
      cell(entry.email),
      cell(entry.subject),
      cell(entry.message),
      "sending…",
    ]);
    row = sheet.getLastRow();
  } finally {
    lock.releaseLock();
  }

  // The message is saved before any email goes out, so a mail problem never loses it
  var emailed = false, mailError = "";
  try {
    if (MailApp.getRemainingDailyQuota() < RECIPIENTS.length) throw new Error("daily email quota used up");
    var mail = {
      to: RECIPIENTS.join(","),
      subject: String(data.subject || "Swingbus feedback"),
      body: String(data.text || entry.message || ""),
      htmlBody: String(data.html || ""),
      name: "Swingbus Feedback",
    };
    if (entry.email) mail.replyTo = String(entry.email);
    MailApp.sendEmail(mail);
    emailed = true;
  } catch (err) {
    mailError = String(err && err.message ? err.message : err);
  }
  sheet.getRange(row, HEADERS.length).setValue(emailed ? "yes" : "no: " + mailError);

  return json({ ok: true, saved: true, emailed: emailed, error: mailError || undefined });
}

// Text from visitors goes in as text: a value starting with = + - or @ would otherwise run as a formula
function cell(v) {
  var s = v == null ? "" : String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
