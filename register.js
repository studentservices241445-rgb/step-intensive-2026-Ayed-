(function () {
  'use strict';

  const OFFICIAL_USERNAME = 'Ayed_Academy_2026';

  const $ = (sel) => document.querySelector(sel);

  const form = $('#enrollForm');
  const resultBox = $('#resultBox');
  const readyMsg = $('#readyMsg');
  const copyBtn = $('#copyBtn');
  const tgBtn = $('#tgBtn');

  function val(id) {
    const el = document.getElementById(id);
    return el ? (el.value || '').trim() : '';
  }

  function escapeLine(s) {
    return (s || '').replace(/\s+/g, ' ').trim();
  }

  function buildMessage(payload) {
    const lines = [];
    lines.push('السلام عليكم ورحمة الله وبركاته');
    lines.push('');
    lines.push('أرغب بالاشتراك في *الدورة المكثفة STEP 2026*، وتم تحويل المبلغ على الحساب الرسمي كما هو موضح في الموقع.');
    lines.push('');
    lines.push('*بيانات المتدرب:*');
    lines.push(`- الاسم: ${payload.fullName}`);
    lines.push(`- وسيلة التواصل: ${payload.contactMethod}${payload.contactValue ? ' — ' + payload.contactValue : ''}`);
    lines.push(`- منطقة الاختبار: ${payload.region || '—'}`);
    lines.push('');
    lines.push('*معلومات الاختبار:*');
    lines.push(`- موعد الاختبار: ${payload.examDate || 'غير محدد'}`);
    lines.push(`- هل سبق اختبرت؟ ${payload.prev || '—'}`);
    lines.push(`- درجتك السابقة (إن وجدت): ${payload.prevScore || '—'}`);
    lines.push(`- الدرجة المستهدفة: ${payload.target || '—'}`);
    lines.push(`- المستوى الحالي (حسب اختبار تحديد المستوى): ${payload.level || '—'}`);
    lines.push(`- ملاحظات: ${payload.notes || '—'}`);
    lines.push('');
    lines.push('*تم إرفاق الإيصال مع الطلب وسأرسله هنا في المحادثة للتأكيد النهائي.*');
    lines.push('');
    lines.push('أنتظر تأكيد الانضمام وتفعيل الوصول للمحتوى.');
    return lines.join('\n');
  }

  function tgDeepLink(text) {
    const encoded = encodeURIComponent(text);
    return `https://t.me/${OFFICIAL_USERNAME}?text=${encoded}`;
  }

  function show(msg) {
    readyMsg.value = msg;
    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(readyMsg.value);
      copyBtn.textContent = 'تم النسخ ✅';
      setTimeout(() => (copyBtn.textContent = 'نسخ الرسالة'), 1200);
    } catch (e) {
      readyMsg.select();
      document.execCommand('copy');
      copyBtn.textContent = 'تم النسخ ✅';
      setTimeout(() => (copyBtn.textContent = 'نسخ الرسالة'), 1200);
    }
  }

  if (copyBtn) copyBtn.addEventListener('click', copyText);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const receipt = document.getElementById('receipt');
      if (!receipt || !receipt.files || !receipt.files[0]) {
        alert('يرجى إرفاق الإيصال قبل إرسال الطلب.');
        receipt && receipt.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const payload = {
        fullName: escapeLine(val('fullName')),
        contactMethod: escapeLine(val('contactMethod')),
        contactValue: escapeLine(val('contactValue')),
        region: escapeLine(val('region')),
        examDate: escapeLine(val('examDate')),
        prev: escapeLine(val('prev')),
        prevScore: escapeLine(val('prevScore')),
        target: escapeLine(val('target')),
        level: escapeLine(val('level')),
        notes: escapeLine(val('notes'))
      };

      if (!payload.fullName) {
        alert('اكتب اسمك الثلاثي لإكمال الطلب.');
        document.getElementById('fullName')?.focus();
        return;
      }

      const msg = buildMessage(payload);
      show(msg);

      if (tgBtn) {
        tgBtn.href = tgDeepLink(msg);
        tgBtn.classList.remove('disabled');
        tgBtn.setAttribute('aria-disabled', 'false');
      }
    });
  }
})();
