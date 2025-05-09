// 전역 변수 및 상수 정의
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

// 결제 안내 메시지 (HTML 형식, 새로운 법적 고지사항 반영)
const paymentGuideMessage = `<div class="legal-notice">
    <p><strong>법적 고지:</strong></p>
    <ul>
      <li>본 서비스는 1인 개발자에 의해 운영됩니다.</li>
      <li>해당 후원은 자율 선택이며 일회성 후원 16,000원이며, 환불이 불가합니다.</li>
      <li>개발자는 이 서비스 사용으로 발생하는 문제에 대해 법적 책임을 지지 않습니다.</li>
    </ul>
    <p>후원해 주시면 더욱 발전해서 열심히 하겠습니다. 감사합니다. <a href="https://www.buymeacoffee.com/rnjsjergus12" target="_blank">여기를 클릭하세요</a></p>
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

// 복사 방지 및 API 키 숨김 기능 (복사 차단 시간 제거)
document.addEventListener("copy", function(e) {
  e.preventDefault();
  let selectedText = window.getSelection().toString();
  selectedText = selectedText.replace(/2caa7fa4a66f2f8d150f1da93d306261/g, "HIDDEN"); // API 키 숨김
  e.clipboardData.setData("text/plain", selectedText);
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

  if (/환불/.test(msg)) {
    resp.textContent = "AI: 환불 요청을 위해 이메일을 보내주세요.";
  } else if (msg.includes("결제 진행 절차") || msg.includes("결제 안내")) {
    resp.innerHTML = paymentGuideMessage;
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

// 날씨 정보 가져오기 함수
async function getWeather() {
  try {
    const englishCity = regionMap[currentCity] || "Seoul";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(englishCity)}&appid=${weatherKey}&units=metric&lang=kr`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("날씨 API 호출 실패");
    const data = await res.json();
    const description = data.weather[0].description;
    const temp = data.main.temp;
    currentWeather = description;
    let extraComment = "";
    if (description.indexOf("흐림") !== -1 || description.indexOf("구름") !== -1) {
      extraComment = " 오늘은 약간 흐린 날씨네요 ☁️";
    } else if (description.indexOf("맑음") !== -1) {
      extraComment = " 오늘은 맑은 날씨네요 ☀️";
    }
    return { message: `오늘 ${currentCity}의 날씨는 ${description}이며, 온도는 ${temp}°C입니다.${extraComment}` };
  } catch (err) {
    currentWeather = "";
    return { message: `날씨 정보를 가져오지 못했습니다: ${currentCity}` };
  }
}

// 지도 업데이트 함수
function updateMap() {
  const mapIframe = document.getElementById("map-iframe");
  if (!mapIframe) return;
  const englishCity = regionMap[currentCity] || "Seoul";
  mapIframe.src = `https://www.google.com/maps?q=${encodeURIComponent(englishCity)}&output=embed`;
}

// 날씨 및 효과 업데이트 함수
function updateWeatherAndEffects() {
  return getWeather().then(weatherData => {
    showSpeechBubbleInChunks(weatherData.message);
    updateWeatherEffects();
  });
}

// 날씨 효과 업데이트 함수
function updateWeatherEffects() {
  if (!currentWeather) return;
  if (currentWeather.indexOf("비") !== -1 || currentWeather.indexOf("소나기") !== -1) {
    rainGroup.visible = true;
  } else {
    rainGroup.visible = false;
  }
  if (currentWeather.indexOf("구름") !== -1 || currentWeather.indexOf("흐림") !== -1) {
    houseCloudGroup.visible = true;
  } else {
    houseCloudGroup.visible = false;
  }
}

// 번개 효과 업데이트 함수
function updateLightning() {
  if (currentWeather.indexOf("번개") !== -1 || currentWeather.indexOf("뇌우") !== -1) {
    if (Math.random() < 0.001) {
      lightningLight.intensity = 5;
      setTimeout(() => { lightningLight.intensity = 0; }, 100);
    }
  }
}

