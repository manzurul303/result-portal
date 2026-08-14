let currentSessionCookie = '';

// ==========================================
// ১. ট্যাবসুইচিং লজিক (ইনপুট তথ্য অক্ষত রাখে)
// ==========================================
function switchTab(tabType) {
  const tabIndividualBtn = document.getElementById('tab-individual');
  const tabInstitutionBtn = document.getElementById('tab-institution');
  const individualTab = document.getElementById('individualTab');
  const institutionTab = document.getElementById('institutionTab');

  if (tabType === 'individual') {
    tabIndividualBtn.classList.add('active');
    tabInstitutionBtn.classList.remove('active');

    individualTab.classList.remove('hidden');
    institutionTab.classList.add('hidden');
  } else if (tabType === 'institution') {
    tabInstitutionBtn.classList.add('active');
    tabIndividualBtn.classList.remove('active');

    institutionTab.classList.remove('hidden');
    individualTab.classList.add('hidden');
  }
}

// ==========================================
// ২. পেজ রিলোড ও মডাল হ্যান্ডলিং
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // পেজ রিলোড হলে শুধুমাত্র একবার ফর্ম ক্লিয়ার হবে
  const indForm = document.getElementById('individualForm');
  const instForm = document.getElementById('institutionForm');
  if (indForm) indForm.reset();
  if (instForm) instForm.reset();

  // মডাল অটো ক্রিয়েশন
  initModals();

  const indSubmitBtn = document.getElementById('indSubmitBtn');
  const instSubmitBtn = document.getElementById('instSubmitBtn');

  // ইন্ডিভিজুয়াল গেট রেজাল্ট বাটনে ক্লিক
  if (indSubmitBtn) {
    indSubmitBtn.addEventListener('click', () => {
      const roll = document.getElementById('indRoll').value.trim();
      if (!roll) {
        alert('অনুগ্রহ করে রোল নম্বর (Roll No) পূরণ করুন।');
        return;
      }
      openCaptchaModal();
    });
  }

  // ইনস্টিটিউট গেট রেজাল্ট বাটনে ক্লিক
  if (instSubmitBtn) {
    instSubmitBtn.addEventListener('click', () => {
      const eiin = document.getElementById('instEiin').value.trim();
      if (!eiin) {
        alert('অনুগ্রহ করে ৬ ডিজিটের EIIN কোড পূরণ করুন।');
        return;
      }
      openCaptchaModal();
    });
  }

  // ক্যাপচা পপআপ অপেন ও ফেচিং
  async function openCaptchaModal() {
    const captchaModal = document.getElementById('customCaptchaModal');
    const mathQuestionEl = document.getElementById('customMathQuestion');
    const captchaErrorEl = document.getElementById('customCaptchaError');

    captchaModal.style.display = 'flex';
    mathQuestionEl.textContent = 'ক্যাপচা লোড হচ্ছে...';
    document.getElementById('customCaptchaInput').value = '';
    captchaErrorEl.textContent = '';

    try {
      const res = await fetch('/api/captcha');
      const data = await res.json();

      if (data.success) {
        mathQuestionEl.textContent = data.mathQuestion;
        currentSessionCookie = data.sessionCookie || '';
      } else {
        mathQuestionEl.textContent = 'ব্যর্থ হয়েছে';
        captchaErrorEl.textContent = 'সার্ভার থেকে ক্যাপচা আনা যায়নি।';
      }
    } catch (err) {
      mathQuestionEl.textContent = 'ব্যর্থ হয়েছে';
      captchaErrorEl.textContent = 'নেটওয়ার্ক এরর! আবার চেষ্টা করুন।';
    }
  }

  // ক্যাপচা সাবমিট ও ফলাফল ফেচ
  document.getElementById('customSubmitCaptchaBtn')?.addEventListener('click', async () => {
    const captchaValue = document.getElementById('customCaptchaInput').value.trim();
    if (!captchaValue) {
      document.getElementById('customCaptchaError').textContent = 'ক্যাপচার সঠিক উত্তর লিখুন!';
      return;
    }

    document.getElementById('customCaptchaModal').style.display = 'none';
    const resultModal = document.getElementById('customResultModal');
    const resultBody = document.getElementById('customResultBody');
    const loadingSpinner = document.getElementById('customLoadingSpinner');

    resultModal.style.display = 'flex';
    loadingSpinner.style.display = 'block';
    resultBody.innerHTML = '';

    const isIndividual = document.getElementById('tab-individual').classList.contains('active');

    const payload = {
      exam: isIndividual ? document.getElementById('indExam').value : document.getElementById('instExam').value,
      board: isIndividual ? document.getElementById('indBoard').value : document.getElementById('instBoard').value,
      year: isIndividual ? document.getElementById('indYear').value : document.getElementById('instYear').value,
      roll: isIndividual ? document.getElementById('indRoll').value.trim() : '',
      reg: isIndividual ? document.getElementById('indReg').value.trim() : '',
      eiin: !isIndividual ? document.getElementById('instEiin').value.trim() : '',
      value: captchaValue,
      clientCookie: currentSessionCookie
    };

    try {
      const res = await fetch('/api/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      loadingSpinner.style.display = 'none';

      if (data.success) {
        let resultHTML = `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <p><strong>Student Name:</strong> ${data.data.studentName || 'N/A'}</p>
            <p><strong>Father's Name:</strong> ${data.data.fatherName || 'N/A'}</p>
            <p><strong>GPA:</strong> <span style="color: #059669; font-weight: bold;">${data.data.gpa || 'N/A'}</span></p>
            <p><strong>Result Status:</strong> ${data.data.result || 'PASSED'}</p>
          </div>
        `;
        resultBody.innerHTML = resultHTML;
      } else {
        resultBody.innerHTML = `<p style="color: #dc2626; font-weight: bold; text-align: center; padding: 20px;">${data.message || 'ভুল তথ্য অথবা ক্যাপচা সঠিক নয়।'}</p>`;
      }
    } catch (err) {
      loadingSpinner.style.display = 'none';
      resultBody.innerHTML = '<p style="color: #dc2626; text-align: center; padding: 20px;">সার্ভারে রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে।</p>';
    }
  });
});

