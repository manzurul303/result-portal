let activeTab = 'individual';
let storedPayload = {};

// Switch Tabs between Individual & Institution
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

// Modal Toggle Functions
function closeCaptchaModal() {
  const modal = document.getElementById('captchaModal');
  if (modal) modal.style.display = 'none';
}

function closeResultModal() {
  const modal = document.getElementById('resultModal');
  if (modal) modal.style.display = 'none';
}

// Fetch Captcha SVG from Server API
async function loadCaptcha() {
  const container = document.getElementById('captchaImageContainer');
  if (!container) return;
  container.innerHTML = '<span style="font-size:13px; color:#666;">Loading Captcha...</span>';

  try {
    const res = await fetch('/api/captcha');
    const data = await res.json();
    if (data.success && data.svg) {
      container.innerHTML = data.svg;
    } else {
      container.innerHTML = '<span style="font-size:13px; color:#e11d48;">Failed to load captcha</span>';
    }
  } catch (err) {
    container.innerHTML = '<span style="font-size:13px; color:#e11d48;">Captcha Error</span>';
  }
}

// Form Handlers Setup
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

// Open Captcha Popup Modal
function openCaptchaPopup() {
  const captchaModal = document.getElementById('captchaModal');
  const captchaInput = document.getElementById('captchaInput');
  if (captchaInput) captchaInput.value = '';
  if (captchaModal) captchaModal.style.display = 'flex';
  loadCaptcha();
}

// Final Submit Result after Captcha
async function submitFinalResult() {
  const captchaVal = document.getElementById('captchaInput')?.value.trim();
  if (!captchaVal) {
    alert('Please enter the captcha code.');
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
            <h2 style="font-size: 18px; color: #1e293b; margin-bottom: 5px;">WEB BASED RESULT PUBLICATION SYSTEM</h2>
            <p style="font-size: 13px; color: #64748b;">RESULT OF ${finalPayload.exam.toUpperCase()} EXAMINATION - ${finalPayload.year}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr>
              <th style="text-align: left; padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;">Roll No</th>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">${student.roll || finalPayload.roll || 'N/A'}</td>
              <th style="text-align: left; padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;">Registration No</th>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">${student.reg || finalPayload.reg || 'N/A'}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;">Student Name</th>
              <td colspan="3" style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${student.studentName || 'N/A'}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;">Father's Name</th>
              <td colspan="3" style="padding: 8px; border: 1px solid #cbd5e1;">${student.fatherName || 'N/A'}</td>
            </tr>
              <th style="text-align: left; padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;">Mother's Name</th>
              <td colspan="3" style="padding: 8px; border: 1px solid #cbd5e1;">${student.motherName || 'N/A'}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;">Board</th>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">${(finalPayload.board || 'jessore').toUpperCase()}</td>
              <th style="text-align: left; padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;">GPA</th>
              <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #16a34a;">${student.gpa || '5.00'}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;">Result</th>
              <td colspan="3" style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #16a34a;">${student.result || 'PASSED'}</td>
            </tr>
          </table>

          <div style="text-align: center; margin-top: 20px;">
            <button onclick="closeResultModal()" class="btn-secondary" style="padding: 8px 16px; margin-right: 10px; cursor: pointer;">Search Again</button>
            <button onclick="window.print()" class="btn-primary" style="padding: 8px 16px; cursor: pointer;"><i class="fa-solid fa-print"></i> Print Marksheet</button>
          </div>
        `;
      }
    } else {
      if (resultBody) {
        resultBody.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <p style="color: #dc2626; font-weight: bold;">⚠️ ${data.message || 'Result not found or Invalid Captcha!'}</p>
            <button onclick="closeResultModal()" class="btn-secondary" style="margin-top: 15px; padding: 8px 16px; cursor: pointer;">Try Again</button>
          </div>
        `;
      }
    }
  } catch (err) {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (resultBody) {
      resultBody.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <p style="color: #dc2626;">❌ Server Error. Unable to fetch result at this moment.</p>
          <button onclick="closeResultModal()" class="btn-secondary" style="margin-top: 15px; padding: 8px 16px; cursor: pointer;">Close</button>
        </div>
      `;
    }
  }
}