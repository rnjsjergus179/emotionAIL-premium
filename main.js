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

function showSpeechBubbleInChunks(text, chunkSize = 15, delay = 3000) {
  const bubble = document.getElementById("speech-bubble");
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

function changeRegion(value) {
  currentCity = value;
  updateMap();
  showSpeechBubbleInChunks(`지역이 ${value}(으)로 변경되었습니다.`);
}

function toggleHud2() {
  const hud2 = document.getElementById("hud-2");
  hud2.classList.toggle("show");
}

function sendHud2Chat() {
  const inputEl = document.getElementById("hud-2-input");
  const msg = inputEl.value.trim();
  if (!msg) return;
  const logEl = document.getElementById("hud-2-log");
  const userMsg = document.createElement("p");
  userMsg.style.color = "#333";
  userMsg.textContent = "사용자: " + msg;
  logEl.appendChild(userMsg);
  const resp = document.createElement("p");
  resp.style.color = "#2575fc";
  const cleanedMsg = msg.replace(/,/g, '');

  if (/환불/.test(msg)) {
    resp.innerHTML = "AI: 환불 요청을 위해 QR 코드를 이메일로 보내주세요.";
  } else if (msg.includes("결제 진행 절차") || msg.includes("결제 안내")) {
    resp.innerHTML = paymentGuideMessage;
  } else if (/^\d+$/.test(cleanedMsg)) {
    const amount = parseInt(cleanedMsg);
    if (amount === 23000) {
      resp.innerHTML = `AI: 23,000원을 결제하려면 다음 QR 코드를 스캔하세요.<br>
        <img src="./QR코드.jpg" alt="QR Code for 23000" style="width: 80%; margin-top: 10px; border-radius: 8px;">`;
    } else if (amount === 16000) {
      resp.innerHTML = `AI: 16,000원을 결제하려면 다음 QR 코드를 스캔하세요.<br>
        <img src="./QR 코드.jpg" alt="QR Code for 16000" style="width: 80%; margin-top: 10px; border-radius: 8px;">`;
    } else {
      resp.textContent = "AI: 잘못된 결제 금액입니다. 23000 또는 16000을 입력하세요.";
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

function showPaymentGuide() {
  const logEl = document.getElementById("hud-2-log");
  const resp = document.createElement("p");
  resp.style.color = "#2575fc";
  resp.innerHTML = paymentGuideMessage;
  logEl.appendChild(resp);
  logEl.scrollTop = logEl.scrollHeight;
}

function showRefundGuide() {
  const logEl = document.getElementById("hud-2-log");
  const resp = document.createElement("p");
  resp.style.color = "#2575fc";
  resp.innerHTML = "AI: 환불 요청을 위해 QR 코드를 이메일로 보내주세요.";
  logEl.appendChild(resp);
  logEl.scrollTop = logEl.scrollHeight;
}

function updateMap() {
  const englishCity = regionMap[currentCity] || "Seoul";
  document.getElementById("map-iframe").src =
    `https://www.google.com/maps?q=${encodeURIComponent(englishCity)}&output=embed`;
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("canvas"), alpha: true });

function onWindowResize() {
  const canvasBox = document.getElementById("three-canvas");
  const width = canvasBox.clientWidth;
  const height = canvasBox.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
window.addEventListener("resize", onWindowResize);

function setupScene() {
  const canvasBox = document.getElementById("three-canvas");
  renderer.setSize(canvasBox.clientWidth, canvasBox.clientHeight);
  camera.position.set(5, 5, 10);
  camera.lookAt(0, 0, 0);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7).normalize();
  scene.add(directionalLight);
  scene.add(new THREE.AmbientLight(0x333333));
}

function mainInit() {
  setupScene();
  onWindowResize();
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

document.addEventListener("DOMContentLoaded", function() {
  const regionSelect = document.getElementById("region-select");
  regionList.forEach(region => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = `${region} (${regionMap[region]})`;
    if (region === currentCity) option.selected = true;
    regionSelect.appendChild(option);
  });
  document.getElementById("hud-2-toggle").addEventListener("click", toggleHud2);

  // Form submission
  document.getElementById("contact-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    try {
      const response = await fetch("https://emotionail-server.onrender.com/send-email", {
        method: "POST",
        body: formData
      });
      if (response.ok) {
        alert("문의가 성공적으로 전송되었습니다.");
        this.reset();
      } else {
        alert("문의 전송에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("문의 전송 중 오류가 발생했습니다.");
    }
  });
});

window.addEventListener("load", async () => {
  mainInit();
  updateMap();
  onWindowResize();
});
