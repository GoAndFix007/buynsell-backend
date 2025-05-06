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

app.get('/top5', async (req, res) => {
  try {
    const symbols = ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'];
    const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${symbols.join(',')}?apikey=${FMP_API_KEY}`;
    const response = await axios.get(quoteUrl);
    const quotes = response.data;

    const ideas = quotes.map((q, i) => {
      const stopLoss = (q.price * 0.98).toFixed(2);
      const target = (q.price * 1.05).toFixed(2);
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

app.listen(PORT, () => {
  console.log(`🚀 BuyNSell 2.0 server running on http://localhost:${PORT}`);
});
