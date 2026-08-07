const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 1. Fetch Math CAPTCHA from official government portal
app.get('/api/captcha', async (req, res) => {
  try {
    const response = await axios.get('https://www.educationboardresults.gov.bd/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    const cookies = response.headers['set-cookie'];
    const cookieHeader = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

    const $ = cheerio.load(response.data);
    
    // Extract math expression e.g., "5 + 3"
    const mathText = $('td:contains("+")').text().trim();

    res.json({ 
      success: true, 
      mathQuestion: mathText || '5 + 3',
      sessionCookie: cookieHeader 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Official server connect error' });
  }
});

// 2. Submit Result Request to educationboardresults.gov.bd
app.post('/api/result', async (req, res) => {
  const { exam, year, board, roll, reg, value, sessionCookie } = req.body;

  try {
    const params = new URLSearchParams();
    params.append('sr', '3'); // Standard Result
    params.append('et', '2'); // Exam type
    params.append('exam', exam);
    params.append('year', year);
    params.append('board', board);
    params.append('roll', roll);
    params.append('reg', reg);
    params.append('value', value); // Math result answer

    const response = await axios.post('https://www.educationboardresults.gov.bd/result.php', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': sessionCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://www.educationboardresults.gov.bd/'
      }
    });

    const $ = cheerio.load(response.data);
    const resultTable = $('table.tbl_result').parent().html();

    if (resultTable) {
      res.json({ success: true, html: resultTable });
    } else {
      res.json({ success: false, message: 'তথ্য সঠিক নয় অথবা রেজাল্ট পাওয়া যায়নি।' });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: 'সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন।' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;