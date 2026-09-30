// Goethe signup form: saves emails to the Email Subscriptions sheet,
// with spam checks that run on Google's side (bots can't skip them).

var SHEET_ID = "1nY6sD-bzi2eQxKLmJWR34tICCdRXqVIIM1UniS4a8UE";

// Turn this to true AFTER the website update (bot-protection branch) is live.
// It rejects anything that didn't come through the real site.
var REQUIRE_SITE_CHECKS = false;
var MIN_FILL_TIME_MS = 3000;

function doPost(e) {
  var p = (e && e.parameter) || {};
  var email = String(p.email || "").trim();

  if (!email) {
    return reply_("Error: No email provided");
  }

  // Spam is quietly ignored with a normal reply, so bots don't learn anything
  if (isSpam_(p, email)) {
    return reply_("Success");
  }

  var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

  // Skip emails that are already on the sheet
  var existing = sheet.createTextFinder(email).matchCase(false).matchEntireCell(true).findNext();
  if (!existing) {
    sheet.appendRow([email]);
  }

  return reply_("Success");
}

function isSpam_(p, email) {
  // Hidden trap field was filled in
  if (p.website) return true;

  // Not a real-looking email
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return true;

  if (REQUIRE_SITE_CHECKS) {
    // Direct posts to this URL have no fill time; real visitors take a few seconds
    var elapsed = Number(p.elapsed);
    if (!elapsed || elapsed < MIN_FILL_TIME_MS) return true;

    // Cloudflare Turnstile, only once TURNSTILE_SECRET is added in Script properties
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
  }

  return false;
}

function reply_(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
}
