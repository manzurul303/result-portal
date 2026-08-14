// Tab Switching Function
function switchTab(tabType) {
  const individualTab = document.getElementById('individualTab');
  const institutionTab = document.getElementById('institutionTab');
  const individualForm = document.getElementById('individualForm');
  const institutionForm = document.getElementById('institutionForm');

  if (!individualTab || !institutionTab) return;

  if (tabType === 'individual') {
    individualTab.classList.add('active');
    institutionTab.classList.remove('active');
    if (individualForm) individualForm.style.display = 'block';
    if (institutionForm) institutionForm.style.display = 'none';
  } else {
    institutionTab.classList.add('active');
    individualTab.classList.remove('active');
    if (individualForm) individualForm.style.display = 'none';
    if (institutionForm) institutionForm.style.display = 'block';
  }
}

// Modal Toggle Functions
function closeModal() {
  const modal = document.getElementById('resultModal');
  if (modal) modal.style.display = 'none';
}

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resultForm') || document.querySelector('form');
  const modal = document.getElementById('resultModal');
  const resultBody = document.getElementById('modalResultBody') || document.getElementById('resultBody');
  const loadingSpinner = document.getElementById('loadingSpinner');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rollInput = document.getElementById('roll');
      const regInput = document.getElementById('reg');
      const boardInput = document.getElementById('board');
      const examInput = document.getElementById('exam');
      const yearInput = document.getElementById('year');

      const payload = {
        exam: examInput ? examInput.value : '',
        year: yearInput ? yearInput.value : '',
        board: boardInput ? boardInput.value : '',
        roll: rollInput ? rollInput.value : '',
        reg: regInput ? regInput.value : ''
      };

      if (modal) modal.style.display = 'flex';
      if (loadingSpinner) loadingSpinner.style.display = 'block';
      if (resultBody) resultBody.innerHTML = '';

      try {
        const res = await fetch('/api/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const textData = await res.text();
        if (loadingSpinner) loadingSpinner.style.display = 'none';

        let data;
        try {
          data = JSON.parse(textData);
        } catch (jsonErr) {
          if (resultBody) {
            resultBody.innerHTML = '<p style="color: #dc2626; text-align: center; padding: 20px;">সার্ভার থেকে অবৈধ রেসপন্স এসেছে।</p>';
          }
          return;
        }

        if (data.success && data.data) {
          if (resultBody) {
            resultBody.innerHTML = `
              <div style="font-family: sans-serif; line-height: 1.6; color: #1f2937;">
                <p><strong>Student Name:</strong> ${data.data.studentName || 'N/A'}</p>
                <p><strong>Father's Name:</strong> ${data.data.fatherName || 'N/A'}</p>
                <p><strong>Mother's Name:</strong> ${data.data.motherName || 'N/A'}</p>
                <p><strong>Roll No:</strong> ${data.data.roll || 'N/A'}</p>
                <p><strong>Registration No:</strong> ${data.data.reg || 'N/A'}</p>
                <p><strong>Board:</strong> ${data.data.board || 'N/A'}</p>
                <p><strong>GPA:</strong> <span style="color: #059669; font-weight: bold;">${data.data.gpa || 'N/A'}</span></p>
                <p><strong>Result:</strong> <span style="color: #059669; font-weight: bold;">${data.data.result || 'PASSED'}</span></p>
              </div>
            `;
          }
        } else {
          if (resultBody) {
            resultBody.innerHTML = `<p style="color: #dc2626; font-weight: bold; text-align: center; padding: 20px;">${data.message || 'কোনো তথ্য পাওয়া যায়নি।'}</p>`;
          }
        }
      } catch (err) {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (resultBody) {
          resultBody.innerHTML = '<p style="color: #dc2626; text-align: center; padding: 20px;">সার্ভারে রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে।</p>';
        }
      }
    });
  }
});