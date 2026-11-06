# AMO listing: UMT Captcha Fill

## Name (16 characters, limit 50)
UMT Captcha Fill

## Summary (215 characters, limit 250)
Fills the captcha on the UMT online portal login (online.umt.edu.pk), case preserved. Unofficial, not affiliated with the university. Never touches ID or password, never submits, stores nothing, no network requests.

## Description
Unofficial. UMT Captcha Fill is an independent add-on. It is not affiliated with, endorsed by or sponsored by the University of Management and Technology. The university is named only to say which site the add-on works on. The add-on uses no university logo.

On the login page of https://online.umt.edu.pk/, the captcha is shown as plain text. The portal often rejects the first login attempt even when the code was typed correctly. This add-on copies that exact text into the code box for you, with the same upper and lower case as shown on the page. If the captcha refreshes, it fills the new code.

What it does not do:
- It fills only the captcha. It never reads or fills your student ID or password. Firefox's password manager can do that.
- It never clicks the Login button. You press it yourself.
- It never overwrites what you typed in the code box.
- It stores nothing, makes no network requests, and has no analytics or remote code.

It runs only on https://online.umt.edu.pk/ and asks for no other permission. It needs Firefox for desktop, version 140 or newer.

Source code (MIT licence): https://github.com/muzammil-shayk/umt-captcha-fill
Support: https://github.com/muzammil-shayk/umt-captcha-fill/issues

## Privacy statement
This add-on collects no data. It reads the captcha text on the login page only to copy it into the code box, and it does not keep, log or send that text anywhere. It stores nothing, makes no network requests, and contains no analytics or remote code. It never reads your student ID or password.

## Notes to reviewer
- Name: "UMT Captcha Fill" is the author's choice. The name contains the university's initials only to say which site it works on. The description states that the add-on is independent, unofficial and not affiliated with or endorsed by the university, and no university logo is used.
- Desktop only: the manifest has no `gecko_android` key. Set the AMO compatibility to Firefox desktop only.
- Single host match: the content script matches only `https://online.umt.edu.pk/*`. The add-on works on that one portal's login page and nowhere else. It requests no permissions and no host permissions beyond that content script match.
- No data collection: `data_collection_permissions` is `required: ["none"]`. The code has no network calls (no fetch, XMLHttpRequest, WebSocket or beacon), no storage API, and no analytics.
- No remote code: all logic is in one file, `content.js`, shipped in the package. Nothing is fetched or evaluated at run time.
- What it touches: it reads the text of `span.captcha` inside `form#loginform` and writes it to `#SecurityCode`, then dispatches `input`, `change` and `keyup` events so the page sees the value. It does not touch the ID or password fields or the submit button. It does not overwrite a value the user typed.
- Source, tests and fixture: https://github.com/muzammil-shayk/umt-captcha-fill
- How to verify without a university account: open `test/fixtures/login.html`. It is a hand-written page with the same structure (`form#loginform`, `span.captcha`, `#SecurityCode`). The fixture is a local file and the manifest matches only the real portal URL, so to run the add-on against it, serve or edit it to match, or read `test/content.test.js`, which loads the fixture in jsdom and runs `content.js`. Run `npm install` then `npm test`.
- No build step, no minification, no bundler, no transpiler: the source is the package. The submitted zip contains `manifest.json`, `content.js`, `LICENSE`, `README.md` and `icons/`. The repository also holds tests and tooling that are not in the zip.
- Licence: MIT.

## Suggested category and tags
Category: Other (or Web Development if Other is not offered).
Tags: captcha, autofill, login, form filler, university, student portal

## Release notes for 1.0.0
First release: fills the plain-text captcha on the online.umt.edu.pk login page.
