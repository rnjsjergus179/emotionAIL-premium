const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI; // .env에 저장된 Mongo URI

router.get('/verify-subscription', async (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: '사용자 이름이 필요합니다.' });

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('ai_subscription');
    const user = await db.collection('users').findOne({ name });

    if (!user) return res.status(404).json({ status: 'fail', message: '사용자 없음' });

    const now = new Date();
    if (user.expiresAt && new Date(user.expiresAt) > now) {
      res.json({ status: 'success', message: '구독 확인됨' });
    } else {
      res.json({ status: 'expired', message: '구독이 만료됨' });
    }

    await client.close();
  } catch (err) {
    res.status(500).json({ error: '서버 오류', details: err.message });
  }
});

module.exports = router;
