/***** 사이트 링크 및 키워드 설정 *****/
const SITE_LINKS = {
  "빙": "https://www.bing.com",
  "네이버": "https://www.naver.com",
  "다음": "https://www.daum.net",
  "유튜브": "https://www.youtube.com",
  "넷플릭스": "https://www.netflix.com",
  "트위치": "https://www.twitch.tv",
  "틱톡": "https://www.tiktok.com",
  "인스타": "https://www.instagram.com",
  "인스타그램": "https://www.instagram.com",
  "페이스북": "https://www.facebook.com",
  "트위터": "https://x.com",
  "엑스": "https://x.com",
  "링크드인": "https://www.linkedin.com",
  "레딧": "https://www.reddit.com"
};

const KEYWORDS = {
  greetings: ["안녕", "안녕하세요", "안녕 하세", "안녕하시오", "안녕한갑네"],
  sleep: ["잘자", "좋은꿈", "좋은 꿈", "잘자요", "잘자시게", "잘자리요", "잘자라니께"],
  weather: ["날씨알려줘", "날씨알려주게", "날씨좀알려줘", "날씨 알려줘", "날씨 좀 알려줘", "날씨 어때", "날씨 맑아"],
  calendar: ["일정 알려줘"],
  time: ["시간 알려줘"],
  delete: ["하루일정 삭제", "하루일과 삭제해줘", "하루일과", "하루일저", "하루 일관"]
};

/***** 전역 변수 *****/
document.addEventListener("contextmenu", event => event.preventDefault());
let currentCity = "서울";
let currentWeather = "";
const regionMap = {
  "서울": "Seoul",
  "인천": "Incheon",
  "수원": "Suwon",
  "고양": "Goyang",
  "성남": "Seongnam",
  "용인": "Yongin",
  "부천": "Bucheon",
  "안양": "Anyang",
  "의정부": "Uijeongbu",
  "광명": "Gwangmyeong",
  "안산": "Ansan",
  "파주": "Paju",
  "부산": "Busan",
  "대구": "Daegu",
  "광주": "Gwangju",
  "대전": "Daejeon",
  "울산": "Ulsan",
  "제주": "Jeju",
  "전주": "Jeonju",
  "청주": "Cheongju",
  "포항": "Pohang",
  "여수": "Yeosu",
  "김해": "Gimhae"
};
const regionList = Object.keys(regionMap);

/***** 복사 차단 *****/
document.addEventListener("copy", function(e) {
  e.preventDefault();
  let selectedText = window.getSelection().toString();
  e.clipboardData.setData("text/plain", selectedText);
});

