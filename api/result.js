const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { exam, year, board, roll, reg, captcha } = req.body || {};

    if (!roll) {
      return res.status(400).json({ success: false, message: 'রোল নম্বর প্রদান করুন।' });
    }

    // ব্যাকএন্ড রেজাল্ট প্রসেসিং বা গভমেন্ট সার্ভার সিমুলেশন
    // বাস্তব পোর্টালে পোস্ট রিকোয়েস্ট পাঠানোর জায়গা
    return res.status(200).json({
      success: true,
      data: {
        studentName: "MD. RAHIM HOSSAIN",
        fatherName: "ABDUL KARIM",
        motherName: "ROKEYA BEGUM",
        roll: roll,
        reg: reg || "N/A",
        board: board || "DHAKA",
        result: "PASSED",
        gpa: "5.00",
        grades: [
          { subject: "Bangla", grade: "A+" },
          { subject: "English", grade: "A+" },
          { subject: "Mathematics", grade: "A+" },
          { subject: "Physics", grade: "A+" },
          { subject: "Chemistry", grade: "A+" },
          { subject: "Biology", grade: "A+" }
        ]
      }
    });

  } catch (error) {
    console.error("Result fetch error:", error.message);
    return res.status(500).json({
      success: false,
      message: 'রেজাল্ট পেতে সমস্যা হচ্ছে। প্রদত্ত তথ্য যাচাই করে আবার চেষ্টা করুন।'
    });
  }
};