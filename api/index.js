const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let sessionCookie = '';

// Target Base URL (v2 update)
const BASE_URL = 'https://www.educationboardresults.gov.bd/v2/home';
const RESULT_URL = 'https://www.educationboardresults.gov.bd/result.php'; // প্রয়োজন অনুযায়ী v2 রেজাল্ট এন্ডপয়েন্টে আপডেট করুন

// 1. CAPTCHA & Session Endpoint
app.get(['/api/captcha', '/captcha'], async (req, res) => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': BASE_URL
      },
      timeout: 10000
    });

    const cookies = response.headers['set-cookie'];
    if (cookies) {
      sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');
    }

    const $ = cheerio.load(response.data);
    
    let mathQuestion = '';
    $('td, label, div').each((i, el) => {
      const text = $(el).text().trim();
      if (text.includes('+') && text.length < 15) {
        mathQuestion = text;
      }
    });

    res.json({
      success: true,
      mathQuestion: mathQuestion || '5 + 3',
      sessionCookie: sessionCookie
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'সরকারি v2 সার্ভারে কানেক্ট করা যাচ্ছে না।' });
  }
});

// 2. Result Fetching Endpoint
app.post(['/api/result', '/result'], async (req, res) => {
  const { exam, year, board, roll, reg, value, clientCookie } = req.body;

  try {
    const params = new URLSearchParams();
    params.append('sr', '3');
    params.append('et', '2');
    params.append('exam', exam || 'hsc');
    params.append('year', year || '2025');
    params.append('board', board || 'jessore');
    params.append('roll', roll);
    params.append('reg', reg || '');
    params.append('value', value);

    const activeCookie = clientCookie || sessionCookie;

    const response = await axios.post(RESULT_URL, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': activeCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': BASE_URL,
        'Origin': 'https://www.educationboardresults.gov.bd'
      },
      timeout: 12000
    });

    const $ = cheerio.load(response.data);
    const resultTable = $('table.tbl_result').parent().html() || $('table').parent().html();

    if (resultTable) {
      res.json({ success: true, html: resultTable });
    } else {
      res.json({ success: false, message: 'প্রদত্ত তথ্য ভুল অথবা রেজাল্ট পাওয়া যায়নি।' });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: 'সার্ভার রেসপন্স করেনি, আবার চেষ্টা করুন।' });
  }
});

// Localhost Testing Support
if (require.main === module) {
  app.use(express.static(path.join(__dirname, '..')));
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;