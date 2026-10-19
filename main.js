/* ==========================================================================
   Predrag, Unity Game Developer
   ========================================================================== */

/* ---- Kontakt podaci: popuni ovdje (prazna polja se ne prikazuju) ---- */
const CONTACT = {
  email: 'predragbrajoviccw@gmail.com',
  linkedin: 'https://www.linkedin.com/in/predrag-brajovic-213a531b3/',
  phone: '+38267152809',
  github: '',    // npr. 'https://github.com/tvoj-profil'
  itch: '',      // npr. 'https://tvoj-profil.itch.io'
};

/* ---- English translations (the Montenegrin text lives in index.html) ---- */
const EN = {
  'skip': 'Skip to content',
  'nav.projects': 'Projects',
  'nav.about': 'About',
  'nav.contact': 'Contact',

  'hero.badge': 'Currently: Game Developer at Hugo FM',
  'hero.hello': 'Hi, I’m Predrag',
  'hero.title': 'I build games, from the first idea to the <span class="hl">final build</span>.',
  'hero.lead': 'Game developer and designer with a double master’s degree in Computer Science from University Mediterranean (Montenegro) and Mälardalen University (Sweden), and a background in building AI tools. I have 2 years of experience in game development and design, I work on many projects for Hugo FM, and I build my own AI models into games that recognize sound, speech and drawings.',
  'hero.cta1': 'See my projects',
  'hero.cta2': 'Get in touch',

  'proj.eyebrow': 'Featured projects',
  'proj.title': 'Four projects. One developer.',
  'proj.lead': 'I built Fart Runner, Frootz Fighters and Mr Farts App for Hugo FM, while Heroes of Alatyr is my own game, coming soon. I did everything myself, both development and design, including the AI tools behind them: sound detection, speech recognition and handwritten digit recognition.',
  'client.hugo': 'Made for Hugo FM',
  'client.own': 'My own game · coming soon',
  'solo': 'Solo · development & design',
  'client.live': 'Live · constantly evolving',
  'features': 'Highlights',
  't.sound': 'AI sound detection',
  't.speech': 'AI speech recognition',
  't.digits': 'AI digit recognition',
  't.edu': 'Educational',
  't.minigames': 'Mini-games',
  't.progression': 'Progression',

  'fr.tagline': 'The race where the loudest wins.',
  'fr.desc': 'A silly arcade racer where the characters sprint around the rim of a toilet in a fully 3D bathroom. I built a custom fart-sound detection tool for it: while the microphone picks up the sound, your character runs, the moment it stops, so does your character.',
  'fr.f1': 'Your character runs while the sound lasts and stops when it’s silent',
  'fr.f5': 'Singleplayer and multiplayer races',
  'fr.f2': '8 characters with distinct stats, fart boost and max speed',
  'fr.f3': 'Custom real-time fart-sound detection tool',
  'fr.f4': 'Laps, race timer, live leaderboard and power-ups',

  'hoa.tagline': 'Where math is the sharpest sword.',
  'hoa.desc': 'My own game, coming soon. An educational action adventure set in a low-poly fantasy world: when you meet an enemy, you win the fight by drawing the answer to a math problem on the screen, while the clock is ticking. The drawn numbers are recognized by an AI tool I developed during my studies at University Mediterranean.',
  'hoa.f1': 'Draw your answers on screen, AI recognizes the handwritten numbers',
  'hoa.f5': 'Custom digit-recognition model, developed during my studies',
  'hoa.f6': 'Combat driven by timed math challenges',
  'hoa.f2': '9 heroes to unlock with in-game coins',
  'hoa.f3': 'Difficulty levels and two game modes: Singleplay and Arcade',

  'ff.tagline': 'Aliens, fruit and planet-sized chaos.',
  'ff.desc': 'A colorful sci-fi shooter set on alien planets. You collect fruit scattered across the planet and shoot by shouting the name of a fruit you’ve collected, an AI I developed recognizes which fruit you picked. Matches last three minutes, solo or against other players.',
  'ff.f5': 'Shoot with your voice, shout the name of a collected fruit',
  'ff.f6': 'Custom AI that recognizes spoken fruit names',
  'ff.f1': '4 aliens, Frostbite, Toxic, Beastroos and Shadow, each with its own speed and health',
  'ff.f2': '10 fruit types to collect, a radar and a kill counter',
  'ff.f3': 'Singleplayer and multiplayer three-minute matches',

  'mf.tagline': 'Sounds, pranks and mini-games in one app.',
  'mf.desc': 'A mobile entertainment app that bundles a soundboard, pranks and mini-games into one package, with a full progression system that keeps users coming back. The app is live, constantly evolving, and I maintain it on my own.',
  'mf.f1': 'Soundboard with sound packs, a random mode and a Lab section',
  'mf.f2': 'Six pranks, Fart Countdown, Silence Detect, Fake Call, Fake Calculator, Face Down and System Error',
  'mf.f3': 'Built-in mini-games: Farts Lander, Top Farts and The Wellerman',
  'mf.f4': 'Levels, XP, streaks and coins to unlock content',
  'mf.f5': 'Continuous development and maintenance, all by me',

  'about.eyebrow': 'About me',
  'about.title': 'Engineer by training, game developer by calling.',
  'about.lead': 'During my studies I focused on building AI tools, from handwritten digit recognition to predicting failures on trains. Today I combine that with game development: I work in Unity and C#, own projects end to end, and give games something others don’t have, control by sound, voice or drawing.',
  'exp.title': 'Experience',
  'exp.now': 'Now',
  'exp.d1': 'Working on many projects for Hugo FM, games and apps with AI features, including Fart Runner, Frootz Fighters and Mr Farts App.',
  'exp.yrs': '2 years',
  'exp.role2': 'Game development & design',
  'exp.d2': 'Designing and developing games for mobile, desktop and web.',
  'exp.thesis': 'Master’s thesis',
  'exp.role3': 'AI tool for failure prediction',
  'exp.d3': 'I completed my master’s thesis in industry at Alstom, where I developed a tool for predicting failures on Alstom trains.',
  'edu.title': 'Education',
  'edu.degree': 'Double Master’s Degree',
  'edu.field': 'Computer Science · focus on AI tools',
  'edu.u1': 'University Mediterranean',
  'edu.u1loc': 'Podgorica, Montenegro',
  'edu.u2loc': 'Sweden',
  'skills.title': 'Tools & skills',
  'skill.design': 'Game design',
  'skill.gameplay': 'Gameplay programming',
  'skill.ai': 'AI / machine learning',
  'skill.sound': 'Sound detection',
  'skill.speech': 'Speech recognition',
  'skill.digits': 'Handwritten digit recognition',
  'skill.predict': 'Predictive maintenance',
  'skill.3d': '3D scenes & low-poly worlds',
  'skill.progression': 'Progression & in-game economy',


  'contact.eyebrow': 'Contact',
  'contact.title': 'Got a game idea, Let’s build it.',
  'contact.lead': 'I’m open to collaborations, new projects and conversations about games. Reach out, I’d love to chat.',
  'contact.email': 'Send an email',

  'nav.home': 'Predrag, home',
  'nav.aria': 'Main navigation',
  'hero.tech': 'Technologies',
  'gal.open': 'Open full size',
  'lb.label': 'Gallery',
  'lb.close': 'Close',
  'lb.prev': 'Previous',
  'lb.next': 'Next',
};

