let activeTab = 'individual';
let storedPayload = {};
window.currentCaptchaCode = '';

// Tab Switching
function switchTab(tab) {
  activeTab = tab;
  const tabIndBtn = document.getElementById('tab-individual');
  const tabInstBtn = document.getElementById('tab-institution');
  const tabIndBody = document.getElementById('individualTab');
  const tabInstBody = document.getElementById('institutionTab');

  if (tab === 'individual') {
    if (tabIndBtn) tabIndBtn.classList.add('active');
    if (tabInstBtn) tabInstBtn.classList.remove('active');
    if (tabIndBody) tabIndBody.classList.remove('hidden');
    if (tabInstBody) tabInstBody.classList.add('hidden');
  } else {
    if (tabInstBtn) tabInstBtn.classList.add('active');
    if (tabIndBtn) tabIndBtn.classList.remove('active');
    if (tabInstBody) tabInstBody.classList.remove('hidden');
    if (tabIndBody) tabIndBody.classList.add('hidden');
  }
}

// Modal Handlers
function closeCaptchaModal() {
  const modal = document.getElementById('captchaModal');
  if (modal) modal.style.display = 'none';
}

function closeResultModal() {
  const modal = document.getElementById('resultModal');
  if (modal) modal.style.display = 'none';
}

// Fast SVG Captcha Generator
function generateClientCaptcha(container) {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  window.currentCaptchaCode = code;

  const svg = `
    <svg width="150" height="42" viewBox="0 0 150 42" xmlns="http://www.w3.org/2000/svg" style="background:#f1f5f9; border-radius:8px; user-select:none;">
      <path d="M 10 20 Q 35 5, 70 20 T 140 15" stroke="#cbd5e1" stroke-width="2" fill="none"/>
      <path d="M 5 28 Q 45 35, 90 12 T 145 25" stroke="#a7f3d0" stroke-width="2" fill="none"/>
      <text x="22" y="28" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="bold" fill="#0f172a" letter-spacing="7">${code}</text>
    </svg>
  `;
  container.innerHTML = svg;
}

// Load Captcha
async function loadCaptcha() {
  const container = document.getElementById('captchaImageContainer');
  if (!container) return;
  
  // সরাসরি ক্লায়েন্ট সাইড থেকে ইনস্ট্যান্ট ইনস্টল ক্যাপচা রেন্ডার করা হবে যাতে কোনো লেট না হয়
  generateClientCaptcha(container);
}

// Open Captcha Popup
function openCaptchaPopup() {
  const captchaModal = document.getElementById('captchaModal');
  const captchaInput = document.getElementById('captchaInput');
  if (captchaInput) captchaInput.value = '';
  if (captchaModal) captchaModal.style.display = 'flex';
  loadCaptcha();
}

// Form Submission Event
document.addEventListener('DOMContentLoaded', () => {
  const indForm = document.getElementById('individualForm');
  const instForm = document.getElementById('institutionForm');

  if (indForm) {
    indForm.addEventListener('submit', (e) => {
      e.preventDefault();
      storedPayload = {
        type: 'individual',
        exam: document.getElementById('indExam')?.value || '',
        board: document.getElementById('indBoard')?.value || '',
        year: document.getElementById('indYear')?.value || '',
        roll: document.getElementById('indRoll')?.value || '',
        reg: document.getElementById('indReg')?.value || ''
      };
      openCaptchaPopup();
    });
  }

  if (instForm) {
    instForm.addEventListener('submit', (e) => {
      e.preventDefault();
      storedPayload = {
        type: 'institution',
        exam: document.getElementById('instExam')?.value || '',
        board: document.getElementById('instBoard')?.value || '',
        year: document.getElementById('instYear')?.value || '',
        eiin: document.getElementById('instEiin')?.value || ''
      };
      openCaptchaPopup();
    });
  }
});

// Final Submit after Captcha Validation
async function submitFinalResult() {
  const captchaVal = document.getElementById('captchaInput')?.value.trim();
  if (!captchaVal) {
    alert('Please enter the captcha code.');
    return;
  }

  if (window.currentCaptchaCode && captchaVal.toUpperCase() !== window.currentCaptchaCode.toUpperCase()) {
    alert('Incorrect Captcha Code! Please try again.');
    loadCaptcha();
    return;
  }

  closeCaptchaModal();

  const resultModal = document.getElementById('resultModal');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const resultBody = document.getElementById('modalResultBody');

  if (resultModal) resultModal.style.display = 'flex';
  if (loadingSpinner) loadingSpinner.style.display = 'block';
  if (resultBody) resultBody.innerHTML = '';

  const finalPayload = { ...storedPayload, captcha: captchaVal };

  try {
    const res = await fetch('/api/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload)
    });

    const data = await res.json();
    if (loadingSpinner) loadingSpinner.style.display = 'none';

    if (data.success && data.data) {
      const student = data.data;
      if (resultBody) {
        resultBody.innerHTML = `
          <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
            <h2 style="font-size: 18px; color: #0f172a; margin-bottom: 5px;">WEB BASED RESULT PUBLICATION SYSTEM</h2>
            <p style="font-size: 13px; color: #64748b;">RESULT OF ${(finalPayload.exam || '').toUpperCase()} EXAMINATION - ${finalPayload.year}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr>
              <th style="text-align: left; padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc; color: #334155;">Roll No</th>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">${student.roll || finalPayload.roll || 'N/A'}</td>
              <th style="text-align: left; padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc; color: #334155;">Registration No</th>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">${student.reg || finalPayload.reg || 'N/A'}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc; color: #334155;">Student Name</th>
              <td colspan="3" style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${student.studentName || 'N/A'}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc; color: #334155;">Board</th>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">${(finalPayload.board || 'jessore').toUpperCase()}</td>
              <th style="text-align: left; padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc; color: #334155;">GPA</th>
              <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #16a34a;">${student.gpa || '5.00'}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc; color: #334155;">Result</th>
              <td colspan="3" style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #16a34a;">${student.result || 'PASSED'}</td>
            </tr>
          </table>

          <div style="text-align: center; margin-top: 20px;">
            <button onclick="closeResultModal()" class="btn-secondary" style="padding: 8px 16px; margin-right: 10px; cursor: pointer; border-radius: 6px;">Search Again</button>
            <button onclick="window.print()" class="btn-primary" style="padding: 8px 16px; cursor: pointer; border-radius: 6px; display: inline-flex;"><i class="fa-solid fa-print"></i> Print Marksheet</button>
          </div>
        `;
      }
    } else {
      if (resultBody) {
        resultBody.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <p style="color: #ef4444; font-weight: bold;">⚠️ ${data.message || 'Result not found!'}</p>
            <button onclick="closeResultModal()" class="btn-secondary" style="margin-top: 15px; padding: 8px 16px; cursor: pointer; border-radius: 6px;">Try Again</button>
          </div>
        `;
      }
    }
  } catch (err) {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (resultBody) {
      resultBody.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <p style="color: #ef4444;">❌ Server Error. Unable to fetch result at this moment.</p>
          <button onclick="closeResultModal()" class="btn-secondary" style="margin-top: 15px; padding: 8px 16px; cursor: pointer; border-radius: 6px;">Close</button>
        </div>
      `;
    }
  }
}