// ডাইনামিক পপআপ মডাল জেনারেটর
function initModals() {
  if (document.getElementById('customCaptchaModal')) return;

  const modalHTML = `
    <div id="customCaptchaModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; backdrop-filter:blur(4px);">
      <div style="background:#fff; padding:25px; border-radius:12px; max-width:380px; width:90%; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.2); position:relative;">
        <span onclick="document.getElementById('customCaptchaModal').style.display='none'" style="position:absolute; right:15px; top:10px; font-size:22px; cursor:pointer; color:#888;">&times;</span>
        <h3 style="margin-top:0; color:#2c3e50;">Security Check</h3>
        <p style="color:#666; font-size:14px;">গভমেন্ট সার্ভারের গাণিতিক ক্যাপচাটি পূরণ করুন:</p>
        <div id="customMathQuestion" style="background:#f1f5f9; padding:12px; font-size:22px; font-weight:bold; color:#0f766e; border-radius:8px; margin:15px 0;">Loading...</div>
        <input type="text" id="customCaptchaInput" placeholder="উত্তর লিখুন (যেমন: 8)" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; text-align:center; font-size:16px; margin-bottom:12px;" autocomplete="off" />
        <button id="customSubmitCaptchaBtn" style="width:100%; padding:12px; background:#059669; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:15px;">Submit & View Result</button>
        <p id="customCaptchaError" style="color:#dc2626; font-size:13px; margin-top:10px;"></p>
      </div>
    </div>

    <div id="customResultModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; backdrop-filter:blur(4px);">
      <div style="background:#fff; padding:25px; border-radius:12px; max-width:750px; width:92%; max-height:85vh; overflow-y:auto; box-shadow:0 10px 25px rgba(0,0,0,0.2); position:relative;">
        <span onclick="document.getElementById('customResultModal').style.display='none'" style="position:absolute; right:15px; top:10px; font-size:24px; cursor:pointer; color:#888;">&times;</span>
        <h3 style="margin-top:0; color:#0f766e; text-align:center;">Academic Result Sheet</h3>
        <div id="customLoadingSpinner" style="text-align:center; padding:30px; color:#0284c7; font-weight:bold;">গভমেন্ট সার্ভার থেকে ফলাফল ফেচ করা হচ্ছে...</div>
        <div id="customResultBody" style="margin-top:15px;"></div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}