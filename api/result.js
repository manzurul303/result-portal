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
    // Body Parsing safely
    let bodyData = req.body;
    if (typeof req.body === 'string') {
      try {
        bodyData = JSON.parse(req.body);
      } catch (e) {
        bodyData = {};
      }
    }
    
    const { exam, year, board, roll, reg, eiin } = bodyData || {};

    if (!roll && !eiin) {
      return res.status(200).json({
        success: false,
        message: 'অনুগ্রহ করে রোল নম্বর (Roll) বা EIIN প্রদান করুন।'
      });
    }

    // Success JSON response
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
    console.error("Result handler error:", error);
    return res.status(200).json({
      success: false,
      message: 'সার্ভার প্রসেসিংয়ে সাময়িক সমস্যা হয়েছে। আবার চেষ্টা করুন।'
    });
  }
};