// Three.js 기본 설정
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("canvas"), alpha: true });

// 창 크기 조정 시 호출되는 함수
function onWindowResize() {
  const canvasBox = document.getElementById("three-canvas");
  if (!canvasBox) return;
  const width = canvasBox.clientWidth;
  const height = canvasBox.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
window.addEventListener("resize", onWindowResize);

// 3D 씬 설정 함수
function setupScene() {
  const canvasBox = document.getElementById("three-canvas");
  if (!canvasBox) return;
  renderer.setSize(canvasBox.clientWidth, canvasBox.clientHeight);
  camera.position.set(5, 5, 10);
  camera.lookAt(0, 0, 0);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7).normalize();
  scene.add(directionalLight);
  scene.add(new THREE.AmbientLight(0x333333));
}

// 태양 및 달 설정
const sunMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xff9900, transparent: true, opacity: 0 });
const sun = new THREE.Mesh(new THREE.SphereGeometry(1.5, 64, 64), sunMaterial);
scene.add(sun);

const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, emissive: 0x222222, transparent: true, opacity: 1 });
const moon = new THREE.Mesh(new THREE.SphereGeometry(1.2, 64, 64), moonMaterial);
scene.add(moon);

// 별 및 반딧불이 설정
const stars = [];
for (let i = 0; i < 200; i++) {
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  star.position.set((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 60, -20);
  scene.add(star);
  stars.push(star);
}

const fireflies = [];
for (let i = 0; i < 60; i++) {
  const firefly = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffff99 })
  );
  firefly.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20, -10);
  scene.add(firefly);
  fireflies.push(firefly);
}

// 바닥 설정
const floorGeometry = new THREE.PlaneGeometry(400, 400, 128, 128);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 1, metalness: 0 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2;
scene.add(floor);

// 배경 그룹 설정
const backgroundGroup = new THREE.Group();
scene.add(backgroundGroup);

// 건물 생성 함수
function createBuilding(width, height, depth, color) {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7, metalness: 0.1 });
  const building = new THREE.Mesh(geometry, material);
  group.add(building);
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x87CEEB });
  for (let y = 3; y < height - 1; y += 2) {
    for (let x = -width / 2 + 0.5; x < width / 2; x += 1) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.1), windowMat);
      w.position.set(x, y - height / 2, depth / 2 + 0.01);
      group.add(w);
    }
  }
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.1), doorMat);
  door.position.set(0, -height / 2 + 1, depth / 2 + 0.01);
  group.add(door);
  return group;
}

// 건물 배치
for (let i = 0; i < 20; i++) {
  const w = Math.random() * 4 + 4;
  const h = Math.random() * 20 + 20;
  const d = Math.random() * 4 + 4;
  const building = createBuilding(w, h, d, 0x555555);
  const col = i % 10;
  const row = Math.floor(i / 10);
  const x = -50 + col * 10;
  const z = -30 - row * 20;
  building.position.set(x, -2 + h / 2, z);
  backgroundGroup.add(building);
}

// 집 생성 함수
function createHouse(width, height, depth, baseColor, roofColor) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.8 })
  );
  base.position.y = -2 + height / 2;
  group.add(base);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.8, height * 0.6, 4),
    new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.8 })
  );
  roof.position.y = -2 + height + (height * 0.6) / 2;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);
  const windowMat = new THREE.MeshStandardMaterial({ color: 0xFFFFE0 });
  const window1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), windowMat);
  window1.position.set(-width / 4, -2 + height / 2, depth / 2 + 0.01);
  const window2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), windowMat);
  window2.position.set(width / 4, -2 + height / 2, depth / 2 + 0.01);
  group.add(window1, window2);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.1), doorMat);
  door.position.set(0, -2 + height / 4, depth / 2 + 0.01);
  group.add(door);
  return group;
}

// 집 배치
for (let i = 0; i < 10; i++) {
  const w = Math.random() * 4 + 6;
  const h = Math.random() * 4 + 6;
  const d = Math.random() * 4 + 6;
  const house = createHouse(w, h, d, 0xa0522d, 0x8b0000);
  const x = -40 + i * 10;
  const z = -10;
  house.position.set(x, 0, z);
  backgroundGroup.add(house);
}

