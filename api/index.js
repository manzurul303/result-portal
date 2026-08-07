const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Localhost-এ public ফোল্ডারের ফাইল সার্ভ করার জন্য
app.use(express.static(path.join(__dirname, '../public')));

let sessionCookie = '';

// CAPTCHA Endpoint
app.get(['/api/captcha', '/captcha'], async (req, res) => {
  try {
    const response = await axios.get('https://www.educationboardresults.gov.bd/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const cookies = response.headers['set-cookie'];
    if (cookies) {
      sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');
    }

    const $ = cheerio.load(response.data);
    
    let mathQuestion = '';
    $('td').each((i, el) => {
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
    res.status(500).json({ success: false, message: 'সরকারি সার্ভারে কানেক্ট করা যাচ্ছে না।' });
  }
});

// Result Endpoint
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

    const response = await axios.post('https://www.educationboardresults.gov.bd/result.php', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': activeCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.educationboardresults.gov.bd/'
      },
      timeout: 12000
    });

    const $ = cheerio.load(response.data);
    const resultTable = $('table.tbl_result').parent().html();

    if (resultTable) {
      res.json({ success: true, html: resultTable });
    } else {
      res.json({ success: false, message: 'প্রদত্ত তথ্য ভুল অথবা রেজাল্ট পাওয়া যায়নি।' });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: 'সার্ভার রেসপন্স করেনি, আবার চেষ্টা করুন।' });
  }
});

// Localhost Server Runner
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Local server running on http://localhost:${PORT}`);
  });
}

module.exports = app;