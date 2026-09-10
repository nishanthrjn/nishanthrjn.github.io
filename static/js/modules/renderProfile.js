function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

const BRAND_ICONS = {
  'i-python': 'python',
  'i-dotnet': 'csharp',
  'i-docker': 'docker',
  'i-pytorch': 'pytorch',
};

function iconSvg(icon, className = 'ic') {
  if (BRAND_ICONS[icon]) {
    return `<img class="${className} brand-icon" src="/static/icons/${BRAND_ICONS[icon]}.svg" width="32" height="32" alt="">`;
  }
  return `<svg class="${className}"><use href="#${icon}"/></svg>`;
}

function renderNav(profile, contact) {
  setText('navName', profile.name);
  setText('navRole', profile.role);

  const photo = document.getElementById('navPhoto');
  if (photo) photo.src = profile.photo;

  setHtml('navStrip', `
    <a class="nav-icon" href="${contact.phoneHref}" title="Phone">${iconSvg('i-phone')}</a>
    <a class="nav-icon" href="mailto:${contact.email}" title="Email">${iconSvg('i-mail')}</a>
    <a class="nav-icon" href="${contact.linkedinUrl}" target="_blank" title="LinkedIn">${iconSvg('i-linkedin')}</a>
    <a class="nav-icon" href="${contact.githubUrl}" target="_blank" title="GitHub">${iconSvg('i-github')}</a>
    <a class="nav-icon" href="#contact" title="${contact.location}">${iconSvg('i-location')}</a>
  `);
}

function renderHero(profile, contact) {
  setText('heroStatusText', profile.heroStatus);
  setText('heroH1', profile.heroHeadline);
  setHtml('heroSub', profile.heroSub);

  setHtml('heroPills', profile.heroPills
    .map(p => `<span class="pill${p.variant ? ' ' + p.variant : ''}">${p.text}</span>`)
    .join(''));

  setHtml('heroContacts', `
    <a class="hc-item" href="mailto:${contact.email}">${iconSvg('i-mail')}${contact.email}</a>
    <a class="hc-item" href="${contact.linkedinUrl}" target="_blank">${iconSvg('i-linkedin')}LinkedIn</a>
    <a class="hc-item" href="${contact.githubUrl}" target="_blank">${iconSvg('i-github')}GitHub</a>
  `);


}

function renderAbout(profile, timeline) {
  const aboutPhoto = document.getElementById('aboutPhoto');
  if (aboutPhoto) aboutPhoto.src = profile.photo;

  setText('aboutBio', profile.aboutBio);
  setText('aboutName', profile.name);

  setHtml('eduRow', profile.education.map(edu => `
    <div class="edu-row">
      <div class="edu-icon"><img src="${edu.logo}" alt="" width="44" height="44"></div>
      <div><div class="edu-name">${edu.name}</div><div class="edu-sub">${edu.sub}</div></div>
    </div>
  `).join(''));

  setHtml('langRow', profile.languages.map(lang => `
    <div class="lang-item">
      <img class="language-flag" src="/static/icons/flag-${lang.code.toLowerCase()}.svg" width="32" height="24" alt="">
      <div><div class="lang-name">${lang.name}</div><div class="lang-level">${lang.level}</div></div>
    </div>
  `).join(''));

  const careerIcons = {
    'Current': 'i-llm',
    'Professional Development': 'i-grad',
    'Kauschke': 'i-cube',
    'Relocation & MSc Studies': 'i-grad',
    'Greenway Health': 'i-hospital',
    'FourNxt': 'i-agent',
    'Smartdale': 'i-cloud',
    'IDSi': 'i-cad',
    'Personal Development': 'i-grad',
    'Seven Seas': 'i-hotel',
    'Visionics': 'i-cube',
    'iSET': 'i-grid',
  };
  setHtml('timeline', timeline.map(entry => `
    <li class="career-item">
      <span class="career-node" aria-hidden="true"></span>
      <div class="career-entry">
        <span class="career-emblem" aria-hidden="true">${iconSvg(careerIcons[entry.company] || 'i-user')}</span>
        <h4 class="career-company">${entry.company}</h4>
        <div class="career-period">${entry.period}</div>
        <div class="career-role">${entry.role}</div>
        <p class="career-description">${entry.desc}</p>
      </div>
    </li>
  `).join(''));

  setText('aboutPhil', profile.philosophy);
}

