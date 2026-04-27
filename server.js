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
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-KEY'];
    const secret = req.headers['x-secret'] || req.headers['X-SECRET'];
    const passphrase = req.headers['x-passphrase'] || req.headers['X-PASSPHRASE'];
    const method = req.headers['x-method'] || req.headers['X-METHOD'] || 'GET';
    const body = req.body ? JSON.stringify(req.body) : '';
    const timestamp = Date.now().toString();

    const prehash = timestamp + method + path + (body || '');
    const signature = crypto.createHmac('sha256', secret)
      .update(prehash)
      .digest('base64');

    const headers = {
      'ACCESS-KEY': apiKey,
      'ACCESS-SIGN': signature,
      'ACCESS-TIMESTAMP': timestamp,
      'ACCESS-PASSPHRASE': passphrase,
      'Content-Type': 'application/json',
    };

    const response = await fetch('https://api.bitget.com' + path, {
      method,
      headers,
      body: method === 'POST' ? body : undefined,
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