(() => {
  const root = document.documentElement;
  root.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };

  /* ---------- Contact links ---------- */
  const contactBox = document.getElementById('contact-links');
  const contactDefs = [
    { key: 'email', href: v => `mailto:${v}`, icon: 'i-mail', label: 'Pošalji email', i18n: 'contact.email', primary: true },
    { key: 'phone', href: v => `tel:${v.replace(/[^+\d]/g, '')}`, icon: 'i-phone', label: v => v },
    { key: 'linkedin', href: v => v, icon: 'i-linkedin', label: 'LinkedIn' },
    { key: 'github', href: v => v, icon: 'i-github', label: 'GitHub' },
    { key: 'itch', href: v => v, icon: 'i-link', label: 'itch.io' },
  ];
  contactDefs.forEach(d => {
    const value = (CONTACT[d.key] || '').trim();
    if (!value) return;
    const a = document.createElement('a');
    a.className = `btn ${d.primary ? 'btn-primary' : 'btn-ghost'}`;
    const href = d.href(value);
    a.href = href;
    if (!/^(mailto|tel):/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
    a.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#${d.icon}"/></svg><span${d.i18n ? ` data-i18n="${d.i18n}"` : ''}></span>`;
    a.querySelector('span').textContent = typeof d.label === 'function' ? d.label(value) : d.label;
    contactBox.appendChild(a);
  });

  /* ---------- i18n ---------- */
  const ME = {};
  document.querySelectorAll('[data-i18n]').forEach(el => { ME[el.dataset.i18n] = el.innerHTML; });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { ME[`aria:${el.dataset.i18nAria}`] = el.getAttribute('aria-label'); });

  const langButtons = document.querySelectorAll('[data-lang]');

  function setLang(lang) {
    const en = lang === 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      const v = en ? EN[k] : ME[k];
      if (v != null && el.innerHTML !== v) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const k = el.dataset.i18nAria;
      const v = en ? EN[k] : ME[`aria:${k}`];
      if (v != null) el.setAttribute('aria-label', v);
    });
    root.lang = en ? 'en' : 'sr-Latn-ME';
    langButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }

  const params = new URLSearchParams(location.search);
  const browserLocal = /^(sr|hr|bs|me|cnr|sh)\b/i.test(navigator.language || '');
  let lang = params.get('lang') || store.get('lang') || (browserLocal ? 'me' : 'en');
  if (lang !== 'en' && lang !== 'me') lang = 'me';
  setLang(lang);

  langButtons.forEach(b => b.addEventListener('click', () => {
    lang = b.dataset.lang;
    store.set('lang', lang);
    setLang(lang);
  }));

  /* ---------- Nav state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const navLinks = [...document.querySelectorAll('.nav-links a')];
  if ('IntersectionObserver' in window) {
    const sectionIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === `#${e.target.id}`)));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(a => {
      const s = document.querySelector(a.getAttribute('href'));
      if (s) sectionIO.observe(s);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.06 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById('lightbox');
  const lbStage = lb.querySelector('.lb-stage');
  const lbImg = lbStage.querySelector('img');
  const lbVid = lbStage.querySelector('video');
  const lbCap = lbStage.querySelector('.lb-caption');
  const lbPrev = lb.querySelector('.lb-prev');
  const lbNext = lb.querySelector('.lb-next');
  let lbItems = [];
  let lbIndex = 0;

  function lbRender() {
    const it = lbItems[lbIndex];
    const isVideo = it.type === 'video';
    lbImg.hidden = isVideo;
    lbVid.hidden = !isVideo;
    if (isVideo) {
      if (lbVid.getAttribute('src') !== it.src) lbVid.src = it.src;
      lbVid.poster = it.poster || '';
      lbVid.play().catch(() => {});
    } else {
      lbVid.pause();
      lbImg.src = it.src;
      lbImg.alt = it.alt;
    }
    lbCap.textContent = lbItems.length > 1 ? `${it.alt} (${lbIndex + 1} / ${lbItems.length})` : it.alt;
    lbPrev.hidden = lbNext.hidden = lbItems.length < 2;
  }

  function lbOpen(items, index) {
    lbItems = items;
    lbIndex = index;
    lbRender();
    if (!lb.open) lb.showModal();
    root.classList.add('has-modal');
  }

  const lbStep = d => { lbIndex = (lbIndex + d + lbItems.length) % lbItems.length; lbRender(); };

  lbPrev.addEventListener('click', () => lbStep(-1));
  lbNext.addEventListener('click', () => lbStep(1));
  lb.querySelector('.lb-close').addEventListener('click', () => lb.close());
  lb.addEventListener('close', () => { lbVid.pause(); root.classList.remove('has-modal'); });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') lbStep(-1);
    if (e.key === 'ArrowRight') lbStep(1);
  });
  lb.addEventListener('click', e => { if (e.target === lb || e.target === lbStage) lb.close(); });

  let swipeX = null;
  lbStage.addEventListener('pointerdown', e => { swipeX = e.target === lbVid ? null : e.clientX; });
  lbStage.addEventListener('pointerup', e => {
    if (swipeX == null) return;
    const dx = e.clientX - swipeX;
    swipeX = null;
    if (Math.abs(dx) > 50 && lbItems.length > 1) lbStep(dx < 0 ? 1 : -1);
  });

  /* ---------- Galleries ---------- */
  const toItem = b => ({ type: b.dataset.type || 'image', src: b.dataset.src, alt: b.dataset.alt || '', poster: b.dataset.poster });

  document.querySelectorAll('[data-gallery]').forEach(g => {
    const buttons = [...g.querySelectorAll('[data-src]')];
    const items = buttons.map(toItem);

    // Phone-style gallery: every screen opens the lightbox directly.
    if (g.dataset.gallery === 'phones') {
      buttons.forEach((b, i) => b.addEventListener('click', () => lbOpen(items, i)));
      return;
    }

    const main = g.querySelector('.gallery-main');
    const img = main.querySelector('img');
    let vid = null;
    let index = 0;
    let inView = !('IntersectionObserver' in window);

    const playIfVisible = () => {
      if (!vid || vid.hidden) return;
      if (inView && !reduceMotion) vid.play().catch(() => {});
      else vid.pause();
    };

    function show(i) {
      index = i;
      const it = items[i];
      buttons.forEach((b, j) => {
        b.classList.toggle('is-active', j === i);
        b.setAttribute('aria-pressed', String(j === i));
      });

      if (it.type === 'video') {
        if (!vid) {
          vid = document.createElement('video');
          vid.muted = true; vid.loop = true; vid.playsInline = true;
          vid.setAttribute('muted', ''); vid.setAttribute('playsinline', '');
          main.insertBefore(vid, img.nextSibling);
        }
        if (vid.getAttribute('src') !== it.src) vid.src = it.src;
        if (it.poster) vid.poster = it.poster;
        img.hidden = true;
        vid.hidden = false;
        playIfVisible();
        return;
      }

      if (vid) { vid.pause(); vid.hidden = true; }
      img.hidden = false;
      if (img.getAttribute('src') === it.src) return;
      img.classList.add('is-loading');
      const pre = new Image();
      pre.onload = pre.onerror = () => {
        if (index !== i) return;
        img.src = it.src;
        img.alt = it.alt;
        img.classList.remove('is-loading');
      };
      pre.src = it.src;
    }

    buttons.forEach((b, i) => {
      b.addEventListener('click', () => show(i));
      // Warm the cache so swapping feels instant.
      b.addEventListener('pointerenter', () => { if (items[i].type === 'image') new Image().src = items[i].src; }, { once: true });
    });
    main.querySelector('.gallery-open').addEventListener('click', () => {
      if (vid && !vid.hidden) vid.pause();
      lbOpen(items, index);
    });
    lb.addEventListener('close', playIfVisible);

    if (items.some(it => it.type === 'video') && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { inView = e.isIntersecting; playIfVisible(); }, { threshold: 0.35 }).observe(main);
    }

    show(0);
  });

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