/***** 메모리 저장(기억) 및 반복 학습 *****/
const memoryStorage = {
  save: function(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  load: function(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch(e) {
      console.error("Error loading key:", key, e);
      return null;
    }
  }
};

function updateConversationHistory(input, response) {
  try {
    let history = memoryStorage.load("conversationHistory") || [];
    history.push({ timestamp: Date.now(), input: input, response: response });
    memoryStorage.save("conversationHistory", history);
  } catch(e) {
    console.error("대화 이력 저장 오류:", e);
  }
}

function learnFromInteractions() {
  let history = memoryStorage.load("conversationHistory") || [];
  let emotionCount = memoryStorage.load("emotionCount") || { positive: 0, negative: 0, surprise: 0 };
  if (emotionCount["negative"] && emotionCount["negative"] >= 5) {
    if (!KEYWORDS.negativeComfort) {
      KEYWORDS.negativeComfort = ["힘내세요!", "당신은 혼자가 아니에요.", "괜찮을 거예요."];
    }
  }
}

/***** NLP (감정 분석) + 의도 인식 + 뉴스 파이프라인 *****/
let lastTopic = memoryStorage.load("lastTopic") || "";
function processNLP(input) {
  const lowerInput = input.toLowerCase();
  const emotions = {
    positive: ["좋아", "행복", "기쁘", "즐거", "최고"],
    negative: ["슬프", "우울", "짜증", "화나", "피곤"],
    surprise: ["놀라", "대박", "와"]
  };
  let detectedEmotion = null;
  for (let mood in emotions) {
    if (emotions[mood].some(keyword => lowerInput.includes(keyword))) {
      detectedEmotion = mood;
      break;
    }
  }
  if (input.trim().match(/!$/)) {
    detectedEmotion = "surprise";
  }
  let emotionCount = memoryStorage.load("emotionCount") || { positive: 0, negative: 0, surprise: 0 };
  if (detectedEmotion) {
    emotionCount[detectedEmotion] = (emotionCount[detectedEmotion] || 0) + 1;
    memoryStorage.save("emotionCount", emotionCount);
  }
  let enhancedResponse = "";
  if (detectedEmotion === "positive") {
    enhancedResponse = "기분이 좋으시다니 저도 기뻐요!";
  } else if (detectedEmotion === "negative") {
    enhancedResponse = "마음이 힘드시다니 안타깝네요. 제가 위로해드릴게요.";
  } else if (detectedEmotion === "surprise") {
    enhancedResponse = "정말 놀라운 일이네요!";
  }
  if (detectedEmotion === "negative" && emotionCount["negative"] >= 3) {
    enhancedResponse += " 여러 번 우울한 감정을 느끼셨네요. 혹시 도움이 필요하시면 전문가와 상담해보시는 건 어떨까요?";
  }
  if (lowerInput.includes("뭐해") || lowerInput.includes("무엇을")) {
    enhancedResponse = "저는 여기서 당신과 대화 중이에요!";
  }
  return enhancedResponse || null;
}

const intents = {
  addEvent: ["일정", "추가", "예약", "회의"],
  getWeather: ["날씨", "어때"],
  getTime: ["시간", "몇 시"],
  youtubeSearch: ["유튜브", "youtube", "동영상", "비디오", "영상"]
};

function detectIntent(input) {
  const lowerInput = input.toLowerCase();
  for (let intent in intents) {
    if (intents[intent].some(keyword => lowerInput.includes(keyword))) {
      return intent;
    }
  }
  return null;
}

function isNewsQuery(input) {
  const newsKeywords = ["뉴스", "속보", "보도", "언론", "이슈", "사건", "정치", "사회", "경제"];
  return newsKeywords.some(keyword => input.includes(keyword));
}

async function pipelineNewsSearch(userInput) {
  let query = userInput;
  if (isNewsQuery(userInput)) {
    query += " site:news.google.com OR site:n.news.naver.com";
  }
  const results = await getGoogleSearchResults(query);
  const summary = results.split(", ").slice(0, 5).join("\n- ");
  showSpeechBubbleInChunks("뉴스 요약:\n- " + summary);
}

/***** 음성 출력 *****/
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.volume = 1;
  utterance.rate = 1.5;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

/***** 캘린더 관련 함수 *****/
function deleteCalendarEvent(day) {
  const eventDiv = document.getElementById(`event-${currentYear}-${currentMonth+1}-${day}`);
  if (eventDiv) {
    eventDiv.textContent = "";
    let calendarData = JSON.parse(localStorage.getItem("calendarEvents") || "{}");
    delete calendarData[`${currentYear}-${currentMonth+1}-${day}`];
    localStorage.setItem("calendarEvents", JSON.stringify(calendarData));
    return `${currentYear}-${currentMonth+1}-${day} 일정이 삭제되었습니다.`;
  } else {
    return "해당 날짜에 일정이 없습니다.";
  }
}

function getCalendarEvents(dateStr = null) {
  const calendarData = JSON.parse(localStorage.getItem("calendarEvents") || "{}");
  if (!Object.keys(calendarData).length) {
    return "저장된 일정이 없습니다. 먼저 날짜 셀을 클릭하여 일정을 입력해주세요.";
  }
  if (dateStr) {
    if (calendarData[dateStr]) {
      return `${dateStr}의 일정: ${calendarData[dateStr]}`;
    } else {
      return `${dateStr}에는 일정이 없습니다.";
    }
  } else {
    const currentMonthStr = `${currentYear}-${currentMonth+1}`;
    let events = [];
    for (let key in calendarData) {
      if (key.startsWith(currentMonthStr)) {
        events.push(`${key}: ${calendarData[key]}`);
      }
    }
    return events.length ? `현재 월(${currentMonthStr})의 일정:\n${events.join("\n")}`
                          : `현재 월(${currentMonthStr})에는 일정이 없습니다.`;
  }
}

function updateMap() {
  const englishCity = regionMap[currentCity] || "Seoul";
  document.getElementById("map-iframe").src = `https://www.google.com/maps?q=${encodeURIComponent(englishCity)}&output=embed`;
}

/***** 백엔드 API 호출 함수 *****/
const BACKEND_URL = 'https://your-backend.onrender.com'; // 실제 Render URL로 교체 필요

async function getWeather() {
  try {
    const englishCity = regionMap[currentCity] || "Seoul";
    const response = await fetch(`${BACKEND_URL}/api/weather?city=${encodeURIComponent(englishCity)}`);
    if (!response.ok) throw new Error("서버 응답 오류");
    const data = await response.json();
    currentWeather = data.description;
    const message = `오늘 ${currentCity}의 날씨는 ${data.description}이고, 기온은 ${data.temperature}°C입니다.`;
    return { message };
  } catch (error) {
    console.error(error);
    currentWeather = "";
    return { message: "날씨 정보를 가져오는데 실패했습니다." };
  }
}

async function getGoogleSearchResults(query) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("서버 응답 오류");
    const data = await response.json();
    if (data.length > 0) {
      return data.map(item => item.title).join(", ");
    } else {
      return "검색 결과가 없습니다.";
    }
  } catch (error) {
    console.error(error);
    return "검색 결과를 가져오는데 실패했습니다.";
  }
}

async function getYouTubeSearchResults(query) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/youtube-search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("서버 응답 오류");
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const results = data.items.map(item => {
        const title = item.title;
        const url = item.url;
        return `<a href="${url}" target="_blank">${title}</a>`;
      });
      return results.join("<br>");
    } else {
      return "검색 결과가 없습니다.";
    }
  } catch (error) {
    console.error(error);
    return "유튜브 검색 결과를 가져오는데 실패했습니다.";
  }
}

