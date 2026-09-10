const PROJECT_THUMBNAILS = {
  talentbot: 'talentbot-rag-assistant.svg',
  documind: 'documind-document-retrieval.svg',
  agentnexus: 'agent-nexus-negotiation.svg',
  greenway: 'greenway-ehr-healthcare.svg',
  smartdale: 'grandcivitas-multi-tenant-saas.svg',
  fournxt: 'fournxt-rpa-workflows.svg',
  sevenseas: 'seven-seas-enterprise-erp.svg',
  kauschke: 'kauschke-solidworks-assembly.svg',
  idsi: 'idsi-cad-permit-validation.svg',
  visionics: 'visionics-edwinxp-eda.svg',
  iset: 'iset-cadcam-manufacturing.svg',
};

function thumbnailUrl(project) {
  return `/static/images/projects/${PROJECT_THUMBNAILS[project.id]}`;
}

function featuredCard(project) {
  return `<button type="button" class="feat-card" data-project="${project.id}" aria-haspopup="dialog" aria-controls="modalBox" aria-label="View ${project.title} project details">
    <span class="feat-visual"><img src="${thumbnailUrl(project)}" width="720" height="360" loading="lazy" alt="${project.title} project illustration"></span>
    <span class="feat-copy"><span class="project-kicker">${project.numLabel}</span>
      <span class="feat-title">${project.title}</span>
      <span class="feat-desc">${project.featDesc}</span>
      <span class="feat-link">[ DETAILS <span aria-hidden="true">↗</span> ]</span>
    </span>
  </button>`;
}

function galleryCard(project) {
  return `<button type="button" class="proj-card" data-project="${project.id}" data-category="${project.category}" aria-haspopup="dialog" aria-controls="modalBox" aria-label="View ${project.title} project details">
    <span class="project-thumbnail">${project.featured
      ? `<img src="${thumbnailUrl(project)}" width="720" height="360" loading="lazy" alt="">`
      : `<span class="project-art" style="background-image:url('${thumbnailUrl(project)}');background-size:100% auto;background-position:center" aria-hidden="true"></span>`}</span>
    <span class="proj-card-copy"><span class="project-kicker">${project.historical ? 'CAREER PROJECT' : project.numLabel}</span>
      <span class="proj-card-title">${project.title}</span>
      <span class="proj-card-desc">${project.cardDesc}</span>
      <span class="proj-card-stack">${project.tags.slice(0, 3).map(tag => tag.text).join(' · ')}</span>
      <span class="feat-link">[ DETAILS <span aria-hidden="true">↗</span> ]</span>
    </span>
  </button>`;
}

export function renderProjects(projects) {
  const enabled = projects.filter(project => project.enabled);
  const featured = document.getElementById('featGrid');
  featured.innerHTML = enabled.filter(project => project.featured).map(featuredCard).join('') + `
    <a class="feat-card showcase-card" href="#chatbot">
      <span class="feat-visual showcase-visual"><span class="project-art" style="background-image:url('/static/images/projects/talentbot-rag-assistant.svg');background-size:100% auto;background-position:center" aria-hidden="true"></span></span>
      <span class="feat-copy"><span class="project-kicker">PERSONAL AI · LIVE DEMO</span>
        <span class="feat-title">Agent Showcase</span>
        <span class="feat-desc">Explore TalentBot's architecture and ask about my projects, skills, and career.</span>
        <span class="showcase-cta">Explore the agent <span aria-hidden="true">↗</span></span>
      </span>
    </a>`;

  const gallery = document.getElementById('projectGallery');
  gallery.innerHTML = enabled.map(galleryCard).join('');
  const section = document.getElementById('projects');
  section.addEventListener('click', event => {
    const card = event.target.closest('[data-project]');
    if (card) window.openModal(card.dataset.project);
  });
  const filters = [...section.querySelectorAll('[data-project-filter]')];
  filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.projectFilter;
    filters.forEach(candidate => {
      const active = candidate === button;
      candidate.classList.toggle('active', active);
      candidate.setAttribute('aria-pressed', String(active));
    });
    let visible = 0;
    gallery.querySelectorAll('[data-project]').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
      if (!card.hidden) visible++;
    });
    document.getElementById('projectCount').textContent = `${visible} projects`;
  }));
  document.getElementById('projectCount').textContent = `${enabled.length} projects`;
}
