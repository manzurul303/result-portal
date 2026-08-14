const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

// সেশন কুকি ধরে রাখার জন্য
const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { exam, year, board, roll, reg, value } = req.body;

  try {
    // সরকারি পোর্টালে POST রিকোয়েস্ট পাঠানো (রিয়েল-টাইম)
    const govtResponse = await client.post('http://www.educationboardresults.gov.bd/result.php', new URLSearchParams({
      sr: '3',
      et: '2',
      exam: exam, // e.g. ssc
      year: year, // e.g. 2024
      board: board, // e.g. dhaka
      roll: roll,
      reg: reg,
      v_code: value // ইউজার কর্তৃক ইনপুটকৃত ক্যাপচা
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    // গভর্নমেন্টের রেসপন্স HTML পার্স করা (Cheerio দিয়ে)
    const $ = cheerio.load(govtResponse.data);

    // সরকারি সাইটের টেবিল থেকে ডেটা খুঁজে বের করা
    const studentName = $('td:contains("Name of Student")').next().text().trim();
    const gpa = $('td:contains("GPA")').next().text().trim();
    const fatherName = $('td:contains("Father\'s Name")').next().text().trim();

    if (!studentName) {
      return res.status(400).json({ success: false, message: 'ভুল তথ্য বা ক্যাপচা দেওয়া হয়েছে অথবা রেজাল্ট পাওয়া যায়নি।' });
    }

    return res.status(200).json({
      success: true,
      data: {
        studentName,
        fatherName,
        gpa,
        result: 'PASSED'
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'গভর্নমেন্ট সার্ভারের সাথে সংযোগ করা যায়নি।' });
  }
};