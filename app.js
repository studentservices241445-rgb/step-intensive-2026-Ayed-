/* Ayed STEP Intensive 2026 - Front-end helpers (no server, GitHub Pages ready) */

const AYED = window.AYED || (window.AYED = {});

AYED.config = {
  telegramUsername: 'Ayed_Academy_2026',
  discountPrice: 349,
  officialPrice: 599,
  discountDeadlineISO: '2026-01-29T23:59:59+03:00',
  initialSeats: 33,
};

// --------- Utilities
const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function format2(n){return String(n).padStart(2,'0');}

function nowMs(){return Date.now();}

function safeLocalGet(key, fallback){
  try{ const v = localStorage.getItem(key); return v===null? fallback : v; }catch(_){ return fallback; }
}
function safeLocalSet(key, val){
  try{ localStorage.setItem(key, val); }catch(_){ /* noop */ }
}

function toast(message, kind='info'){
  const host = qs('#toasts');
  if(!host) return;
  const t = document.createElement('div');
  t.className = `toast ${kind}`;
  t.innerHTML = `<div class="txt">${message}</div><button class="x" aria-label="إغلاق">✕</button>`;
  host.appendChild(t);
  const rm = ()=>{ t.classList.add('out'); setTimeout(()=>t.remove(), 240); };
  qs('.x', t).addEventListener('click', rm);
  setTimeout(rm, 5200);
}

// --------- Navbar
function initNavbar(){
  const burger = qs('[data-nav-toggle]') || qs('#burger') || qs('#navToggle');
  const nav = qs('[data-nav]') || qs('#navLinks') || qs('#nav');
  if(burger && nav){
    burger.addEventListener('click', ()=> nav.classList.toggle('open'));
    qsa('a', nav).forEach(a=>a.addEventListener('click', ()=> nav.classList.remove('open')));
  }

  // active link
  const path = location.pathname.split('/').pop() || 'index.html';
  const candidates = nav ? qsa('a', nav) : qsa('a[data-page]');
  candidates.forEach(a=>{
    const href = a.getAttribute('href') || '';
    if(href.endsWith(path)){ a.classList.add('active'); }
    if(a.getAttribute('data-page') === path){ a.classList.add('active'); }
  });
}

// --------- Seats counter (local simulation)
function getSeats(){
  const key = 'ayed_seats_v3';
  const stored = parseInt(safeLocalGet(key, ''), 10);
  let seats = Number.isFinite(stored) ? stored : AYED.config.initialSeats;
  seats = clamp(seats, 0, 999);
  return seats;
}
function setSeats(n){
  safeLocalSet('ayed_seats_v3', String(clamp(n,0,999)));
}

function maybeTickSeats(){
  const keyLast = 'ayed_seats_lastTick_v3';
  const last = parseInt(safeLocalGet(keyLast, '0'), 10);
  const elapsed = nowMs() - (Number.isFinite(last) ? last : 0);
  // Tick at most once every 3 hours per browser
  if(elapsed < 3*60*60*1000) return;

  let seats = getSeats();
  // Randomly decrement 0..2 seats with a soft probability
  const r = Math.random();
  let dec = 0;
  if(r < 0.55) dec = 0;
  else if(r < 0.90) dec = 1;
  else dec = 2;
  if(seats > 0){ seats = Math.max(0, seats - dec); }
  setSeats(seats);
  safeLocalSet(keyLast, String(nowMs()));

  // If almost full, optionally add extra seats once
  const expandedKey = 'ayed_seats_expanded_v3';
  const expanded = safeLocalGet(expandedKey, '0') === '1';
  if(seats <= 3 && !expanded){
    // Add after a short delay to feel like “تحديث”
    setTimeout(()=>{
      let s = getSeats();
      if(s <= 3){
        const add = (Math.random() < 0.55) ? 10 : 20;
        setSeats(s + add);
        safeLocalSet(expandedKey, '1');
        toast(`تم فتح ${add} مقعد إضافي لكثرة الطلب ✅`, 'good');
        renderSeats();
      }
    }, 12000 + Math.random()*8000);
  }
}

function seatsColor(seats){
  if(seats >= 18) return 'var(--ok)';
  if(seats >= 8) return 'var(--warn)';
  return 'var(--bad)';
}

