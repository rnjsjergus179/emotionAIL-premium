// 지역 관련 설정
let currentCity = "서울";
const regionMap = {
  "서울": "Seoul", "인천": "Incheon", "수원": "Suwon", "고양": "Goyang",
  "성남": "Seongnam", "용인": "Yongin", "부천": "Bucheon", "안양": "Anyang",
  "의정부": "Uijeongbu", "광명": "Gwangmyeong", "안산": "Ansan", "파주": "Paju",
  "부산": "Busan", "대구": "Daegu", "광주": "Gwangju", "대전": "Daejeon",
  "울산": "Ulsan", "제주": "Jeju", "전주": "Jeonju", "청주": "Cheongju",
  "포항": "Pohang", "여수": "Yeosu", "김해": "Gimhae"
};
const regionList = Object.keys(regionMap);

// 결제 안내 메시지
const paymentGuideMessage = `AI: 결제 진행 절차를 안내합니다.<br>
  월 구독은 23,000원, 주간 구독은 16,000원입니다.<br>
  결제할 금액을 입력하세요 (예: 23000 또는 16000).<br>
  <div class="legal-notice">
    <p><strong>법적 고지:</strong></p>
    <ul>
      <li>이 서비스는 1인 개발자에 의해 운영됩니다.</li>
      <li>환불은 수동으로 처리되며, 처리에 3~5일이 소요될 수 있습니다.</li>
      <li>개발자는 이 서비스의 사용으로 인해 발생하는 어떠한 손해 또는 손실에 대해 책임을 지지 않습니다.</li>
    </ul>
  </div>`;

// 말풍선 표시 함수
function showSpeechBubbleInChunks(text, chunkSize = 15, delay = 3000) {
  const bubble = document.getElementById("speech-bubble") || document.createElement("div");
  bubble.id = "speech-bubble";
  document.body.appendChild(bubble);
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  let index = 0
