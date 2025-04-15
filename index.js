const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('EmotionAIL 백엔드 실행 중');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: 포트 ${PORT}`);
});
