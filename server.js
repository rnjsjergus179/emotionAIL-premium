
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 환경 변수 로드
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS 설정: 특정 도메인 허용
app.use(cors({
  origin: 'https://your-frontend-domain.com', // 실제 클라이언트 도메인으로 변경
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/send-email', upload.single('file-upload'), async (req, res) => {
  const { name, email, message } = req.body;
  const file = req.file;

  if (!name || !email || !message) {
    return res.status(400).send('이름, 이메일, 문의 내용은 필수입니다.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.OWNER_EMAIL,
      pass: process.env.GOOGLE_APP_PASSWORD
    }
  });

  const mailOptions = {
    from: `"${name}" <${process.env.OWNER_EMAIL}>`, // Gmail 인증 계정 사용
    to: process.env.OWNER_EMAIL,
    subject: `새로운 문의: ${name}`,
    text: `이름: ${name}\n이메일: ${email}\n문의 내용: ${message}`,
    attachments: file ? [{ filename: file.originalname, content: file.buffer }] : []
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('이메일이 성공적으로 전송되었습니다.');
  } catch (err) {
    console.error('이메일 전송 오류:', err.message, err.stack);
    res.status(500).send(`이메일 전송에 실패했습니다: ${err.message}`);
  }
});

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