function updateWeatherEffects() {
  if (!currentWeather) return;
  if (currentWeather.includes("비") || currentWeather.includes("소나기")) {
    rainGroup.visible = true;
    cloudRainGroup.visible = true;
  } else {
    rainGroup.visible = false;
    cloudRainGroup.visible = false;
  }
  if (currentWeather.includes("구름") || currentWeather.includes("흐림")) {
    houseCloudGroup.visible = true;
  } else {
    houseCloudGroup.visible = false;
  }
}

function updateLightning() {
  if (currentWeather.includes("번개") || currentWeather.includes("뇌우")) {
    if (Math.random() < 0.001) {
      lightningLight.intensity = 5;
      setTimeout(() => { lightningLight.intensity = 0; }, 100);
    }
  }
}

async function updateWeatherAndEffects(sendMessage = true) {
  const weatherData = await getWeather();
  if (sendMessage) {
    showSpeechBubbleInChunks(weatherData.message);
  }
  updateWeatherEffects();
}

function changeRegion(value) {
  currentCity = value;
  updateMap();
  updateWeatherAndEffects();
  const englishCity = regionMap[currentCity] || "Seoul";
  const message = `지역이 ${currentCity} (${englishCity})로 변경되었습니다.`;
  showSpeechBubbleInChunks(message);
}

/***** 음성 인식 *****/
function startSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "ko-KR";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();
  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript.trim();
    if (confirm(`"${transcript}" 맞나요?`)) {
      document.getElementById("chat-input").value = transcript;
      sendChat();
    }
  };
  recognition.onerror = function(event) {
    console.error("음성 인식 오류:", event.error);
  };
}

/***** 대화 맥락 유지 및 의도 인식 *****/
function updateContext(intent) {
  lastTopic = intent;
  memoryStorage.save("lastTopic", lastTopic);
}

