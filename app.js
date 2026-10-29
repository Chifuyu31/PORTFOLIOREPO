/* =========================================================
   Portfolio app (vanilla JavaScript, no dependencies)

   Sections of this file:
   1. Configuration & default content
   2. Small helpers (DOM, URLs, images, toast)
   3. Storage (localStorage load / save / backup)
   4. Rendering (hero, about, skills, projects, certs, contact, footer)
   5. Dialogs (details, image viewer, confirm)
   6. Editors (skills, projects, certifications, profile/about/contact)
   7. Contact form
   8. Page behaviour (nav, scroll spy, back-to-top, edit mode)
   9. Init
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. CONFIGURATION & DEFAULT CONTENT
     The defaults below come from the CV. Anything the CV did
     not say is left empty or shown as a [PLACEHOLDER].
     --------------------------------------------------------- */
  const CONFIG = {
    storageKey: 'portfolio.rommel-bitco.v1',
    // Set to false to hide the "Edit Portfolio" button from visitors.
    // You can still open edit mode by adding ?edit to the page address.
    showEditButton: false,
    defaultPhoto: 'profile.jpg'
  };

  const SKILL_CATEGORIES = [
    { name: 'Programming Languages', icon: 'code' },
    { name: 'Web Development', icon: 'globe' },
    { name: 'Database Management', icon: 'database' },
    { name: 'Software and Development Tools', icon: 'tool' },
    { name: 'Other Technical Skills', icon: 'layers' },
    { name: 'Soft Skills', icon: 'users' }
  ];
  const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
  const PROJECT_TYPES = ['Academic', 'Personal'];

  const DEFAULT_DATA = {
    profile: {
      fullName: 'Rommel A. Bitco',
      title: 'BSCS Student | Aspiring Software Developer',
      intro: 'Computer Science student aiming to apply programming knowledge, problem-solving abilities, and creativity to build efficient, user-centered software solutions.',
      photo: '' // empty = use the bundled photo in profile.jpg
    },
    about: {
      degree: 'Bachelor of Science in Computer Science (BSCS)',
      university: 'University of Negros Occidental – Recoletos',
      year: 'Expected graduation: 2027',
      bio: 'To develop my knowledge and skills in computer science and information technology while gaining practical experience and contributing to an organization\'s goals. I aim to apply my programming knowledge, problem-solving abilities, and creativity in developing efficient and user-centered software solutions.',
      interests: 'I am interested in software development, web development, and application programming. I enjoy learning programming concepts, solving problems through code, and creating practical applications that address real-world needs. I also want to explore user interface design, database management, and emerging technologies to broaden my skills as a computer science student.',
      goals: 'My goal during On-the-Job Training (OJT) is to gain hands-on experience in software development, improve my programming and problem-solving skills, and learn from experienced IT professionals. After graduation, I aspire to become a competent software developer, contribute to meaningful technology projects, and continuously improve my technical knowledge while building a successful career in the IT industry.',
      education: [
        { degree: 'Bachelor of Science in Computer Science', school: 'University of Negros Occidental – Recoletos', period: 'Expected 2027' },
        { degree: 'Secondary Education', school: 'Ramon Torres Ma-ao Sugar Central National High School', period: '2015 – 2016' },
        { degree: 'Primary Education', school: 'Ma-ao Sugar Central Elementary School', period: '2019 – 2020' }
      ]
    },
    // Proficiency is intentionally left unset: set it yourself in Edit mode.
    skills: [
      { id: 's1', name: 'Java Programming', category: 'Programming Languages', level: '', desc: '' },
      { id: 's2', name: 'Microsoft Office', category: 'Software and Development Tools', level: '', desc: '' },
      { id: 's3', name: 'Basic Computer Troubleshooting', category: 'Other Technical Skills', level: '', desc: '' },
      { id: 's4', name: 'Software Development Project Collaboration', category: 'Other Technical Skills', level: '', desc: '' },
      { id: 's5', name: 'Communication', category: 'Soft Skills', level: '', desc: '' },
      { id: 's6', name: 'Teamwork & Collaboration', category: 'Soft Skills', level: '', desc: '' },
      { id: 's7', name: 'Problem-Solving', category: 'Soft Skills', level: '', desc: '' },
      { id: 's8', name: 'Adaptability', category: 'Soft Skills', level: '', desc: '' },
      { id: 's9', name: 'Time Management', category: 'Soft Skills', level: '', desc: '' }
    ],
    projects: [
      {
        id: 'p1',
        title: 'Object Detection with Audio Conversion App',
        type: '',
        description: 'An application that detects real-world objects and converts the detection results into audio output. It was designed to assist visually impaired users in recognizing objects in their surroundings.',
        role: 'Co-Developer. Collaborated in developing the application and contributed to implementing its object detection and audio output features to help visually impaired users recognize objects in their surroundings.',
        team: 'Main Developer: Led the development of the application and handled the implementation of the core object detection functionality and audio output integration.\n\nUI/UX Designer: Designed and developed the user interface, focusing on creating a clear, accessible, and user-friendly experience for users interacting with the application.',
        technologies: [], external: '', github: '', demo: '', docs: '', images: []
      },
      {
        id: 'p2',
        title: 'Restaurant Point-of-Sale (POS) System',
        type: '',
        description: 'A point-of-sale system for a local restaurant in Bacolod City, with features intended to streamline sales transactions, inventory management, and transaction processing.',
        role: 'Co-Developer. Collaborated in developing the POS system and contributed to the implementation of sales transactions, inventory management, and transaction processing features.',
        team: 'Main Developer: Led the development of the POS system and handled the core functionality for sales transactions, inventory management, and transaction processing.\n\nUI/UX Designer: Designed and developed the user interface, focusing on an organized and intuitive layout to make sales transactions and inventory operations easier to navigate.',
        technologies: [], external: '', github: '', demo: '', docs: '', images: []
      }
    ],
    certs: [
      { id: 'c1', title: 'Dean\'s Lister', issuer: 'University of Negros Occidental – Recoletos', date: 'Second Year, Second Semester', description: '', image: '', link: '' },
      { id: 'c2', title: 'Consistent Honor Student', issuer: '', date: 'Senior High School and High School', description: '', image: '', link: '' }
    ],
    contact: {
      email: 'bitcorommel@gmail.com',
      phone: '09275329347',
      showPhone: true,
      location: 'Bago City, Negros Occidental',
      github: '',
      linkedin: '',
      other: [],      // [{ label, url }]
      formEndpoint: '' // optional Formspree-style https URL
    }
  };

  /* ---------------------------------------------------------
     2. HELPERS
     --------------------------------------------------------- */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const newId = (prefix) => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const isPlaceholder = (text) => /^\[[\s\S]*\]$/.test((text || '').trim());

  /** Create a DOM element safely (text is never parsed as HTML). */
  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === false) continue;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
      else if (value === true) node.setAttribute(key, '');
      else node.setAttribute(key, value);
    }
    for (const child of children.flat()) {
      if (child === null || child === undefined || child === false) continue;
      node.append(child.nodeType ? child : document.createTextNode(child));
    }
    return node;
  }

  /** Icon from the inline SVG sprite in index.html. */
  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#i-' + name);
    svg.append(use);
    return svg;
  }

  /** Accept only http(s) links (adds https:// if missing). Returns '' if unusable. */
  function safeUrl(input) {
    const raw = (input || '').trim();
    if (!raw) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw) && !/^https?:\/\//i.test(raw)) return ''; // blocks javascript:, data:, etc.
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
    try {
      const url = new URL(withProtocol);
      return url.hostname.includes('.') ? url.href : '';
    } catch (error) { return ''; }
  }

  /** Accept only image data URLs, relative paths and http(s) image links. */
  function safeImage(src) {
    const value = (src || '').trim();
    if (!value) return '';
    if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value)) return value;
    if (/^https?:\/\//i.test(value)) return value;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
    return '';
  }

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((value || '').trim());
  const splitList = (text) => (text || '').split(',').map((item) => item.trim()).filter(Boolean);

  function initialsOf(name) {
    const words = (name || '').replace(/[^\p{L}\s.-]/gu, '').split(/\s+/).filter((w) => /\p{L}/u.test(w));
    if (!words.length) return 'PF';
    const first = words[0][0];
    const last = words.length > 1 ? words[words.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  /** Resize an uploaded image in the browser and return a compressed JPEG data URL. */
  function fileToResizedDataUrl(file, maxSize, quality) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\/(png|jpe?g|webp|gif)$/i.test(file.type)) {
        reject(new Error('Please choose a PNG, JPG, WEBP or GIF image.'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('The file could not be read.'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('That image could not be opened.'));
        image.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          const context = canvas.getContext('2d');
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  let toastTimer = null;
  function showToast(message, isError = false) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.toggle('err', isError);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), isError ? 6000 : 3200);
  }

  /** Put text in an element; text like [THIS] gets the visible placeholder style. */
  function setText(node, text, emptyMessage) {
    const value = (text || '').trim();
    node.textContent = value || emptyMessage || '';
    node.classList.toggle('is-placeholder', !value || isPlaceholder(value));
  }

  /* ---------------------------------------------------------
     3. STORAGE
     --------------------------------------------------------- */
  let state = loadData();
  let isEditing = false;
  let activeCategory = 'All';

  /** Make sure data from storage/import always has the shape the app expects. */
  function normalizeData(raw) {
    const base = clone(DEFAULT_DATA);
    if (!raw || typeof raw !== 'object') return base;
    const objectOr = (value, fallback) => (value && typeof value === 'object' && !Array.isArray(value) ? { ...fallback, ...value } : fallback);
    const listOf = (value, fallback, fix) => (Array.isArray(value) ? value.filter((item) => item && typeof item === 'object').map(fix) : fallback);
    const text = (value) => (typeof value === 'string' ? value : '');

    const data = {
      profile: objectOr(raw.profile, base.profile),
      about: objectOr(raw.about, base.about),
      contact: objectOr(raw.contact, base.contact)
    };
    data.about.education = listOf(raw.about && raw.about.education, base.about.education, (e) => ({ degree: text(e.degree), school: text(e.school), period: text(e.period) }));
    data.contact.other = listOf(raw.contact && raw.contact.other, [], (o) => ({ label: text(o.label), url: text(o.url) }));
    data.contact.showPhone = raw.contact && typeof raw.contact.showPhone === 'boolean' ? raw.contact.showPhone : base.contact.showPhone;
    data.skills = listOf(raw.skills, base.skills, (s) => ({ id: text(s.id) || newId('s'), name: text(s.name), category: text(s.category) || 'Other Technical Skills', level: SKILL_LEVELS.includes(s.level) ? s.level : '', desc: text(s.desc) }));
    data.projects = listOf(raw.projects, base.projects, (p) => ({
      id: text(p.id) || newId('p'), title: text(p.title), type: PROJECT_TYPES.includes(p.type) ? p.type : '', description: text(p.description),
      role: text(p.role), team: text(p.team), technologies: Array.isArray(p.technologies) ? p.technologies.map(text).filter(Boolean) : [],
      external: text(p.external), github: text(p.github), demo: text(p.demo), docs: text(p.docs),
      images: Array.isArray(p.images) ? p.images.map(text).filter(Boolean) : []
    }));
    data.certs = listOf(raw.certs, base.certs, (c) => ({ id: text(c.id) || newId('c'), title: text(c.title), issuer: text(c.issuer), date: text(c.date), description: text(c.description), image: text(c.image), link: text(c.link) }));
    return data;
  }

  function loadData() {
    try {
      const saved = localStorage.getItem(CONFIG.storageKey);
      if (saved) return normalizeData(JSON.parse(saved));
    } catch (error) {
      console.warn('Saved portfolio data could not be read; using defaults.', error);
    }
    return clone(DEFAULT_DATA);
  }

  /** Save to localStorage. Returns false (and tells the user) if it fails, e.g. storage is full. */
  function saveData() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
      return true;
    } catch (error) {
      const full = error && (error.name === 'QuotaExceededError' || error.code === 22);
      showToast(full
        ? 'Could not save: browser storage is full. Use smaller or fewer images, then try again.'
        : 'Could not save in this browser (private mode or blocked storage?). Use "Export backup" to keep your work.', true);
      return false;
    }
  }

  /** Apply a change; if saving fails, roll back so the page never shows unsaved data as saved. */
  function commit(change) {
    const snapshot = JSON.stringify(state);
    change();
    if (saveData()) { renderAll(); return true; }
    state = normalizeData(JSON.parse(snapshot));
    renderAll();
    return false;
  }

  /* ---------------------------------------------------------
     4. RENDERING
     --------------------------------------------------------- */
  function socialLinkItems() {
    const c = state.contact;
    const items = [];
    if (c.email && isValidEmail(c.email)) items.push({ label: 'Email', href: 'mailto:' + c.email.trim(), icon: 'mail', external: false });
    if (safeUrl(c.github)) items.push({ label: 'GitHub', href: safeUrl(c.github), icon: 'github', external: true });
    if (safeUrl(c.linkedin)) items.push({ label: 'LinkedIn', href: safeUrl(c.linkedin), icon: 'linkedin', external: true });
    c.other.forEach((o) => { if (safeUrl(o.url)) items.push({ label: o.label || 'Link', href: safeUrl(o.url), icon: 'link', external: true }); });
    return items;
  }

  function renderSocials(listNode) {
    listNode.replaceChildren(...socialLinkItems().map((item) =>
      el('li', {}, el('a', {
        href: item.href, 'aria-label': item.label + (item.external ? ' (opens in a new tab)' : ''),
        title: item.label, target: item.external ? '_blank' : null, rel: item.external ? 'noopener noreferrer' : null
      }, icon(item.icon)))));
  }

  function renderHero() {
    const { profile } = state;
    const name = profile.fullName.trim() || '[ENTER YOUR FULL NAME]';
    setText($('#hero-name'), name);
    $('#hero-title').textContent = profile.title.trim() || 'BSCS Student | Aspiring Software Developer';
    setText($('#hero-intro'), profile.intro, '[ENTER YOUR INTRODUCTION]');
    const photo = $('#hero-photo');
    photo.src = safeImage(profile.photo) || CONFIG.defaultPhoto;
    photo.alt = 'Portrait of ' + (profile.fullName.trim() || 'the portfolio owner');
    $('#brand-mark').textContent = initialsOf(profile.fullName);
    $('#brand-name').textContent = profile.fullName.trim() || 'Your Name';
    document.title = (profile.fullName.trim() || 'Portfolio') + ' | BSCS Student Portfolio';
    renderSocials($('#hero-socials'));
  }

  function renderAbout() {
    const { about, profile } = state;
    const bioFallback = '[WRITE A SHORT INTRODUCTION ABOUT YOURSELF, YOUR BACKGROUND AS A BSCS STUDENT, YOUR INTEREST IN TECHNOLOGY, AND YOUR CAREER GOALS.]';
    setText($('#about-bio'), about.bio, bioFallback);
    setText($('#about-interests'), about.interests, '[ADD YOUR CAREER INTERESTS]');
    setText($('#about-goals'), about.goals, '[ADD YOUR PROFESSIONAL GOALS]');

    const facts = [
      ['Full name', profile.fullName], ['Degree program', about.degree],
      ['University', about.university], ['Year level / graduation', about.year]
    ].filter(([, value]) => (value || '').trim());
    $('#about-facts').replaceChildren(...facts.map(([label, value]) => el('div', {}, el('dt', { text: label }), el('dd', { text: value }))));

    const education = about.education.filter((e) => e.degree || e.school || e.period);
    $('#about-education').replaceChildren(...(education.length
      ? education.map((e) => el('li', {}, el('span', { class: 'tl-title', text: e.degree || e.school }),
          e.degree && e.school ? el('span', { class: 'tl-sub', text: e.school }) : null,
          e.period ? el('span', { class: 'tl-sub', text: e.period }) : null))
      : [el('li', {}, el('span', { class: 'tl-sub is-placeholder', text: '[ADD YOUR EDUCATIONAL BACKGROUND]' }))]));
  }

  function levelBadge(level) {
    return level ? el('span', { class: 'badge', text: level }) : null;
  }

  function renderSkills() {
    const select = $('#skill-category');
    if (!select.options.length) SKILL_CATEGORIES.forEach((c) => select.append(el('option', { value: c.name, text: c.name })));

    const usedCategories = SKILL_CATEGORIES.filter((c) => state.skills.some((s) => s.category === c.name));
    const extraCategories = [...new Set(state.skills.map((s) => s.category))].filter((name) => !SKILL_CATEGORIES.some((c) => c.name === name));
    const visibleCategories = isEditing ? SKILL_CATEGORIES.map((c) => c.name) : [...usedCategories.map((c) => c.name), ...extraCategories];
    if (activeCategory !== 'All' && !visibleCategories.includes(activeCategory)) activeCategory = 'All';

    // Filter chips
    const chips = ['All', ...visibleCategories].map((name) => el('button', {
      class: 'chip', type: 'button', 'aria-pressed': String(name === activeCategory), text: name,
      onclick: () => { activeCategory = name; renderSkills(); }
    }));
    $('#skills-filter').replaceChildren(...chips);
    $('#skills-filter').hidden = state.skills.length === 0 && !isEditing;

    // Category cards
    const cards = visibleCategories
      .filter((name) => activeCategory === 'All' || name === activeCategory)
      .map((name) => {
        const meta = SKILL_CATEGORIES.find((c) => c.name === name) || { icon: 'layers' };
        const skills = state.skills.filter((s) => s.category === name);
        const items = skills.map((skill) => el('li', { class: 'skill-item' },
          el('div', {}, el('span', { class: 'skill-name', text: skill.name }), skill.desc ? el('span', { class: 'skill-desc', text: skill.desc }) : null),
          el('div', { class: 'skill-meta' }, levelBadge(skill.level),
            isEditing ? el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Edit skill ' + skill.name, onclick: () => openSkillEditor(skill.id) }, icon('edit')) : null,
            isEditing ? el('button', { class: 'icon-btn danger', type: 'button', 'aria-label': 'Remove skill ' + skill.name, onclick: () => removeSkill(skill.id) }, icon('trash')) : null)));
        return el('article', { class: 'card skill-cat' },
          el('h3', {}, el('span', { class: 'cat-icon' }, icon(meta.icon)), name),
          skills.length ? el('ul', { class: 'skill-list' }, items) : el('p', { class: 'empty-note', text: 'No skills added in this category yet.' }));
      });
    $('#skills-grid').replaceChildren(...(cards.length ? cards : [el('p', { class: 'empty-note', text: 'Skills will be added here.' })]));
  }

  async function removeSkill(id) {
    const skill = state.skills.find((s) => s.id === id);
    if (!skill) return;
    if (await askConfirm('Remove skill?', `"${skill.name}" will be removed from your portfolio.`, 'Remove')) {
      commit(() => { state.skills = state.skills.filter((s) => s.id !== id); });
      showToast('Skill removed.');
    }
  }

  function renderProjects() {
    const grid = $('#projects-grid');
    const cards = state.projects.map((project) => {
      const cover = safeImage(project.images[0]);
      const githubUrl = safeUrl(project.github);
      const demoUrl = safeUrl(project.demo);
      return el('article', { class: 'card project-card' },
        el('div', { class: 'project-media' }, cover ? el('img', { src: cover, alt: 'Screenshot of ' + project.title, loading: 'lazy' }) : icon('code')),
        el('div', { class: 'project-body' },
          el('div', { class: 'tag-row' }, project.type ? el('span', { class: 'badge badge-slate', text: project.type + ' project' }) : null),
          el('h3', { text: project.title || 'Untitled project' }),
          el('p', { class: 'project-desc', text: project.description }),
          project.technologies.length ? el('div', { class: 'tag-row', 'aria-label': 'Technologies used' }, project.technologies.map((t) => el('span', { class: 'badge', text: t }))) : null,
          el('div', { class: 'project-actions' },
            el('button', { class: 'btn btn-sm btn-primary', type: 'button', onclick: () => openProjectDetails(project.id) }, 'View Details'),
            githubUrl ? el('a', { class: 'btn btn-sm', href: githubUrl, target: '_blank', rel: 'noopener noreferrer' }, icon('github'), 'GitHub', el('span', { class: 'sr-only', text: ' (opens in a new tab)' })) : null,
            demoUrl ? el('a', { class: 'btn btn-sm', href: demoUrl, target: '_blank', rel: 'noopener noreferrer' }, icon('external'), 'Live Demo') : null,
            isEditing ? el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Edit project ' + project.title, onclick: () => openProjectEditor(project.id) }, icon('edit')) : null,
            isEditing ? el('button', { class: 'icon-btn danger', type: 'button', 'aria-label': 'Delete project ' + project.title, onclick: () => removeProject(project.id) }, icon('trash')) : null)));
    });
    if (isEditing) {
      cards.push(el('button', { class: 'card add-card', type: 'button', onclick: () => openProjectEditor(null) },
        el('span', {}, icon('plus'), el('br'), 'Add a project')));
    }
    if (!cards.length) {
      cards.push(el('div', { class: 'card placeholder-card' }, icon('folder'), el('p', { text: 'Projects will be added here.' })));
    }
    grid.replaceChildren(...cards);
  }

  async function removeProject(id) {
    const project = state.projects.find((p) => p.id === id);
    if (!project) return;
    if (await askConfirm('Delete project?', `"${project.title}" and its screenshots will be deleted from this browser.`, 'Delete')) {
      commit(() => { state.projects = state.projects.filter((p) => p.id !== id); });
      showToast('Project deleted.');
    }
  }

  function renderCerts() {
    const list = $('#certs-list');
    const items = state.certs.map((cert) => {
      const image = safeImage(cert.image);
      const verifyUrl = safeUrl(cert.link);
      const meta = [cert.issuer, cert.date].filter(Boolean).join(' · ');
      return el('li', { class: 'cert-item' },
        el('div', { class: 'cert-dot' }, icon('award')),
        el('article', { class: 'card cert-card' + (image ? ' has-image' : '') },
          el('div', {},
            el('h3', { text: cert.title || 'Untitled' }),
            meta ? el('p', { class: 'cert-meta', text: meta }) : null,
            cert.description ? el('p', { text: cert.description }) : null,
            el('div', { class: 'card-actions' },
              verifyUrl ? el('a', { class: 'btn btn-sm', href: verifyUrl, target: '_blank', rel: 'noopener noreferrer' }, icon('external'), 'Verify credential') : null,
              isEditing ? el('button', { class: 'btn btn-sm', type: 'button', onclick: () => openCertEditor(cert.id) }, icon('edit'), 'Edit') : null,
              isEditing ? el('button', { class: 'btn btn-sm btn-danger', type: 'button', onclick: () => removeCert(cert.id) }, icon('trash'), 'Delete') : null)),
          image ? el('button', { class: 'cert-thumb', type: 'button', 'aria-label': 'View certificate image for ' + cert.title, onclick: () => openImage(image, cert.title) },
            el('img', { src: image, alt: 'Certificate image: ' + cert.title, loading: 'lazy' })) : null));
    });
    if (isEditing) {
      items.push(el('li', {}, el('button', { class: 'card add-card', style: 'width:100%', type: 'button', onclick: () => openCertEditor(null) },
        el('span', {}, icon('plus'), el('br'), 'Add a certificate or achievement'))));
    }
    if (!state.certs.length) {
      items.unshift(el('li', {}, el('div', { class: 'card placeholder-card' }, icon('award'), el('p', { text: 'Certifications and achievements will be added here.' }))));
    }
    list.replaceChildren(...items);
  }

  async function removeCert(id) {
    const cert = state.certs.find((c) => c.id === id);
    if (!cert) return;
    if (await askConfirm('Delete entry?', `"${cert.title}" will be removed from your portfolio.`, 'Delete')) {
      commit(() => { state.certs = state.certs.filter((c) => c.id !== id); });
      showToast('Entry deleted.');
    }
  }

  function renderContact() {
    const c = state.contact;
    const rows = [];
    const row = (iconName, label, content) => el('li', {}, el('span', { class: 'contact-icon' }, icon(iconName)), el('div', {}, el('span', { class: 'contact-label', text: label }), content));
    if (c.email.trim()) rows.push(row('mail', 'Email', isValidEmail(c.email) ? el('a', { href: 'mailto:' + c.email.trim(), text: c.email.trim() }) : el('span', { class: 'contact-value', text: c.email })));
    else rows.push(row('mail', 'Email', el('span', { class: 'contact-value is-placeholder', text: '[ADD YOUR PROFESSIONAL EMAIL]' })));
    if (c.showPhone && c.phone.trim()) rows.push(row('phone', 'Phone', el('a', { href: 'tel:' + c.phone.replace(/[^\d+]/g, ''), text: c.phone.trim() })));
    if (c.location.trim()) rows.push(row('pin', 'Location', el('span', { class: 'contact-value', text: c.location.trim() })));
    if (safeUrl(c.github)) rows.push(row('github', 'GitHub', el('a', { href: safeUrl(c.github), target: '_blank', rel: 'noopener noreferrer', text: safeUrl(c.github).replace(/^https?:\/\/(www\.)?/, '') })));
    if (safeUrl(c.linkedin)) rows.push(row('linkedin', 'LinkedIn', el('a', { href: safeUrl(c.linkedin), target: '_blank', rel: 'noopener noreferrer', text: safeUrl(c.linkedin).replace(/^https?:\/\/(www\.)?/, '') })));
    c.other.forEach((o) => { if (safeUrl(o.url)) rows.push(row('link', o.label || 'Link', el('a', { href: safeUrl(o.url), target: '_blank', rel: 'noopener noreferrer', text: safeUrl(o.url).replace(/^https?:\/\/(www\.)?/, '') }))); });
    $('#contact-list').replaceChildren(...rows);

    const endpoint = safeUrl(c.formEndpoint);
    $('#form-note').textContent = endpoint
      ? 'Messages from this form are delivered through the form service set up by the site owner.'
      : '';
  }

  function renderFooter() {
    const name = state.profile.fullName.trim() || 'Your Name';
    $('#footer-name').textContent = name;
    $('#footer-copy-name').textContent = name;
    $('#footer-year').textContent = String(new Date().getFullYear()); // updates automatically
    renderSocials($('#footer-socials'));
  }

  function renderAll() {
    renderHero(); renderAbout(); renderSkills(); renderProjects(); renderCerts(); renderContact(); renderFooter();
  }

  /* ---------------------------------------------------------
     5. DIALOGS
     --------------------------------------------------------- */
  function openDialog(dialog) { if (!dialog.open) dialog.showModal(); }

  // Close buttons and backdrop clicks (backdrop click is disabled for the editor to avoid lost work)
  $$('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target.closest('[data-close]')) dialog.close();
      else if (event.target === dialog && dialog.id !== 'editor-dialog' && dialog.id !== 'confirm-dialog') dialog.close();
    });
  });

  /** Yes/No confirmation. Resolves to true only if the user confirms. */
  function askConfirm(title, text, okLabel = 'Confirm') {
    const dialog = $('#confirm-dialog');
    $('#cd-title').textContent = title;
    $('#cd-text').textContent = text;
    $('#cd-ok').textContent = okLabel;
    return new Promise((resolve) => {
      const finish = (answer) => {
        $('#cd-ok').onclick = null; $('#cd-cancel').onclick = null; dialog.onclose = null;
        if (dialog.open) dialog.close();
        resolve(answer);
      };
      $('#cd-ok').onclick = () => finish(true);
      $('#cd-cancel').onclick = () => finish(false);
      dialog.onclose = () => finish(false); // Escape key
      openDialog(dialog);
      $('#cd-cancel').focus();
    });
  }

  function openImage(src, title) {
    $('#img-title').textContent = title || 'Image';
    const image = $('#img-large');
    image.src = src;
    image.alt = title ? 'Large view: ' + title : 'Large image';
    openDialog($('#image-dialog'));
  }

  /** Project details modal: full description, role, teammates, tech, links, screenshots. */
  function openProjectDetails(id) {
    const project = state.projects.find((p) => p.id === id);
    if (!project) return;
    $('#pd-title').textContent = project.title || 'Project';
    const block = (title, content) => content ? el('section', { class: 'pd-block' }, el('h3', { text: title }), content) : null;
    const textBlock = (title, value) => {
      if (!(value || '').trim()) return null;
      const p = el('p');
      setText(p, value);
      return block(title, p);
    };
    const links = [];
    const githubUrl = safeUrl(project.github), demoUrl = safeUrl(project.demo), docsUrl = safeUrl(project.docs);
    if (githubUrl) links.push(el('a', { class: 'btn btn-sm', href: githubUrl, target: '_blank', rel: 'noopener noreferrer' }, icon('github'), 'GitHub repository'));
    if (demoUrl) links.push(el('a', { class: 'btn btn-sm btn-primary', href: demoUrl, target: '_blank', rel: 'noopener noreferrer' }, icon('external'), 'Live demo'));
    if (docsUrl) links.push(el('a', { class: 'btn btn-sm', href: docsUrl, target: '_blank', rel: 'noopener noreferrer' }, icon('file'), 'Documentation / evidence'));

    const images = project.images.map(safeImage).filter(Boolean);
    $('#pd-body').replaceChildren(...[
      project.type ? el('p', {}, el('span', { class: 'badge badge-slate', text: project.type + ' project' })) : null,
      images.length ? el('div', { class: 'pd-gallery' }, images.map((src, index) =>
        el('button', { type: 'button', 'aria-label': `View screenshot ${index + 1} of ${project.title}`, onclick: () => openImage(src, `${project.title} (screenshot ${index + 1})`) },
          el('img', { src, alt: `Screenshot ${index + 1} of ${project.title}`, loading: 'lazy' })))) : null,
      textBlock('About the project', project.description),
      textBlock('My role and contributions', project.role),
      textBlock('Teammates and their contributions', project.team),
      project.technologies.length ? block('Technologies and tools', el('div', { class: 'tag-row' }, project.technologies.map((t) => el('span', { class: 'badge', text: t })))) : null,
      textBlock('External resources acknowledged', project.external),
      links.length ? block('Links', el('div', { class: 'pd-links' }, links)) : null
    ].filter(Boolean));
    openDialog($('#project-dialog'));
  }

  /* ---------------------------------------------------------
     6. EDITORS
     Each editor builds a form inside #editor-dialog and returns
     { collect() } which gives { values } or { errors } on Save.
     --------------------------------------------------------- */
  let currentEditor = null;

  function openEditorDialog(title, buildForm, onSave) {
    $('#ed-title').textContent = title;
    $('#ed-status').textContent = '';
    $('#ed-status').className = 'form-status err';
    const body = $('#ed-body');
    body.replaceChildren();
    currentEditor = { form: buildForm(body), onSave };
    openDialog($('#editor-dialog'));
    body.scrollTop = 0;
    const firstInput = $('input, textarea, select', body);
    if (firstInput) firstInput.focus();
  }

  $('#editor-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!currentEditor) return;
    const result = currentEditor.form.collect();
    if (result.errors && result.errors.length) {
      $('#ed-status').textContent = 'Please fix: ' + result.errors.join(' ');
      const invalid = $('[aria-invalid="true"]', $('#ed-body'));
      if (invalid) invalid.focus();
      return;
    }
    if (currentEditor.onSave(result.values) !== false) {
      $('#editor-dialog').close();
      showToast('Saved.');
    }
  });
  $('#editor-dialog').addEventListener('close', () => { currentEditor = null; });

  /** Build one labelled form field. Returns { wrap, input }. */
  function formField({ id, label, value = '', type = 'text', required = false, multiline = false, rows = 4, hint = '', maxLength, options, full = false }) {
    let input;
    if (options) {
      input = el('select', { id, name: id }, options.map((o) => el('option', { value: o.value, text: o.label, selected: o.value === value })));
    } else if (multiline) {
      input = el('textarea', { id, name: id, rows, maxlength: maxLength });
      input.value = value;
    } else {
      input = el('input', { id, name: id, type, maxlength: maxLength, autocomplete: 'off' });
      input.value = value;
    }
    const errorId = id + '-err';
    const error = el('p', { class: 'field-error', id: errorId, role: 'alert' });
    input.setAttribute('aria-describedby', errorId + (hint ? ' ' + id + '-hint' : ''));
    if (required) input.setAttribute('aria-required', 'true');
    const wrap = el('div', { class: 'field' + (full ? ' full' : '') },
      el('label', { for: id }, label, required ? el('span', { class: 'req', 'aria-hidden': 'true', text: ' *' }) : null),
      input, hint ? el('p', { class: 'field-hint', id: id + '-hint', text: hint }) : null, error);
    wrap.setError = (message) => { error.textContent = message || ''; input.setAttribute('aria-invalid', message ? 'true' : 'false'); if (!message) input.removeAttribute('aria-invalid'); };
    return { wrap, input, setError: wrap.setError };
  }

  /** Validate a URL-ish field (optional). Returns cleaned URL or sets an error. */
  function checkUrlField(field, label, errors) {
    const raw = field.input.value.trim();
    field.setError('');
    if (!raw) return '';
    const clean = safeUrl(raw);
    if (!clean) { field.setError('Enter a valid web link, e.g. https://github.com/username'); errors.push(label + ' is not a valid link.'); return raw; }
    return clean;
  }

  /** Image picker with preview. `multiple` keeps a list; otherwise a single image. */
  function imagePicker({ id, label, images, multiple, maxImages = 6, maxSize = 1200, quality = 0.8, fallbackSrc = '', altText = 'Preview' }) {
    const list = images.slice();
    const previews = el('div', { class: 'preview-grid' });
    const status = el('p', { class: 'field-hint', role: 'status' });
    const input = el('input', { id, class: 'file-input', type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif', multiple: multiple || null });

    const refresh = () => {
      const shown = list.length ? list : (fallbackSrc ? [fallbackSrc] : []);
      previews.replaceChildren(...shown.map((src, index) => el('div', { class: 'preview-item' },
        el('img', { class: 'preview-img', src, alt: altText + (multiple ? ' ' + (index + 1) : '') }),
        list.length ? el('button', { class: 'icon-btn danger', type: 'button', 'aria-label': 'Remove image ' + (index + 1), onclick: () => { list.splice(index, 1); refresh(); } }, icon('x')) : null)));
    };
    input.addEventListener('change', async () => {
      const files = Array.from(input.files || []);
      status.textContent = '';
      for (const file of files) {
        if (multiple && list.length >= maxImages) { status.textContent = `Maximum of ${maxImages} images reached.`; break; }
        try {
          const dataUrl = await fileToResizedDataUrl(file, maxSize, quality);
          if (multiple) list.push(dataUrl); else list.splice(0, list.length, dataUrl);
        } catch (error) { status.textContent = error.message; }
      }
      input.value = '';
      refresh();
    });
    refresh();
    const wrap = el('div', { class: 'field full' }, el('label', { for: id, text: label }), input,
      el('p', { class: 'field-hint', text: 'Images are resized and stored in this browser. Preview below; nothing is saved until you press Save.' }), previews, status);
    return { wrap, getImages: () => list.slice() };
  }

  /* ---- Skill editor ---- */
  function openSkillEditor(id) {
    const existing = state.skills.find((s) => s.id === id);
    openEditorDialog('Edit skill', (body) => {
      const name = formField({ id: 'ed-skill-name', label: 'Skill name', value: existing.name, required: true, maxLength: 60 });
      const category = formField({ id: 'ed-skill-category', label: 'Category', value: existing.category, options: SKILL_CATEGORIES.map((c) => ({ value: c.name, label: c.name })) });
      const level = formField({ id: 'ed-skill-level', label: 'Proficiency level', value: existing.level, options: [{ value: '', label: 'Not specified' }, ...SKILL_LEVELS.map((l) => ({ value: l, label: l }))] });
      const desc = formField({ id: 'ed-skill-desc', label: 'Short description (optional)', value: existing.desc, maxLength: 140 });
      body.append(el('div', { class: 'form-grid' }, name.wrap, category.wrap, level.wrap, desc.wrap));
      return {
        collect() {
          if (!name.input.value.trim()) { name.setError('Skill name is required.'); return { errors: ['Skill name is required.'] }; }
          return { values: { name: name.input.value.trim(), category: category.input.value, level: level.input.value, desc: desc.input.value.trim() } };
        }
      };
    }, (values) => commit(() => { Object.assign(state.skills.find((s) => s.id === id), values); }));
  }

  // Inline "Add a skill" form (visible in edit mode)
  $('#skill-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.name.value.trim();
    const error = $('#skill-name-err');
    if (!name) {
      error.textContent = 'Please enter a skill name.';
      form.elements.name.setAttribute('aria-invalid', 'true');
      form.elements.name.focus();
      return;
    }
    error.textContent = ''; form.elements.name.removeAttribute('aria-invalid');
    const added = commit(() => {
      state.skills.push({ id: newId('s'), name, category: form.elements.category.value, level: form.elements.level.value, desc: form.elements.desc.value.trim() });
    });
    if (added) { form.reset(); showToast('Skill added.'); form.elements.name.focus(); }
  });

  /* ---- Project editor ---- */
  function openProjectEditor(id) {
    const existing = state.projects.find((p) => p.id === id);
    const project = existing || { title: '', type: '', description: '', role: '', team: '', technologies: [], external: '', github: '', demo: '', docs: '', images: [] };
    openEditorDialog(existing ? 'Edit project' : 'Add project', (body) => {
      const title = formField({ id: 'ed-p-title', label: 'Project title', value: project.title, required: true, maxLength: 100, full: true });
      const type = formField({ id: 'ed-p-type', label: 'Project type', value: project.type, options: [{ value: '', label: 'Not specified' }, ...PROJECT_TYPES.map((t) => ({ value: t, label: t }))] });
      const tech = formField({ id: 'ed-p-tech', label: 'Technologies and tools', value: project.technologies.join(', '), hint: 'Separate with commas, e.g. Java, MySQL' });
      const description = formField({ id: 'ed-p-desc', label: 'Project description', value: project.description, multiline: true, rows: 4, full: true });
      const role = formField({ id: 'ed-p-role', label: 'My role and contributions', value: project.role, multiline: true, rows: 4, full: true, hint: 'Describe only the parts you personally did.' });
      const team = formField({ id: 'ed-p-team', label: 'Teammates and what they contributed', value: project.team, multiline: true, rows: 3, full: true, hint: 'Credit your teammates so your own work is clearly separate.' });
      const external = formField({ id: 'ed-p-ext', label: 'External resources acknowledged', value: project.external, multiline: true, rows: 2, full: true, hint: 'Libraries, tutorials, datasets, templates or code you did not write.' });
      const github = formField({ id: 'ed-p-github', label: 'GitHub repository link', value: project.github, type: 'url' });
      const demo = formField({ id: 'ed-p-demo', label: 'Live demo link', value: project.demo, type: 'url' });
      const docs = formField({ id: 'ed-p-docs', label: 'Documentation / evidence link (optional)', value: project.docs, type: 'url', full: true });
      const picker = imagePicker({ id: 'ed-p-images', label: 'Project screenshots', images: project.images, multiple: true, altText: 'Screenshot preview' });
      body.append(el('div', { class: 'form-grid' }, title.wrap, type.wrap, tech.wrap, description.wrap, role.wrap, team.wrap, external.wrap, github.wrap, demo.wrap, docs.wrap, picker.wrap));
      return {
        collect() {
          const errors = [];
          title.setError('');
          if (!title.input.value.trim()) { title.setError('Project title is required.'); errors.push('Project title is required.'); }
          const githubUrl = checkUrlField(github, 'GitHub link', errors);
          const demoUrl = checkUrlField(demo, 'Live demo link', errors);
          const docsUrl = checkUrlField(docs, 'Documentation link', errors);
          return {
            errors,
            values: {
              title: title.input.value.trim(), type: type.input.value, description: description.input.value.trim(), role: role.input.value.trim(),
              team: team.input.value.trim(), technologies: splitList(tech.input.value), external: external.input.value.trim(),
              github: githubUrl, demo: demoUrl, docs: docsUrl, images: picker.getImages()
            }
          };
        }
      };
    }, (values) => commit(() => {
      if (existing) Object.assign(state.projects.find((p) => p.id === id), values);
      else state.projects.push({ id: newId('p'), ...values });
    }));
  }

  /* ---- Certification / achievement editor ---- */
  function openCertEditor(id) {
    const existing = state.certs.find((c) => c.id === id);
    const cert = existing || { title: '', issuer: '', date: '', description: '', image: '', link: '' };
    openEditorDialog(existing ? 'Edit certificate or achievement' : 'Add certificate or achievement', (body) => {
      const title = formField({ id: 'ed-c-title', label: 'Certificate or achievement title', value: cert.title, required: true, maxLength: 120, full: true });
      const issuer = formField({ id: 'ed-c-issuer', label: 'Issuing organization', value: cert.issuer, maxLength: 120 });
      const date = formField({ id: 'ed-c-date', label: 'Date obtained', value: cert.date, maxLength: 60, hint: 'e.g. March 2026, or Second Year, Second Semester' });
      const description = formField({ id: 'ed-c-desc', label: 'Short description', value: cert.description, multiline: true, rows: 3, full: true });
      const link = formField({ id: 'ed-c-link', label: 'Credential verification link (if available)', value: cert.link, type: 'url', full: true });
      const picker = imagePicker({ id: 'ed-c-image', label: 'Certificate image', images: cert.image ? [cert.image] : [], multiple: false, maxSize: 1400, quality: 0.82, altText: 'Certificate preview' });
      body.append(el('div', { class: 'form-grid' }, title.wrap, issuer.wrap, date.wrap, description.wrap, link.wrap, picker.wrap));
      return {
        collect() {
          const errors = [];
          title.setError('');
          if (!title.input.value.trim()) { title.setError('A title is required.'); errors.push('A title is required.'); }
          const linkUrl = checkUrlField(link, 'Verification link', errors);
          return { errors, values: { title: title.input.value.trim(), issuer: issuer.input.value.trim(), date: date.input.value.trim(), description: description.input.value.trim(), link: linkUrl, image: picker.getImages()[0] || '' } };
        }
      };
    }, (values) => commit(() => {
      if (existing) Object.assign(state.certs.find((c) => c.id === id), values);
      else state.certs.push({ id: newId('c'), ...values });
    }));
  }

  /* ---- Profile / About / Contact editor ---- */
  function openProfileEditor() {
    const { profile, about, contact } = state;
    openEditorDialog('Profile, About & Contact', (body) => {
      // Hero
      const fullName = formField({ id: 'ed-name', label: 'Full name', value: profile.fullName, required: true, maxLength: 80 });
      const title = formField({ id: 'ed-title-field', label: 'Professional title', value: profile.title, maxLength: 100 });
      const intro = formField({ id: 'ed-intro', label: 'Short introduction (hero section)', value: profile.intro, multiline: true, rows: 3, full: true });
      const photo = imagePicker({ id: 'ed-photo', label: 'Profile photo', images: profile.photo ? [profile.photo] : [], multiple: false, maxSize: 900, quality: 0.85, fallbackSrc: CONFIG.defaultPhoto, altText: 'Profile photo preview' });
      body.append(el('fieldset', {}, el('legend', { text: 'Hero' }), el('div', { class: 'form-grid' }, fullName.wrap, title.wrap, intro.wrap, photo.wrap)));

      // About
      const degree = formField({ id: 'ed-degree', label: 'Degree program', value: about.degree });
      const university = formField({ id: 'ed-univ', label: 'University', value: about.university });
      const year = formField({ id: 'ed-year', label: 'Year level or expected graduation year', value: about.year, full: true });
      const bio = formField({ id: 'ed-bio', label: 'Short professional biography', value: about.bio, multiline: true, rows: 5, full: true });
      const interests = formField({ id: 'ed-interests', label: 'Career interests', value: about.interests, multiline: true, rows: 3 });
      const goals = formField({ id: 'ed-goals', label: 'Professional goals', value: about.goals, multiline: true, rows: 3 });
      const educationRows = el('div');
      const educationState = about.education.map((e) => ({ ...e }));
      const renderEducation = () => {
        educationRows.replaceChildren(...educationState.map((row, index) => el('div', { class: 'repeater-row' },
          repeaterInput('Degree / level', row.degree, (v) => { row.degree = v; }, 'ed-edu-d' + index),
          repeaterInput('School', row.school, (v) => { row.school = v; }, 'ed-edu-s' + index),
          repeaterInput('Years', row.period, (v) => { row.period = v; }, 'ed-edu-p' + index),
          el('button', { class: 'icon-btn danger', type: 'button', 'aria-label': 'Remove education entry ' + (index + 1), onclick: () => { educationState.splice(index, 1); renderEducation(); } }, icon('trash')))));
      };
      renderEducation();
      body.append(el('fieldset', {}, el('legend', { text: 'About me' }), el('div', { class: 'form-grid' }, degree.wrap, university.wrap, year.wrap, bio.wrap, interests.wrap, goals.wrap),
        el('p', { class: 'label', text: 'Educational background' }), educationRows,
        el('button', { class: 'btn btn-sm', type: 'button', style: 'margin-bottom:1rem', onclick: () => { educationState.push({ degree: '', school: '', period: '' }); renderEducation(); } }, icon('plus'), 'Add education entry')));

      // Contact
      const email = formField({ id: 'ed-email', label: 'Professional email address', value: contact.email, type: 'email' });
      const phone = formField({ id: 'ed-phone', label: 'Contact number (optional)', value: contact.phone, type: 'tel' });
      const showPhone = el('div', { class: 'field full checkbox' }, el('input', { id: 'ed-showphone', type: 'checkbox', checked: contact.showPhone || null }), el('label', { for: 'ed-showphone', text: 'Show my phone number on the public page' }));
      const location = formField({ id: 'ed-location', label: 'Location (city / province only is recommended)', value: contact.location, full: true });
      const github = formField({ id: 'ed-github', label: 'GitHub profile', value: contact.github, type: 'url', hint: 'e.g. https://github.com/your-username' });
      const linkedin = formField({ id: 'ed-linkedin', label: 'LinkedIn profile', value: contact.linkedin, type: 'url' });
      const otherRows = el('div');
      const otherState = contact.other.map((o) => ({ ...o }));
      const renderOther = () => {
        otherRows.replaceChildren(...otherState.map((row, index) => el('div', { class: 'repeater-row two' },
          repeaterInput('Label (e.g. Portfolio)', row.label, (v) => { row.label = v; }, 'ed-oth-l' + index),
          repeaterInput('Link', row.url, (v) => { row.url = v; }, 'ed-oth-u' + index),
          el('button', { class: 'icon-btn danger', type: 'button', 'aria-label': 'Remove link ' + (index + 1), onclick: () => { otherState.splice(index, 1); renderOther(); } }, icon('trash')))));
      };
      renderOther();
      const endpoint = formField({ id: 'ed-endpoint', label: 'Contact form service URL (optional)', value: contact.formEndpoint, type: 'url', full: true, hint: 'Leave empty to use your email app. To deliver messages automatically, create a free form at formspree.io and paste its https:// endpoint here.' });
      body.append(el('fieldset', {}, el('legend', { text: 'Contact' }), el('div', { class: 'form-grid' }, email.wrap, phone.wrap, showPhone, location.wrap, github.wrap, linkedin.wrap),
        el('p', { class: 'label', text: 'Other professional links' }), otherRows,
        el('button', { class: 'btn btn-sm', type: 'button', style: 'margin-bottom:1rem', onclick: () => { otherState.push({ label: '', url: '' }); renderOther(); } }, icon('plus'), 'Add another link'),
        el('div', { class: 'form-grid' }, endpoint.wrap)));

      return {
        collect() {
          const errors = [];
          fullName.setError(''); email.setError('');
          if (!fullName.input.value.trim()) { fullName.setError('Your full name is required.'); errors.push('Full name is required.'); }
          if (email.input.value.trim() && !isValidEmail(email.input.value)) { email.setError('Enter a valid email address, e.g. name@example.com'); errors.push('Email address is not valid.'); }
          const githubUrl = checkUrlField(github, 'GitHub link', errors);
          const linkedinUrl = checkUrlField(linkedin, 'LinkedIn link', errors);
          const endpointUrl = checkUrlField(endpoint, 'Form service URL', errors);
          if (endpointUrl && !/^https:\/\//i.test(endpointUrl)) { endpoint.setError('The form service URL must start with https://'); errors.push('Form service URL must use https.'); }
          const others = otherState.filter((o) => o.label.trim() || o.url.trim()).map((o) => ({ label: o.label.trim(), url: safeUrl(o.url) }));
          if (others.some((o) => !o.url)) errors.push('One of the other links is not a valid web link.');
          return {
            errors,
            values: {
              profile: { fullName: fullName.input.value.trim(), title: title.input.value.trim(), intro: intro.input.value.trim(), photo: photo.getImages()[0] || '' },
              about: { degree: degree.input.value.trim(), university: university.input.value.trim(), year: year.input.value.trim(), bio: bio.input.value.trim(), interests: interests.input.value.trim(), goals: goals.input.value.trim(),
                education: educationState.filter((e) => e.degree.trim() || e.school.trim() || e.period.trim()).map((e) => ({ degree: e.degree.trim(), school: e.school.trim(), period: e.period.trim() })) },
              contact: { email: email.input.value.trim(), phone: phone.input.value.trim(), showPhone: $('#ed-showphone').checked, location: location.input.value.trim(), github: githubUrl, linkedin: linkedinUrl, other: others, formEndpoint: endpointUrl }
            }
          };
        }
      };
    }, (values) => commit(() => { state.profile = values.profile; state.about = values.about; state.contact = values.contact; }));
  }

  /** Small labelled input for repeater rows. */
  function repeaterInput(label, value, onInput, id) {
    const input = el('input', { id, type: 'text', autocomplete: 'off' });
    input.value = value || '';
    input.addEventListener('input', () => onInput(input.value));
    return el('div', { class: 'field' }, el('label', { for: id, text: label }), input);
  }

  /* ---- Backup, import and reset ---- */
  function exportBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const link = el('a', { href: URL.createObjectURL(blob), download: 'portfolio-backup.json' });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    showToast('Backup downloaded. Use "Import backup" on another device to load it.');
  }

  function importBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => showToast('The backup file could not be read.', true);
    reader.onload = async () => {
      let parsed;
      try { parsed = JSON.parse(reader.result); } catch (error) { showToast('That file is not a valid portfolio backup.', true); return; }
      if (!parsed || typeof parsed !== 'object' || !parsed.profile || !Array.isArray(parsed.skills)) { showToast('That file does not look like a portfolio backup.', true); return; }
      if (await askConfirm('Import this backup?', 'This replaces everything currently shown in this browser with the contents of the backup file.', 'Import')) {
        if (commit(() => { state = normalizeData(parsed); })) showToast('Backup imported.');
      }
    };
    reader.readAsText(file);
  }

  async function resetToDefault() {
    const ok = await askConfirm('Reset to default?', 'All edits, uploaded images and added items saved in this browser will be erased, and the original CV-based content will be restored. This cannot be undone. Export a backup first if unsure.', 'Reset everything');
    if (!ok) return;
    try { localStorage.removeItem(CONFIG.storageKey); } catch (error) { /* storage unavailable: just reset memory */ }
    state = clone(DEFAULT_DATA);
    renderAll();
    showToast('Portfolio reset to default.');
  }

  /* ---------------------------------------------------------
     7. CONTACT FORM
     No fake success: either the form service answers OK, or the
     user's own email app is opened and we say it is NOT sent yet.
     --------------------------------------------------------- */
  const contactForm = $('#contact-form');
  const formStatus = $('#form-status');

  function validateContactForm() {
    const values = Object.fromEntries(['name', 'email', 'subject', 'message'].map((key) => [key, contactForm.elements[key].value.trim()]));
    const messages = {
      name: values.name ? '' : 'Please enter your name.',
      email: !values.email ? 'Please enter your email address.' : (isValidEmail(values.email) ? '' : 'Please enter a valid email address, e.g. name@example.com.'),
      subject: values.subject ? '' : 'Please enter a subject.',
      message: values.message ? (values.message.length >= 10 ? '' : 'Your message is a bit short. Please write at least 10 characters.') : 'Please write a message.'
    };
    let firstInvalid = null;
    for (const key of Object.keys(messages)) {
      const field = contactForm.elements[key];
      $('#cf-' + key + '-err').textContent = messages[key];
      if (messages[key]) { field.setAttribute('aria-invalid', 'true'); firstInvalid = firstInvalid || field; }
      else field.removeAttribute('aria-invalid');
    }
    return { values, firstInvalid };
  }

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    formStatus.className = 'form-status';
    formStatus.textContent = '';
    const { values, firstInvalid } = validateContactForm();
    if (firstInvalid) { firstInvalid.focus(); return; }

    const endpoint = safeUrl(state.contact.formEndpoint);
    if (endpoint) {
      try {
        formStatus.textContent = 'Sending…';
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(values) });
        if (!response.ok) throw new Error('The form service replied with status ' + response.status);
        formStatus.className = 'form-status ok';
        formStatus.textContent = 'Your message was delivered. Thank you!';
        contactForm.reset();
      } catch (error) {
        formStatus.className = 'form-status err';
        formStatus.textContent = 'Your message could not be sent. Please try again, or email ' + (state.contact.email || 'me') + ' directly.';
      }
      return;
    }

    const email = state.contact.email.trim();
    if (!isValidEmail(email)) {
      formStatus.className = 'form-status err';
      formStatus.textContent = 'The site owner has not added a contact email yet, so this message cannot be sent.';
      return;
    }
    const body = values.message + '\n\n— ' + values.name + ' (' + values.email + ')';
    const link = el('a', { href: 'mailto:' + email + '?subject=' + encodeURIComponent(values.subject) + '&body=' + encodeURIComponent(body) });
    document.body.append(link);
    link.click();
    link.remove();
    formStatus.textContent = 'Your email app should now open with this message ready. It has not been sent yet: press Send in your email app to deliver it.';
  });
  // Clear an error as soon as the visitor starts fixing the field
  $$('#contact-form input, #contact-form textarea').forEach((field) => field.addEventListener('input', () => {
    field.removeAttribute('aria-invalid');
    const error = $('#cf-' + field.name + '-err');
    if (error) error.textContent = '';
  }));

  /* ---------------------------------------------------------
     8. PAGE BEHAVIOUR
     --------------------------------------------------------- */
  // Mobile menu
  const navToggle = $('#nav-toggle');
  const navMenu = $('#nav-menu');
  function setMenu(open) {
    navMenu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  navToggle.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
  navMenu.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navMenu.classList.contains('open')) { setMenu(false); navToggle.focus(); }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // Highlight the nav link of the section currently in view
  const navLinks = $$('.nav-links a');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          const active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('active', active);
          if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((section) => spy.observe(section));
  }

  // Back-to-top button
  const toTop = $('#to-top');
  window.addEventListener('scroll', () => { toTop.hidden = window.scrollY < 500; }, { passive: true });
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    $('#home').setAttribute('tabindex', '-1');
    $('#home').focus({ preventScroll: true });
  });

  // Gentle reveal-on-scroll for the first page load only
  function setupRevealOnScroll() {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    $$('.section-head, .about-grid > .card, .skill-cat, .project-card, .cert-item, .contact-grid > *').forEach((node) => {
      if (node.getBoundingClientRect().top < window.innerHeight) return; // already on screen
      node.classList.add('reveal');
      observer.observe(node);
    });
  }

  // Edit mode
  const editToggle = $('#edit-toggle');
  function setEditing(on) {
    isEditing = on;
    document.body.classList.toggle('editing', on);
    $('#edit-bar').hidden = !on;
    $('#skill-form').hidden = !on;
    editToggle.setAttribute('aria-pressed', String(on));
    editToggle.querySelector('span').textContent = on ? 'Exit Edit Mode' : 'Edit Portfolio';
    renderAll();
    if (on) showToast('Edit mode on. Use the buttons on each section to add, edit or delete items.');
  }
  editToggle.hidden = !(CONFIG.showEditButton || new URLSearchParams(location.search).has('edit'));
  editToggle.addEventListener('click', () => { setEditing(!isEditing); setMenu(false); });
  $('#edit-done-btn').addEventListener('click', () => setEditing(false));
  $('#edit-profile-btn').addEventListener('click', openProfileEditor);
  $('#export-btn').addEventListener('click', exportBackup);
  $('#import-btn').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', (event) => { importBackup(event.target.files[0]); event.target.value = ''; });
  $('#reset-btn').addEventListener('click', resetToDefault);

  // Visually hidden helper text used by external-link buttons
  const srStyle = document.createElement('style');
  srStyle.textContent = '.sr-only{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}';
  document.head.append(srStyle);

  /* ---------------------------------------------------------
     9. INIT
     --------------------------------------------------------- */
  renderAll();
  setupRevealOnScroll();
})();
