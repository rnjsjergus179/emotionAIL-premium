const express = require('express');
const axios = require('axios');
const app = express();

// JSON 데이터 수신을 위한 미들웨어
app.use(express.json());

// 기본 확인 라우트
app.get('/', (req, res) => {
  res.send('EmotionAIL 백엔드 실행 중');
});

// 외부 IP 확인용 라우트
app.get('/myip', async (req, res) => {
  try {
    const response = await axios.get('https://api64.ipify.org?format=json');
    res.send(`현재 서버 IP: ${response.data.ip}`);
  } catch (error) {
    res.status(500).send('IP 확인 중 오류 발생');
  }
});

// NICEPAY 웹훅 수신 라우트
app.post('/webhook', (req, res) => {
  console.log('NICEPAY 웹훅 수신됨:', req.body);
  // 여기서 결제 성공 여부나 데이터 처리 로직 추가 가능
  res.status(200).send('Webhook OK'); // 반드시 200 응답
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: 포트 ${PORT}`);
});