/***** 채팅 전송 및 파이프라인 처리 *****/
async function sendChat() {
  const inputEl = document.getElementById("chat-input");
  const input = inputEl.value.trim();
  if (!input) return;
  let response = "";
  let isHTML = false;
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes("일정 알려") || lowerInput.includes("일정 뭐") || lowerInput.includes("일정 보여")) {
    const dateMatch = input.match(/\d{4}-\d{1,2}-\d{1,2}/);
    response = dateMatch ? getCalendarEvents(dateMatch[0]) : getCalendarEvents();
  } else if (lowerInput.startsWith("구글 ")) {
    const query = input.replace("구글 ", "").trim();
    if (query) {
      const searchResults = await getGoogleSearchResults(query);
      response = searchResults ? `구글 검색 결과: ${searchResults}` : "검색 결과를 가져오는데 실패했습니다.";
    } else {
      response = "검색어를 입력해주세요. 예: 구글 날씨";
    }
  } else if (isNewsQuery(input)) {
    await pipelineNewsSearch(input);
    inputEl.value = "";
    return;
  } else {
    for (let site in SITE_LINKS) {
      if (lowerInput.includes(site)) {
        if (site === "유튜브" || site === "youtube") {
          const query = lowerInput.replace(new RegExp(intents.youtubeSearch.join("|"), "gi"), "").trim();
          if (query) {
            const youtubeResults = await getYouTubeSearchResults(query);
            response = youtubeResults;
            isHTML = true;
            inputEl.value = `${query} 비디오`;
          } else {
            response = "유튜브 검색어를 입력해주세요. 예: 고양이 비디오";
          }
          updateContext("youtubeSearch");
        } else {
          response = `${site} 사이트로 이동합니다! 잠시만 기다려 주세요.`;
          showSpeechBubbleInChunks(response);
          setTimeout(() => { window.location.href = SITE_LINKS[site]; }, 2000);
          inputEl.value = "";
          return;
        }
        break;
      }
    }

    const nlpResponse = processNLP(input);
    if (nlpResponse) {
      response = nlpResponse;
    }
    const intent = detectIntent(input);
    if (!response && intent === "addEvent") {
      const eventMatch = input.match(/(오늘|내일|\d{4}-\d{1,2}-\d{1,2})\s*(\d{1,2})시/);
      if (eventMatch) {
        let date;
        if (eventMatch[1] === "오늘") {
          date = new Date();
        } else if (eventMatch[1] === "내일") {
          date = new Date(Date.now() + 86400000);
        } else {
          date = new Date(eventMatch[1]);
        }
        date.setHours(parseInt(eventMatch[2]));
        const eventText = input.replace(eventMatch[0], "").trim();
        const dateKey = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
        let calendarData = JSON.parse(localStorage.getItem("calendarEvents") || "{}");
        calendarData[dateKey] = eventText;
        localStorage.setItem("calendarEvents", JSON.stringify(calendarData));
        renderCalendar(currentYear, currentMonth);
        response = `${dateKey}에 "${eventText}" 일정이 추가되었습니다.`;
        updateContext("addEvent");
      }
    } else if (!response && intent === "getWeather") {
      const weatherData = await getWeather();
      response = weatherData.message;
      updateContext("weather");
    } else if (!response && intent === "getTime") {
      const now = new Date();
      response = `현재 시간은 ${now.getHours()}시 ${now.getMinutes()}분입니다.`;
      updateContext("time");
    } else if (!response && intent === "youtubeSearch") {
      const query = lowerInput.replace(new RegExp(intents.youtubeSearch.join("|"), "gi"), "").trim();
      if (query) {
        const youtubeResults = await getYouTubeSearchResults(query);
        response = youtubeResults;
        isHTML = true;
        inputEl.value = `${query} 비디오`;
        updateContext("youtubeSearch");
      } else {
        response = "유튜브 검색어를 입력해주세요. 예: 고양이 비디오";
      }
    }

    if (!response && lastTopic === "weather" && lowerInput.includes("내일")) {
      response = "내일 날씨는 비가 올 예정입니다.";
    }

    if (!response) {
      if (lowerInput.startsWith("지역 ")) {
        const newCity = lowerInput.replace("지역", "").trim();
        if (newCity && regionList.includes(newCity)) {
          currentCity = newCity;
          document.getElementById("region-select").value = newCity;
          response = `좋아요, 지역을 ${newCity}(으)로 변경할게요!`;
          updateMap();
          await updateWeatherAndEffects();
        } else {
          response = "죄송해요, 그 지역은 지원하지 않아요. 드롭다운 메뉴에서 선택해주세요.";
        }
      } else if (regionList.includes(input)) {
        currentCity = input;
        document.getElementById("region-select").value = input;
        response = `좋아요, 지역을 ${input}(으)로 변경할게요!`;
        updateMap();
        await updateWeatherAndEffects();
      } else if (KEYWORDS.delete.some(keyword => lowerInput.includes(keyword))) {
        const dayStr = prompt("삭제할 하루일정의 날짜(일)를 입력하세요 (예: 15):");
        if (dayStr) {
          const dayNum = parseInt(dayStr);
          response = deleteCalendarEvent(dayNum);
        } else {
          response = "삭제할 날짜를 입력하지 않으셨습니다.";
        }
      } else if (KEYWORDS.greetings.some(keyword => lowerInput.includes(keyword))) {
        response = "안녕하세요! 만나서 반갑습니다. 오늘 하루 어떠셨나요?";
      } else if (KEYWORDS.sleep.some(keyword => lowerInput.includes(keyword))) {
        response = "편안한 밤 되세요, 좋은 꿈 꾸세요~";
      } else if (KEYWORDS.weather.some(keyword => lowerInput.includes(keyword))) {
        const weatherData = await getWeather();
        response = weatherData.message;
      } else if (lowerInput.includes("시간")) {
        const now = new Date();
        response = `현재 시간은 ${now.getHours()}시 ${now.getMinutes()}분입니다.`;
      } else {
        const generalResponses = [
          "정말 흥미로운 이야기네요. 더 들려주세요!",
          "알겠습니다. 혹시 다른 궁금한 점은 없으신가요?",
          "그렇군요. 당신의 의견을 듣고 있으니 저도 많이 배워요.",
          "그렇게 느끼실 수 있겠네요. 함께 이야기 나눠봐요!"
        ];
        response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
      }
    }
  }
  memoryStorage.save('lastInput', input);
  memoryStorage.save('lastResponse', response);
  updateConversationHistory(input, response);
  learnFromInteractions();

  showSpeechBubbleInChunks(response, isHTML);
}

