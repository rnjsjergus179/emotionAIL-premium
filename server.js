const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');

// 환경 변수 로드 (Render 대시보드에서 설정된 값 사용)
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Multer 설정: 파일 업로드 처리
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 미들웨어 설정
app.use(cors());           // CORS 허용
app.use(express.json());   // JSON 요청 파싱

// POST /send-email 엔드포인트
app.post('/send-email', upload.single('file-upload'), async (req, res) => {
  const { name, email, message } = req.body;
  const file = req.file;

  // Nodemailer 설정
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.OWNER_EMAIL,       // Gmail 주소
      pass: process.env.GOOGLE_APP_PASSWORD // Gmail 앱 비밀번호
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
    res.status(200).send('이메일이 성공적으로 전송되었습니다.');
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    res.status(500).send('이메일 전송에 실패했습니다.');
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
