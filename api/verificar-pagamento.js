const axios = require('axios');

const DICE_URL = 'https://dev.use-dice.com';
const CLIENT_ID = process.env.DICE_CLIENT_ID || 'dice_live_498b702b2fdf289abb71546775e709e1';
const CLIENT_SECRET = process.env.DICE_CLIENT_SECRET || 'dicesk_live_b6205c24540327108c91ce08b05dfc8f84523cbaf9f39be3';

let _token = null;
let _expiry = 0;

async function getDiceToken() {
  if (_token && Date.now() < _expiry) return _token;
  const res = await axios.post(`${DICE_URL}/api/v1/auth/login`, {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  });
  _token = res.data.token || res.data.access_token;
  _expiry = Date.now() + 50 * 60 * 1000;
  return _token;
}

module.exports = async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ ok: false, erro: 'ID da transação não fornecido.' });
  }

  try {
    const token = await getDiceToken();
    
    // Dice GET request to check status
    const { data } = await axios.get(
      `${DICE_URL}/api/v1/transactions/getStatusTransac/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.json({
      ok: true,
      status: data.status || 'PENDING',
      amount: data.amount,
      payment_method: data.payment_method
    });

  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error || err.message;
    console.error('[DICE] Erro ao consultar transação:', msg);
    if (err.response?.status === 401) { _token = null; _expiry = 0; }
    return res.status(500).json({ ok: false, erro: msg || 'Erro interno ao verificar pagamento.' });
  }
};
