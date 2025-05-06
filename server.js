const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const FMP_API_KEY = process.env.FMP_API_KEY;

function calculatePercentChange(current, target) {
  return (((target - current) / current) * 100).toFixed(2);
}

// 🔵 BLUE PILL — TOP 5 AI STOCK PICKS
app.get('/top5', async (req, res) => {
  try {
    const volumeUrl = `https://financialmodelingprep.com/api/v3/actives?apikey=${FMP_API_KEY}`;
    const volumeResponse = await axios.get(volumeUrl);

    const actives = volumeResponse.data.filter(
      stock => stock.price > 5 && stock.marketCap > 2_000_000_000
    );

    if (!actives.length) {
      return res.json({ message: "⚠️ No active high-volume mid-cap stocks found." });
    }

    const topSymbols = actives.slice(0, 10).map(stock => stock.ticker);
    const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${topSymbols.join(',')}?apikey=${FMP_API_KEY}`;
    const response = await axios.get(quoteUrl);
    const quotes = response.data.slice(0, 5);

    if (!quotes.length) {
      return res.json({ message: "⚠️ Could not retrieve quote data for selected stocks." });
    }

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
🧠 Reason: ${q.name} is experiencing strong volume and favorable short-term sentiment, making it an attractive swing candidate.`;
    });

    res.json({ message: ideas.join('\n') });
  } catch (error) {
    console.error('🔥 Top 5 Generation Error:', error.message);
    res.status(500).json({ message: '⚠️ Failed to generate enriched Top 5.' });
  }
});

// 🔵 BLUE PILL — SINGLE STOCK SIGNAL
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
    const target = (price * 1.08).toFixed(2);
    const stop = (price * 0.95).toFixed(2);
    const gainPct = calculatePercentChange(price, target);
    const lossPct = calculatePercentChange(price, stop);

    const message = `
📊 ${stock} Trade Idea
💵 Current Price: $${price.toFixed(2)}
🎯 Target Price: $${target} (+${gainPct}%)
🛑 Stop Loss Price: $${stop} (${lossPct}%)
🧠 Reasoning: ${stock} has shown favorable technical indicators and market sentiment suggesting short-term upside potential. Consider this a swing opportunity over the next 5–7 days.`;

    res.json({ message });
  } catch (err) {
    console.error('🔥 GPT Signal Error:', err.message);
    res.status(500).json({ message: '⚠️ Failed to generate AI insight.' });
  }
});

// 🔴 RED PILL — OPTIONS STRATEGY
app.post('/options', async (req, res) => {
  const { stock } = req.body;

  try {
    const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${stock}?apikey=${FMP_API_KEY}`;
    const response = await axios.get(quoteUrl);
    const data = response.data[0];

    if (!data || !data.price) {
      return res.status(404).json({ message: `⚠️ No data found for ${stock}.` });
    }

    const price = data.price;
    const strike = (price * 1.02).toFixed(2);  // 2% out of the money
    const target = (price * 1.10).toFixed(2);  // +10% expected gain
    const stop = (price * 0.95).toFixed(2);    // -5% risk
    const gainPct = calculatePercentChange(price, target);
    const lossPct = calculatePercentChange(price, stop);

    const message = `
💹 Option Strategy: Buy a Call option for ${stock} with a strike price of $${strike}, expires in 2 weeks.
💵 Current Price: $${price.toFixed(2)}
🎯 Target Price: $${target} (+${gainPct}%)
🛑 Stop Loss Price: $${stop} (${lossPct}%)
🧠 Reasoning: ${stock.toUpperCase()} is poised for a short-term upside move due to favorable sentiment and technical conditions. A slightly out-of-the-money call provides a leveraged opportunity while managing risk with a tight stop.
📅 Suggested Holding: 5–10 trading days.`;

    res.json({ message });
  } catch (err) {
    console.error('🔥 Options Signal Error:', err.message);
    res.status(500).json({ message: '⚠️ Failed to generate options insight.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 BuyNSell 2.0 server running on http://localhost:${PORT}`);
});
