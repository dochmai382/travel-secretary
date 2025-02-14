// googleMapApi.js

// 전역 변수 선언
let map;
let geocoder;
let markers = [];
let polylines = [];
let dayCount = 1;

// 초기화 함수 (한 번만 정의)
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 13,
  });
  geocoder = new google.maps.Geocoder();
}

// DOM 로드 시 이벤트 리스너 등록
document.addEventListener("DOMContentLoaded", function () {
  const addDayBtn = document.getElementById("addDayBtn");
  if (addDayBtn) {
    addDayBtn.addEventListener("click", function () {
      dayCount++;
      const daysContainer = document.getElementById("daysContainer");
      const newDaySection = document.createElement("div");
      newDaySection.className = "day-section";
      newDaySection.innerHTML = `
        <h3 onclick="toggleSection('day${dayCount}')">Day ${dayCount}</h3>
        <div id="day${dayCount}" class="day-inputs">
          <div class="place-input-container">
            <input type="text" class="place-input" placeholder="장소를 입력하세요" />
            <button class="delete-place-btn" onclick="deletePlaceInput(this)">삭제</button>
          </div>
          <button class="add-place-btn" onclick="addPlaceInput('day${dayCount}')">장소 추가</button>
        </div>
      `;
      daysContainer.appendChild(newDaySection);
    });
  }

  const toggleBtn = document.getElementById("toggleRouteSectionBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      const routeSection = document.getElementById("routeSection");
      if (
        routeSection.style.display === "none" ||
        routeSection.style.display === ""
      ) {
        routeSection.style.display = "block";
      } else {
        routeSection.style.display = "none";
      }
    });
  }
});

function toggleSection(dayId) {
  const section = document.getElementById(dayId);
  section.classList.toggle("hidden");
}

function addPlaceInput(dayId) {
  const dayInputs = document.getElementById(dayId);
  const newInputContainer = document.createElement("div");
  newInputContainer.className = "place-input-container";
  newInputContainer.innerHTML = `
    <input type="text" class="place-input" placeholder="장소를 입력하세요" />
    <button class="delete-place-btn" onclick="deletePlaceInput(this)">삭제</button>
  `;
  dayInputs.insertBefore(newInputContainer, dayInputs.lastElementChild);
}

function deletePlaceInput(button) {
  const inputContainer = button.parentElement;
  inputContainer.remove();
}

function drawAllRoutes() {
  clearMap();
  const daySections = document.querySelectorAll(".day-inputs");
  daySections.forEach((section, dayIndex) => {
    drawRouteForDay(section, dayIndex);
  });
}

function drawDayRoutes() {
  clearMap();
  const daySections = document.querySelectorAll(".day-inputs");
  daySections.forEach((section, dayIndex) => {
    if (!section.classList.contains("hidden")) {
      drawRouteForDay(section, dayIndex);
    }
  });
}

function drawRouteForDay(section, dayIndex) {
  const inputs = section.querySelectorAll(".place-input");
  const dayPlaces = [];
  let geocodePromises = [];

  inputs.forEach((input, placeIndex) => {
    const placeName = input.value.trim();
    if (placeName) {
      const geocodePromise = new Promise((resolve, reject) => {
        geocoder.geocode({ address: placeName }, function (results, status) {
          if (status === "OK") {
            const location = results[0].geometry.location;
            resolve({ location, placeIndex });
          } else {
            reject("장소를 찾을 수 없습니다: " + placeName);
          }
        });
      });
      geocodePromises.push(geocodePromise);
    }
  });

  Promise.all(geocodePromises)
    .then((results) => {
      results.sort((a, b) => a.placeIndex - b.placeIndex);

      results.forEach((result, i) => {
        const location = result.location;
        const marker = new google.maps.Marker({
          map: map,
          position: location,
          label: `Day ${dayIndex + 1}-${i + 1}`,
          icon: getMarkerIcon(dayIndex),
        });
        markers.push(marker);
        dayPlaces.push(location);

        if (i === 0 && dayIndex === 0) {
          map.setCenter(location);
        }
      });

      if (dayPlaces.length >= 2) {
        const polyline = new google.maps.Polyline({
          path: dayPlaces,
          geodesic: true,
          strokeColor: getDayColor(dayIndex),
          strokeOpacity: 1.0,
          strokeWeight: 2,
        });
        polyline.setMap(map);
        polylines.push(polyline);
      }
    })
    .catch((error) => {
      alert(error);
    });
}

function clearMap() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
  polylines.forEach((polyline) => polyline.setMap(null));
  polylines = [];
}

function getMarkerIcon(dayIndex) {
  const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFA500", "#800080"];
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: colors[dayIndex % colors.length],
    fillOpacity: 1,
    strokeWeight: 0,
    scale: 8,
  };
}

function getDayColor(dayIndex) {
  const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFA500", "#800080"];
  return colors[dayIndex % colors.length];
}

function displayRouteData(routes) {
  const daysContainer = document.getElementById("daysContainer");
  daysContainer.innerHTML = "";

  routes.forEach((dayRoute) => {
    const daySection = document.createElement("div");
    daySection.className = "day-section";
    daySection.innerHTML = `
      <h3 onclick="toggleSection('day${dayRoute.day}')">Day ${dayRoute.day}</h3>
      <div id="day${dayRoute.day}" class="day-inputs">
        ${dayRoute.places
          .map(
            (place) => `
          <div class="place-input-container">
            <input type="text" class="place-input" value="${place}" />
            <button class="delete-place-btn" onclick="deletePlaceInput(this)">삭제</button>
          </div>
        `
          )
          .join("")}
        <button class="add-place-btn" onclick="addPlaceInput('day${
          dayRoute.day
        }')">장소 추가</button>
      </div>
    `;
    daysContainer.appendChild(daySection);
  });
}