/***** 말풍선(버블) 여러 줄 출력 *****/
function showSpeechBubbleInChunks(text, isHTML = false, chunkSize = 15, delay = 1500) {
  const bubble = document.getElementById("speech-bubble");
  let parts;
  if (isHTML) {
    parts = text.split("<br>");
  } else {
    parts = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      parts.push(text.slice(i, i + chunkSize));
    }
  }
  let index = 0;
  bubble.innerHTML = "";
  function showNextPart() {
    if (index < parts.length) {
      if (isHTML) {
        bubble.innerHTML += parts[index] + "<br>";
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = parts[index];
        speakText(tempDiv.textContent);
      } else {
        bubble.textContent += parts[index];
        speakText(parts[index]);
      }
      bubble.style.display = "block";
      index++;
      setTimeout(showNextPart, delay);
    } else {
      setTimeout(() => { bubble.style.display = "none"; }, 3000);
    }
  }
  showNextPart();
}

/***** DOMContentLoaded, resize, load 이벤트 *****/
window.addEventListener("DOMContentLoaded", function() {
  const chatInput = document.getElementById("chat-input");
  chatInput.setAttribute("list", "Charge");
  const autoCompleteList = document.createElement("datalist");
  autoCompleteList.id = "Charge";
  const allKeywords = Object.values(KEYWORDS).flat().concat(Object.keys(SITE_LINKS));
  allKeywords.forEach(kw => {
    const option = document.createElement("option");
    option.value = kw;
    autoCompleteList.appendChild(option);
  });
  document.body.appendChild(autoCompleteList);
  document.getElementById("chat-input").addEventListener("keydown", function(e) {
    if (e.key === "Enter") sendChat();
  });
  const regionSelect = document.getElementById("region-select");
  regionList.forEach(region => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = `${region} (${regionMap[region]})`;
    if (region === currentCity) option.selected = true;
    regionSelect.appendChild(option);
  });
});

window.addEventListener("resize", function(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("load", async () => {
  initCalendar();
  updateMap();
  await updateWeatherAndEffects();
});

/***** 캘린더 렌더링 *****/
let currentYear, currentMonth;
function initCalendar() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
  populateYearSelect();
  renderCalendar(currentYear, currentMonth);
  document.getElementById("prev-month").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar(currentYear, currentMonth);
  });
  document.getElementById("next-month").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar(currentYear, currentMonth);
  });
  document.getElementById("year-select").addEventListener("change", (e) => {
    currentYear = parseInt(e.target.value);
    renderCalendar(currentYear, currentMonth);
  });
  document.getElementById("delete-day-event").addEventListener("click", () => {
    const dayStr = prompt("삭제할 하루일정의 날짜(일)를 입력하세요 (예: 15):");
    if (dayStr) {
      const dayNum = parseInt(dayStr);
      const eventDiv = document.getElementById(`event-${currentYear}-${currentMonth+1}-${dayStr}`);
      if (eventDiv) {
        eventDiv.textContent = "";
        const message = `${currentYear}-${currentMonth+1}-${dayStr} 일정이 삭제되었습니다. 다시 입력할 수 있습니다.`;
        alert(message);
        speakText(message);
        let calendarData = JSON.parse(localStorage.getItem("calendarEvents") || "{}");
        delete calendarData[`${currentYear}-${currentMonth+1}-${dayStr}`];
        localStorage.setItem("calendarEvents", JSON.stringify(calendarData));
      }
    }
  });
}

function populateYearSelect() {
  const yearSelect = document.getElementById("year-select");
  yearSelect.innerHTML = "";
  for (let y = 2020; y <= 2070; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    if (y === currentYear) option.selected = true;
    yearSelect.appendChild(option);
  }
}

