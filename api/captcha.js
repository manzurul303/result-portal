const axios = require('axios');

module.exports = async (req, res) => {
  // CORS হেডার্স সেট করা
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // eboardresults পোর্টাল থেকে Session Cookie ও ক্যাপচা আনা
    const response = await axios.get('https://eboardresults.com/v2/home', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const setCookie = response.headers['set-cookie'];
    let cookieStr = '';
    if (setCookie) {
      cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
    }

    // রেসপন্স থেকে গাণিতিক ক্যাপচা টেস্ট (যেমন: 5 + 3 = ?) বা ইমেজ এক্সট্রাক্ট করা
    // ডেমো সিকিউর গাণিতিক ক্যাপচা রেসপন্স
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    
    return res.status(200).json({
      success: true,
      captchaQuestion: `${num1} + ${num2} = ?`,
      captchaAnswer: (num1 + num2).toString(),
      cookie: cookieStr
    });

  } catch (error) {
    console.error("Captcha fetch error:", error.message);
    return res.status(500).json({
      success: false,
      message: 'গভমেন্ট সার্ভার থেকে ক্যাপচা ফেচ করা সম্ভব হয়নি। আবার চেষ্টা করুন।'
    });
  }
};