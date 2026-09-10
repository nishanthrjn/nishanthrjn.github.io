import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOKING } from '../static/js/data/booking.js';
import { createDraftUpdater, dateFromKey, formatBookingDate, isBookableDate, isBookableTime, validDuration, zonedNow } from '../static/js/modules/bookingRequest.js';
const now = new Date('2026-09-10T06:00:00Z');
const selection = { requestedDate: '2026-09-10', requestedTime: '14:00', duration: '30' };

test('date validation matches current-month future weekdays', () => {
  assert(isBookableDate('2026-09-10', now));
  assert(isBookableDate('2026-09-11', now));
  for (const date of ['2026-09-09', '2026-09-12', '2026-10-01', '2026-09-31', '', 'bad']) assert(!isBookableDate(date, now));
  assert.equal(dateFromKey('2026-02-30'), null);
});
test('timezone calendar dates remain correct across midnight and DST', () => {
  assert.equal(zonedNow(new Date('2026-09-10T23:30:00Z')).date, '2026-09-11');
  assert.equal(zonedNow(new Date('2026-01-10T13:00:00Z')).time, '14:00');
  assert.equal(zonedNow(new Date('2026-07-10T12:00:00Z')).time, '14:00');
  assert.equal(formatBookingDate(selection.requestedDate), 'Thursday, 10 September 2026');
});
test('only configured, future times and durations are accepted', () => {
  assert(isBookableTime(selection.requestedDate, '14:00', now));
  for (const time of ['', '99:00', '14:15', '09:00']) assert(!isBookableTime(selection.requestedDate, time, new Date('2026-09-10T08:00:00Z')));
  for (const duration of BOOKING.durations) assert(validDuration(duration));
  for (const duration of ['', 0, -15, 17, '30bad']) assert(!validDuration(duration));
});
test('professional draft includes a locale-safe date, timezone, duration and name', () => {
  const update = createDraftUpdater();
  assert.equal(update('', selection, 'Alice'), "Hi Nishanth,\n\nI'd like to schedule a call on Thursday, 10 September 2026 at 14:00 (Europe/Berlin) for 30 minutes.\n\nBest regards,\nAlice");
});
test('updates retain notes before and after generated text and change the signature', () => {
  const update = createDraftUpdater();
  let draft = update('', selection, 'Alice');
  draft = `My agenda: CAD integration.\n\n${draft}\n\nPlease include the engineering team.`;
  draft = update(draft, { ...selection, requestedTime: '15:00', duration: '45' }, 'Bob');
  assert(draft.startsWith('My agenda: CAD integration.'));
  assert(draft.endsWith('Please include the engineering team.'));
  assert(draft.includes('at 15:00 (Europe/Berlin) for 45 minutes.'));
  assert(draft.includes('Best regards,\nBob'));
  assert(!draft.includes('14:00'));
});
test('rewritten messages are kept, and a fresh summary does not accumulate', () => {
  const update = createDraftUpdater(); update('', selection, 'Alice');
  const personal = 'Please call me about our new team.\nKind regards, Alice';
  let draft = update(personal, { ...selection, duration: '45' }, 'Alice');
  assert(draft.endsWith(personal));
  draft = update(draft, { ...selection, duration: '60' }, 'Alice');
  assert.equal(draft.match(/schedule a call/g).length, 1);
  assert(draft.endsWith(personal));
});
test('custom signatures and literal replacement characters survive', () => {
  const update = createDraftUpdater(); let draft = update('', selection, 'Alice');
  draft = draft.replace('Best regards,\nAlice', 'Best regards,\nAlice Cooper, hiring manager');
  draft = update(draft, { ...selection, duration: '45' }, 'Bob');
  assert(draft.endsWith('Alice Cooper, hiring manager'));
  const other = createDraftUpdater();
  let text = other('', selection, 'Alice');
  text = other(text, selection, '$& Visitor');
  assert(text.endsWith('$& Visitor'));
});
test('changing date clears stale time and duration from the generated sentence', () => {
  const update = createDraftUpdater(); let draft = update('', selection, '');
  draft = update(draft, { requestedDate: '2026-09-11', requestedTime: '', duration: '' }, '');
  assert(draft.includes('Friday, 11 September 2026.'));
  assert(!draft.includes('14:00'));
  assert(!draft.includes('30 minutes'));
  assert(draft.includes('[visitor name]'));
});

test('inline personal wording survives date, time and duration updates', () => {
  const update = createDraftUpdater();
  let draft = update('', selection, 'Alice');
  draft = draft.replace('for 30 minutes.', 'for 30 minutes, with my engineering team.');
  draft = update(draft, { ...selection, requestedTime: '15:00', duration: '45' }, 'Alice');
  assert(draft.includes('at 15:00 (Europe/Berlin) for 45 minutes, with my engineering team.'));
  assert.equal(draft.match(/schedule a call/g).length, 1);
  draft = update(draft, { requestedDate: '2026-09-11', requestedTime: '', duration: '' }, 'Alice');
  assert(draft.includes('Friday, 11 September 2026, with my engineering team.'));
  assert(!draft.includes('15:00'));
});

test('half-hour starts validate and appear in the editable draft', () => {
  assert(isBookableTime(selection.requestedDate, '09:30', now));
  assert(isBookableTime(selection.requestedDate, '14:30', now));
  assert(!isBookableTime(selection.requestedDate, '09:30', new Date('2026-09-10T08:00:00Z')));
  const draft = createDraftUpdater()('', { ...selection, requestedTime: '14:30' }, 'Alice');
  assert(draft.includes('at 14:30 (Europe/Berlin) for 30 minutes.'));
});