function renderCalendar(year, month) {
  const monthNames = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  document.getElementById("month-year-label").textContent = `${year}년 ${monthNames[month]}`;
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";
  const daysOfWeek = ["일","월","화","수","목","금","토"];
  daysOfWeek.forEach(day => {
    const th = document.createElement("div");
    th.style.fontWeight = "bold";
    th.style.textAlign = "center";
    th.textContent = day;
    th.style.color = "#00ffcc";
    th.style.textShadow = "0 0 3px #00ffcc";
    grid.appendChild(th);
  });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement("div"));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.innerHTML = `
      <div class="day-number">${d}</div>
      <div class="event" id="event-${year}-${month+1}-${d}"></div>
    `;
    cell.addEventListener("click", () => {
      const eventText = prompt(`${year}-${month+1}-${d} 일정 입력:`);
      if (eventText) {
        const eventDiv = document.getElementById(`event-${year}-${month+1}-${d}`);
        if (eventDiv.textContent) {
          eventDiv.textContent += "; " + eventText;
        } else {
          eventDiv.textContent = eventText;
        }
        speakText(`${year}-${month+1}-${d}에 ${eventText} 일정이 추가되었습니다.`);
        let calendarData = JSON.parse(localStorage.getItem("calendarEvents") || "{}");
        calendarData[`${year}-${month+1}-${d}`] = eventDiv.textContent;
        localStorage.setItem("calendarEvents", JSON.stringify(calendarData));
      }
    });
    let calendarData = JSON.parse(localStorage.getItem("calendarEvents") || "{}");
    const dateKey = `${year}-${month+1}-${d}`;
    if (calendarData[dateKey]) {
      cell.querySelector(`#event-${year}-${month+1}-${d}`).textContent = calendarData[dateKey];
    }
    grid.appendChild(cell);
  }
}

/***** Three.js 및 3D 배경 렌더링 *****/
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas"),
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(10, 10, 20);
camera.lookAt(0, 0, 0);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7).normalize();
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0x333333));

const sunMaterial = new THREE.MeshStandardMaterial({
  color: 0xffcc00,
  emissive: 0xff9900,
  transparent: true,
  opacity: 0
});
const sun = new THREE.Mesh(new THREE.SphereGeometry(1.5, 64, 64), sunMaterial);
scene.add(sun);

const moonMaterial = new THREE.MeshStandardMaterial({
  color: 0xcccccc,
  emissive: 0x222222,
  transparent: true,
  opacity: 1
});
const moon = new THREE.Mesh(new THREE.SphereGeometry(1.2, 64, 64), moonMaterial);
scene.add(moon);

const stars = [];
const fireflies = [];
for (let i = 0; i < 200; i++) {
  const star = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  star.position.set((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 60, -20);
  scene.add(star);
  stars.push(star);
}
for (let i = 0; i < 60; i++) {
  const firefly = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffff99 }));
  firefly.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20, -10);
  scene.add(firefly);
  fireflies.push(firefly);
}

const floorGeometry = new THREE.PlaneGeometry(400, 400, 128, 128);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x808080,
  roughness: 1,
  metalness: 0
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2;
scene.add(floor);

const backgroundGroup = new THREE.Group();
scene.add(backgroundGroup);

function createBuilding(width, height, depth, color) {
  const buildingGroup = new THREE.Group();
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7,
    metalness: 0.1
  });
  const building = new THREE.Mesh(geometry, material);
  buildingGroup.add(building);

  const windowMat = new THREE.MeshStandardMaterial({ color: 0x87CEEB });
  for (let y = 3; y < height - 1; y += 2) {
    for (let x = -width / 2 + 0.5; x < width / 2; x += 1) {
      const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.1), windowMat);
      windowMesh.position.set(x, y - height / 2, depth / 2 + 0.01);
      buildingGroup.add(windowMesh);
    }
  }

  const doorMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.1), doorMat);
  door.position.set(0, -height / 2 + 1, depth / 2 + 0.01);
  buildingGroup.add(door);
  return buildingGroup;
}

function createHouse(width, height, depth, baseColor, roofColor) {
  const houseGroup = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.8 })
  );
  base.position.y = -2 + height / 2;
  houseGroup.add(base);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.8, height * 0.6, 4),
    new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.8 })
  );
  roof.position.y = -2 + height + (height * 0.6) / 2;
  roof.rotation.y = Math.PI / 4;
  houseGroup.add(roof);

  const windowMat = new THREE.MeshStandardMaterial({ color: 0xFFFFE0 });
  const window1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), windowMat);
  window1.position.set(-width / 4, -2 + height / 2, depth / 2 + 0.01);
  const window2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), windowMat);
  window2.position.set(width / 4, -2 + height / 2, depth / 2 + 0.01);
  houseGroup.add(window1, window2);

  const doorMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.1), doorMat);
  door.position.set(0, -2 + height / 4, depth / 2 + 0.01);
  houseGroup.add(door);
  return houseGroup;
}

