<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BuyNSell</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap" rel="stylesheet">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      font-family: 'Orbitron', sans-serif;
      background-color: #000;
      color: #00ff41;
      height: 100%;
    }
    .top-disclaimer-bar {
      position: fixed;
      top: 0;
      width: 100%;
      background-color: #f8f8f8;
      color: #333;
      font-family: sans-serif;
      font-size: 0.75rem;
      padding: 0.5rem 1rem;
      text-align: center;
      z-index: 999;
      border-bottom: 1px solid #ddd;
      line-height: 1.4;
      word-wrap: break-word;
      white-space: normal;
      box-sizing: border-box;
    }
    body { padding-top: 50px; }
    .page-section {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      text-align: center;
      padding: 2rem;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      text-shadow: 0 0 10px #00ff41;
    }
    p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      line-height: 1.8;
      max-width: 600px;
    }
    .pill-options {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    button {
      padding: 1.5rem 3rem;
      font-size: 1.2rem;
      border: none;
      border-radius: 999px;
      cursor: pointer;
      font-family: 'Orbitron', sans-serif;
      transition: background-color 0.3s, transform 0.2s;
    }
    .blue-pill {
      background-color: #005eff;
      color: #fff;
      box-shadow: 0 0 10px #005eff;
    }
    .red-pill {
      background-color: #ff003c;
      color: #fff;
      box-shadow: 0 0 10px #ff003c;
    }
    button:hover {
      transform: scale(1.05);
      opacity: 0.95;
    }
    .blinking-cursor {
      display: inline-block;
      width: 10px;
      height: 20px;
      background-color: #00ff41;
      animation: blink 1s steps(2, start) infinite;
      margin-left: 5px;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    input[type="text"] {
      padding: 1rem;
      font-size: 1rem;
      border: none;
      border-radius: 10px;
      width: 300px;
      text-align: center;
    }
    #blue-pill-section button,
    #red-pill-section button {
      margin-top: 1.5rem;
      padding: 1rem 2rem;
      font-size: 1rem;
    }
    .result-box {
      margin-top: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      text-align: left;
      background-color: #000;
      padding: 1rem;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
      word-wrap: break-word;
      color: #00ff41;
      font-size: 1.1rem;
      line-height: 1.6;
    }
    #blue-pill-section,
    #red-pill-section {
      display: none;
    }
  </style>
</head>
<body>
  <div class="top-disclaimer-bar">
    BuyNSell is for informational and entertainment purposes only. It does not provide financial advice, investment recommendations, or guarantee any financial results. Always consult with a licensed financial advisor before making any investment decisions.
  </div>

  <div id="main-section" class="page-section">
    <h1>BuyNSell</h1>
    <p>This is your last chance. After this, there’s no turning back.<br>
    You take the blue pill — the story continues. You follow the charts, play it safe, and swing through the market like it’s just another day.<br>
    You take the red pill — and you drop into BuyNSell, where we don’t play it safe. I’ll show you what AI can do.<span class="blinking-cursor"></span></p>
    <div class="pill-options">
      <button class="blue-pill" onclick="showBluePill()">BuyNSell<br><small>Stock Signal</small></button>
      <button class="red-pill" onclick="showRedPill()">Red Pill<br><small>Options Mode</small></button>
    </div>
  </div>

  <div id="blue-pill-section" class="page-section">
    <h1>BuyNSell – Stock Signal</h1>
    <p>Enter a stock symbol or get today's Top 5 swing picks with target & stop levels:<span class="blinking-cursor"></span></p>
    <input type="text" id="stockInput" placeholder="e.g. AAPL">
    <button onclick="getStockSignal()">Get Signal</button>
    <button onclick="getTop5()">🎯 Top 5 AI Picks</button>
    <div id="result" class="result-box"></div>
  </div>

  <div id="red-pill-section" class="page-section">
    <h1>BuyNSell – Options Mode</h1>
    <p>Enter a stock symbol for a short-term options strategy:<span class="blinking-cursor"></span></p>
    <input type="text" id="optionsStockInput" placeholder="e.g. TSLA">
    <button onclick="getOptionsSignal()">Get Strategy</button>
    <div id="options-result" class="result-box"></div>
  </div>

  <script>
    function typeMessage(element, message, speed = 20) {
      element.innerHTML = '';
      let index = 0;
      function typeChar() {
        if (index < message.length) {
          element.innerHTML += message.charAt(index);
          index++;
          setTimeout(typeChar, speed);
        }
      }
      typeChar();
    }

    const backendUrl = "https://buynsell-backend-qoev.onrender.com";

    function showBluePill() {
      document.getElementById('main-section').style.display = 'none';
      document.getElementById('blue-pill-section').style.display = 'flex';
    }

    function showRedPill() {
      document.getElementById('main-section').style.display = 'none';
      document.getElementById('red-pill-section').style.display = 'flex';
    }

    function getStockSignal() {
      const stock = document.getElementById('stockInput').value.toUpperCase();
      const resultDiv = document.getElementById('result');

      if (!stock) {
        resultDiv.innerHTML = 'Please enter a stock symbol.';
        return;
      }

      resultDiv.innerHTML = '🤖 Contacting AI...';

      fetch(`${backendUrl}/gpt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock })
      })
      .then(res => res.json())
      .then(data => {
        const pre = document.createElement('pre');
        pre.style.fontSize = '1.2rem';
        pre.style.textAlign = 'left';
        pre.style.color = '#00ff41';
        pre.style.fontFamily = "'Courier New', monospace";
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.wordWrap = 'break-word';
        pre.style.lineHeight = '1.6';
        resultDiv.innerHTML = '';
        resultDiv.appendChild(pre);
        typeMessage(pre, data.message);
      })
      .catch(() => {
        resultDiv.innerHTML = '⚠️ Failed to generate AI insight.';
      });
    }

    function getTop5() {
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = '🤖 Gathering today’s Top 5 swing picks...';

      fetch(`${backendUrl}/top5`, {
        method: 'GET'
      })
      .then(res => res.json())
      .then(data => {
        const pre = document.createElement('pre');
        pre.style.fontSize = '1.2rem';
        pre.style.textAlign = 'left';
        pre.style.color = '#00ff41';
        pre.style.fontFamily = "'Courier New', monospace";
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.wordWrap = 'break-word';
        pre.style.lineHeight = '1.6';
        resultDiv.innerHTML = '';
        resultDiv.appendChild(pre);
        typeMessage(pre, data.message);
      })
      .catch(() => {
        resultDiv.innerHTML = '⚠️ Failed to fetch Top 5 picks.';
      });
    }

    function getOptionsSignal() {
      const stock = document.getElementById('optionsStockInput').value.toUpperCase();
      const resultDiv = document.getElementById('options-result');

      if (!stock) {
        resultDiv.innerHTML = 'Please enter a valid stock symbol.';
        return;
      }

      resultDiv.innerHTML = '🤖 Contacting AI for options strategy...';

      fetch(`${backendUrl}/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock })
      })
      .then(res => res.json())
      .then(data => {
        const pre = document.createElement('pre');
        pre.style.fontSize = '1.2rem';
        pre.style.textAlign = 'left';
        pre.style.color = '#00ff41';
        pre.style.fontFamily = "'Courier New', monospace";
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.wordWrap = 'break-word';
        pre.style.lineHeight = '1.6';
        resultDiv.innerHTML = '';
        resultDiv.appendChild(pre);
        typeMessage(pre, data.message);
      })
      .catch(() => {
        resultDiv.innerHTML = '⚠️ Failed to generate options insight.';
      });
    }
  </script>
</body>
</html>
