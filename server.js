const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

app.all('/proxy', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const secret = req.headers['x-secret'];
    const passphrase = req.headers['x-passphrase'];
    const bitgetPath = req.query.path;
    const timestamp = Date.now().toString();
    const method = 'GET';

    const toSign = timestamp + method + bitgetPath;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(toSign)
      .digest('base64');

    const response = await fetch('https://api.bitget.com' + bitgetPath, {
      method,
      headers: {
        'ACCESS-KEY': apiKey,
        'ACCESS-SIGN': signature,
        'ACCESS-TIMESTAMP': timestamp,
        'ACCESS-PASSPHRASE': passphrase,
        'Content-Type': 'application/json',
        'locale': 'en-US'
      }
    });

    const text = await response.text();
    res.set('Content-Type', 'application/json');
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Bitget proxy running'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Proxy running on port ' + PORT));
app.listen(PORT, () => console.log('Proxy running on port ' + PORT));
