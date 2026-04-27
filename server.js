const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

app.all('/proxy', async (req, res) => {
  try {
    const path = req.query.path;
    const method = (req.query.method || 'GET').toUpperCase();
    const apiKey = req.query.apikey;
    const secret = req.query.secret;
    const passphrase = req.query.passphrase;
    const timestamp = Date.now().toString();

    const prehash = timestamp + method + path;
    const signature = crypto.createHmac('sha256', secret)
      .update(prehash)
      .digest('base64');

    const response = await fetch('https://api.bitget.com' + path, {
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

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Bitget proxy running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Proxy running on port ' + PORT));
