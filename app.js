(() => {
  'use strict';

  // Colombian presidential terms run four years, 7 August to 7 August.
  // Colombia is UTC−5 all year (no daylight saving), so a fixed offset is safe.
  const TZ = 'America/Bogota';
  const UTC_OFFSET_HOURS = 5;
  const TERM_START = new Date(Date.UTC(2026, 7, 7, UTC_OFFSET_HOURS));
  const TERM_END = new Date(Date.UTC(2030, 7, 7, UTC_OFFSET_HOURS));
  const DIAL_MAX = { h: 24, m: 60, s: 60 };

  // What the caricature says, in turn. Kept in Spanish in both languages: they're quotes.
  const LINES = ['¡Firme por la patria!', '¡Miau!', 'El gato más grande de la patria'];

  const STRINGS = {
    es: {
      locale: 'es-CO',
      docTitle: 'Cuenta regresiva: fin del mandato presidencial',
      eyebrow: (date) => `Fin del mandato presidencial\u00a0· ${date}`,
      days: (d, n) => (d === 1 ? 'Falta 1 día' : `Faltan ${n} días`),
      tail: 'para que termine este gobierno.',
      doneHeadline: 'Se acabó',
      doneTail: 'Este gobierno ya terminó.',
      units: {
        h: ['hora', 'horas'],
        m: ['minuto', 'minutos'],
        s: ['segundo', 'segundos'],
      },
      loading: 'Cargando el fin de este gobierno…',
      loaded: 'Fin del gobierno: cargado',
    },
    en: {
      locale: 'en-GB',
      docTitle: 'Countdown to the end of the presidential term',
      eyebrow: (date) => `End of the presidential term\u00a0· ${date}`,
      days: (d, n) => (d === 1 ? '1 day' : `${n} days`),
      tail: 'until this presidency ends.',
      doneHeadline: 'It’s over',
      doneTail: 'This presidency has ended.',
      units: {
        h: ['hour', 'hours'],
        m: ['minute', 'minutes'],
        s: ['second', 'seconds'],
      },
      loading: 'Loading the end of this presidency…',
      loaded: 'End of presidency: loaded',
    },
  };

  function split(ms) {
    let s = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(s / 86400);
    s -= d * 86400;
    const h = Math.floor(s / 3600);
    s -= h * 3600;
    const m = Math.floor(s / 60);
    s -= m * 60;
    return { d, h, m, s };
  }

  // ---- Rendering ----

  const $ = (sel) => document.querySelector(sel);
  const setText = (el, value) => {
    if (el.textContent !== value) el.textContent = value;
  };
  const dials = [...document.querySelectorAll('.dial')].map((el) => ({
    el,
    unit: el.dataset.unit,
    num: el.querySelector('.dial__num'),
    label: el.querySelector('.dial__label'),
  }));

  let lang = pickLang();
  let builtLang = '';
  let fmt = {};
  const t = () => STRINGS[lang];

  function pickLang() {
    try {
      const saved = localStorage.getItem('lang');
      if (saved && STRINGS[saved]) return saved;
    } catch (_) { /* storage unavailable */ }
    return (navigator.language || '').toLowerCase().startsWith('es') ? 'es' : 'en';
  }

  function build() {
    const s = t();
    fmt = {
      int: new Intl.NumberFormat(s.locale),
      // Six decimals, so you can watch it crawl.
      pct: new Intl.NumberFormat(s.locale, { style: 'percent', minimumFractionDigits: 6, maximumFractionDigits: 6 }),
      date: new Intl.DateTimeFormat(s.locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }),
    };
    document.documentElement.lang = lang;
    document.title = s.docTitle;
    $('#eyebrow').textContent = s.eyebrow(fmt.date.format(TERM_END));
    document.querySelectorAll('.lang button').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    builtLang = lang;
  }

  function render() {
    if (lang !== builtLang) build();
    const s = t();
    const now = Date.now();
    const done = now >= TERM_END;
    const p = split(TERM_END - now);

    setText($('#headline'), done ? s.doneHeadline : s.days(p.d, fmt.int.format(p.d)));
    setText($('#tail'), done ? s.doneTail : s.tail);

    for (const dial of dials) {
      const v = p[dial.unit];
      setText(dial.num, String(v).padStart(2, '0'));
      setText(dial.label, s.units[dial.unit][v === 1 ? 0 : 1]);
      dial.el.style.setProperty('--p', `${(v / DIAL_MAX[dial.unit]) * 100}%`);
    }

    const share = Math.min(1, Math.max(0, (now - TERM_START) / (TERM_END - TERM_START)));
    $('#loader').style.setProperty('--pct', `${share * 100}%`);
    $('#track').setAttribute('aria-valuenow', (share * 100).toFixed(2));
    setText($('#pct'), fmt.pct.format(share));
    setText($('#loader-label'), done ? s.loaded : s.loading);
    $('#walker').classList.toggle('is-late', share > 0.65);
  }

  // Swap the line each time the bubble's pop animation loops (it's invisible at that moment).
  // With reduced motion there's no animation, so a timer swaps it instead.
  function startBubble() {
    const text = $('#bubble-text');
    let i = 0;
    const next = () => {
      i = (i + 1) % LINES.length;
      text.textContent = LINES[i];
    };
    text.textContent = LINES[0];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(next, 4000);
    else $('#bubble').addEventListener('animationiteration', next);
  }

  // Tick on each second boundary so the seconds change in step with the clock.
  function loop() {
    render();
    setTimeout(loop, 1000 - (Date.now() % 1000) + 5);
  }

  document.querySelector('.lang').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-lang]');
    if (!btn || btn.dataset.lang === lang) return;
    lang = btn.dataset.lang;
    try { localStorage.setItem('lang', lang); } catch (_) { /* ignore */ }
    render();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) render();
  });

  startBubble();
  loop();
})();
