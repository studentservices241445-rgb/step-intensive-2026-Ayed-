(async function () {
  const mount = document.getElementById('testApp');
  if (!mount) return;

  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  const cfg = window.AYED?.config || { discountPrice: 349, officialPrice: 599, resultKey: 'ayed_test_result_v4' };
  const storageKey = 'ayed_test_state_v4';

  const defaultProfile = {
    examWindow: '',
    examDate: '',
    triedBefore: 'no',
    prevScore: '',
    targetScore: '83+',
    level: 'متوسط',
    weakSection: 'reading',
    dailyTime: '1-2',
    region: '',
    notes: ''
  };

  const safeLocalGet = (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (_) {
      return fallback;
    }
  };

  const safeLocalSet = (key, val) => {
    try {
      localStorage.setItem(key, val);
    } catch (_) {
      // ignore
    }
  };

  let bank;
  try {
    const res = await fetch('questions.json', { cache: 'no-store' });
    bank = await res.json();
  } catch (e) {
    mount.innerHTML = `
      <section class="wrap section">
        <div class="card">
          <h2>نواجه صعوبة مؤقتة في تحميل الأسئلة</h2>
          <p class="muted">حدّث الصفحة أو حاول مرة أخرى بعد لحظات.</p>
        </div>
      </section>
    `;
    return;
  }

  const state = {
    step: 1,
    profile: { ...defaultProfile },
    picked: [],
    answers: {},
    currentIndex: 0
  };

  const saved = safeLocalGet(storageKey, '');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.picked && parsed.answers) {
        Object.assign(state, parsed);
      }
    } catch (_) {
      // ignore
    }
  }

  const bySection = (s) => bank.filter((q) => q.section === s);

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickQuestions() {
    const g = shuffle(bySection('grammar')).slice(0, 8);
    const r = shuffle(bySection('reading')).slice(0, 7);
    const l = shuffle(bySection('listening')).slice(0, 5);
    state.picked = [...g, ...r, ...l];
  }

  function persist() {
    safeLocalSet(storageKey, JSON.stringify(state));
  }

  function h(str) {
    return String(str).replace(/[&<>"']/g, (s) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[s]));
  }

  function render() {
    if (state.step === 1) return renderIntro();
    if (state.step === 2) return renderQuiz();
    return renderResult();
  }

  function renderIntro() {
    const hasResume = state.step === 2 && state.picked.length > 0;

    mount.innerHTML = `
      <section class="wrap section">
        <div class="kicker">اختبار تحديد المستوى</div>
        <h1>خطوة واحدة تفصل بينك وبين خطة مذاكرة دقيقة</h1>
        <p class="muted">أجب على أسئلة قصيرة، وسنقدّم لك تحليلًا واضحًا لنقاط القوة والضعف، مع خطة تناسب وقت اختبارك.</p>

        <div class="grid-2">
          <div class="card">
            <h3>معلومات سريعة عنك</h3>
            <div class="cols-2">
              <div class="field">
                <label>كم باقي على اختبارك؟</label>
                <select id="examWindow">
                  <option value="">اختر</option>
                  <option value="7">خلال 7 أيام</option>
                  <option value="14">8 - 14 يوم</option>
                  <option value="30">15 - 30 يوم</option>
                  <option value="31">أكثر من 30 يوم</option>
                  <option value="0">مو محدد / لسه ما حجزت</option>
                </select>
              </div>
              <div class="field">
                <label>موعد اختبارك (اختياري)</label>
                <input id="examDate" type="date" />
              </div>
              <div class="field">
                <label>هل سبق اختبرت STEP؟</label>
                <select id="triedBefore">
                  <option value="no">لا</option>
                  <option value="yes">نعم</option>
                </select>
              </div>
              <div class="field">
                <label>إذا نعم: درجتك السابقة (اختياري)</label>
                <input id="prevScore" inputmode="numeric" placeholder="67" />
              </div>
              <div class="field">
                <label>هدفك</label>
                <select id="targetScore">
                  <option>70+</option>
                  <option>75+</option>
                  <option selected>83+</option>
                  <option>90+</option>
                </select>
              </div>
              <div class="field">
                <label>مستواك الحالي (تقديري)</label>
                <select id="level">
                  <option>ضعيف</option>
                  <option selected>متوسط</option>
                  <option>جيد</option>
                  <option>ممتاز</option>
                </select>
              </div>
              <div class="field">
                <label>أكثر قسم متعبك</label>
                <select id="weakSection">
                  <option value="grammar">Grammar</option>
                  <option value="reading" selected>Reading</option>
                  <option value="listening">Listening</option>
                </select>
              </div>
              <div class="field">
                <label>وقت مذاكرتك اليومي (تقريبي)</label>
                <select id="dailyTime">
                  <option value="0-1">أقل من ساعة</option>
                  <option value="1-2" selected>ساعة إلى ساعتين</option>
                  <option value="2-3">ساعتين إلى 3 ساعات</option>
                  <option value="3+">أكثر من 3 ساعات</option>
                </select>
              </div>
              <div class="field">
                <label>منطقة الاختبار (اختياري)</label>
                <select id="region">
                  <option value="">—</option>
                  <option>الرياض</option>
                  <option>جدة</option>
                  <option>الشرقية</option>
                  <option>المدينة</option>
                  <option>مكة</option>
                  <option>القصيم</option>
                  <option>أبها</option>
                  <option>تبوك</option>
                  <option>أخرى</option>
                </select>
              </div>
              <div class="field">
                <label>ملاحظات (اختياري)</label>
                <input id="notes" placeholder="وقتي ضيق وأحتاج خطة مركزة" />
              </div>
            </div>
          </div>

          <div class="card">
            <h3>الاختبار التشخيصي</h3>
            <p class="muted">20 سؤالًا قصيرة، سؤال واحد في كل مرة مع حفظ تلقائي لتقدّمك.</p>
            <div class="alert">بعد انتهاء الاختبار تظهر لك النتيجة والخطة والسعر المخفّض بشكل واضح.</div>
            <div class="cta-row">
              <button id="startBtn" class="btn btn-gold">ابدأ الاختبار</button>
              ${hasResume ? '<button id="resumeBtn" class="btn">متابعة الاختبار المحفوظ</button>' : ''}
              <a class="btn btn-ghost" href="course-content.html">تعرّف على محتوى الدورة</a>
            </div>
          </div>
        </div>
      </section>
    `;

    const bind = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = state.profile[key] || '';
      el.addEventListener('input', () => {
        state.profile[key] = el.value;
        persist();
      });
      el.addEventListener('change', () => {
        state.profile[key] = el.value;
        persist();
      });
    };

    bind('examWindow', 'examWindow');
    bind('examDate', 'examDate');
    bind('triedBefore', 'triedBefore');
    bind('prevScore', 'prevScore');
    bind('targetScore', 'targetScore');
    bind('level', 'level');
    bind('weakSection', 'weakSection');
    bind('dailyTime', 'dailyTime');
    bind('region', 'region');
    bind('notes', 'notes');

    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', () => {
      if (!state.profile.examWindow) {
        window.AYED?.toast?.('اختر المدة المتبقية حتى نحسب الخطة بدقة.');
        document.getElementById('examWindow')?.focus();
        return;
      }
      pickQuestions();
      state.answers = {};
      state.currentIndex = 0;
      state.step = 2;
      persist();
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const resumeBtn = document.getElementById('resumeBtn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        state.step = 2;
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  function renderQuiz() {
    if (!state.picked.length) {
      pickQuestions();
    }

    const total = state.picked.length;
    const current = state.currentIndex;
    const q = state.picked[current];
    const chosen = state.answers[q.id];
    const tag = q.section === 'grammar' ? 'Grammar' : q.section === 'reading' ? 'Reading' : 'Listening';

    const shared = q.passage
      ? `<div class="details"><b>Passage</b><div class="muted" style="margin-top:6px; white-space:pre-wrap">${h(q.passage)}</div></div>`
      : q.dialog
        ? `<div class="details"><b>Dialogue</b><div class="muted" style="margin-top:6px; white-space:pre-wrap">${h(q.dialog)}</div></div>`
        : '';

    mount.innerHTML = `
      <section class="wrap section">
        <div class="test-shell">
          <div class="progress-wrap">
            <div class="progress"><i style="width:${((current + 1) / total) * 100}%"></i></div>
            <div class="muted">${current + 1} / ${total}</div>
          </div>

          <div class="question-card">
            <div class="question-meta">
              <span>${tag}</span>
              <span>سؤال ${current + 1} من ${total}</span>
            </div>
            ${shared}
            <div class="q-prompt">${h(q.prompt)}</div>
            <div class="option-list">
              ${q.options.map((opt, idx) => `
                <label class="option ${chosen === idx ? 'selected' : ''}">
                  <input type="radio" name="q_${q.id}" value="${idx}" ${chosen === idx ? 'checked' : ''} />
                  <span>${h(opt)}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="cta-row">
            <button id="prevBtn" class="btn" ${current === 0 ? 'disabled' : ''}>السابق</button>
            <button id="nextBtn" class="btn btn-gold">${current === total - 1 ? 'عرض النتيجة' : 'التالي'}</button>
          </div>
          <div class="muted">لن تتمكن من الانتقال للسؤال التالي قبل اختيار إجابة.</div>
        </div>
      </section>
    `;

    qsa('input[type="radio"]', mount).forEach((input) => {
      input.addEventListener('change', (e) => {
        const id = Number(e.target.name.split('_')[1]);
        state.answers[id] = Number(e.target.value);
        persist();
        renderQuiz();
      });
    });

    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (state.currentIndex > 0) {
          state.currentIndex -= 1;
          persist();
          renderQuiz();
        }
      });
    }

    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (state.answers[q.id] === undefined) {
          window.AYED?.toast?.('اختر إجابة قبل المتابعة.');
          return;
        }
        if (state.currentIndex < total - 1) {
          state.currentIndex += 1;
          persist();
          renderQuiz();
        } else {
          state.step = 3;
          persist();
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  function score() {
    const picked = state.picked;
    let correct = 0;
    const per = { grammar: { c: 0, t: 0 }, reading: { c: 0, t: 0 }, listening: { c: 0, t: 0 } };
    const wrong = [];

    for (const q of picked) {
      const ans = state.answers[q.id];
      const isCorrect = ans === q.answer;
      if (isCorrect) correct += 1;
      per[q.section].t += 1;
      if (isCorrect) per[q.section].c += 1;
      if (!isCorrect) wrong.push({ q, chosen: ans });
    }

    const overall = Math.round((correct / picked.length) * 100);
    const breakdown = {
      grammar: Math.round((per.grammar.c / (per.grammar.t || 1)) * 100),
      reading: Math.round((per.reading.c / (per.reading.t || 1)) * 100),
      listening: Math.round((per.listening.c / (per.listening.t || 1)) * 100)
    };
    return { overall, breakdown, wrong, correct, total: picked.length };
  }

  function labelFor(pct) {
    if (pct >= 80) return { title: 'مستواك قوي', desc: 'ركز على تصحيح الأخطاء الدقيقة وتثبيت الاستراتيجيات.' };
    if (pct >= 65) return { title: 'تقدم ممتاز', desc: 'أنت قريب من هدفك. ركّز على القسم الأضعف مع نماذج مركزة.' };
    if (pct >= 50) return { title: 'مستوى جيد', desc: 'تحتاج خطة مركزة وثبات يومي لتقوية الأساسيات.' };
    return { title: 'بحاجة لتأسيس', desc: 'الخبر الجيد: التأسيس الصحيح يرفع النتيجة بسرعة مع خطة واضحة.' };
  }

  function genPlan(breakdown) {
    const w = Number(state.profile.examWindow);
    const weakOrder = Object.entries(breakdown).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
    const weakest = weakOrder[0];
    const second = weakOrder[1];

    const timeText = {
      '0-1': 'أقل من ساعة',
      '1-2': 'ساعة إلى ساعتين',
      '2-3': 'ساعتين إلى 3 ساعات',
      '3+': 'أكثر من 3 ساعات'
    }[state.profile.dailyTime] || 'ساعة إلى ساعتين';

    const blocks = {
      grammar: 'Grammar (القواعد)',
      reading: 'Reading (القراءة)',
      listening: 'Listening (الاستماع)'
    };

    const focus = (s) => blocks[s] || s;

    const common = [
      `وقت المذاكرة اليومي: <b>${timeText}</b>.`,
      `ابدأ دائمًا بـ <b>${focus(weakest)}</b> لأنه القسم الأضعف حسب نتيجتك.`,
      'خصص آخر 15 دقيقة لمراجعة الأخطاء وفهم السبب.'
    ];

    const plan = [];

    if (w === 7) {
      plan.push('<h3>خطة 7 أيام</h3>');
      plan.push('<ul class="list">' + [
        `<li><b>اليوم 1:</b> تأسيس سريع + تكنيكات ${focus(weakest)}.</li>`,
        `<li><b>اليوم 2:</b> نماذج مركزة ${focus(weakest)} + مراجعة أخطاء.</li>`,
        `<li><b>اليوم 3:</b> تأسيس واستراتيجيات ${focus(second)}.</li>`,
        '<li><b>اليوم 4:</b> نماذج مختلطة + تثبيت القواعد الأساسية.</li>',
        '<li><b>اليوم 5:</b> Listening مكثف + كلمات متكررة.</li>',
        '<li><b>اليوم 6:</b> نموذج شامل + تحليل الأخطاء.</li>',
        '<li><b>اليوم 7:</b> مراجعة خفيفة + راحة ذهنية قبل الاختبار.</li>'
      ].join('') + '</ul>');
    } else if (w === 14) {
      plan.push('<h3>خطة 14 يوم</h3>');
      plan.push('<ul class="list">' + [
        `<li><b>الأيام 1-4:</b> تأسيس واستراتيجيات ${focus(weakest)} + نماذج يومية.</li>`,
        `<li><b>الأيام 5-8:</b> تأسيس ${focus(second)} + مراجعة أخطاء.</li>`,
        '<li><b>الأيام 9-11:</b> نماذج مختلطة + تثبيت القطع المتكررة.</li>',
        '<li><b>الأيام 12-13:</b> نموذج شامل + مراجعة مركزة.</li>',
        '<li><b>اليوم 14:</b> مراجعة خفيفة + تجهيز نهائي.</li>'
      ].join('') + '</ul>');
    } else if (w === 30) {
      plan.push('<h3>خطة 30 يوم</h3>');
      plan.push('<ul class="list">' + [
        `<li><b>الأسبوع 1:</b> تأسيس ${focus(weakest)}.</li>`,
        `<li><b>الأسبوع 2:</b> تأسيس ${focus(second)} + تدريبات.</li>`,
        '<li><b>الأسبوع 3:</b> نماذج مكثفة + مراجعة أخطاء.</li>',
        '<li><b>الأسبوع 4:</b> نماذج شاملة + تثبيت الاستراتيجيات.</li>'
      ].join('') + '</ul>');
    } else {
      plan.push('<h3>خطة مرنة</h3>');
      plan.push('<ul class="list">' + [
        '<li><b>المرحلة 1:</b> تأسيس القواعد والاستراتيجيات.</li>',
        '<li><b>المرحلة 2:</b> نماذج متعددة + مراجعة الأخطاء.</li>',
        '<li><b>المرحلة 3:</b> تثبيت النقاط المتكررة والاستعداد النهائي.</li>'
      ].join('') + '</ul>');
    }

    return `
      <div class="card">
        <h2>خطة مذاكرة مخصصة لك</h2>
        <p class="muted">${common.join('<br />')}</p>
        ${plan.join('')}
      </div>
    `;
  }

  function renderResult() {
    const s = score();
    const label = labelFor(s.overall);

    const bars = (name, pct) => `
      <div class="bar-row">
        <div>${name}</div>
        <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
        <div>${pct}%</div>
      </div>
    `;

    const wrongList = s.wrong.slice(0, 6).map((w, idx) => {
      const q = w.q;
      const chosenTxt = w.chosen === undefined ? '—' : q.options[w.chosen];
      const correctTxt = q.options[q.answer];
      const shared = q.passage
        ? `<details class="details"><summary>Passage</summary><div class="muted" style="white-space:pre-wrap">${h(q.passage)}</div></details>`
        : q.dialog
          ? `<details class="details"><summary>Dialogue</summary><div class="muted" style="white-space:pre-wrap">${h(q.dialog)}</div></details>`
          : '';

      return `
        <div class="card">
          <div class="muted">خطأ ${idx + 1}</div>
          ${shared}
          <div class="q-prompt">${h(q.prompt)}</div>
          <div class="muted"><b>إجابتك:</b> ${h(chosenTxt)} | <b>الصحيح:</b> ${h(correctTxt)}</div>
          <div class="muted">${h(q.explanation)}</div>
        </div>
      `;
    }).join('');

    const plan = genPlan(s.breakdown);

    const resultPayload = {
      createdAt: new Date().toISOString(),
      profile: state.profile,
      score: s
    };
    safeLocalSet(cfg.resultKey || 'ayed_test_result_v4', JSON.stringify(resultPayload));

    mount.innerHTML = `
      <section class="wrap section">
        <div class="kicker">نتيجتك وخطتك</div>
        <h1>${label.title}</h1>
        <p class="muted">${label.desc}</p>

        <div class="grid-2">
          <div class="card">
            <h3>تحليل الأداء</h3>
            <div class="price-now">${s.overall}%</div>
            <p class="muted">إجابات صحيحة: ${s.correct} من ${s.total}</p>
            <div class="divider"></div>
            ${bars('Grammar', s.breakdown.grammar)}
            ${bars('Reading', s.breakdown.reading)}
            ${bars('Listening', s.breakdown.listening)}
          </div>
          <div class="card">
            <h3>الاشتراك بعد النتيجة</h3>
            <p class="muted">الاشتراك يمنحك مسارًا مرتبًا يشمل المحاضرات، الملفات، النماذج، والكويزات — بدون تشتت.</p>
            <div class="price-box">
              <div class="muted">السعر المخفض للدفعة الحالية</div>
              <div class="price-now">${cfg.discountPrice} ريال</div>
              <div class="muted">السعر الرسمي المرجعي: <b>${cfg.officialPrice} ريال</b></div>
            </div>
            <div class="cta-row">
              <a class="btn btn-gold" href="register.html">انتقل للتسجيل الآن</a>
              <a class="btn btn-ghost" href="course-content.html">تفاصيل المحتوى</a>
            </div>
          </div>
        </div>

        <div class="section">${plan}</div>

        <div class="section">
          <h2>أهم نقاط التحسين</h2>
          <p class="muted">عرضنا لك أكثر الأخطاء تأثيرًا لتكون مرجعًا واضحًا في المراجعة.</p>
          ${wrongList || '<div class="card"><p class="muted">أخطاءك قليلة جدًا، استمر على نفس النسق.</p></div>'}
        </div>

        <div class="section">
          <div class="card">
            <h3>الخطوة التالية</h3>
            <p class="muted">ابدأ بالخطة اليوم، وعندما تكون جاهزًا أكمل التسجيل بسهولة.</p>
            <div class="cta-row">
              <a class="btn" href="index.html">العودة للرئيسية</a>
              <a class="btn btn-gold" href="register.html">التسجيل</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  mount.innerHTML = render();
})();
