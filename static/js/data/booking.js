// Public frontend configuration. Obtain the endpoint from your Formspree dashboard.
// Configure the destination email in Formspree; never add SMTP credentials here.
export const BOOKING = Object.freeze({
  formspreeEndpoint: 'https://formspree.io/f/mwlkybrr',
  timezone: 'Europe/Berlin',
  timeSlots: Object.freeze(['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']),
  durations: Object.freeze([15, 30, 45, 60]),
  submissionTimeoutMs: 20000,
});
