// Function to switch between Individual and Institution Tabs
function switchTab(tabName) {
  const individualTab = document.getElementById('individualTab');
  const institutionTab = document.getElementById('institutionTab');
  const tabIndividualBtn = document.getElementById('tab-individual');
  const tabInstitutionBtn = document.getElementById('tab-institution');

  if (tabName === 'individual') {
    individualTab.classList.remove('hidden');
    institutionTab.classList.add('hidden');
    tabIndividualBtn.classList.add('active');
    tabInstitutionBtn.classList.remove('active');
  } else if (tabName === 'institution') {
    institutionTab.classList.remove('hidden');
    individualTab.classList.add('hidden');
    tabInstitutionBtn.classList.add('active');
    tabInstitutionBtn.classList.remove('active');
  }
}

// Global Variables for API Session
let currentSessionCookie = '';

// Load Math CAPTCHA on Page Load
document.addEventListener('DOMContentLoaded', async () => {
  fetchCaptcha();
});

// Fetch Math Question / Captcha from Backend API
async function fetchCaptcha() {
  try {
    const response = await fetch('/api/captcha');
    const data = await response.json();

    if (data.success) {
      currentSessionCookie = data.sessionCookie || '';
      // যদি ক্যাপচা দেখানোর ইনপুট/লেবেল থাকে তা আপডেট করবে
      const captchaLabel = document.getElementById('captchaQuestion');
      if (captchaLabel) {
        captchaLabel.textContent = data.mathQuestion;
      }
    }
  } catch (error) {
    console.error('CAPTCHA Fetch Error:', error);
  }
}

// Handle Form Submission for Individual Result
const individualForm = document.getElementById('individualForm');
if (individualForm) {
  individualForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const exam = document.getElementById('examType').value;
    const board = document.getElementById('boardName').value;
    const year = document.getElementById('examYear').value;
    const roll = individualForm.querySelector('input[placeholder*="Roll"]').value.trim();
    const reg = individualForm.querySelector('input[placeholder*="Registration"]').value.trim();
    const captchaValue = document.getElementById('captchaInput')?.value.trim() || '';

    if (!roll) {
      alert('অনুগ্রহ করে আপনার বোর্ড রোল নম্বরটি লিখুন।');
      return;
    }

    try {
      const response = await fetch('/api/result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exam,
          board,
          year,
          roll,
          reg,
          value: captchaValue,
          clientCookie: currentSessionCookie
        })
      });

      const data = await response.json();

      if (data.success) {
        // রেজাল্ট টেবিল দেখানোর জন্য কন্টেইনার
        const resultDisplay = document.getElementById('resultDisplay');
        if (resultDisplay) {
          resultDisplay.innerHTML = data.html;
          resultDisplay.classList.remove('hidden');
        } else {
          alert('রেজাল্ট সফলভাবে পাওয়া গেছে!');
        }
      } else {
        alert(data.message || 'রেজাল্ট পাওয়া যায়নি। প্রদত্ত তথ্য যাচাই করুন।');
      }
    } catch (error) {
      console.error('Result Fetch Error:', error);
      alert('সার্ভারে সমস্যা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন।');
    }
  });
}