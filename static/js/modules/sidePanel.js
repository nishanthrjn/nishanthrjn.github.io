import { loadChatFrames } from './chatEmbeds.js?v=20260910-9';

export function toggleSidePanel(force) {
  const panel = document.getElementById('sidePanel');
  const open = typeof force === 'boolean' ? force : !panel.classList.contains('open');
  panel.classList.toggle('open', open);
  if (open) loadChatFrames(panel);
  const trigger = document.getElementById('sideFab');
  trigger.classList.toggle('is-open', open);
  trigger.setAttribute('aria-expanded', String(open));
  trigger.setAttribute('aria-label', open ? 'Close Agent Chat' : 'Open Agent Chat');
}

export function switchSideTab(tab, event) {
  document.querySelectorAll('.side-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.side-tab-content').forEach(content => content.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById('side-' + tab).classList.add('active');
}
