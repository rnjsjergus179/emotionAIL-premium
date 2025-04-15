const express = require('express');
const axios = require('axios');
const app = express();

app.get('/', (req, res) => {
  res.send('EmotionAIL 백엔드 실행 중');
});

// 여기서 외부 IP를 확인하는 라우트
app.get('/myip', async (req, res) => {
  try {
    const response = await axios.get('https://api64.ipify.org?format=json');
    res.send(`현재 서버 IP: ${response.data.ip}`);
  } catch (error) {
    res.status(500).send('IP 확인 중 오류 발생');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: 포트 ${PORT}`);
});