for (let i = 0; i < 20; i++) {
  const width = Math.random() * 4 + 4;
  const height = Math.random() * 20 + 20;
  const depth = Math.random() * 4 + 4;
  const building = createBuilding(width, height, depth, 0x555555);
  const col = i % 10;
  const row = Math.floor(i / 10);
  const x = -50 + col * 10;
  const z = -30 - row * 20;
  building.position.set(x, -2 + height / 2, z);
  backgroundGroup.add(building);
}
for (let i = 0; i < 10; i++) {
  const width = Math.random() * 4 + 6;
  const height = Math.random() * 4 + 6;
  const depth = Math.random() * 4 + 6;
  const house = createHouse(width, height, depth, 0xa0522d, 0x8b0000);
  const x = -40 + i * 10;
  const z = -10;
  house.position.set(x, 0, z);
  backgroundGroup.add(house);
}

function createStreetlight() {
  const lightGroup = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 4, 8),
    new THREE.MeshBasicMaterial({ color: 0x333333 })
  );
  pole.position.y = 2;
  lightGroup.add(pole);

  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffcc00 })
  );
  lamp.position.y = 4.2;
  lightGroup.add(lamp);

  const lampLight = new THREE.PointLight(0xffcc00, 1, 10);
  lampLight.position.set(0, 4.2, 0);
  lightGroup.add(lampLight);
  return lightGroup;
}
const characterStreetlight = createStreetlight();
characterStreetlight.position.set(1, -2, 0);
scene.add(characterStreetlight);

let rainGroup = new THREE.Group();
scene.add(rainGroup);

function initRain() {
  const rainCount = 2000;
  const rainGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount; i++) {
    positions[i * 3] = Math.random() * 200 - 100;
    positions[i * 3 + 1] = Math.random() * 100;
    positions[i * 3 + 2] = Math.random() * 200 - 100;
  }
  rainGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const rainMaterial = new THREE.PointsMaterial({
    color: 0xaaaaee,
    size: 0.1,
    transparent: true,
    opacity: 0.6
  });
  const rainParticles = new THREE.Points(rainGeometry, rainMaterial);
  rainGroup.add(rainParticles);
}
initRain();
rainGroup.visible = false;

let houseCloudGroup = new THREE.Group();
scene.add(houseCloudGroup);

function createHouseCloud() {
  const cloud = new THREE.Group();
  const cloudMat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9
  });
  const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), cloudMat);
  sphere1.position.set(0, 0, 0);
  const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), cloudMat);
  sphere2.position.set(0.6, 0.2, 0);
  const sphere3 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), cloudMat);
  sphere3.position.set(-0.6, 0.1, 0);
  cloud.add(sphere1, sphere2, sphere3);
  cloud.scale.set(2, 2, 2);
  cloud.userData.initialPos = cloud.position.clone();
  return cloud;
}
const singleCloud = createHouseCloud();
houseCloudGroup.add(singleCloud);
houseCloudGroup.position.set(0, 2, 0);

let cloudRainGroup = new THREE.Group();
function initCloudRain() {
  const cloudRainCount = 100;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(cloudRainCount * 3);
  for (let i = 0; i < cloudRainCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1.5;
    positions[i * 3 + 1] = Math.random() * 0.2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xaaaaee,
    size: 0.05,
    transparent: true,
    opacity: 0.8
  });
  const particles = new THREE.Points(geometry, material);
  cloudRainGroup.add(particles);
}
initCloudRain();
cloudRainGroup.visible = false;
houseCloudGroup.add(cloudRainGroup);

function updateHouseClouds() {
  if (typeof head === 'undefined' || head === null || typeof head.getWorldPosition !== "function") return;
  const headWorldPos = new THREE.Vector3();
  try {
    head.getWorldPosition(headWorldPos);
  } catch (err) {
    console.error("updateHouseClouds 에러:", err);
    return;
  }
  houseCloudGroup.position.x = headWorldPos.x + Math.sin(Date.now() * 0.001) * 1;
  houseCloudGroup.position.y = headWorldPos.y + 2.5;
  houseCloudGroup.position.z = headWorldPos.z;
}

let lightningLight = new THREE.PointLight(0xffffff, 0, 500);
lightningLight.position.set(0, 50, 0);
scene.add(lightningLight);

const characterGroup = new THREE.Group();
const charBody = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1.5, 0.5),
  new THREE.MeshStandardMaterial({ color: 0x00cc66 })
);
const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xffcc66 })
);
head.position.y = 1.2;