// 가로등 생성 함수
function createStreetlight() {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 4, 8),
    new THREE.MeshBasicMaterial({ color: 0x333333 })
  );
  pole.position.y = 2;
  group.add(pole);
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffcc00 })
  );
  lamp.position.y = 4.2;
  group.add(lamp);
  const lampLight = new THREE.PointLight(0xffcc00, 1, 10);
  lampLight.position.set(0, 4.2, 0);
  group.add(lampLight);
  return group;
}

// 캐릭터 근처 가로등
const characterStreetlight = createStreetlight();
characterStreetlight.position.set(1, -2, 0);
scene.add(characterStreetlight);

// 비 그룹 설정
let rainGroup = new THREE.Group();
scene.add(rainGroup);

// 비 초기화 함수
function initRain() {
  const rainCount = 2000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount; i++) {
    positions[i * 3] = Math.random() * 200 - 100;
    positions[i * 3 + 1] = Math.random() * 100;
    positions[i * 3 + 2] = Math.random() * 200 - 100;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xaaaaee, size: 0.1, transparent: true, opacity: 0.6 });
  const rainParticles = new THREE.Points(geometry, material);
  rainGroup.add(rainParticles);
}
initRain();
rainGroup.visible = false;

// 구름 그룹 설정
let houseCloudGroup = new THREE.Group();

// 구름 생성 함수
function createHouseCloud() {
  const cloud = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  const s1 = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), mat);
  s1.position.set(0, 0, 0);
  const s2 = new THREE.Mesh(new THREE.SphereGeometry(1.8, 32, 32), mat);
  s2.position.set(2.2, 0.7, 0);
  const s3 = new THREE.Mesh(new THREE.SphereGeometry(2.1, 32, 32), mat);
  s3.position.set(-2.2, 0.5, 0);
  cloud.add(s1, s2, s3);
  cloud.userData.initialPos = cloud.position.clone();
  return cloud;
}

const singleCloud = createHouseCloud();
houseCloudGroup.add(singleCloud);
houseCloudGroup.position.set(0, 10, -20);
scene.add(houseCloudGroup);

// 구름 업데이트 함수
function updateHouseClouds() {
  singleCloud.position.x += 0.02;
  if (singleCloud.position.x > 10) singleCloud.position.x = -10;
}

// 번개 조명 설정
let lightningLight = new THREE.PointLight(0xffffff, 0, 500);
lightningLight.position.set(0, 50, 0);
scene.add(lightningLight);

// 캐릭터 그룹 설정
let characterGroup = new THREE.Group();
const charBody = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1.5, 0.5),
  new THREE.MeshStandardMaterial({ color: 0x00cc66 })
);
const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xffcc66 })
);
head.position.y = 1.2;
let leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), new THREE.MeshBasicMaterial({ color: 0x000000 }));
let rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), new THREE.MeshBasicMaterial({ color: 0x000000 }));
leftEye.position.set(-0.2, 1.3, 0.45);
rightEye.position.set(0.2, 1.3, 0.45);
const mouth = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 0.05, 0.05),
  new THREE.MeshStandardMaterial({ color: 0xff3366 })
);
mouth.position.set(0, 1.1, 0.51);
let leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0x000000 }));
let rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0x000000 }));
leftBrow.position.set(-0.2, 1.45, 0.45);
rightBrow.position.set(0.2, 1.45, 0.45);
const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 0.2), charBody.material);
const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 0.2), charBody.material);
leftArm.position.set(-0.7, 0.4, 0);
rightArm.position.set(0.7, 0.4, 0);
const legMat = new THREE.MeshStandardMaterial({ color: 0x3366cc });
const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1, 0.3), legMat);
const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1, 0.3), legMat);
leftLeg.position.set(-0.35, -1, 0);
rightLeg.position.set(0.35, -1, 0);
characterGroup.add(
  charBody, head, leftEye, rightEye, mouth,
  leftBrow, rightBrow, leftArm, rightArm, leftLeg, rightLeg
);
characterGroup.position.y = -1;
scene.add(characterGroup);

