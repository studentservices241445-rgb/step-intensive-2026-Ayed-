/*
  register.js
  - Reads registration form values
  - Requires receipt upload (client-side check)
  - Builds a formatted message and opens Telegram deep-link to the academy username

  Notes:
  - This is a static site. The receipt file is NOT uploaded anywhere.
  - The user is instructed to re-send the receipt in Telegram for final confirmation.
*/

(function(){
  'use strict';

  const OFFICIAL_USERNAME = 'Ayed_Academy_2026'; // @Ayed_Academy_2026

  const $ = (sel) => document.querySelector(sel);

  const form = $('#enrollForm');
  const resultBox = $('#resultBox');
  const readyMsg = $('#readyMsg');
  const copyBtn = $('#copyBtn');
  const tgBtn = $('#tgBtn');

  function val(id){
    const el = document.getElementById(id);
    return el ? (el.value || '').trim() : '';
  }

  function escapeLine(s){
    return (s || '').replace(/\s+/g,' ').trim();
  }

  function buildMessage(payload){
    const lines = [];
    lines.push('السلام عليكم ورحمة الله وبركاته');
    lines.push('');
    lines.push('أرغب بالاشتراك في *الدورة المكثفة STEP 2026*، وتم تحويل المبلغ على الحساب الرسمي كما هو موضح في الموقع.');
    lines.push('');
    lines.push('*بيانات المتدرب:*');
    lines.push(`- الاسم: ${payload.fullName}`);
    lines.push(`- وسيلة التواصل: ${payload.contactMethod}${payload.contactValue ? ' — ' + payload.contactValue : ''}`);
    lines.push(`- منطقة الاختبار (اختياري): ${payload.region || '—'}`);
    lines.push('');
    lines.push('*معلومات الاختبار:*');
    lines.push(`- موعد الاختبار: ${payload.examDate || 'غير محدد'}`);
    lines.push(`- هل سبق اختبرت؟ ${payload.prev || '—'}`);
    lines.push(`- درجتك السابقة (إن وجدت): ${payload.prevScore || '—'}`);
    lines.push(`- الدرجة المستهدفة: ${payload.target || '—'}`);
    lines.push(`- المستوى الحالي (حسب اختبار تحديد المستوى): ${payload.level || '—'}`);
    lines.push(`- ملاحظات: ${payload.notes || '—'}`);
    lines.push('');
    lines.push('— — — — — — — — — — — — —');
    lines.push('*مهم جدًا:*');
    lines.push('📎 تم إرفاق الإيصال هنا في الموقع للتسجيل، وسأقوم *بإعادة إرسال الإيصال مرة أخرى هنا في الخاص* كملف/صورة لتأكيد الاشتراك بشكل نهائي.');
    lines.push('');
    lines.push('بعد إرسال الإيصال، أنتظر تأكيد الانضمام وتفعيل الوصول للمحتوى.');
    lines.push('رجاءً لا أرسل أكثر من رسالة حتى لا يتأخر الرد 🙏');
    return lines.join('\n');
  }

  function tgDeepLink(text){
    const encoded = encodeURIComponent(text);
    return `https://t.me/${OFFICIAL_USERNAME}?text=${encoded}`;
  }

  function show(msg){
    readyMsg.value = msg;
    resultBox.classList.remove('hidden');
    resultBox.scrollIntoView({behavior:'smooth', block:'start'});
  }

  async function copyText(){
    try{
      await navigator.clipboard.writeText(readyMsg.value);
      copyBtn.textContent = 'تم النسخ ✅';
      setTimeout(()=> copyBtn.textContent = 'نسخ الرسالة', 1200);
    } catch(e){
      // fallback
      readyMsg.select();
      document.execCommand('copy');
      copyBtn.textContent = 'تم النسخ ✅';
      setTimeout(()=> copyBtn.textContent = 'نسخ الرسالة', 1200);
    }
  }

  if(copyBtn) copyBtn.addEventListener('click', copyText);

  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();

      const receipt = document.getElementById('receipt');
      if(!receipt || !receipt.files || !receipt.files[0]){
        alert('لازم ترفق الإيصال (صورة/ملف PDF) قبل إرسال الطلب.');
        receipt && receipt.scrollIntoView({behavior:'smooth', block:'center'});
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
        notes: escapeLine(val('notes')),
      };

      if(!payload.fullName){
        alert('اكتب اسمك الثلاثي عشان نكمل 🙏');
        document.getElementById('fullName')?.focus();
        return;
      }

      const msg = buildMessage(payload);
      show(msg);

      // Enable Telegram button
      if(tgBtn){
        tgBtn.href = tgDeepLink(msg);
        tgBtn.classList.remove('disabled');
      }
    });
  }
})();
