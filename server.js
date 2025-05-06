
app.post('/options', async (req, res) => {
  const { stock } = req.body;
  console.log("📩 Received options request for:", stock);

  try {
    const fmpResponse = await axios.get(
      `https://financialmodelingprep.com/api/v3/quote/${stock}?apikey=${process.env.FMP_API_KEY}`
    );

    const quote = fmpResponse.data[0];
    if (!quote) {
      console.warn("⚠️ No quote found for:", stock);
      return res.json({ message: "⚠️ Invalid stock symbol or no data available." });
    }

    const currentPrice = quote.price;
    if (currentPrice === undefined) {
      console.warn("⚠️ No price field found in quote:", quote);
      return res.json({ message: "⚠️ Stock data unavailable or malformed response." });
    }

    console.log("💰 Current Price (Options):", currentPrice);

    const prompt = `
      Stock: ${stock}
      Current Price: $${currentPrice.toFixed(2)}
      Based on technical indicators and market conditions, suggest a short-term swing options trade.

      Respond with:
      💹 Option Type (CALL or PUT) with strike and expiration
      🎯 Profit Target %
      🛑 Stop Loss %
      🧠 Reasoning based on technicals (RSI, MACD, trends, momentum)

      Format like:
      💹 Option Trade: Buy CALL @ $XXX Strike, [date] Expiration
      🎯 Profit Target: +50%
      🛑 Stop Loss: -30%
      🧠 Reasoning: [explanation here]
    `;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',
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