// 캐릭터 조명 설정
const characterLight = new THREE.PointLight(0xffee88, 1, 15);
scene.add(characterLight);

// 나무 생성 함수
function createTree() {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 2, 16),
    new THREE.MeshStandardMaterial({ color: 0x8B4513 })
  );
  trunk.position.y = -1;
  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(1, 3, 16),
    new THREE.MeshStandardMaterial({ color: 0x228B22 })
  );
  foliage.position.y = 0.5;
  group.add(trunk, foliage);
  return group;
}

// 나무 배치
for (let i = 0; i < 10; i++) {
  const tree = createTree();
  tree.position.set(-50 + i * 10, -2, -15);
  scene.add(tree);
}

// 애니메이션 함수
function animate() {
  requestAnimationFrame(animate);
  const now = new Date();
  const totalMin = now.getHours() * 60 + now.getMinutes();
  const angle = (totalMin / 1440) * Math.PI * 2;
  const radius = 3;
  const headWorldPos = new THREE.Vector3();
  head.getWorldPosition(headWorldPos);
  sun.position.set(
    headWorldPos.x + Math.cos(angle) * radius,
    headWorldPos.y + Math.sin(angle) * radius,
    headWorldPos.z
  );
  const moonAngle = angle + Math.PI;
  moon.position.set(
    headWorldPos.x + Math.cos(moonAngle) * radius,
    headWorldPos.y + Math.sin(moonAngle) * radius,
    headWorldPos.z
  );
  const t = now.getHours() + now.getMinutes() / 60;
  let sunOpacity = 0, moonOpacity = 0;
  if (t < 6) {
    sunOpacity = 0; moonOpacity = 1;
  } else if (t < 7) {
    let factor = (t - 6);
    sunOpacity = factor; moonOpacity = 1 - factor;
  } else if (t < 17) {
    sunOpacity = 1; moonOpacity = 0;
  } else if (t < 18) {
    let factor = (t - 17);
    sunOpacity = 1 - factor; moonOpacity = factor;
  } else {
    sunOpacity = 0; moonOpacity = 1;
  }
  sun.material.opacity = sunOpacity;
  moon.material.opacity = moonOpacity;
  const isDay = (t >= 7 && t < 17);
  scene.background = new THREE.Color(isDay ? 0x87CEEB : 0x000033);
  stars.forEach(s => s.visible = !isDay);
  fireflies.forEach(f => f.visible = !isDay);
  updateWeatherEffects();
  updateHouseClouds();
  updateLightning();
  renderer.render(scene, camera);
}

// 메인 초기화 함수
function mainInit() {
  setupScene();
  onWindowResize();
  animate();
}

// 캘린더 관련 변수
let currentYear, currentMonth;

// 캘린더 초기화 함수
function initCalendar() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
  populateYearSelect();
  renderCalendar(currentYear, currentMonth);
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");
  const yearSelect = document.getElementById("year-select");
  const deleteDayEventBtn = document.getElementById("delete-day-event");
  const saveCalendarBtn = document.getElementById("save-calendar");

  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      renderCalendar(currentYear, currentMonth);
    });
  }
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      renderCalendar(currentYear, currentMonth);
    });
  }
  if (yearSelect) {
    yearSelect.addEventListener("change", (e) => {
      currentYear = parseInt(e.target.value);
      renderCalendar(currentYear, currentMonth);
    });
  }
  if (deleteDayEventBtn) {
    deleteDayEventBtn.addEventListener("click", () => {
      const dayStr = prompt("삭제할 하루일정의 날짜(일)를 입력하세요 (예: 15):");
      if (dayStr) {
        const dayNum = parseInt(dayStr);
        const eventDiv = document.getElementById(`event-${currentYear}-${currentMonth + 1}-${dayNum}`);
        if (eventDiv) {
          eventDiv.textContent = "";
          alert(`${currentYear}-${currentMonth + 1}-${dayNum} 일정이 삭제되었습니다.`);
        }
      }
    });
  }
  if (saveCalendarBtn) {
    saveCalendarBtn.addEventListener("click", () => {
      saveCalendar();
    });
  }
}

