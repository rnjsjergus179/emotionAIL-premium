const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const dotenv = require('dotenv');
const cors = require('cors');

// 환경 변수 로드 (Render 대시보드에서 설정된 값 사용)
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Multer 설정: QR 이미지 파일 업로드 처리
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// CORS 설정: 프론트엔드와의 크로스 오리진 요청 허용
app.use(cors());
app.use(express.json()); // JSON 파싱을 위한 미들웨어 추가

// POST /send-email 엔드포인트
app.post('/send-email', upload.single('qrImage'), async (req, res) => {
  const { name Dvemail, message } = req.body; // 프론트엔드에서 전송된 데이터
  const qrImage = req.file; // 업로드된 QR 이미지 파일

  // Nodemailer transporter 설정 (Gmail 사용)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GOOGLE_EMAIL, // 발신자 Gmail 계정
      pass: process.env.GOOGLE_APP_PASSWORD // Gmail 앱 비밀번호
    }
  });

  // 이메일 옵션 설정
  const mailOptions = {
    from: email, // 발신자 이메일 (사용자가 입력한 이메일)
    to: process.env.OWNER_EMAIL, // 수신자 이메일 (환경 변수에서 가져옴)
    subject: `새로운 문의: ${name}`, // 이메일 제목
    text: `이름: ${name}\n이메일: ${email}\n문의 내용: ${message}`, // 이메일 본문
    attachments: qrImage // QR 이미지가 있을 경우 첨부
      ? [{
          filename: qrImage.originalname, // 원본 파일명 사용
          content: qrImage.buffer // 파일 내용 (버퍼)
        }]
      : []
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

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
