const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Official Govt Result Portal Endpoint Proxy
const OFFICIAL_GOVT_URL = "https://eboardresults.com/v2/home"; 

// 1. Individual Result Live Scraper
app.post("/api/verify-individual", async (req, res) => {
  const { exam, board, year, roll, reg } = req.body;

  try {
    // Live Request to official portal backend
    const govtResponse = await axios.post(
      "https://eboardresults.com/v2/get-result",
      new URLSearchParams({
        exam: exam,
        year: year,
        board: board,
        result_type: "1", // Individual
        roll: roll,
        reg: reg
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      }
    );

    const $ = cheerio.load(govtResponse.data);

    // Extracting Live Data from Official HTML Tables
    const studentInfo = {};
    const subjects = [];

    $(".result-table-info tr").each((i, el) => {
      const key = $(el).find("td").eq(0).text().trim();
      const val = $(el).find("td").eq(1).text().trim();
      if (key && val) studentInfo[key] = val;
    });

    $(".subject-table tbody tr").each((i, el) => {
      const code = $(el).find("td").eq(0).text().trim();
      const name = $(el).find("td").eq(1).text().trim();
      const paper = $(el).find("td").eq(2).text().trim();
      if (code && name) subjects.push({ code, name, paper });
    });

    if (Object.keys(studentInfo).length === 0) {
      return res.status(404).json({
        success: false,
        message: "Result not found or invalid Roll/Registration combination."
      });
    }

    return res.json({
      success: true,
      data: { studentInfo, subjects }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to connect to official Education Board server."
    });
  }
});

// 2. Institution Result Live Scraper
app.post("/api/verify-institution", async (req, res) => {
  const { exam, board, year, eiin } = req.body;

  try {
    const govtResponse = await axios.post(
      "https://eboardresults.com/v2/get-result",
      new URLSearchParams({
        exam: exam,
        year: year,
        board: board,
        result_type: "2", // Institution
        eiin: eiin
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      }
    );

    const $ = cheerio.load(govtResponse.data);
    const institutionInfo = {};

    $(".inst-result-table tr").each((i, el) => {
      const key = $(el).find("td").eq(0).text().trim();
      const val = $(el).find("td").eq(1).text().trim();
      if (key && val) institutionInfo[key] = val;
    });

    if (Object.keys(institutionInfo).length === 0) {
      return res.status(404).json({
        success: false,
        message: "Institution record not found for this EIIN."
      });
    }

    return res.json({
      success: true,
      data: { institutionInfo }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Official server timeout or endpoint error."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Live Scraper Proxy Server running on http://localhost:${PORT}`);
});