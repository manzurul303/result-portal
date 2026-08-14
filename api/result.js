module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let bodyData = {};
    if (typeof req.body === 'string') {
      try {
        bodyData = JSON.parse(req.body);
      } catch (e) {
        bodyData = {};
      }
    } else if (req.body) {
      bodyData = req.body;
    }

    const { exam, year, board, roll, reg, eiin, captcha } = bodyData;

    // Response structure
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
    console.error("API Error:", error);
    return res.status(200).json({
      success: false,
      message: 'সার্ভারে সাময়িক সমস্যা হয়েছে। আবার চেষ্টা করুন।'
    });
  }
};