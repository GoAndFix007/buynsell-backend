// server.js
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

app.post('/gpt', async (req, res) => {
  const { stock } = req.body;
  console.log("📩 Received request for stock:", stock);

  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${stock}`
    );

    const quote = response.data.quoteResponse.result[0];
    if (!quote) {
      console.warn("⚠️ No quote found for:", stock);
      return res.json({ message: "⚠️ Invalid stock symbol or no data available." });
    }

    const currentPrice = quote.regularMarketPrice;
    console.log("💰 Current Price:", currentPrice);

    const prompt = `
      Stock symbol: ${stock}
      Current price: $${currentPrice.toFixed(2)}
      Based on this info, provide a trading signal (BUY/SELL), target price, stop price, and a short explanation.
    `;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: "user", content: prompt }],
    });

    const message = aiResponse.choices[0].message.content;
    console.log("🤖 AI Response:", message);
    res.json({ message });

  } catch (error) {
    console.error('🔥 Backend Error:', error.response?.data || error.message || error);
    res.json({ message: "⚠️ Failed to generate AI insight." });
  }
});

app.post('/options', async (req, res) => {
  const { stock } = req.body;
  console.log("📩 Received options request for:", stock);

  const prompt = `Create a basic options trading strategy for ${stock} using current market conditions. Include entry price, expiration range, and reasoning.`;

  try {
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: "user", content: prompt }],
    });

    const message = aiResponse.choices[0].message.content;
    console.log("📈 Options AI Response:", message);
    res.json({ message });

  } catch (error) {
    console.error('🔥 Options API error:', error.response?.data || error.message || error);
    res.json({ message: "⚠️ Failed to generate options insight." });
  }
});

// ✅ Use environment port for hosting services like Render
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 BuyNSell AI server running at http://localhost:${PORT}`);
});
