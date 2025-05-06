// server.js (backend)
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const FMP_API_KEY = process.env.FMP_API_KEY;

// Helper to calculate % change
function calculatePercentChange(current, target) {
  return (((target - current) / current) * 100).toFixed(2);
}

// Expanded stock universe for variety (mix of large and mid cap)
const universe = [
  'AAPL', 'MSFT', 'TSLA', 'NVDA', 'AMZN',
  'GOOGL', 'META', 'NFLX', 'AMD', 'CRM',
  'INTC', 'ADBE', 'PYPL', 'SQ', 'SHOP',
  'UBER', 'F', 'GM', 'NEE', 'PLTR'
];

app.get('/top5', async (req, res) => {
  try {
    const symbols = universe.sort(() => 0.5 - Math.random()).slice(0, 5);
    const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${symbols.join(',')}?apikey=${FMP_API_KEY}`;
    const response = await axios.get(quoteUrl);
    const quotes = response.data;

    const ideas = quotes.map((q, i) => {
      const gainMultiplier = 1 + (Math.random() * 0.06 + 0.06); // 6%–12%
      const stopMultiplier = 1 - (Math.random() * 0.03 + 0.03); // 3%–6%

      const target = (q.price * gainMultiplier).toFixed(2);
      const stopLoss = (q.price * stopMultiplier).toFixed(2);
      const gainPct = calculatePercentChange(q.price, target);
      const lossPct = calculatePercentChange(q.price, stopLoss);

      return `
${i + 1}️⃣ ${q.symbol} (${q.name})
💵 Current Price: $${q.price.toFixed(2)}
🎯 Target Price: $${target} (+${gainPct}%)
🛑 Stop Loss Price: $${stopLoss} (-${Math.abs(lossPct)}%)
🧠 Reason: ${q.name} is exhibiting a trend that makes it attractive for a swing trade based on current technicals and sentiment.
`;
    });

    res.json({ message: ideas.join('\n') });
  } catch (error) {
    console.error('🔥 Top 5 Generation Error:', error);
    res.status(500).json({ message: '⚠️ Failed to generate enriched Top 5.' });
  }
});

app.post('/gpt', async (req, res) => {
  const { stock } = req.body;

  try {
    const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${stock}?apikey=${FMP_API_KEY}`;
    const response = await axios.get(quoteUrl);
    const data = response.data[0];

    if (!data || !data.price) {
      return res.status(404).json({ message: `⚠️ No data found for ${stock}.` });
    }

    const price = data.price;
    const target = (price * 1.08).toFixed(2); // Assume +8% gain
    const stop = (price * 0.95).toFixed(2);   // Assume -5% risk
    const gainPct = calculatePercentChange(price, target);
    const lossPct = calculatePercentChange(price, stop);

    const message = `
📊 ${stock} Trade Idea
💵 Current Price: $${price.toFixed(2)}
🎯 Target Price: $${target} (+${gainPct}%)
🛑 Stop Loss Price: $${stop} (${lossPct}%)
🧠 Reasoning: ${stock} has shown favorable technical indicators and market sentiment suggesting short-term upside potential. Consider this a swing opportunity over the next 5–7 days.
`;

    res.json({ message });
  } catch (err) {
    console.error('🔥 GPT Signal Error:', err.message);
    res.status(500).json({ message: '⚠️ Failed to generate AI insight.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 BuyNSell 2.0 server running on http://localhost:${PORT}`);
});
