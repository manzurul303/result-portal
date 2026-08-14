module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // দুটি র্যান্ডম সংখ্যা জেনারেট করা
    const num1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const num2 = Math.floor(Math.random() * 8) + 1; // 1 to 8
    
    // ব্যাকএন্ড থেকেই প্রপার JSON রেসপন্স পাঠানো
    return res.status(200).json({
      success: true,
      captchaQuestion: `${num1} + ${num2} = ?`,
      captchaAnswer: (num1 + num2).toString()
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'সার্ভার থেকে ক্যাপচা আনা যায়নি।'
    });
  }
};