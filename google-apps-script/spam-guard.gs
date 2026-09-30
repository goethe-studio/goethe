/**
 * Goethe signup form: server-side spam guard for the Google Apps Script
 * that saves emails to the "Email Subscriptions" sheet.
 *
 * Why this matters: the script URL is public in JS/scripts.js, so bots can
 * post to it directly and skip the website entirely. These checks run in
 * Google, so they catch those bots too.
 *
 * HOW TO INSTALL
 * 1. Open the Apps Script project (Extensions > Apps Script from the sheet).
 * 2. Add a new file, name it spam-guard, and paste this whole file in.
 * 3. In your existing doPost(e) function, add this as the very first line:
 *
 *      if (isSpamSignup_(e)) return ContentService.createTextOutput("ok");
 *
 * 4. Deploy > Manage deployments > edit (pencil) > Version: New version > Deploy.
 *    Editing the existing deployment keeps the same URL, so the site keeps working.
 *
 * TURNSTILE (optional, once you have Cloudflare keys)
 * Project Settings > Script properties > add TURNSTILE_SECRET = your secret key.
 * Leave it unset and the Turnstile check is skipped.
 */

var MIN_FILL_TIME_MS = 3000;

function isSpamSignup_(e) {
  var p = (e && e.parameter) || {};
  var email = String(p.email || "").trim().toLowerCase();

  // 1. Hidden bot-trap field was filled in
  if (p.website) return true;

  // 2. Missing or impossibly fast fill time (direct posts to the URL have none)
  var elapsed = Number(p.elapsed);
  if (!elapsed || elapsed < MIN_FILL_TIME_MS) return true;

  // 3. Not a plausible email
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return true;

  // 4. Cloudflare Turnstile, only if a secret is configured
  var secret = PropertiesService.getScriptProperties().getProperty("TURNSTILE_SECRET");
  if (secret) {
    if (!p.token) return true;
    try {
      var res = UrlFetchApp.fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "post",
        payload: { secret: secret, response: p.token },
        muteHttpExceptions: true
      });
      if (!JSON.parse(res.getContentText()).success) return true;
    } catch (err) {
      return true;
    }
  }

  // 5. Already signed up (skip the duplicate row)
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      var found = ss.getSheets()[0].createTextFinder(email).matchCase(false).matchEntireCell(true).findNext();
      if (found) return true;
    }
  } catch (err) {
    // If the sheet can't be read, don't block the signup
  }

  return false;
}
