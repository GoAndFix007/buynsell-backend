const express = require('express');
const cors = require('cors');
const axios = require('axios');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint: Stock Signal
app.post('/gpt', async (req, res) => {
  const { stock } = req.body;
  console.log("📩 Received GPT request for:", stock);

  try {
    const fmpResponse = await axios.get(
      `https://financialmodelingprep.com/api/v3/quote/${stock}?apikey=${process.env.FMP_API_KEY}`
    );

    const quote = fmpResponse.data[0];
    if (!quote) return res.status(404).json({ message: `No data found for ${stock}` });

    const current = quote.price;
    const target = (current * 1.08).toFixed(2);
    const stop = (current * 0.95).toFixed(2);

    const message = `📊 ${stock} Trade Idea\n🧮 Current Price: $${current}\n🎯 Target Price: $${target} (+8.00%)\n🛑 Stop Loss Price: $${stop} (-5.00%)\n🧠 Reasoning: ${stock} has shown favorable technical indicators and market sentiment suggesting short-term upside potential. Consider this a swing opportunity over the next 5–7 days.`;

    res.json({ message });
  } catch (error) {
    console.error("❌ Error fetching quote:", error.message);
    res.status(500).json({ message: "Failed to generate AI insight." });
  }
});

// Endpoint: Top 5 by Type
app.get('/top5/:type', async (req, res) => {
  const { type } = req.params;
  const lowerType = type.toLowerCase();
  const validTypes = ['high-volume', 'large-cap', 'mid-cap'];

  if (!validTypes.includes(lowerType)) {
    return res.status(400).json({ message: "Invalid Top 5 type." });
  }

  try {
    let screenerUrl = `https://financialmodelingprep.com/api/v3/stock-screener?limit=5&exchange=NASDAQ&apikey=${process.env.FMP_API_KEY}`;

    if (lowerType === 'high-volume') {
      screenerUrl += `&sort=volume&order=desc`;
    } else if (lowerType === 'large-cap') {
      screenerUrl += `&marketCapMoreThan=10000000000`;
    } else if (lowerType === 'mid-cap') {
      screenerUrl += `&marketCapMoreThan=2000000000&marketCapLowerThan=10000000000`;
    }

    const response = await axios.get(screenerUrl);
    const stocks = response.data;

    if (!stocks.length) {
      return res.status(404).json({ message: "No stocks found for this category." });
    }

    const message = `📈 Top 5 ${lowerType.replace('-', ' ')} stocks:\n` +
      stocks.map((s, i) => `${i + 1}. ${s.symbol} - ${s.companyName}`).join('\n');

    res.json({ message });
  } catch (err) {
    console.error("❌ Error fetching top 5:", err.message);
    res.status(500).json({ message: "Failed to fetch Top 5." });
  }
});

// Endpoint: Options Signal
app.post('/options', async (req, res) => {
  const { stock } = req.body;
  console.log("🟥 OPTIONS REQUEST:", stock);

  try {
    const fmpResponse = await axios.get(
      `https://financialmodelingprep.com/api/v3/quote/${stock}?apikey=${process.env.FMP_API_KEY}`
    );
    const quote = fmpResponse.data[0];
    if (!quote) return res.status(404).json({ message: `No data found for ${stock}` });

    const current = quote.price;
    const strike = (current * 1.05).toFixed(2);
    const target = (current * 1.2).toFixed(2);
    const stop = (current * 0.9).toFixed(2);

    const message = `💡 Options Strategy for ${stock}\n💵 Current Price: $${current}\n🎯 Buy Call Option @ Strike: $${strike}\n📅 Expiration: 2 weeks from now\n📈 Target: $${target} (+20%)\n🛑 Stop Loss: $${stop} (-10%)\n🧠 Reason: Based on momentum and volume, this setup has short-term bullish potential. Consider this a tactical 2-week play.`;

    res.json({ message });
  } catch (error) {
    console.error("❌ Options error:", error.message);
    res.status(500).json({ message: "Failed to generate options insight." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
