import { BOOKING } from '../data/booking.js?v=20260910-20';
import { getBookingSelection } from './bookingCalendar.js?v=20260910-20';
import { isBookableDate, isBookableTime, validDuration } from './bookingRequest.js?v=20260910-20';

let submitting = false;
let lastSuccessfulRequest = '';

function setStatus(form, text, state = '') {
  const status = form.querySelector('#contactFormStatus');
  status.hidden = !text;
  status.textContent = text;
  status.dataset.state = state;
}

export function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const clearStatus = () => {
    if (!submitting) setStatus(form, '');
    document.querySelectorAll('#contact [aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
  };
  form.addEventListener('input', clearStatus);
  form.addEventListener('bookingchange', clearStatus);
}

export async function handleForm(event) {
  event.preventDefault();
  if (submitting) return;
  const form = event.currentTarget || event.target;
  const name = form.elements.name;
  const email = form.elements.email;
  const message = form.elements.message;
  const booking = getBookingSelection();
  const time = document.getElementById('bookingTime');
  const duration = document.getElementById('bookingDuration');
  const dateTarget = document.querySelector('#calGrid .selected, #calGrid button.avail');
  const checks = [
    [Boolean(name.value.trim()), name, 'Please enter your name.'],
    [Boolean(email.value.trim()) && email.validity.valid, email, 'Please enter a valid email address.'],
    [isBookableDate(booking.requestedDate), dateTarget, 'Please select a highlighted booking date.'],
    [isBookableTime(booking.requestedDate, booking.requestedTime), time, 'Please select an available time.'],
    [validDuration(booking.duration), duration, 'Please select a duration.'],
    [Boolean(message.value.trim()), message, 'Please enter a message.'],
  ];
  const failed = checks.find(([valid]) => !valid);
  if (failed) {
    const [, field, text] = failed;
    setStatus(form, text, 'error');
    field?.setAttribute('aria-invalid', 'true');
    field?.setAttribute('aria-describedby', 'contactFormStatus' + (field === time ? ' bookingTimezone' : ''));
    field?.focus();
    return;
  }
  if (!/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(BOOKING.formspreeEndpoint)) {
    setStatus(form, 'Call requests are not configured yet. Please use the email link to get in touch.', 'error');
    return;
  }

  const fields = {
    name: name.value.trim(), email: email.value.trim(),
    requestedDate: booking.requestedDate, requestedTime: booking.requestedTime,
    duration: String(booking.duration), timezone: BOOKING.timezone, message: message.value.trim(),
    _gotcha: form.elements._gotcha.value,
  };
  const fingerprint = JSON.stringify(fields);
  if (fingerprint === lastSuccessfulRequest) {
    setStatus(form, 'This call request was already sent successfully.', 'success');
    return;
  }
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.append(key, value));
  const button = form.querySelector('button[type="submit"]');
  const originalButton = button.innerHTML;
  // Freeze this request while it is in flight; keep every entered value on failure.
  const controls = [...form.elements, ...document.querySelectorAll('#calGrid button')];
  const disabledStates = controls.map(control => control.disabled);
  submitting = true;
  form.setAttribute('aria-busy', 'true');
  controls.forEach(control => { control.disabled = true; });
  button.textContent = 'Sending...';
  setStatus(form, 'Sending your call request...', 'sending');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BOOKING.submissionTimeoutMs);
  try {
    const response = await fetch(BOOKING.formspreeEndpoint, {
      method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: controller.signal,
    });
    if (!response.ok) throw new Error('Submission failed');
    lastSuccessfulRequest = fingerprint;
    setStatus(form, 'Message/call request sent successfully. Your requested time is subject to confirmation.', 'success');
  } catch {
    setStatus(form, 'Submission failed. Please try again.', 'error');
  } finally {
    clearTimeout(timeout);
    controls.forEach((control, index) => { control.disabled = disabledStates[index]; });
    button.innerHTML = originalButton;
    form.removeAttribute('aria-busy');
    submitting = false;
  }
}
