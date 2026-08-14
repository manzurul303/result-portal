const axios = require('axios');

module.exports = async (req, res) => {
  // CORS Headers
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
    const { exam, year, board, roll, reg, value } = req.body || {};

    if (!roll && !req.body.eiin) {
      return res.status(400).json({ success: false, message: 'সঠিক রোল নম্বর অথবা EIIN প্রদান করুন।' });
    }

    // রেসপন্স সিমুলেশন / রিয়েল-টাইম পার্সিং টেস্ট
    return res.status(200).json({
      success: true,
      data: {
        studentName: "MD. TANVIR AHMED",
        fatherName: "MD. MUSTAFIZUR RAHMAN",
        motherName: "NASRIN BEGUM",
        roll: roll || "2113155323",
        reg: reg || "1813624105",
        board: (board || "jessore").toUpperCase(),
        result: "PASSED",
        gpa: "5.00"
      }
    });

  } catch (error) {
    console.error("Result processing error:", error.message);
    return res.status(200).json({
      success: false,
      message: 'গভর্নমেন্ট সার্ভার থেকে রেজাল্ট প্রসেস করতে ব্যর্থ হয়েছে। তথ্য যাচাই করে আবার চেষ্টা করুন।'
    });
  }
};