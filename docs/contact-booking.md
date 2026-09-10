# Contact call requests

The GitHub Pages frontend uses native browser modules and Formspree. No server, UI library, or production dependency is required. There is no frontend compilation/build step or configured lint command in this repository: `index.html` and `static/` are the deployable frontend.

## Required setup

1. Create a form in your Formspree dashboard and verify its recipient email there.
2. In `static/js/data/booking.js`, replace `BOOKING.formspreeEndpoint` (`https://formspree.io/f/YOUR_FORM_ID`) with the exact public endpoint provided by Formspree, such as `https://formspree.io/f/<your-form-id>`.
3. Review the form's spam/reCAPTCHA settings in Formspree. This integration does not add a CAPTCHA widget; it uses the supported hidden `_gotcha` field. Configure the service to accept this AJAX flow, then send a real test request after deployment.
4. Keep destination-email configuration and all private credentials in Formspree. Do not put SMTP passwords, API secrets, or Gmail credentials in this project.

Until an endpoint is configured, submission shows a configuration message and makes no network request. The existing public contact email link remains available.

The request submits `name`, `email`, `requestedDate` (YYYY-MM-DD), `requestedTime` (HH:mm), `duration` (minutes), `timezone`, and `message`, plus `_gotcha`. A successful response acknowledges a call request, not a confirmed appointment. No timeslot reservation or availability service is implied.

## Defaults and editing behavior

All settings live in `static/js/data/booking.js`: Europe/Berlin, half-hour start times from 09:00–11:30 and 14:00–16:30, durations 15 / 30 / 45 / 60 minutes, and a 20-second request timeout. The time selector is a compact, scrollable native list with keyboard support. No time or duration is preselected. Dates remain current-month, non-past weekdays; the calendar uses Berlin's date even for visitors abroad. Elapsed times today cannot be submitted. Server-side Formspree spam and validation settings remain necessary because client-side validation can be bypassed.

The calendar and editable form share one workspace on desktop and tablet, with a compact stacked layout on phones. Space is reserved for booking controls. Date selection keeps the whole workspace visible when it fits below the navigation; on shorter screens, it scrolls only to reveal obscured controls. Selecting another date moves the controls below that week row and resets time and duration. The draft updates only its generated scheduling sentence and unedited signature, preserving visitor notes and custom greetings/signatures. If the visitor rewrites the generated sentence entirely, the next booking change prepends a fresh scheduling summary while retaining the rewritten message. Requests are frozen while sending, retained after errors, and identical successful requests cannot be resubmitted in the same page session.

## Checks

- `node --test tests/booking.test.mjs`
- Serve the repo with `python -m http.server 8767 --bind 127.0.0.1`.
- `node tests/contact-booking.browser.cjs` (requires an existing Playwright installation and Chrome; set `PLAYWRIGHT_MODULE` to its module path if installed outside this project, and optionally `PORTFOLIO_TEST_URL` to the local server URL).

Browser tests mock Formspree and never send email. They exercise missing configuration, validation, row placement, draft preservation, mobile/keyboard input, multipart payload, duplicate prevention, loading, success, HTTP/network errors, timeout, and retry. A real delivery test requires your configured Formspree form.

References: [Formspree AJAX submissions](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax), [Formspree honeypot support](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering).
