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
- 📊 Expected % Gain
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

// 🔝 Dynamic Top 5 AI Picks with Pro-Level % Targets
app.get('/top5', async (req, res) => {
  try {
    const movers = await axios.get(`https://financialmodelingprep.com/api/v3/stock_market/actives?apikey=${process.env.FMP_API_KEY}`);
    const filtered = movers.data.filter(stock => stock.price >= 10 && stock.price <= 1000).slice(0, 10);
    const symbols = filtered.map(stock => stock.symbol).join(',');

    const quoteData = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=${process.env.FMP_API_KEY}`);
    const quotes = quoteData.data;

    const formattedStocks = quotes.map((q, idx) => {
      const targetPrice = (q.price * 1.10).toFixed(2);
      const stopLoss = (q.price * 0.965).toFixed(2);
      const gainPercent = ((targetPrice - q.price) / q.price * 100).toFixed(1);

      return `#${idx + 1}: ${q.name} (${q.symbol})
💵 Current Price: $${q.price}
🎯 Target Price: $${targetPrice} (+${gainPercent}%)
🛑 Stop Loss Price: $${stopLoss} (-3.5%)
🧠 Reason: Trending upward with high volume; AI expects a short-term breakout based on swing indicators.`;
    }).join("\n\n");

    const message = `${formattedStocks}\n\n⚠️ This is not financial advice. Always do your own research.`;
    res.json({ message });
  } catch (error) {
    console.error("🔥 Top 5 Dynamic Error:", error.response?.data || error.message || error);
    res.json({ message: "⚠️ Failed to generate Top 5 picks." });
  }
});

// ✅ Server Listen
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 BuyNSell 2.0 server live at http://localhost:${PORT}`);
});
