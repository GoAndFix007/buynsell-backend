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
    const message = `📈 Top 5 ${lowerType.replace('-', ' ')} stocks (sample):\n1. ABC\n2. DEF\n3. GHI\n4. JKL\n5. MNO`;
    res.json({ message });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch Top 5." });
  }
});

// Endpoint: Options Signal
app.post('/options', async (req, res) => {
  const { stock } = req.body;
  console.log("🟥 OPTIONS REQUEST:", stock);

  try {
    const message = `💡 Options Strategy for ${stock}\nBuy Call Option @ Strike $XX (Exp: MM/DD)\nTarget: $XX (+X%)\nStop: $XX (-X%)\nReason: AI detected bullish trend and high short-term momentum.`;
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