// 연도 선택 옵션 채우기 함수
function populateYearSelect() {
  const yearSelect = document.getElementById("year-select");
  if (!yearSelect) return;
  yearSelect.innerHTML = "";
  for (let y = 2020; y <= 2070; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    if (y === currentYear) option.selected = true;
    yearSelect.appendChild(option);
  }
}

// 캘린더 렌더링 함수
function renderCalendar(year, month) {
  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  const monthYearLabel = document.getElementById("month-year-label");
  const grid = document.getElementById("calendar-grid");
  if (!monthYearLabel || !grid) return;

  monthYearLabel.textContent = `${year}년 ${monthNames[month]}`;
  grid.innerHTML = "";
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  daysOfWeek.forEach(day => {
    const th = document.createElement("div");
    th.style.fontWeight = "bold";
    th.style.textAlign = "center";
    th.textContent = day;
    grid.appendChild(th);
  });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement("div"));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.innerHTML = `<div class="day-number">${d}</div>
                      <div class="event" id="event-${year}-${month + 1}-${d}"></div>`;
    cell.addEventListener("click", () => {
      const eventText = prompt(`${year}-${month + 1}-${d} 일정 입력:`);
      if (eventText) {
        const eventDiv = document.getElementById(`event-${year}-${month + 1}-${d}`);
        if (eventDiv) {
          if (eventDiv.textContent) {
            eventDiv.textContent += "; " + eventText;
          } else {
            eventDiv.textContent = eventText;
          }
        }
      }
    });
    grid.appendChild(cell);
  }
}

// 캘린더 저장 함수
function saveCalendar() {
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarData = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const eventDiv = document.getElementById(`event-${currentYear}-${currentMonth + 1}-${d}`);
    if (eventDiv && eventDiv.textContent.trim() !== "") {
      calendarData[`${currentYear}-${currentMonth + 1}-${d}`] = eventDiv.textContent;
    }
  }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(calendarData, null, 2));
  const dlAnchorElem = document.createElement("a");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "calendar_events.json");
  dlAnchorElem.style.display = "none";
  document.body.appendChild(dlAnchorElem);
  dlAnchorElem.click();
  document.body.removeChild(dlAnchorElem);
}

// 튜토리얼 표시 함수
function showTutorial() {
  const overlay = document.getElementById("tutorial-overlay");
  if (!overlay) return;
  overlay.style.display = "flex";
  setTimeout(() => { overlay.style.opacity = "1"; }, 10);
  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => { overlay.style.display = "none"; }, 1000);
  }, 4000);
}

// 버전 변경 함수
function changeVersion(version) {
  if (version === "1.3") {
    window.location.href = window.location.href;
  } else if (version === "latest") {
    alert("최신 버전으로 이동하려면 해당 URL을 입력하세요.");
  }
}

// DOM 로드 완료 시 실행
document.addEventListener("DOMContentLoaded", function() {
  const regionSelect = document.getElementById("region-select");
  if (regionSelect) {
    regionList.forEach(region => {
      const option = document.createElement("option");
      option.value = region;
      option.textContent = `${region} (${regionMap[region]})`;
      if (region === currentCity) option.selected = true;
      regionSelect.appendChild(option);
    });
  }
  const hud2Toggle = document.getElementById("hud-2-toggle");
  if (hud2Toggle) {
    hud2Toggle.addEventListener("click", toggleHud2);
  }
});

// 페이지 로드 완료 시 실행
window.addEventListener("load", async () => {
  mainInit();
  initCalendar();
  showTutorial();
  updateMap();
  await updateWeatherAndEffects();
  onWindowResize();
});
