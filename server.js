const express = require('express');
const connectDB = require('./mongodb');
const subscriptionRoutes = require('./routes/subscription.route');

const app = express();

// JSON 파싱 미들웨어
app.use(express.json());

// MongoDB 연결
connectDB();

// 라우트 설정
app.use('/', subscriptionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});
