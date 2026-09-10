import { BOOKING } from '../data/booking.js?v=20260910-21';

export function zonedNow(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: BOOKING.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).map(part => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

export function dateFromKey(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const date = new Date(`${key}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === key ? date : null;
}

export function formatBookingDate(key) {
  const date = dateFromKey(key);
  return date ? new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(date) : '';
}

export function isBookableDate(key, now = new Date()) {
  const date = dateFromKey(key);
  const today = zonedNow(now).date;
  return Boolean(date && key.slice(0, 7) === today.slice(0, 7) && key >= today &&
    date.getUTCDay() !== 0 && date.getUTCDay() !== 6);
}

export function isBookableTime(date, time, now = new Date()) {
  const current = zonedNow(now);
  return isBookableDate(date, now) && /^([01]\d|2[0-3]):[0-5]\d$/.test(time) &&
    BOOKING.timeSlots.includes(time) && (date !== current.date || time > current.time);
}

export function validDuration(value) {
  return BOOKING.durations.some(minutes => String(minutes) === String(value) && minutes > 0);
}

// Only replace text we generated. Notes, custom greetings, and edited signatures
// stay untouched. If the generated sentence was rewritten, retain that text and
// prepend an up-to-date scheduling summary on the next booking change.
export function createDraftUpdater() {
  let previousSentence = '';
  let previousSignature = '';
  let previousParts = null;
  return (message, selection, name) => {
    const date = formatBookingDate(selection.requestedDate);
    if (!date) return message;
    const time = selection.requestedTime ? ` at ${selection.requestedTime} (${BOOKING.timezone})` : '';
    const duration = selection.duration ? ` for ${selection.duration} minutes` : '';
    const sentence = `I'd like to schedule a call on ${date}${time}${duration}.`;
    const signature = `Best regards,\n${name.trim() || '[visitor name]'}`;
    let next = message;
    if (!next.trim()) {
      next = `Hi Nishanth,\n\n${sentence}\n\n${signature}`;
    } else {
      if (previousSentence && next.includes(previousSentence)) {
        next = next.replace(previousSentence, () => sentence);
      } else if (sentence !== previousSentence) {
        // If only the surrounding prose changed, update the booking fragments
        // in that line and leave its custom wording intact.
        const lines = next.split('\n');
        const index = previousParts ? lines.findIndex(line =>
          line.includes(previousParts.date) &&
          (!previousParts.time || line.includes(previousParts.time)) &&
          (!previousParts.duration || line.includes(previousParts.duration))) : -1;
        if (index >= 0) {
          let line = lines[index];
          // Replace the whole date fragment together with its adjacent details
          // when possible, so adding previously empty fields needs no guesswork.
          const oldDetails = previousParts.date + previousParts.time + previousParts.duration;
          if (line.includes(oldDetails)) {
            line = line.replace(oldDetails, () => date + time + duration);
          } else {
            line = line.replace(previousParts.date, () => date);
            if (previousParts.time) line = line.replace(previousParts.time, () => time);
            else if (time) line = line.replace(date, () => date + time);
            if (previousParts.duration) line = line.replace(previousParts.duration, () => duration);
            else if (duration) line = line.replace(date + time, () => date + time + duration);
          }
          lines[index] = line;
          next = lines.join('\n');
        } else {
          next = `${sentence}\n\n${next}`;
        }
      }
      if (previousSignature && (next.endsWith(previousSignature) || next.includes(`${previousSignature}\n`))) {
        next = next.replace(previousSignature, () => signature);
      }
    }
    previousParts = { date, time, duration };
    previousSentence = sentence;
    previousSignature = signature;
    return next;
  };
}
