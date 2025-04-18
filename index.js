// 폼 요소 가져오기
const contactForm = document.getElementById('contact-form');

// 폼 제출 이벤트 감지 및 처리
contactForm.addEventListener('submit', async function(e) {
  e.preventDefault(); // 기본 폼 제출 동작 방지

  // FormData로 폼 데이터 수집
  const formData = new FormData(this);

  // POST 요청 보내기
  try {
    const response = await fetch('https://emotionail-backend.onrender.com/send-email', {
      method: 'POST',
      body: formData
    });

    // 응답에 따른 알림 표시
    if (response.ok) {
      alert('문의가 성공적으로 전송되었습니다.');
    } else {
      alert('전송에 실패했습니다.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('전송 중 오류가 발생했습니다.');
  }
});