const SKILL_MARKS = {
  'Python': ['python'], 'C# / .NET': ['csharp','dot-net'],
  'FastAPI': ['fastapi'], 'LangChain': ['langchain'],
  'Semantic Kernel / Microsoft Agent Framework (MAF)': ['microsoft'],
  'RAG': ['rag'], 'Vector Retrieval': ['vector'], 'Groq / Llama': ['groq','meta'],
  'NegMAS': ['negotiation'], 'PyTorch / DL': ['pytorch'],
  'ASP.NET Core': ['dot-net'], '.NET Core / Framework': ['dot-net'],
  'REST APIs': ['api'], 'Blazor': ['blazor'], 'WPF': ['desktop'], 'WinForms': ['windows'],
  'Application Integration': ['workflow'], 'PostgreSQL': ['postgresql'],
  'SQL Server': ['sqlserver-official'], 'pgvector': ['vector'], 'FAISS': ['vector'],
  'Git': ['git'], 'Docker': ['docker'], 'Jenkins': ['jenkins'], 'AWS exposure': ['aws'],
  'AutoCAD API': ['autocad'], 'SOLIDWORKS API': ['solidworks'],
  'LLM Integration': ['brain'], 'Agentic Workflows': ['workflow'],
  'Document Intelligence': ['rag'], 'Vector Search': ['vector'],
  'DevOps / AWS Exposure': ['aws'], 'CAD / Engineering': ['autocad','solidworks'],
};
function skillIcon(item) {
  const marks = SKILL_MARKS[item.label];
  if (!marks) return iconSvg(item.icon);
  return marks.map(mark => `<img class="ic skill-mark${['langchain','groq','meta'].includes(mark) ? ' monochrome-mark' : ''}" src="/static/icons/${mark}.svg" alt="" width="32" height="32">`).join('');
}

function renderSkillCard(card) {
  let body;
  if (card.kind === 'list') {
    body = `<ul class="skill-list">${card.items.map(item => `<li>${item}</li>`).join('')}</ul>`;
  } else if (card.kind === 'tags') {
    body = `<div class="tag-row">${card.tags.map(t => `<span class="tag${t.variant ? ' ' + t.variant : ''}">${t.text}</span>`).join('')}</div>`;
  } else {
    const style = card.cols === 2 ? ' style="--skill-min:140px"' : '';
    body = `<div class="icon-grid"${style}>${card.items.map(item => `
      <div class="icon-cell"><div class="icon-cell-badge" style="background:${item.bg};color:${item.color}">${skillIcon(item)}</div><span class="skill-label">${item.label}</span></div>
    `).join('')}</div>`;
  }
  return `<div class="skill-card${card.wide ? ' wide' : ''}"><div class="skill-card-title">${card.title}</div>${body}</div>`;
}

function renderSkills(skills) {
  const cardByTitle = title => skills.cards.find(card => card.title === title);
  const ai = cardByTitle('Python & Applied AI');
  const databases = cardByTitle('Data & Databases');
  const pick = (card, labels) => card.items.filter(item => labels.includes(item.label));
  const selectedCategories = {
    'Python': ai,
    'C# / .NET': cardByTitle('C# / .NET Stack'),
    'LLM Integration': {kind: 'icons', items: pick(ai, ['FastAPI', 'LangChain', 'Semantic Kernel / Microsoft Agent Framework (MAF)', 'RAG', 'Groq / Llama', 'Prompt Engineering'])},
    'Agentic Workflows': {kind: 'icons', items: pick(ai, ['Semantic Kernel / Microsoft Agent Framework (MAF)', 'LangChain', 'NegMAS'])},
    'Document Intelligence': {kind: 'icons', items: pick(ai, ['Python', 'FastAPI', 'RAG', 'Vector Retrieval'])},
    'Vector Search': {kind: 'icons', items: [...pick(ai, ['Vector Retrieval']), ...pick(databases, ['pgvector', 'FAISS'])]},
    'DevOps / AWS Exposure': cardByTitle('DevOps & Tooling'),
    'CAD / Engineering': cardByTitle('Engineering Software'),
  };
  setHtml('spectrumGrid', skills.spectrum.map((s, index) => `
    <button type="button" class="spectrum-card" id="spectrum-category-${index}" aria-expanded="false" aria-controls="skillCategoryDetails">
      <span class="spectrum-icon-badge" style="background:${s.bg};color:${s.color}">${skillIcon(s)}</span>
      <span class="spectrum-label">${s.label}</span>
    </button>
  `).join(''));
  setHtml('skillsGrid', skills.cards.map(renderSkillCard).join(''));

  const details = document.getElementById('skillCategoryDetails');
  const buttons = [...document.querySelectorAll('#spectrumGrid .spectrum-card')];
  buttons.forEach((button, index) => button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    buttons.forEach(candidate => candidate.setAttribute('aria-expanded', String(open && candidate === button)));
    details.hidden = !open;
    if (open) {
      const label = skills.spectrum[index].label;
      details.innerHTML = renderSkillCard({...selectedCategories[label], title: label});
      details.setAttribute('aria-labelledby', button.id);
    } else {
      details.innerHTML = '';
      details.removeAttribute('aria-labelledby');
    }
  }));

  setHtml('radarLegend', skills.radar.legend.map(l => `
    <div class="rl"><div class="rl-dot" style="background:${l.color}"></div>${l.label}</div>
  `).join(''));
}

