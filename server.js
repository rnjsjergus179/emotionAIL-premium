const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 이메일 전송 엔드포인트
app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  // 필수 데이터 확인
  if (!name || !email || !message) {
    return res.status(400).send('이름, 이메일, 문의 내용은 필수입니다.');
  }

  // 이메일 전송 설정
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.OWNER_EMAIL,
      pass: process.env.GOOGLE_APP_PASSWORD
    }
  });

  const mailOptions = {
    from: `"${name}" <${process.env.OWNER_EMAIL}>`,
    to: process.env.OWNER_EMAIL,
    subject: `새로운 문의: ${name}`,
    text: `이름: ${name}\n이메일: ${email}\n문의 내용: ${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('이메일이 성공적으로 전송되었습니다.');
  } catch (err) {
    console.error('이메일 전송 오류:', err.message);
    res.status(500).send('이메일 전송에 실패했습니다.');
  }
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
