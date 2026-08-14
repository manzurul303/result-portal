try {
      const res = await fetch('/api/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Response Text আকারে নিয়ে JSON চেষ্টা করা
      const textData = await res.text();
      loadingSpinner.style.display = 'none';

      let data;
      try {
        data = JSON.parse(textData);
      } catch (jsonErr) {
        resultBody.innerHTML = '<p style="color: #dc2626; text-align: center; padding: 20px;">সার্ভার থেকে অবৈধ রেসপন্স এসেছে। Vercel API রুট চেক করুন।</p>';
        return;
      }

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
      resultBody.innerHTML = '<p style="color: #dc2626; text-align: center; padding: 20px;">নেটওয়ার্ক কানেকশন অথবা সার্ভারে রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে।</p>';
    }