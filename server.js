const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const dotenv = require('dotenv');

// .env 파일 로드
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Multer 설정: 파일 업로드 처리
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// CORS 설정 (프론트엔드와의 연동을 위해 필요)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// POST /send-email 엔드포인트
app.post('/send-email', upload.single('file-upload'), async (req, res) => {
  const { name, email, message } = req.body;
  const file = req.file;

  // Nodemailer transporter 설정
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GOOGLE_EMAIL,
      pass: process.env.GOOGLE_APP_PASSWORD
    }
  });

  // 이메일 옵션
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

  // 이메일 전송
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send email');
  }
});

// 서버 실행
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
