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

// 📊 GPT Swing Trade Endpoint
app.post('/gpt', async (req, res) => {
  const { stock } = req.body;
  try {
    const quote = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${stock}?apikey=${process.env.FMP_API_KEY}`);
    const q = quote.data[0];

    const prompt = `
You are a swing trading assistant. Based on the stock data below, generate a swing trade idea for the next 3–5 days.

- 📈 Symbol: ${stock}
- 💵 Current Price: $${q.price}

Respond with:
- 🎯 Target Price
- 🛑 Stop Loss Price
- 🧠 Short Reasoning (1 paragraph)
- 📆 Holding Duration (in days)
    `;

    const ai = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ message: ai.choices[0].message.content });
  } catch (err) {
    console.error('GPT Error:', err.message);
    res.json({ message: "⚠️ Failed to generate swing trade insight." });
  }
});

// 🔴 GPT Options Trade Endpoint
app.post('/options', async (req, res) => {
  const { stock } = req.body;
  try {
    const quote = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${stock}?apikey=${process.env.FMP_API_KEY}`);
    const q = quote.data[0];

    const prompt = `
You are an AI options trader assistant. Based on the stock below, suggest a short-term options trade (1–2 week window).

- 📈 Symbol: ${stock}
- 💵 Price: $${q.price}

Respond with:
- 💹 Option Strategy (Call/Put, Strike, Expiry)
- 🎯 Target Gain (%)
- 🛑 Stop Loss (%)
- 🧠 Short Reasoning
    `;

    const ai = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ message: ai.choices[0].message.content });
  } catch (err) {
    console.error('Options Error:', err.message);
    res.json({ message: "⚠️ Failed to generate options insight." });
  }
});

// 🏆 Top 5 Stock Picks Endpoint
app.get('/top5', async (req, res) => {
  const tickers = ["AAPL", "MSFT", "TSLA", "NVDA", "AMZN"];

  try {
    const quote = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${tickers.join(",")}?apikey=${process.env.FMP_API_KEY}`);
    const list = quote.data;

    let prompt = `You are an AI swing trader. Suggest top 5 swing trade ideas from the list below. For each one:\n
- Include: 💵 Current Price, 🎯 Target Price, 🛑 Stop Loss Price
- Write a 1-paragraph reason with technical or market-based logic
- Estimated holding time: 3–5 days\n\n`;

    for (let stock of list) {
      prompt += `📈 ${stock.symbol} (${stock.name}) — $${stock.price}\n`;
    }

    const ai = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ message: ai.choices[0].message.content });
  } catch (err) {
    console.error('Top5 Error:', err.message);
    res.json({ message: "⚠️ Failed to generate Top 5 picks." });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 BuyNSell backend running at http://localhost:${PORT}`);
});