const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), eyeMat);
const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), eyeMat);
leftEye.position.set(-0.2, 1.3, 0.45);
rightEye.position.set(0.2, 1.3, 0.45);

const mouth = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 0.05, 0.05),
  new THREE.MeshStandardMaterial({ color: 0xff3366 })
);
mouth.position.set(0, 1.1, 0.51);

const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.05), eyeMat);
const rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.05), eyeMat);
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
  charBody,
  head,
  leftEye,
  rightEye,
  mouth,
  leftBrow,
  rightBrow,
  leftArm,
  rightArm,
  leftLeg,
  rightLeg
);
characterGroup.position.y = -1;
scene.add(characterGroup);

const characterLight = new THREE.PointLight(0xffee88, 1, 15);
scene.add(characterLight);

function createTree() {
  const treeGroup = new THREE.Group();
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

  treeGroup.add(trunk, foliage);
  return treeGroup;
}
for (let i = 0; i < 10; i++) {
  const tree = createTree();
  tree.position.set(-50 + i * 10, -2, -15);
  scene.add(tree);
}

function animate() {
  requestAnimationFrame(animate);
  const now = new Date();
  const headWorldPos = new THREE.Vector3();
  try {
    head.getWorldPositiothn(headWorldPos);
  } catch (err) {
    console.error("애니메이트 중 head.getWorldPosition 에러:", err);
  }

  const totalMin = now.getHours() * 60 + now.getMinutes();
  const angle = (totalMin / 1440) * Math.PI * 2;
  const radius = 3;

  const sunPos = new THREE.Vector3(
    headWorldPos.x + Math.cos(angle) * radius,
    headWorldPos.y + Math.sin(angle) * radius,
    headWorldPos.z
  );
  sun.position.copy(sunPos);

  const moonAngle = angle + Math.PI;
  const moonPos = new THREE.Vector3(
    headWorldPos.x + Math.cos(moonAngle) * radius,
    headWorldPos.y + Math.sin(moonAngle) * radius,
    headWorldPos.z
  );
  moon.position.copy(moonPos);

  const t = now.getHours() + now.getMinutes() / 60;
  let sunOpacity = 0, moonOpacity = 0;
  if (t < 6) {
    sunOpacity = 0;
    moonOpacity = 1;
  } else if (t < 7) {
    let factor = t - 6;
    sunOpacity = factor;
    moonOpacity = 1 - factor;
  } else if (t < 17) {
    sunOpacity = 1;
    moonOpacity = 0;
  } else if (t < 18) {
    let factor = t - 17;
    sunOpacity = 1 - factor;
    moonOpacity = factor;
  } else {
    sunOpacity = 0;
    moonOpacity = 1;
  }
  sun.material.opacity = sunOpacity;
  moon.material.opacity = moonOpacity;

  const isDay = (t >= 7 && t < 17);
  scene.background = new THREE.Color(isDay ? 0x87CEEB : 0x000033);

  stars.forEach(s => (s.visible = !isDay));
  fireflies.forEach(f => (f.visible = !isDay));

  characterStreetlight.traverse(child => {
    if (child instanceof THREE.PointLight) {
      child.intensity = isDay ? 0 : 1;
    }
  });
  characterLight.position.copy(characterGroup.position).add(new THREE.Vector3(0, 5, 0));
  characterLight.intensity = isDay ? 0 : 1;

  characterGroup.position.y = -1;
  characterGroup.rotation.x = 0;

  updateWeatherEffects();
  updateHouseClouds();
  updateLightning();

  characterStreetlight.position.set(
    characterGroup.position.x + 1,
    -2,
    characterGroup.position.z
  );

  updateBubblePosition();

  if (cloudRainGroup.visible) {
    const particles = cloudRainGroup.children[0];
    let positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] -= 0.02;
      if (positions[i + 1] < -0.3) {
        positions[i + 1] = Math.random() * 0.2;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
}
animate();

function updateBubblePosition() {
  const bubble = document.getElementById("speech-bubble");
  if (!bubble) return;
  if (typeof head === 'undefined' || head === null || typeof head.getWorldPosition !== "function") return;
  const headWorldPos = new THREE.Vector3();
  try {
    head.getWorldPosition(headWorldPos);
  } catch (err) {
    console.error("updateBubblePosition 에러:", err);
    return;
  }
  const screenPos = headWorldPos.project(camera);
  bubble.style.left = ((screenPos.x * 0.5 + 0.5) * window.innerWidth) + "px";
  bubble.style.top = ((1 - (screenPos.y * 0.5 + 0.5)) * window.innerHeight - 50) + "px";
}
