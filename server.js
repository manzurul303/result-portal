import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Scraper route for retrieving result data
app.get('/api/scrape', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Target URL parameter is required' });
  }

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(data);
    const results = [];

    // Extract content from targeted HTML elements (e.g., table rows)
    $('table tr').each((_, element) => {
      const text = $(element).text().trim().replace(/\s+/g, ' ');
      if (text) {
        results.push(text);
      }
    });

    res.json({ success: true, total: results.length, data: results });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch external resource', 
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});