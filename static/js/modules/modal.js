import { findProject } from '../data/projects.js';

let modalTrigger = null;

export function openModal(id) {
  const project = findProject(id);
  if (!project) return;

  const iconWrap = document.getElementById('mIconWrap');
  iconWrap.style.background = project.bg;
  iconWrap.style.color = project.color;

  document.getElementById('mIcon').innerHTML = `<use href="#${project.icon}"/>`;
  document.getElementById('mTitle').textContent = project.title;
  document.getElementById('mSub').textContent = project.sub;
  document.getElementById('mBadge').innerHTML = project.badge;
  const diagram = ['talentbot', 'documind', 'agentnexus'].includes(project.id)
    ? `<a class="modal-diagram" href="/static/images/projects/${project.id}.svg" target="_blank" rel="noopener" aria-label="Open ${project.title} diagram at full size"><img src="/static/images/projects/${project.id}.svg" alt="${project.title} architecture diagram" width="720" height="360"></a>` : '';
  document.getElementById('mBody').innerHTML = diagram + project.body;
  modalTrigger = document.activeElement;
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.querySelector('.pm-close').focus({preventScroll: true});
}

export function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  if (modalTrigger?.isConnected) modalTrigger.focus({preventScroll: true});
  modalTrigger = null;
}

export function closeModalOutside(event) {
  if (event.target === document.getElementById('modalOverlay')) closeModal();
}

export function initModalKeyboardDismiss() {
  document.addEventListener('keydown', event => {
    if (!document.getElementById('modalOverlay').classList.contains('open')) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'Tab') {
      const focusable = [...document.querySelectorAll('#modalBox button, #modalBox a[href], #modalBox [tabindex="0"]')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
}
