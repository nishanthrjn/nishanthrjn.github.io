import { BOOKING } from '../data/booking.js?v=20260910-20';
import { createDraftUpdater, dateFromKey, formatBookingDate, isBookableDate, isBookableTime, zonedNow } from './bookingRequest.js?v=20260910-20';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
let selection = { requestedDate: '', requestedTime: '', duration: '', timezone: BOOKING.timezone };
export function getBookingSelection() { return { ...selection }; }

export function initBookingCalendar() {
  const grid = document.getElementById('calGrid');
  const header = document.getElementById('calHead');
  const form = document.getElementById('contactForm');
  if (!grid || !form) return;
  grid.innerHTML = '';
  selection = { requestedDate: '', requestedTime: '', duration: '', timezone: BOOKING.timezone };
  const updateDraft = createDraftUpdater();
  const message = document.getElementById('contactMessage');
  const name = document.getElementById('contactName');
  const today = zonedNow().date;
  const current = dateFromKey(today);
  const year = current.getUTCFullYear(), month = current.getUTCMonth();
  const offset = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const dayCount = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  if (header) header.textContent = new Intl.DateTimeFormat('en-US', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(current);

  const controls = document.createElement('div');
  controls.className = 'booking-controls';
  controls.id = 'bookingControls';
  controls.innerHTML = `<p class="booking-date" id="bookingDateLabel"></p>
    <label for="bookingTime">Select time<select id="bookingTime" name="requestedTime" form="contactForm" required aria-describedby="bookingTimezone"></select></label>
    <label for="bookingDuration">Duration<select id="bookingDuration" name="duration" form="contactForm" required><option value="">Select duration</option></select></label>
    <p class="booking-timezone" id="bookingTimezone"></p>`;
  const timeSelect = controls.querySelector('#bookingTime');
  const durationSelect = controls.querySelector('#bookingDuration');
  BOOKING.durations.forEach(minutes => durationSelect.add(new Option(`${minutes} minutes`, String(minutes))));
  controls.querySelector('#bookingTimezone').textContent = `Timezone: ${BOOKING.timezone}`;
  const sync = () => {
    form.elements.requestedDate.value = selection.requestedDate;
    form.elements.timezone.value = BOOKING.timezone;
    message.value = updateDraft(message.value, selection, name.value);
    form.dispatchEvent(new Event('bookingchange'));
  };
  timeSelect.addEventListener('change', () => { selection.requestedTime = timeSelect.value; sync(); });
  durationSelect.addEventListener('change', () => { selection.duration = durationSelect.value; sync(); });
  name.addEventListener('input', () => { if (selection.requestedDate) sync(); });

  WEEKDAY_LABELS.forEach(label => {
    const cell = document.createElement('span'); cell.textContent = label; grid.appendChild(cell);
  });
  for (let i = 0; i < offset; i++) grid.appendChild(document.createElement('div'));
  const dayCells = [];
  for (let day = 1; day <= dayCount; day++) {
    const key = new Date(Date.UTC(year, month, day, 12)).toISOString().slice(0, 10);
    const available = isBookableDate(key);
    const cell = document.createElement(available ? 'button' : 'div');
    cell.className = 'cal-day' + (available ? ' avail' : '') + (key === today ? ' today' : '');
    cell.textContent = day;
    cell.dataset.date = key;
    if (key === today) cell.setAttribute('aria-current', 'date');
    if (available) {
      cell.type = 'button';
      cell.title = `Request ${formatBookingDate(key)}`;
      cell.setAttribute('aria-label', cell.title);
      cell.setAttribute('aria-pressed', 'false');
      cell.setAttribute('aria-controls', 'bookingControls');
      cell.addEventListener('click', () => {
        if (form.getAttribute('aria-busy') === 'true' || !isBookableDate(key)) return;
        if (selection.requestedDate !== key) {
          selection = { requestedDate: key, requestedTime: '', duration: '', timezone: BOOKING.timezone };
          dayCells.forEach(candidate => {
            const selected = candidate === cell;
            candidate.classList.toggle('selected', selected);
            if (candidate.tagName === 'BUTTON') candidate.setAttribute('aria-pressed', String(selected));
          });
          timeSelect.replaceChildren(new Option('Select time', ''));
          BOOKING.timeSlots.forEach(time => {
            const option = new Option(time, time);
            option.disabled = !isBookableTime(key, time);
            timeSelect.add(option);
          });
          durationSelect.value = '';
          controls.querySelector('#bookingDateLabel').textContent = formatBookingDate(key);
          const rowEndDay = Math.min(Math.ceil((offset + day) / 7) * 7 - offset, dayCount);
          dayCells[rowEndDay - 1].after(controls);
          sync();
        }
        timeSelect.focus({ preventScroll: true });
        controls.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
      });
    }
    dayCells.push(cell);
    grid.appendChild(cell);
  }
}
