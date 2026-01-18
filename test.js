/* Level test + personalized study plan + price reveal */

(async function(){
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));
  const mount = document.getElementById('testApp');
  if(!mount) return;

  const cfg = window.AYED?.config || {discountPrice:349, officialPrice:599};
  const BANK = {
    bank: 'بنك الإنماء',
    account: '68206067557000',
    iban: 'SA4905000068206067557000',
    beneficiary: 'مؤسسة كريتيفا جلوبال لتقنية المعلومات',
    purpose: 'مشتريات دورة STEP المكثفة'
  };

  let bank;
  try{
    const res = await fetch('questions.json', {cache: 'no-store'});
    bank = await res.json();
  }catch(e){
    mount.innerHTML = `<div class="container"><div class="card"><h2>تعذر تحميل أسئلة الاختبار</h2><p class="muted">تأكد إنك فتحت الصفحة من نفس رابط الموقع (GitHub Pages) وليس من ملف محلي.</p></div></div>`;
    return;
  }

  const state = {
    step: 1,
    profile: {
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
    },
    picked: [],
    answers: new Map(),
  };

  const bySection = (s)=> bank.filter(q=>q.section===s);

  function pickQuestions(){
    const g = shuffle(bySection('grammar')).slice(0, 8);
    const r = shuffle(bySection('reading')).slice(0, 7);
    const l = shuffle(bySection('listening')).slice(0, 5);
    state.picked = [...g,...r,...l];
  }

  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function h(str){
    if(str === undefined || str === null) return '';
    return String(str).replace(/[&<>"']/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[s]));
  }

  function render(){
    if(state.step===1) return renderIntro();
    if(state.step===2) return renderQuiz();
    if(state.step===3) return renderResult();
  }

  function renderIntro(){
    const html = `
      <div class="container">
        <div class="kicker"><span class="dot"></span><span>اختبار تحديد المستوى</span></div>
        <h1>خلّنا نطلع لك <span class="gold">خطة مذاكرة تناسبك</span> قبل التسجيل</h1>
        <p class="muted">الفكرة بسيطة: تجاوب أسئلة سريعة + اختبار قصير، وبنطلع لك نقاط ضعفك وخطة عملية. بعدها يظهر لك سعر الاشتراك وخطوات التفعيل.</p>

        <div class="grid cols-2">
          <div class="card">
            <h3>١) معلومات سريعة عنك</h3>
            <div class="grid cols-2">
              <div>
                <label>كم باقي على اختبارك؟</label>
                <select id="examWindow" class="input">
                  <option value="">اختر</option>
                  <option value="7">خلال 7 أيام</option>
                  <option value="14">8 - 14 يوم</option>
                  <option value="30">15 - 30 يوم</option>
                  <option value="31">أكثر من 30 يوم</option>
                  <option value="0">مو محدد / لسه ما حجزت</option>
                </select>
              </div>
              <div>
                <label>موعد اختبارك (اختياري)</label>
                <input id="examDate" class="input" type="date" />
              </div>
              <div>
                <label>هل سبق اختبرت STEP؟</label>
                <select id="triedBefore" class="input">
                  <option value="no">لا</option>
                  <option value="yes">نعم</option>
                </select>
              </div>
              <div>
                <label>إذا نعم: درجتك السابقة (اختياري)</label>
                <input id="prevScore" class="input" inputmode="numeric" placeholder="مثال: 67" />
              </div>
              <div>
                <label>هدفك</label>
                <select id="targetScore" class="input">
                  <option>70+</option>
                  <option>75+</option>
                  <option selected>83+</option>
                  <option>90+</option>
                </select>
              </div>
              <div>
                <label>مستواك الحالي (تقديري)</label>
                <select id="level" class="input">
                  <option>ضعيف</option>
                  <option selected>متوسط</option>
                  <option>جيد</option>
                  <option>ممتاز</option>
                </select>
              </div>
              <div>
                <label>أكثر قسم متعبك</label>
                <select id="weakSection" class="input">
                  <option value="grammar">Grammar</option>
                  <option value="reading" selected>Reading</option>
                  <option value="listening">Listening</option>
                </select>
              </div>
              <div>
                <label>وقت مذاكرتك اليومي (تقريبي)</label>
                <select id="dailyTime" class="input">
                  <option value="0-1">أقل من ساعة</option>
                  <option value="1-2" selected>ساعة إلى ساعتين</option>
                  <option value="2-3">ساعتين إلى 3 ساعات</option>
                  <option value="3+">أكثر من 3 ساعات</option>
                </select>
              </div>
              <div>
                <label>منطقة الاختبار (اختياري)</label>
                <select id="region" class="input">
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
              <div>
                <label>ملاحظات (اختياري)</label>
                <input id="notes" class="input" placeholder="مثال: وقتي ضيق + أتشتت من كثرة المصادر" />
              </div>
            </div>

            <div class="hr"></div>
            <p class="muted">ملاحظة: الهدف من الاختبار التشخيص فقط. ما فيه أي مشاركة لبياناتك، وكل شيء ينحفظ عندك في الجهاز (localStorage).</p>
          </div>

          <div class="card">
            <h3>٢) اختبار قصير (20 سؤال)</h3>
            <p class="muted">بتظهر لك أسئلة متنوعة من الأقسام الثلاثة. بعد ما تخلص، يطلع لك تحليل + خطة مذاكرة + السعر وخطوات التسجيل.</p>

            <div class="callout">
              <b>ليش نسويه قبل التسجيل؟</b>
              <div class="muted">عشان ما ندخلك محتوى كبير وانت ما تدري من وين تبدأ. الخطة بتقول لك: وش تذاكر بالضبط، وش تترك، وكيف تراجع الأخطاء.</div>
            </div>

            <button id="startBtn" class="btn btn-gold">ابدأ الاختبار</button>
            <a class="btn btn-ghost" href="course-content.html">شوف محتوى الدورة</a>
            <div class="hr"></div>
            <div class="mini">
              <div><span class="badge">مهم</span> السعر يظهر بعد النتيجة.</div>
              <div><span class="badge">مهم</span> بعدها تروح مباشرة لنموذج التسجيل.</div>
            </div>
          </div>
        </div>
      </div>
    `;

    mount.innerHTML = html;

    // Bind
    const bind = (id, key) => {
      const el = document.getElementById(id);
      if(!el) return;
      el.value = state.profile[key] || '';
      el.addEventListener('input', ()=> state.profile[key] = el.value);
      el.addEventListener('change', ()=> state.profile[key] = el.value);
    };

    bind('examWindow','examWindow');
    bind('examDate','examDate');
    bind('triedBefore','triedBefore');
    bind('prevScore','prevScore');
    bind('targetScore','targetScore');
    bind('level','level');
    bind('weakSection','weakSection');
    bind('dailyTime','dailyTime');
    bind('region','region');
    bind('notes','notes');

    document.getElementById('startBtn').addEventListener('click', ()=>{
      if(!state.profile.examWindow){
        toast('اختَر كم باقي على اختبارك عشان الخطة تطلع أدق ✅');
        document.getElementById('examWindow').focus();
        return;
      }
      pickQuestions();
      state.step = 2;
      render();
      window.scrollTo({top:0, behavior:'smooth'});
    });
  }

  function toast(msg){
    if(window.AYED && typeof window.AYED.toast === 'function') window.AYED.toast(msg);
    else alert(msg);
  }

  function renderQuiz(){
    const items = state.picked.map((q, idx)=>{
      const shared = q.passage ? `<div class="q-shared"><b>Passage</b><div class="muted" style="margin-top:6px; white-space:pre-wrap">${h(q.passage)}</div></div>`
                    : q.dialog ? `<div class="q-shared"><b>Dialogue</b><div class="muted" style="margin-top:6px; white-space:pre-wrap">${h(q.dialog)}</div></div>`
                    : '';
      const chosen = state.answers.get(q.id);
      const options = q.options.map((opt, i)=>{
        const checked = chosen===i ? 'checked' : '';
        return `
          <label class="option">
            <input type="radio" name="q_${q.id}" value="${i}" ${checked} />
            <span>${h(opt)}</span>
          </label>
        `;
      }).join('');

      const tag = q.section==='grammar' ? 'Grammar' : q.section==='reading' ? 'Reading' : 'Listening';
      return `
        <div class="q-card" data-qid="${q.id}">
          <div class="q-top">
            <div class="badge">${tag}</div>
            <div class="muted">سؤال ${idx+1} من ${state.picked.length}</div>
          </div>
          ${shared}
          <div class="q-prompt">${h(q.prompt)}</div>
          <div class="q-options">${options}</div>
        </div>
      `;
    }).join('');

    mount.innerHTML = `
      <div class="container">
        <div class="kicker"><span class="dot"></span><span>الاختبار</span></div>
        <h1>جاوب بهدوء… وخلك صريح</h1>
        <p class="muted">ما نبي كمال، نبي تشخيص صحيح. إذا احتجت توقف، تقدر تكمل بنفس الجهاز لاحقًا.</p>

        <div class="card">
          <div class="grid cols-2" style="align-items:center">
            <div>
              <div class="mini">
                <div><span class="badge">معلومة</span> لا يوجد خصم إضافي للمشتركين السابقين — هذا أقل سعر للدفعة الحالية.</div>
                <div><span class="badge">تنبيه</span> بعد النتيجة يطلع لك السعر وخطوات التسجيل.</div>
              </div>
            </div>
            <div style="text-align:left">
              <button id="submitBtn" class="btn btn-gold">اعرض نتيجتي وخطتي</button>
              <button id="backBtn" class="btn">رجوع للمعلومات</button>
            </div>
          </div>
        </div>

        <div class="spacer"></div>
        ${items}

        <div class="spacer"></div>
        <div class="card">
          <button id="submitBtn2" class="btn btn-gold">اعرض نتيجتي وخطتي</button>
          <button id="backBtn2" class="btn">رجوع للمعلومات</button>
          <p class="muted" style="margin-top:12px">ملاحظة: النتيجة للتشخيص. الهدف إنك تعرف وش تركز عليه بالضبط.</p>
        </div>
      </div>
    `;

    // bind answers
    qsa('input[type="radio"]', mount).forEach(r=>{
      r.addEventListener('change', (e)=>{
        const name = e.target.name; // q_id
        const id = Number(name.split('_')[1]);
        state.answers.set(id, Number(e.target.value));
      });
    });

    const submit = ()=>{
      // basic check: at least 70% answered
      const answered = state.answers.size;
      const total = state.picked.length;
      if(answered < Math.ceil(total*0.7)){
        toast(`جاوب على الأقل ${Math.ceil(total*0.7)} سؤال عشان التحليل يكون أدق.`);
        return;
      }
      state.step = 3;
      render();
      window.scrollTo({top:0, behavior:'smooth'});
    };

    const back = ()=>{ state.step = 1; render(); window.scrollTo({top:0, behavior:'smooth'}); };

    qs('#submitBtn').addEventListener('click', submit);
    qs('#submitBtn2').addEventListener('click', submit);
    qs('#backBtn').addEventListener('click', back);
    qs('#backBtn2').addEventListener('click', back);
  }

  function score(){
    const picked = state.picked;
    let correct=0;
    const per = {grammar:{c:0,t:0}, reading:{c:0,t:0}, listening:{c:0,t:0}};

    const wrong=[];

    for(const q of picked){
      const ans = state.answers.get(q.id);
      const isCorrect = ans===q.answer;
      if(isCorrect) correct++;
      per[q.section].t++;
      if(isCorrect) per[q.section].c++;
      if(!isCorrect){
        wrong.push({q, chosen: ans});
      }
    }

    const overall = Math.round((correct/picked.length)*100);
    const breakdown = {
      grammar: Math.round((per.grammar.c/(per.grammar.t||1))*100),
      reading: Math.round((per.reading.c/(per.reading.t||1))*100),
      listening: Math.round((per.listening.c/(per.listening.t||1))*100),
    };
    return {overall, breakdown, wrong, correct, total:picked.length};
  }

  function labelFor(pct){
    if(pct >= 80) return {title:'ممتاز 🔥', desc:'مستواك قوي… ركّز على صقل الأخطاء وتثبيت الاستراتيجيات.'};
    if(pct >= 65) return {title:'جيد جدًا ✅', desc:'أنت قريب من هدفك… ركّز على القسم الأضعف + كثّف مراجعة النماذج.'};
    if(pct >= 50) return {title:'متوسط 📈', desc:'تحتاج خطة واضحة ومراجعة مركزة… خلك ثابت أسبوعين وشوف الفرق.'};
    return {title:'بحاجة تأسيس 🧱', desc:'لا تقلق… إذا مشيت على التأسيس + النماذج بتشوف قفزة واضحة.'};
  }

  function genPlan(breakdown){
    // examWindow: 7,14,30,31,0
    const w = Number(state.profile.examWindow);
    const weakOrder = Object.entries(breakdown).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
    const weakest = weakOrder[0];
    const second = weakOrder[1];

    const daily = state.profile.dailyTime;
    const timeText = {
      '0-1':'أقل من ساعة',
      '1-2':'ساعة إلى ساعتين',
      '2-3':'ساعتين إلى 3 ساعات',
      '3+':'أكثر من 3 ساعات'
    }[daily] || 'ساعة إلى ساعتين';

    const blocks = {
      grammar: 'Grammar (القواعد)',
      reading: 'Reading (القراءة)',
      listening: 'Listening (الاستماع)'
    };

    const focus = (s)=> blocks[s] || s;

    const common = [
      `✅ وقتك اليومي: <b>${timeText}</b>. لا تكثر مصادر — خلك على خطة وحدة.`,
      `✅ ابدأ دائمًا بـ <b>${focus(weakest)}</b> لأنه قسمك الأضعف حسب نتيجتك.`,
      `✅ آخر 15 دقيقة يوميًا: <b>مراجعة أخطاء اليوم</b> (ليش غلط؟ وش القاعدة/الاستراتيجية؟).`
    ];

    const plan = [];

    if(w==7){
      plan.push('<h3>خطة 7 أيام (للي اختبارهم قريب)</h3>');
      plan.push('<ul class="plan">' + [
        `<li><b>اليوم 1:</b> تأسيس سريع + تكنيكات ${focus(weakest)} + حل نموذج قصير مع التصحيح.</li>`,
        `<li><b>اليوم 2:</b> نماذج مركزة ${focus(weakest)} + كويزات + مراجعة الأخطاء.</li>`,
        `<li><b>اليوم 3:</b> تأسيس/استراتيجيات ${focus(second)} + نماذج + تثبيت المصطلحات.</li>`,
        `<li><b>اليوم 4:</b> مراجعة قواعد/تكنيكات + نماذج مختلطة (قرامر + ريدنق).</li>`,
        `<li><b>اليوم 5:</b> نماذج Listening + كلمات متكررة + أسئلة فهم سريع.</li>`,
        `<li><b>اليوم 6:</b> نموذج شامل + تحليل مفصل للأخطاء (ركز على نمط السؤال).</li>`,
        `<li><b>اليوم 7:</b> مراجعة خفيفة + تثبيت القطع/الكلمات المتكررة + نوم بدري.</li>`,
      ] + '</ul>');
      plan.push('<div class="callout"><b>مفتاح الأسبوع:</b> نماذج + تصحيح + تكرار. أي سؤال غلط ارجع لقاعدته/تكنيكه فورًا.</div>');
    } else if(w==14){
      plan.push('<h3>خطة 14 يوم (أفضل توازن)</h3>');
      plan.push('<ul class="plan">' + [
        `<li><b>الأيام 1-4:</b> تأسيس واستراتيجيات ${focus(weakest)} + نماذج + كويزات يومية.</li>`,
        `<li><b>الأيام 5-8:</b> تأسيس واستراتيجيات ${focus(second)} + نماذج + مراجعة أخطاء.</li>`,
        `<li><b>الأيام 9-11:</b> نماذج مختلطة (Grammar + Reading) + القطع المتكررة.</li>`,
        `<li><b>الأيام 12-13:</b> نموذج شامل + تحليل + إعادة حل الأسئلة اللي غلطتها.</li>`,
        `<li><b>اليوم 14:</b> مراجعة نهائية خفيفة + تثبيت الكلمات/التكنيكات.</li>`,
      ] + '</ul>');
    } else if(w==30){
      plan.push('<h3>خطة 30 يوم (بناء قوي + نتائج ثابتة)</h3>');
      plan.push('<ul class="plan">' + [
        `<li><b>الأسبوع 1:</b> محاضرات تمهيدية + تأسيس ${focus(weakest)}.</li>`,
        `<li><b>الأسبوع 2:</b> تأسيس ${focus(second)} + بداية النماذج.</li>`,
        `<li><b>الأسبوع 3:</b> نماذج مكثفة + كويزات + مراجعة أخطاء.</li>`,
        `<li><b>الأسبوع 4:</b> نماذج شاملة + تثبيت القطع والكلمات المتكررة + مراجعة نهائية.</li>`,
      ] + '</ul>');
    } else {
      plan.push('<h3>خطة مرنة (للي موعده غير محدد)</h3>');
      plan.push('<ul class="plan">' + [
        `<li><b>المرحلة 1 (تأسيس):</b> محاضرات تمهيدية + قواعد/استراتيجيات.</li>`,
        `<li><b>المرحلة 2 (نماذج):</b> حل نماذج + تصحيح + تثبيت التكنيكات.</li>`,
        `<li><b>المرحلة 3 (مراجعة):</b> إعادة حل الأخطاء + القطع المتكررة + كلمات مهمة.</li>`,
      ] + '</ul>');
    }

    return `
      <div class="card">
        <h2>خطة مذاكرة مخصصة لك</h2>
        <div class="muted">${common.join('<br/>')}</div>
        <div class="hr"></div>
        ${plan.join('')}
      </div>
    `;
  }

  function renderResult(){
    const s = score();
    const label = labelFor(s.overall);

    const bars = (name, pct)=>`
      <div class="barRow">
        <div class="barLabel">${name}</div>
        <div class="bar"><div class="barFill" style="width:${pct}%"></div></div>
        <div class="barPct">${pct}%</div>
      </div>
    `;

    const wrongList = s.wrong.slice(0, 10).map((w, idx)=>{
      const q = w.q;
      const chosenTxt = (w.chosen===undefined || w.chosen===null) ? '—' : (q.options?.[w.chosen] ?? '—');
      const correctTxt = q.options?.[q.answer] ?? '—';
      const shared = q.passage ? `<details class="details"><summary>Passage</summary><div class="muted" style="white-space:pre-wrap">${h(q.passage)}</div></details>`
                   : q.dialog ? `<details class="details"><summary>Dialogue</summary><div class="muted" style="white-space:pre-wrap">${h(q.dialog)}</div></details>`
                   : '';
      return `
        <div class="wrongItem">
          <div class="muted">خطأ ${idx+1}</div>
          ${shared}
          <div class="q-prompt">${h(q.prompt)}</div>
          <div class="mini"><div><span class="badge">إجابتك</span> ${h(chosenTxt)}</div><div><span class="badge">الصحيح</span> ${h(correctTxt)}</div></div>
          <div class="callout"><b>التوضيح:</b> <span class="muted">${h(q.explanation)}</span></div>
        </div>
      `;
    }).join('');

    const plan = genPlan(s.breakdown);

    const resultPayload = {
      createdAt: new Date().toISOString(),
      profile: state.profile,
      score: s,
      planKey: `${state.profile.examWindow}|${Object.entries(s.breakdown).sort((a,b)=>a[1]-b[1])[0][0]}`
    };
    localStorage.setItem('AYED_LEVEL_RESULT', JSON.stringify(resultPayload));

    // price reveal
    const seats = (window.AYED && typeof window.AYED.getSeats==='function') ? window.AYED.getSeats() : null;

    mount.innerHTML = `
      <div class="container">
        <div class="kicker"><span class="dot"></span><span>نتيجتك وخطتك</span></div>
        <h1>${label.title}</h1>
        <p class="muted">${label.desc}</p>

        <div class="grid cols-2">
          <div class="card">
            <h3>تحليل سريع</h3>
            <div class="bigScore">${s.overall}%</div>
            <div class="muted">إجابات صحيحة: ${s.correct} من ${s.total}</div>
            <div class="hr"></div>
            ${bars('Grammar', s.breakdown.grammar)}
            ${bars('Reading', s.breakdown.reading)}
            ${bars('Listening', s.breakdown.listening)}
          </div>

          <div class="card">
            <h3>الحين نجي للزبدة: الاشتراك</h3>
            <p class="muted">بناءً على خطتك، الاشتراك يعطيك محتوى مرتب وتطبيق عملي (محاضرات + ملفات + نماذج + كويزات) بدون تشتت.</p>

            <div class="priceBox">
              <div class="priceTitle">سعر الاشتراك (يظهر بعد الاختبار)</div>
              <div class="priceNow"><span>${cfg.discountPrice}</span> ريال</div>
              <div class="muted">السعر الرسمي بعد اكتمال المقاعد: <b>${cfg.officialPrice} ريال</b></div>
              ${seats!==null ? `<div class="muted" style="margin-top:8px">المقاعد المتبقية في الدفعة الحالية: <b>${seats}</b></div>` : ''}
            </div>

            <div class="mini">
              <div><span class="badge">مهم</span> الدفع تحويل بنكي رسمي + تأكيد بالإيصال.</div>
              <div><span class="badge">مهم</span> بعد إرسال طلب التفعيل… ارفق الإيصال مرة ثانية في الخاص.</div>
            </div>

            <div class="hr"></div>
            <a class="btn btn-gold" href="register.html">أكمل التسجيل وتأكيد الدفع</a>
            <a class="btn btn-ghost" href="course-content.html">شوف محتوى الدورة بالتفصيل</a>
          </div>
        </div>

        <div class="spacer"></div>
        ${plan}

        <div class="spacer"></div>
        <div class="card">
          <h2>أخطاءك الأهم (مع التوضيح)</h2>
          <p class="muted">عرضنا لك أول 10 أخطاء لأنها الأكثر تأثير. تقدر تعيد الاختبار لاحقًا وتشوف تحليل جديد.</p>
          ${wrongList || '<div class="muted">ما شاء الله… أخطاءك قليلة جدًا 🔥</div>'}
        </div>

        <div class="spacer"></div>
        <div class="card">
          <h3>نصيحة أخيرة</h3>
          <p class="muted">كثرة المصادر تشتت. خلّ خطتك وحدة، وركّز على تصحيح الخطأ أكثر من عدد الصفحات. الله يوفقك 🤍</p>
          <a class="btn" href="index.html">الرجوع للرئيسية</a>
        </div>
      </div>
    `;
  }

  mount.innerHTML = render();

})();
