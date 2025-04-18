const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const cors = require('cors');
require('dotenv').config();

// Express 앱 초기화
const app = express();
app.use(cors()); // 프론트엔드와의 통신 허용

// 파일 업로드를 위한 multer 설정 (메모리 스토리지 사용)
const upload = multer({ storage: multer.memoryStorage() });

// Gmail API를 위한 OAuth2 클라이언트 설정
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// MIME 형식 이메일 메시지 생성 함수
function buildEmail(to, subject, body, attachment = null) {
  let message = `To: ${to}\nSubject: ${subject}\nMIME-Version: 1.0\n`;

  if (attachment) {
    const boundary = 'boundary_string';
    message += `Content-Type: multipart/mixed; boundary="${boundary}"\n\n`;
    message += `--${boundary}\n`;
    message += `Content-Type: text/plain; charset="UTF-8"\n\n`;
    message += `${body}\n\n`;
    message += `--${boundary}\n`;
    message += `Content-Type: ${attachment.mimetype}\n`;
    message += `Content-Transfer-Encoding: base64\n`;
    message += `Content-Disposition: attachment; filename="${attachment.originalname}"\n\n`;
    message += `${attachment.base64}\n\n`;
    message += `--${boundary}--`;
  } else {
    message += `Content-Type: text/plain; charset="UTF-8"\n\n`;
    message += `${body}\n`;
  }

  // Gmail API에 필요한 URL-safe base64로 변환
  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

// 폼 제출 처리 라우트
app.post('/submit', upload.single('qrcode'), async (req, res) => {
  const { name, email, inquiry } = req.body;
  const file = req.file;

  const to = process.env.USER_EMAIL;
  const subject = `New Inquiry from ${name}`;
  const body = `이름: ${name}\n이메일: ${email}\n문의 내용: ${inquiry}`;

  let attachment = null;
  if (file) {
    attachment = {
      mimetype: file.mimetype,
      originalname: file.originalname,
      base64: Buffer.from(file.buffer).toString('base64')
    };
  }

  const rawMessage = buildEmail(to, subject, body, attachment);

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage
      }
    });
    res.status(200).send('문의가 성공적으로 제출되었습니다.');
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    res.status(500).send('문의 제출에 실패했습니다.');
  }
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});
