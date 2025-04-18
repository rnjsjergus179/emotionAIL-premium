
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 환경 변수 로드 (Render에서 자동 주입되므로 .env 파일은 선택 사항)
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // 'public' 폴더의 정적 파일 제공

// Multer 설정: 파일 업로드 처리
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 기본 라우트: index.html 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 이메일 전송 API
app.post('/send-email', upload.single('file-upload'), async (req, res) => {
  const { name, email, message } = req.body;
  const file = req.file;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.OWNER_EMAIL, // Render 환경 변수에서 주입
      pass: process.env.GOOGLE_APP_PASSWORD // Render 환경 변수에서 주입
    }
  });

  const mailOptions = {
    from: email,
    to: process.env.OWNER_EMAIL,
    subject: `새로운 문의: ${name}`,
    text: `이름: ${name}\n이메일: ${email}\n문의 내용: ${message}`,
    attachments: file ? [{ filename: file.originalname, content: file.buffer }] : []
  });

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('이메일이 성공적으로 전송되었습니다.');
  } catch (err) {
    console.error('이메일 전송 오류:', err);
    res.status(500).send('이메일 전송에 실패했습니다.');
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
