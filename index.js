const express = require('express');
const axios = require('axios');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_YourSecretKeyHere');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 기본 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 공인 IP 확인
app.get('/myip', async (req, res) => {
  try {
    const response = await axios.get('https://api64.ipify.org?format=json');
    res.send(`현재 Render 서버의 공인 IP: ${response.data.ip}`);
  } catch (e) {
    res.status(500).send('IP 확인 실패');
  }
});

// Stripe 결제 라우트
app.post('/create-checkout-session', async (req, res) => {
  const { plan } = req.body;
  let priceId;

  if (plan === 'weekly') {
    priceId = process.env.STRIPE_WEEKLY_PRICE_ID || 'price_xxx_weekly';
  } else if (plan === 'monthly') {
    priceId = process.env.STRIPE_MONTHLY_PRICE_ID || 'price_xxx_monthly';
  } else {
    return res.status(400).json({ error: 'Invalid plan type.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