function renderSeats(){
  const seats = getSeats();
  qsa('[data-seats]').forEach(el=>{
    el.textContent = String(seats);
    el.style.setProperty('--seatColor', seatsColor(seats));
  });
}

// --------- Countdown
function parseDeadline(){
  // Using ISO with +03:00; JS Date parses it reliably.
  return new Date(AYED.config.discountDeadlineISO);
}

function renderCountdown(){
  const el = qs('[data-countdown]');
  if(!el) return;

  const deadline = parseDeadline();
  const tick = ()=>{
    const diff = deadline.getTime() - Date.now();
    if(diff <= 0){
      el.textContent = 'انتهى وقت الدفعة الحالية';
      el.classList.add('ended');
      return;
    }
    const s = Math.floor(diff/1000);
    const d = Math.floor(s/86400);
    const h = Math.floor((s%86400)/3600);
    const m = Math.floor((s%3600)/60);
    const ss = s%60;
    el.textContent = `${d} يوم • ${format2(h)}:${format2(m)}:${format2(ss)}`;
  };
  tick();
  setInterval(tick, 1000);
}

// --------- Ticker (top news bar)
function initTicker(){
  const bar = qs('[data-ticker]') || qs('#ticker') || qs('#tickerText');
  if(!bar) return;
  const items = window.AYED_TICKER || [];
  if(!items.length) return;

  let i = 0;
  const set = ()=>{
    const msg = items[i % items.length];
    const textNode = bar.querySelector?.('.tickerText') || bar.querySelector?.('.ticker-text');
    if(textNode){
      textNode.textContent = msg;
    }else{
      bar.textContent = msg;
    }
    i++;
  };
  set();
  setInterval(set, 9000);
}

// --------- Toast notifications (social proof)
function initToasts(){
  const list = window.AYED_TOASTS || [];
  if(!list.length) return;
  // Start after a short pause
  setTimeout(()=>{
    const show = ()=>{
      const item = list[Math.floor(Math.random()*list.length)];
      toast(item, 'good');
      // Next in 7-14 seconds
      setTimeout(show, 7000 + Math.random()*7000);
    };
    show();
  }, 3200);
}

// --------- Copy buttons
function initCopyButtons(){
  qsa('[data-copy]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const sel = btn.getAttribute('data-copy');
      const target = qs(sel);
      if(!target) return;
      const text = (target.value ?? target.textContent ?? '').trim();
      try{
        await navigator.clipboard.writeText(text);
        btn.classList.add('copied');
        toast('تم النسخ ✅', 'good');
        setTimeout(()=>btn.classList.remove('copied'), 900);
      }catch(_){
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        toast('تم النسخ ✅', 'good');
      }
    });
  });
}

// --------- Assistant widget
function initAssistant(){
  const btn = qs('#assistantBtn');
  const modal = qs('#assistantModal');
  if(!btn || !modal) return;

  const close = ()=> modal.classList.remove('open');
  btn.addEventListener('click', ()=> modal.classList.add('open'));
  qsa('[data-close-assistant]').forEach(x=>x.addEventListener('click', close));
  modal.addEventListener('click', (e)=>{ if(e.target === modal) close(); });

  // quick chips
  qsa('[data-chip]').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const answer = chip.getAttribute('data-answer') || '';
      const box = qs('#assistantAnswer');
      if(box){
        box.innerHTML = answer;
        box.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });
}

// --------- Guard: force test before registration
function guardRegistration(){
  const mustGuard = document.body.getAttribute('data-guard') === 'test';
  if(!mustGuard) return;
  const has = safeLocalGet('ayed_test_result_v3', '') !== '';
  if(!has){
    toast('قبل التسجيل: أكمل اختبار تحديد المستوى أول ✅', 'warn');
    setTimeout(()=> location.href = 'level-test.html', 900);
  }
}

// --------- Init
document.addEventListener('DOMContentLoaded', ()=>{
  initNavbar();
  initTicker();
  maybeTickSeats();
  renderSeats();
  renderCountdown();
  initToasts();
  initCopyButtons();
  initAssistant();
  guardRegistration();
});
