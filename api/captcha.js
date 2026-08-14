const svgCaptcha = require('svg-captcha');

module.exports = async (req, res) => {
  // CORS হেডার্স সেট করা
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ক্যাপচা তৈরির কনফিগারেশন
    const captchaOptions = {
      size: 5,        // কয়টা ক্যারেক্টার থাকবে
      noise: 3,       // কতগুলো আঁকাবাঁকা রেখা থাকবে (নয়েজ)
      color: true,     // ক্যারেক্টারগুলো রঙিন হবে কি না
      background: '#f1f5f9' // ক্যাপচার ব্যাকগ্রাউন্ড কালার
    };

    // ক্যাপচা জেনারেট করা
    const captcha = svgCaptcha.create(captchaOptions);

    // তুমি যেহেতু 'mathQuestion' নামে স্ক্রিপ্টে ডেটা খুঁজো, আমরা SVG ইমেজটি ওই নামে পাঠাব
    // এবং আসল উত্তরটি সেশন বা কুকিতে সেভ করার জন্য পাঠাব
    
    return res.status(200).json({
      success: true,
      // আসল ক্যারেক্টারগুলো (রেজাল্ট ফেচ করার সময় যাচাইয়ের জন্য)
      captchaText: captcha.text, 
      // SVG ইমেজটি স্ট্রং হিসেবে, যা ফ্রন্টএন্ডে সরাসরি দেখানো যাবে
      mathQuestion: captcha.data // আমরা ওই পুরোনো নামটাই ব্যবহার করছি যাতে script.js এ হাত দিতে না হয়
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'সার্ভার থেকে ক্যাপচা তৈরি করা যায়নি।'
    });
  }
};