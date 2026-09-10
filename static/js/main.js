import { initChatEmbeds } from './modules/chatEmbeds.js?v=20260910-9';
import { toggleExpand } from './modules/disclosure.js?v=20260910-6';
import { toggleSidePanel, switchSideTab } from './modules/sidePanel.js?v=20260910-9';
import { openModal, closeModal, closeModalOutside, initModalKeyboardDismiss } from './modules/modal.js?v=20260910-12';
import { initRadarChart } from './modules/radarChart.js';
import { initBookingCalendar } from './modules/bookingCalendar.js';
import { initScrollReveal } from './modules/scrollReveal.js';
import { handleForm } from './modules/contactForm.js';
import { renderProfile } from './modules/renderProfile.js?v=20260910-11';
import { renderProjects } from './modules/renderProjects.js?v=20260910-16';
import { CONTACT, PROFILE, TIMELINE, SKILLS } from './data/content.js?v=20260910-5';
import { PROJECTS } from './data/projects.js';

// portfolio.html still wires these up via inline `onclick`/`onsubmit` attributes,
// so they need to be reachable on the global object.
Object.assign(window, {
  toggleExpand,
  toggleSidePanel,
  switchSideTab,
  openModal,
  closeModal,
  closeModalOutside,
  handleForm,
});

renderProfile(CONTACT, PROFILE, TIMELINE, SKILLS);
renderProjects(PROJECTS);

initModalKeyboardDismiss();
initRadarChart(SKILLS.radar);
initBookingCalendar();
initScrollReveal();
initChatEmbeds();
