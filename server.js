const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

app.all('/proxy', async (req, res) => {
  try {
    const apiKey = req.query.apikey;
    const secret = req.query.secret;
    const passphrase = req.query.passphrase;
    const bitgetPath = req.query.path;
    const timestamp = Date.now().toString();
    const method = 'GET';

    // Sign exactly: timestamp + METHOD + path (with query string)
    const toSign = timestamp + method + bitgetPath;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(toSign)
      .digest('base64');

    console.log('Signing:', toSign);
    console.log('Sig:', signature);

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
    console.log('Bitget response:', text);
    res.set('Content-Type', 'application/json');
    res.send(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Bitget proxy running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Proxy running on port ' + PORT));
