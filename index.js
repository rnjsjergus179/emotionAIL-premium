// index.js (== server.js 역할까지 포함)
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');

// 환경 변수 로드 (.env 또는 Render 환경 변수 사용)
dotenv.config();

// 기본 설정
const app = express();
const port = process.env.PORT || 3000;

// CORS 및 JSON 파싱 미들웨어
app.use(cors());
app.use(express.json());

// 파일 업로드를 위한 multer 메모리 저장소
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 이메일 전송 엔드포인트
app.post('/send-email', upload.single('file-upload'), async (req, res) => {
  const { name, email, message } = req.body;
  const file = req.file;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.OWNER_EMAIL,
      pass: process.env.GOOGLE_APP_PASSWORD
    }
  });

  const mailOptions = {
    from: email,
    to: process.env.OWNER_EMAIL,
    subject: `새로운 문의: ${name}`,
    text: `이름: ${name}\n이메일: ${email}\n문의 내용: ${message}`,
    attachments: file ? [{
      filename: file.originalname,
      content: file.buffer
    }] : []
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('이메일이 성공적으로 전송되었습니다.');
  } catch (err) {
    console.error('이메일 전송 오류:', err);
    res.status(500).send('이메일 전송에 실패했습니다.');
  }
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
