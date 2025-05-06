// Enhanced server.js for BuyNSell 2.0
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const OpenAI = require('openai');
require('dotenv').config();

console.log("✅ Loaded API Key:", process.env.OPENAI_API_KEY ? "✔️ Loaded" : "❌ Not Found");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 GPT Swing Trade Signal
app.post('/gpt', async (req, res) => {
  const { stock } = req.body;
  console.log("📩 Request for:", stock);

  try {
    const [quote, rsi, macd, ma50, ma200] = await Promise.all([
      axios.get(`https://financialmodelingprep.com/api/v3/quote/${stock}?apikey=${process.env.FMP_API_KEY}`),
      axios.get(`https://financialmodelingprep.com/api/v4/technical_indicator/rsi/${stock}?apikey=${process.env.FMP_API_KEY}`),
      axios.get(`https://financialmodelingprep.com/api/v4/technical_indicator/macd/${stock}?apikey=${process.env.FMP_API_KEY}`),
      axios.get(`https://financialmodelingprep.com/api/v4/technical_indicator/sma/${stock}?period=50&apikey=${process.env.FMP_API_KEY}`),
      axios.get(`https://financialmodelingprep.com/api/v4/technical_indicator/sma/${stock}?period=200&apikey=${process.env.FMP_API_KEY}`),
    ]);

    const q = quote.data?.[0];
    if (!q || !q.price) {
      return res.json({ message: "⚠️ No valid price data available." });
    }

    const prompt = `
You are a professional swing trading assistant. Analyze the stock below using technical indicators and current price to suggest a swing trade.

Stock: ${stock}
Current Price: $${q.price}
Volume: ${q.volume || 'N/A'}
RSI: ${rsi.data?.[0]?.value || 'N/A'}
MACD Signal: ${macd.data?.[0]?.signal || 'N/A'}
50-day MA: ${ma50.data?.[0]?.value || 'N/A'}
200-day MA: ${ma200.data?.[0]?.value || 'N/A'}

Based on this, provide a clear swing trade recommendation:
- 📈 Recommendation: Buy / Hold / Sell
- 🎯 Target Price (in dollars)
- 🛑 Stop Loss Price (in dollars)
- 🧠 Reasoning (1-2 short sentences)
- 🗓️ Expected timeframe (3–5 days)
`;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: "user", content: prompt }],
    });

    const message = aiResponse.choices[0].message.content;
    res.json({ message });

  } catch (error) {
    console.error("🔥 GPT Error:", error.response?.data || error.message || error);
    res.json({ message: "⚠️ Failed to generate swing trade insight." });
  }
});

// 🧠 GPT Options Trade Setup
app.post('/options', async (req, res) => {
  const { stock } = req.body;
  console.log("📩 Received options request for:", stock);

  try {
    const quote = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${stock}?apikey=${process.env.FMP_API_KEY}`);
    const q = quote.data[0];

    const prompt = `
You are an expert options trader. Based on the stock data, recommend a short-term options trade.

Stock: ${stock}
Price: $${q.price}

Output:
- 💹 Option Trade: Buy Call/Put @ Strike with Expiration Date
- 🎯 Profit Target (e.g., 70% gain)
- 🛑 Stop-Loss (e.g., 50% drop)
- 🧠 Reasoning
`;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: "user", content: prompt }],
    });

    const message = aiResponse.choices[0].message.content;
    res.json({ message });
  } catch (error) {
    console.error('🔥 Options API error:', error.response?.data || error.message || error);
    res.json({ message: "⚠️ Failed to generate options insight." });
  }
});

// 🔝 Top 5 AI Picks (Now includes price, target, stop)
app.get('/top5', async (req, res) => {
  const prompt = `
You are a swing trading assistant. Based on today’s market data, give your top 5 stock picks.

For each, include:
- 📈 Stock Symbol and Name
- 💵 Current Price (in dollars)
- 🎯 Target Price (in dollars)
- 🛑 Stop Loss Price (in dollars)
- 🧠 1-sentence Reason

Format cleanly and add a reminder at the bottom that this is not financial advice.
  `;

  try {
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });

    const message = aiResponse.choices[0].message.content;
    res.json({ message });
  } catch (error) {
    console.error("🔥 Top 5 Error:", error.response?.data || error.message || error);
    res.json({ message: "⚠️ Failed to generate Top 5 picks." });
  }
});

// ✅ Server Listen
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 BuyNSell 2.0 server live at http://localhost:${PORT}`);
});
