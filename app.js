const AYED = window.AYED || (window.AYED = {});

AYED.config = {
  telegramUsername: 'Ayed_Academy_2026',
  discountPrice: 349,
  officialPrice: 599,
  discountDeadlineISO: '2026-01-29T23:59:59+03:00',
  initialSeats: 33,
  resultKey: 'ayed_test_result_v4',
};

const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const nowMs = () => Date.now();

function safeLocalGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch (_) {
    return fallback;
  }
}

function safeLocalSet(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch (_) {
    // ignore
  }
}

function toast(message) {
  const host = qs('#toasts');
  if (!host) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<div class="toast-text">${message}</div>`;
  host.appendChild(t);
  setTimeout(() => t.remove(), 5200);
}

AYED.toast = toast;

function initNavbar() {
  const toggle = qs('[data-nav-toggle]');
  const nav = qs('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    qsa('a', nav).forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));
  }

  const path = location.pathname.split('/').pop() || 'index.html';
  qsa('[data-page]').forEach((link) => {
    if (link.getAttribute('data-page') === path) {
      link.classList.add('active');
    }
  });
}

function getSeats() {
  const key = 'ayed_seats_v4';
  const stored = parseInt(safeLocalGet(key, ''), 10);
  let seats = Number.isFinite(stored) ? stored : AYED.config.initialSeats;
  return clamp(seats, 0, 999);
}

function setSeats(n) {
  safeLocalSet('ayed_seats_v4', String(clamp(n, 0, 999)));
}

function seatsColor(seats) {
  if (seats >= 18) return 'var(--ok)';
  if (seats >= 8) return 'var(--warn)';
  return 'var(--bad)';
}

function renderSeats() {
  const seats = getSeats();
  qsa('[data-seats]').forEach((el) => {
    el.textContent = String(seats);
    el.style.setProperty('--seatColor', seatsColor(seats));
  });
}

function maybeTickSeats() {
  const keyLast = 'ayed_seats_lastTick_v4';
  const last = parseInt(safeLocalGet(keyLast, '0'), 10);
  const elapsed = nowMs() - (Number.isFinite(last) ? last : 0);
  if (elapsed < 3 * 60 * 60 * 1000) return;

  let seats = getSeats();
  const r = Math.random();
  let dec = 0;
  if (r < 0.6) dec = 0;
  else if (r < 0.9) dec = 1;
  else dec = 2;

  if (seats > 0) {
    seats = Math.max(0, seats - dec);
  }
  setSeats(seats);
  safeLocalSet(keyLast, String(nowMs()));

  const expandedKey = 'ayed_seats_expanded_v4';
  const expanded = safeLocalGet(expandedKey, '0') === '1';
  if (seats <= 3 && !expanded) {
    setTimeout(() => {
      let s = getSeats();
      if (s <= 3) {
        const add = Math.random() < 0.6 ? 12 : 18;
        setSeats(s + add);
        safeLocalSet(expandedKey, '1');
        toast('تمت إضافة مقاعد جديدة بسبب الإقبال المتزايد.');
        renderSeats();
      }
    }, 12000 + Math.random() * 6000);
  }
}

AYED.getSeats = getSeats;

function renderCountdown() {
  const el = qs('[data-countdown]');
  if (!el) return;
  const deadline = new Date(AYED.config.discountDeadlineISO);

  const tick = () => {
    const diff = deadline.getTime() - Date.now();
    if (diff <= 0) {
      el.textContent = 'تم إغلاق الدفعة الحالية';
      el.classList.add('ended');
      return;
    }
    const s = Math.floor(diff / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    el.textContent = `${d} يوم • ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  tick();
  setInterval(tick, 1000);
}

function initTicker() {
  const el = qs('[data-ticker]');
  if (!el) return;
  const items = window.AYED_TICKER || [];
  if (!items.length) return;

  let i = 0;
  const rotate = () => {
    el.textContent = items[i % items.length];
    i += 1;
    const delay = 5000 + Math.floor(Math.random() * 3000);
    setTimeout(rotate, delay);
  };
  rotate();
}

function initToasts() {
  const list = window.AYED_TOASTS || [];
  if (!list.length) return;

  setTimeout(() => {
    const show = () => {
      const item = list[Math.floor(Math.random() * list.length)];
      toast(item);
      setTimeout(show, 12000 + Math.random() * 6000);
    };
    show();
  }, 4000);
}

function initAssistant() {
  const btn = qs('#assistantBtn');
  const panel = qs('#assistantPanel');
  if (!btn || !panel) return;

  const close = () => panel.classList.remove('open');
  btn.addEventListener('click', () => panel.classList.add('open'));
  panel.addEventListener('click', (e) => {
    if (e.target === panel) close();
  });
  qsa('[data-close-assistant]').forEach((el) => el.addEventListener('click', close));

  qsa('[data-answer]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const answer = chip.getAttribute('data-answer');
      const box = qs('#assistantMessage');
      if (box && answer) {
        box.innerHTML = answer;
      }
    });
  });

  qsa('[data-jump]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const target = chip.getAttribute('data-jump');
      if (target) location.href = target;
    });
  });

  const updateRegisterState = () => {
    const hasResult = safeLocalGet(AYED.config.resultKey, '') !== '';
    qsa('.assistant-register').forEach((btnEl) => {
      if (hasResult) {
        btnEl.classList.remove('disabled');
        btnEl.setAttribute('aria-disabled', 'false');
      } else {
        btnEl.classList.add('disabled');
        btnEl.setAttribute('aria-disabled', 'true');
      }
    });
  };

  updateRegisterState();
  window.addEventListener('storage', updateRegisterState);
}

function guardRegistration() {
  const mustGuard = document.body.getAttribute('data-guard') === 'test';
  if (!mustGuard) return;
  const has = safeLocalGet(AYED.config.resultKey, '') !== '';
  if (!has) {
    toast('لإكمال التسجيل، ابدأ باختبار تحديد المستوى أولاً.');
    setTimeout(() => (location.href = 'level-test.html'), 1200);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTicker();
  maybeTickSeats();
  renderSeats();
  renderCountdown();
  initToasts();
  initAssistant();
  guardRegistration();
  // Register service worker and prompt PWA install
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  // Immediately show the install prompt
  e.prompt();
});

});
