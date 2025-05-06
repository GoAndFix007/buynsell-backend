// ✅ Full server.js for BuyNSell 2.0
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

// 📈 GPT Swing Trade Setup
app.post('/gpt', async (req, res) => {
  const { stock } = req.body;
  console.log("📩 Received request for stock:", stock);

  try {
    const [quote, rsi, macd, ma50, ma200] = await Promise.all([
      axios.get(`https://financialmodelingprep.com/api/v3/quote/${stock}?apikey=${process.env.FMP_API_KEY}`),
      axios.get(`https://financialmodelingprep.com/api/v4/technical_indicator/rsi/${stock}?apikey=${process.env.FMP_API_KEY}`),
      axios.get(`https://financialmodelingprep.com/api/v4/technical_indicator/macd/${stock}?apikey=${process.env.FMP_API_KEY}`),
      axios.get(`https://financialmodelingprep.com/api/v4/technical_indicator/sma/${stock}?period=50&apikey=${process.env.FMP_API_KEY}`),
      axios.get(`https://financialmodelingprep.com/api/v4/technical_indicator/sma/${stock}?period=200&apikey=${process.env.FMP_API_KEY}`),
    ]);

    const q = quote.data[0];
    const prompt = `
You are a professional swing trading assistant. Analyze the following stock based on technical indicators and recommend a swing trade setup (1–5 day outlook).

Stock: ${stock}
Price: $${q.price}
Volume: ${q.volume}
RSI: ${rsi.data[0]?.value || 'N/A'}
MACD Signal: ${macd.data[0]?.signal || 'N/A'}
50-day MA: ${ma50.data[0]?.value || 'N/A'}
200-day MA: ${ma200.data[0]?.value || 'N/A'}

Provide:
- 📈 Recommendation (BUY / HOLD / SELL)
- 🎯 Target Price (3–5 days)
- 🛑 Stop Loss
- 🧠 Short Reasoning
    `;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: "user", content: prompt }],
    });

    const message = aiResponse.choices[0].message.content;
    console.log("🤖 Swing Trade Response:", message);
    res.json({ message });
  } catch (error) {
    console.error('🔥 GPT API error:', error.response?.data || error.message || error);
    res.json({ message: "⚠️ Failed to generate swing trade insight." });
  }
});

// 🔴 GPT Options Trade Setup
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
- 💹 Option Trade: Buy Call or Put @ Strike with Expiration Date
- 🎯 Profit Target (e.g., +70%)
- 🛑 Stop-Loss (e.g., -40%)
- 🧠 Reasoning using technical indicators (MACD, RSI, trends)

Format clearly.
    `;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: "user", content: prompt }],
    });

    const message = aiResponse.choices[0].message.content;
    console.log("📈 Options Trade Response:", message);
    res.json({ message });
  } catch (error) {
    console.error('🔥 Options API error:', error.response?.data || error.message || error);
    res.json({ message: "⚠️ Failed to generate options insight." });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 BuyNSell 2.0 server live at http://localhost:${PORT}`);
});
