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

// Client SVG Captcha Generator
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
function loadCaptcha() {
  const container = document.getElementById('captchaImageContainer');
  if (container) generateClientCaptcha(container);
}

// Open Captcha Popup
function openCaptchaPopup() {
  const captchaModal = document.getElementById('captchaModal');
  const captchaInput = document.getElementById('captchaInput');
  if (captchaInput) captchaInput.value = '';
  if (captchaModal) captchaModal.style.display = 'flex';
  loadCaptcha();
}

// Isolated Print Functionality
function triggerPrintResult() {
  window.print();
}

// Form Submission Listeners
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

// Submit Captcha & Fetch Result
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
          <div id="printableResultArea" class="result-sheet-container">
            <div class="result-header-badge">
              <h2>WEB BASED RESULT PUBLICATION SYSTEM</h2>
              <p>OFFICIAL RESULT SHEET - ${(finalPayload.exam || '').toUpperCase()} (${finalPayload.year})</p>
            </div>

            <table class="result-table">
              <tr>
                <th>Roll No</th>
                <td><strong>${student.roll || finalPayload.roll || 'N/A'}</strong></td>
                <th>Registration No</th>
                <td><strong>${student.reg || finalPayload.reg || 'N/A'}</strong></td>
              </tr>
              <tr>
                <th>Student Name</th>
                <td colspan="3"><strong>${student.studentName || 'N/A'}</strong></td>
              </tr>
              ${student.fatherName ? `
              <tr>
                <th>Father's Name</th>
                <td colspan="3">${student.fatherName}</td>
              </tr>` : ''}
              ${student.motherName ? `
              <tr>
                <th>Mother's Name</th>
                <td colspan="3">${student.motherName}</td>
              </tr>` : ''}
              <tr>
                <th>Board</th>
                <td>${(finalPayload.board || 'JASSORE').toUpperCase()}</td>
                <th>GPA / Result</th>
                <td><span class="status-badge">${student.gpa || '5.00'} (${student.result || 'PASSED'})</span></td>
              </tr>
            </table>

            <div class="modal-actions-flex">
              <button onclick="closeResultModal()" class="btn-secondary">
                <i class="fa-solid fa-rotate-left"></i> Search Again
              </button>
              <button onclick="triggerPrintResult()" class="btn-primary">
                <i class="fa-solid fa-print"></i> Print Marksheet
              </button>
            </div>
          </div>
        `;
      }
    } else {
      if (resultBody) {
        resultBody.innerHTML = `
          <div style="text-align: center; padding: 25px;">
            <p style="color: #ef4444; font-weight: 700; font-size: 15px;">⚠️ ${data.message || 'Result not found!'}</p>
            <p style="color: #64748b; font-size: 13px; margin-top: 5px;">Please check the Roll/Reg number and try again.</p>
            <button onclick="closeResultModal()" class="btn-secondary" style="margin: 20px auto 0 auto; display: block;">Search Again</button>
          </div>
        `;
      }
    }
  } catch (err) {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (resultBody) {
      resultBody.innerHTML = `
        <div style="text-align: center; padding: 25px;">
          <p style="color: #ef4444; font-weight: 700;">❌ Server Connection Error</p>
          <button onclick="closeResultModal()" class="btn-secondary" style="margin: 15px auto 0 auto; display: block;">Close</button>
        </div>
      `;
    }
  }
}