function renderContact(contact) {
  setHtml('contactInfoList', `
    <div class="cdetail"><div class="cicon">${iconSvg('i-mail')}</div><div><div class="clabel">Email</div><div class="cval"><a href="mailto:${contact.email}">${contact.email}</a></div></div></div>
    <div class="cdetail"><div class="cicon">${iconSvg('i-phone')}</div><div><div class="clabel">Phone</div><div class="cval"><a href="${contact.phoneHref}">${contact.phone}</a></div></div></div>
    <div class="cdetail"><div class="cicon">${iconSvg('i-location')}</div><div><div class="clabel">Location</div><div class="cval">${contact.locationDetail}</div></div></div>
  `);

  setHtml('socialList', `
    <a href="${contact.linkedinUrl}" target="_blank">${iconSvg('i-linkedin')}LinkedIn</a>
    <a href="${contact.githubUrl}" target="_blank">${iconSvg('i-github')}GitHub</a>
    <a href="${contact.cvUrl}" download>${iconSvg('i-download')}Download CV</a>
  `);

  setHtml('localRow', `
    <div class="local-card"><div class="ibadge sm" style="background:rgba(37,99,235,0.14);color:#60a5fa">${iconSvg('i-location')}</div><div><div class="local-name">${contact.location}</div><div class="local-sub">Based here · AI Engineer</div></div></div>
    <div class="local-card"><div class="ibadge sm" style="background:rgba(0,255,136,0.12);color:var(--green)">${iconSvg('i-card')}</div><div><div class="local-name">EU Blue Card</div><div class="local-sub">Holder · Available immediately</div></div></div>
  `);

  setHtml('sideContactList', `
    <div class="side-cdetail"><div class="side-cicon">${iconSvg('i-mail')}</div><div><div class="side-clabel">Email</div><div class="side-cval">${contact.email}</div></div></div>
    <div class="side-cdetail"><div class="side-cicon">${iconSvg('i-phone')}</div><div><div class="side-clabel">Phone</div><div class="side-cval">${contact.phone}</div></div></div>
    <div class="side-cdetail"><div class="side-cicon">${iconSvg('i-location')}</div><div><div class="side-clabel">Location</div><div class="side-cval">${contact.locationDetail}</div></div></div>
  `);

  setHtml('sideQuickRow', `
    <a class="side-quick-btn" href="mailto:${contact.email}">${iconSvg('i-mail')}Email</a>
    <a class="side-quick-btn" href="${contact.linkedinUrl}" target="_blank">${iconSvg('i-linkedin')}LinkedIn</a>
    <a class="side-quick-btn" href="${contact.githubUrl}" target="_blank">${iconSvg('i-github')}GitHub</a>
  `);
}

function renderFooter(profile, contact) {
  setText('footerCopyright', profile.footerCopyright);
  setHtml('footerLinks', `
    <a href="${contact.githubUrl}" target="_blank">GitHub</a>
    <a href="${contact.linkedinUrl}" target="_blank">LinkedIn</a>
    <a href="${contact.cvUrl}" download>Download CV</a>
    <a href="#hero">Back to top ↑</a>
  `);
}

export function renderProfile(contact, profile, timeline, skills) {
  renderNav(profile, contact);
  renderHero(profile, contact);
  renderAbout(profile, timeline);
  renderSkills(skills);
  renderContact(contact);
  renderFooter(profile, contact);
}
