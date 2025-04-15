const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json()); // JSON 요청 수신을 위해 필요

// 기본 라우트
app.get('/', (req, res) => {
  res.send('EmotionAIL 백엔드 실행 중');
});

// 외부 IP 확인
app.get('/myip', async (req, res) => {
  try {
    const response = await axios.get('https://api64.ipify.org?format=json');
    res.send(`현재 서버 IP: ${response.data.ip}`);
  } catch (error) {
    res.status(500).send('IP 확인 중 오류 발생');
  }
});

// ✅ NICEPAY 웹훅용 POST 라우트
app.post('/api/nicepay', (req, res) => {
  console.log('NICEPAY 웹훅 수신됨:', req.body);
  res.status(200).send('Webhook OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: 포트 ${PORT}`);
});
