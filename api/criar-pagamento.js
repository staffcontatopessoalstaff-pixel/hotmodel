import axios from 'axios';

const DICE_URL = 'https://dev.use-dice.com';
const CLIENT_ID = process.env.DICE_CLIENT_ID || 'dice_live_1d0d052ef86ebac71fe957801d389116';
const CLIENT_SECRET = process.env.DICE_CLIENT_SECRET || 'dicesk_live_9e73f18dfaad2af7b4b9b1d286f3ace9ca9b239da001d408';

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

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, erro: 'Method not allowed' });
  }

  try {
    const { nome, email, cpf, productName, total } = req.body;

    if (!nome || !email || !cpf || !total) {
      return res.status(400).json({ ok: false, erro: 'Campos obrigatórios faltando.' });
    }

    if (total < 2) {
      return res.status(400).json({ ok: false, erro: 'Valor mínimo é R$ 2,00.' });
    }

    const token = await getDiceToken();
    const payload = {
      product_name: productName || 'hotmodel2026 - Acesso VIP',
      amount: parseFloat(total.toFixed(2)),
      payer: {
        name: nome,
        email: email,
        document: cpf.replace(/\D/g, '')
      }
    };

    const { data } = await axios.post(
      `${DICE_URL}/api/v2/payments/deposit`,
      payload,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    return res.json({
      ok: true,
      qr_code_text: data.qr_code_text,
      qr_code_image: data.qr_code_image || null,
      transaction_id: data.transaction_id || data.id || data.payment_id || null,
      expires_at: data.expires_at || null
    });

  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error || err.message;
    console.error('[DICE] Erro ao criar pagamento:', msg);
    if (err.response?.status === 401) { _token = null; _expiry = 0; }
    return res.status(500).json({ ok: false, erro: msg || 'Erro interno ao criar pagamento.' });
  }
};
