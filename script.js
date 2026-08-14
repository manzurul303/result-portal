// ট্যাব একটিভ ইফেক্ট হ্যান্ডলিং
document.addEventListener('DOMContentLoaded', () => {
  // ইন্ডিভিজুয়াল ও ইনস্টিটিউশন ট্যাবের এলিমেন্ট নির্বাচন
  const tabButtons = document.querySelectorAll('div[class*="tab"], button[class*="tab"], .tab-item'); 

  // যদি আপনার ট্যাবের জন্য নির্দিষ্ট কোনো সাধারণ ক্লাস থাকে, তবে সব ট্যাব বাটন এভাবে সিলেক্ট করা যায়:
  const individualTab = Array.from(document.querySelectorAll('*')).find(el => el.children.length === 0 && el.textContent.trim() === 'Individual Verification')?.parentElement;
  const institutionTab = Array.from(document.querySelectorAll('*')).find(el => el.children.length === 0 && el.textContent.trim() === 'Institution Result')?.parentElement;

  // আরো সহজ ও নিরাপদ উপায়: পেজের প্রথম দুই ট্যাব বাটন সিলেক্ট করা
  const allTabs = document.querySelectorAll('.tab-btn, [role="tab"]');

  // সার্বজনীন ট্যাব সিঙ্ক লজিক
  document.addEventListener('click', (e) => {
    const targetTab = e.target.closest('button, div');
    
    if (targetTab && (targetTab.innerText.includes('Individual Verification') || targetTab.innerText.includes('Institution Result'))) {
      
      // ১. সব ট্যাবের প্যারেন্ট/বাটন থেকে একটিভ স্টাইল মুছে দেওয়া
      document.querySelectorAll('*').forEach(el => {
        if (el.innerText && (el.innerText.includes('Individual Verification') || el.innerText.includes('Institution Result'))) {
          el.classList.remove('active', 'border-b-2', 'border-emerald-600', 'text-emerald-600');
        }
      });

      // ২. ক্লিক করা ট্যাবে অ্যাক্টিভ ইফেক্ট যুক্ত করা
      targetTab.classList.add('active');
      
      // যদি ইনলাইন স্টাইল বা নির্দিষ্ট সিএসএস ক্লাস থাকে, সেটি নিশ্চিত করা
      if (targetTab.innerText.includes('Institution Result')) {
        targetTab.style.borderColor = '#059669'; // সবুজ বর্ডার
        targetTab.style.color = '#059669'; // সবুজ ফন্ট
      }
    }
  });
});