# UMT Captcha Fill

A Firefox add-on. On the login page of `https://online.umt.edu.pk/`, it copies the plain-text captcha into the code box.

**Unofficial.** This is an independent project. It is not affiliated with, endorsed by or sponsored by the University of Management and Technology. The university is named only to say which site the add-on works on. No university logo is used.

## What it does
The portal shows its captcha as text and often rejects the first attempt even when the code was typed correctly. This add-on copies the exact text into the code box, with the same case, and fills again if the captcha refreshes.

It never:
- reads or fills your student ID or password (Firefox's password manager does that)
- clicks Login
- overwrites what you typed in the code box

## Install
- From Mozilla Add-ons: [AMO link: to add after publishing]
- Temporary load for testing: open `about:debugging`, choose This Firefox, then Load Temporary Add-on, and select `manifest.json`.

Needs Firefox for desktop, version 140 or newer.

## How it works
`content.js` runs only on `https://online.umt.edu.pk/*`. It finds `span.captcha` and `#SecurityCode` inside `form#loginform`, reads the span's text, and writes it into the input. A MutationObserver refills when the captcha changes. It fills only an empty box or one still holding its own last fill. If the login form never appears, it stops watching after 15 seconds. There is no build step and no minification: the source is the package.

## Privacy
Collects nothing. No storage, no network requests, no analytics, no remote code, no permissions beyond running on that one site.

## Development
```sh
npm install
npm test          # offline tests (node:test + jsdom), uses test/fixtures/login.html
npm run lint      # web-ext lint
npm run build     # builds the package for upload
```

## Support
https://github.com/muzammil-shayk/umt-captcha-fill/issues

## Contributing and support
Bugs, questions and pull requests go to [GitHub Issues](https://github.com/muzammil-shayk/umt-captcha-fill/issues). Source: https://github.com/muzammil-shayk/umt-captcha-fill

## Licence
MIT. See `LICENSE`.

## Disclaimer
UMT Captcha Fill is an independent, unofficial project. It is not affiliated with, endorsed by or sponsored by the University of Management and Technology. The university is named only to say which site the add-on works on. No university logo is used.
