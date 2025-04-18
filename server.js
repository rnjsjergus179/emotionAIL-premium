const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');

// .env 로드 (Render에선 무시됨 - 자동으로 환경변수 주입됨)
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Multer 설정: 파일 업로드 처리
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 미들웨어
app.use(cors());
app.use(express.json());

// 이메일 전송 API
app.post('/send-email', upload.single('file-upload'), async (req, res) => {
  const { name, email, message } = req.body;
  const file = req.file;

  // Nodemailer 설정
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.OWNER_EMAIL,
      pass: process.env.GOOGLE_APP_PASSWORD
    }
  });

  // 이메일 옵션
  const mailOptions = {
    from: email,
    to: process.env.OWNER_EMAIL,
    subject: `새로운 문의: ${name}`,
    text: `이름: ${name}\n이메일: ${email}\n문의 내용: ${message}`,
    attachments: file
      ? [{ filename: file.originalname, content: file.buffer }]
      : []
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('이메일이 성공적으로 전송되었습니다.');
  } catch (error) {
    console.error('이메일 전송 오류:', error.response || error);
    res.status(500).send('이메일 전송에 실패했습니다: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
