# Lead-capture setup — Google Sheet + email to leads@thevillageinvestment.com

The site shows a **"Register your interest"** popup (name + phone) that appears
up to **twice per session, ~1 minute apart**, when a visitor **clicks a contact
icon** (WhatsApp / phone / email) or **opens a project page**. Every submission is:

1. saved in the visitor's browser (so nothing is lost even offline), and
2. sent to your lead pipeline.

Because the site is a **static file with no server of its own**, the "write to a
Google Sheet + send an email" step runs in a tiny **Google Apps Script** that you
deploy once (5 minutes). Until you deploy it, the form falls back to opening a
pre-filled email to `leads@thevillageinvestment.com` so leads still reach you.

---

## One-time setup (≈5 minutes)

### 1. Create the Google Sheet
- In the Google account that should own the leads (ideally one that can send mail
  to `leads@thevillageinvestment.com`), create a new **Google Sheet** named
  e.g. *"The Village — Website Leads"*.
- Copy its **ID** from the URL: `https://docs.google.com/spreadsheets/d/`**`THIS_IS_THE_ID`**`/edit`.

### 2. Add the Apps Script
- In that Sheet: **Extensions → Apps Script**.
- Delete any sample code and paste the script below.
- Replace `PASTE_YOUR_SHEET_ID` with the ID from step 1.

```javascript
// The Village Investment — website lead capture (Sheet + email)
const SHEET_ID = 'PASTE_YOUR_SHEET_ID';
const NOTIFY   = 'leads@thevillageinvestment.com';

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var sh = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    if (sh.getLastRow() === 0) {
      sh.appendRow(['Timestamp', 'Name', 'Phone', 'Source', 'Page', 'Locale']);
    }
    sh.appendRow([new Date(), d.name || '', d.phone || '', d.source || '', d.page || '', d.locale || '']);
    MailApp.sendEmail({
      to: NOTIFY,
      subject: 'New website lead — ' + (d.name || ''),
      body: 'Name: '   + (d.name   || '') +
          '\nPhone: '  + (d.phone  || '') +
          '\nSource: ' + (d.source || '') +
          '\nPage: '   + (d.page   || '') +
          '\nLocale: ' + (d.locale || '') +
          '\nTime: '   + (d.ts     || new Date().toISOString())
    });
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 3. Deploy it as a Web App
- **Deploy → New deployment → (gear) Web app**.
- **Execute as:** *Me*.
- **Who has access:** *Anyone*.
- Click **Deploy**, then **Authorize access** and grant the Sheets + Gmail-send
  permissions (Google will warn it's an "unverified app" — that's expected for your
  own script; continue).
- Copy the **Web app URL** (it ends in `/exec`).

### 4. Point the site at it
Open `index.html`, find the `CONFIG` block near the top of the script, and set:

```js
LEAD_ENDPOINT: "https://script.google.com/macros/s/XXXXXXXX/exec",
```

(Or send me the URL and I'll set it and redeploy.) Done — every popup submission
now appends a row to the Sheet **and** emails `leads@thevillageinvestment.com`.

---

## Notes
- **Emails** are sent by `MailApp` from the Google account that owns the script
  (daily quota: 100/day on consumer Gmail, 1,500/day on Workspace — ample for leads).
- The site posts with `mode:'no-cors'`, so the browser fires the request without
  reading the response; the Sheet row + email still happen server-side. This keeps
  the setup dependency-free and avoids CORS configuration.
- **Content-Security-Policy** already allows `https://script.google.com` and
  `https://script.googleusercontent.com` in `connect-src`, so no other change is
  needed.
- **Privacy:** you're now collecting personal data (name + phone). Add a short line
  to the Privacy page stating what you collect, why, and how to request deletion —
  and confirm `leads@thevillageinvestment.com` is a monitored inbox.
- **Frequency:** the popup is capped at **twice per session** and never reappears
  after a visitor submits it (stored in `sessionStorage`). To change the cadence,
  edit the `leadTryOpen` timers in the script (`2500` ms first, `60000` ms gap).

## What each lead row contains
| Column | Meaning |
|---|---|
| Timestamp | server time the lead arrived |
| Name / Phone | what the visitor entered |
| Source | `popup` (room to add more capture points later) |
| Page | the route they were on (e.g. `project`, `units`) |
| Locale | `en` or `ar` |
