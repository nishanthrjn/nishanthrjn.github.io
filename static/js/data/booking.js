// Public frontend configuration. Obtain the endpoint from your Formspree dashboard.
// Configure the destination email in Formspree; never add SMTP credentials here.
export const BOOKING = Object.freeze({
  formspreeEndpoint: 'https://formspree.io/f/mwlkybrr',
  timezone: 'Europe/Berlin',
  timeSlots: Object.freeze(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']),
  durations: Object.freeze([15, 30, 45, 60]),
  submissionTimeoutMs: 20000,
});
