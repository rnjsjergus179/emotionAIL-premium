// 전역 변수 및 상수 정의
let blockUntil = 0; // 복사 차단 시간
let danceInterval; // 춤 애니메이션 인터벌 (현재 사용되지 않음)
let currentCity = "서울"; // 현재 선택된 도시
let currentWeather = ""; // 현재 날씨 상태
const weatherKey = "2caa7fa4a66f2f8d150f1da93d306261"; // OpenWeatherMap API 키 (주의: 노출 위험)
const regionMap = {
  "서울": "Seoul", "인천": "Incheon", "수원": "Suwon", "고양": "Goyang",
  "성남": "Seongnam", "용인": "Yongin", "부천": "Bucheon", "안양": "Anyang",
  "의정부": "Uijeongbu", "광명": "Gwangmyeong", "안산": "Ansan", "파주": "Paju",
  "부산": "Busan", "대구": "Daegu", "광주": "Gwangju", "대전": "Daejeon",
  "울산": "Ulsan", "제주": "Jeju", "전주": "Jeonju", "청주": "Cheongju",
  "포항": "Pohang", "여수": "Yeosu", "김해": "Gimhae"
}; // 지역 매핑 객체
const regionList = Object.keys(regionMap); // 지역 리스트

// 결제 안내 메시지 (HTML 형식, 법적 고지사항만 포함)
const paymentGuideMessage = `<div class="legal-notice">
    <p><strong>법적 고지:</strong></p>
    <ul>
      <li>이 서비스는 1인 개발자에 의해 운영됩니다.</li>
      <li>환불은 수동으로 처리되며, 처리에 3~5일이 소요될 수 있습니다.</li>
      <li>개발자는 이 서비스의 사용으로 인해 발생하는 어떠한 손해 또는 손실에 대해 책임을 지지 않습니다.</li>
    </ul>
  </div>`;

// 텍스트를 청크 단위로 말풍선에 표시하는 함수
function showSpeechBubbleInChunks(text, chunkSize = 15, delay = 3000) {
  const bubble = document.getElementById("speech-bubble");
  if (!bubble) return; // 말풍선 요소가 없으면 종료
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  let index = 0;
  function showNextChunk() {
    if (index < chunks.length) {
      bubble.textContent = chunks[index];
      bubble.style.display = "block";
      index++;
      setTimeout(showNextChunk, delay);
    } else {
      setTimeout(() => { bubble.style.display = "none"; }, 3000);
    }
  }
  showNextChunk();
}

// 복사 방지 및 API 키 숨김 기능
document.addEventListener("copy", function(e) {
  e.preventDefault();
  let selectedText = window.getSelection().toString();
  selectedText = selectedText.replace(/2caa7fa4a66f2f8d150f1da93d306261/g, "HIDDEN"); // API 키 숨김
  e.clipboardData.setData("text/plain", selectedText);
  if (Date.now() < blockUntil) return;
  blockUntil = Date.now() + 3600000; // 1시간 차단
  showSpeechBubbleInChunks("1시간 동안 차단됩니다.");
});

// 지역 변경 함수
function changeRegion(value) {
  currentCity = value;
  updateMap();
  updateWeatherAndEffects();
  showSpeechBubbleInChunks(`지역이 ${value}(으)로 변경되었습니다.`);
}

// HUD2 토글 함수
function toggleHud2() {
  const hud2 = document.getElementById("hud-2");
  if (!hud2) return;
  if (hud2.classList.contains("show")) {
    hud2.classList.remove("show");
  } else {
    hud2.classList.add("show");
  }
}

// HUD2 채팅 전송 함수
function sendHud2Chat() {
  const inputEl = document.getElementById("hud-2-input");
  const logEl = document.getElementById("hud-2-log");
  if (!inputEl || !logEl) return;

  const msg = inputEl.value.trim();
  if (!msg) return;

  const userMsg = document.createElement("p");
  userMsg.style.color = "#333";
  userMsg.textContent = "사용자: " + msg;
  logEl.appendChild(userMsg);

  const resp = document.createElement("p");
  resp.style.color = "#2575fc";
  const cleanedMsg = msg.replace(/,/g, '').replace(/원/g, '');

  if (/환불/.test(msg)) {
    resp.textContent = "AI: 환불 요청을 위해 이메일을 보내주세요.";
  } else if (msg.includes("결제 진행 절차") || msg.includes("결제 안내")) {
    resp.innerHTML = paymentGuideMessage;
  } else if (/^\d+$/.test(cleanedMsg)) {
    const amount = parseInt(cleanedMsg);
    if (amount === 16000) {
      resp.textContent = "AI: 16,000원 결제를 진행하세요. 결제 후 구독을 완료해 주세요.";
    } else {
      resp.textContent = "AI: 잘못된 결제 금액입니다. 16000을 입력하세요.";
    }
  } else if (msg.startsWith("정보:")) {
    const userInfo = msg.slice(3).trim();
    if (userInfo) {
      resp.textContent = `AI: 결제 완료가 확인되었습니다. 입력하신 정보: ${userInfo} (감사합니다.)`;
    } else {
      resp.textContent = "AI: '정보:' 뒤에 이메일 또는 닉네임을 입력해 주세요.";
    }
  } else {
    resp.textContent = "AI: 이해하지 못했습니다. 다시 시도해 주세요.";
  }
  logEl.appendChild(resp);
  logEl.scrollTop = logEl.scrollHeight;
  inputEl.value = "";
}

// 결제 안내 표시 함수
function showPaymentGuide() {
  const logEl = document.getElementById("hud-2-log");
  if (!logEl) return;
  const resp = document.createElement("p");
  resp.style.color = "#2575fc";
  resp.innerHTML = paymentGuideMessage;
  logEl.appendChild(resp);
  logEl.scrollTop = logEl.scrollHeight;
}

// 환불 안내 표시 함수
function showRefundGuide() {
  const logEl = document.getElementById("hud-2-log");
  if (!logEl) return;
  const resp = document.createElement("p");
  resp.style.color = "#2575fc";
  resp.textContent = "AI: 환불 요청을 위해 이메일을 보내주세요.";
  logEl.appendChild(resp);
  logEl.scrollTop = logEl.scrollHeight;
}

// **구독 버튼 클릭 이벤트 처리**
document.getElementById('subscribe-button').addEventListener('click', async () => {
  const name = document.getElementById('name-input').value.trim();
  const email = document.getElementById('subscribe-email-input').value.trim();

  if (!name || !email) {
    alert('이름과 이메일을 모두 입력해주세요.');
    return;
  }

  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email }),
    });

    if (!response.ok) {
      throw new Error('구독 요청 실패');
    }

    const data = await response.json();
    alert(data.message);
  } catch (error) {
    console.error('구독 요청 중 오류:', error);
    alert('구독 요청 중 오류가 발생했습니다.');
  }
});

// 나머지 기존 함수들 (간략히 생략)
function updateMap() { /* ... */ }
function updateWeatherAndEffects() { /* ... */ }
function getWeather() { /* ... */ }
// 기타 Three.js 및 캘린더 관련 코드 (필요 시 사용자 원본 코드 참조)
