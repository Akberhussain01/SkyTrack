/**
 * SkyTrack — app.js
 * Intelligent Flight Booking, Cockpit Radar Telemetry & AI Co-pilot
 * Built with Lighter Design Philosophy
 */

const FLIGHTS_DATA = [
  {
    id: "SA127",
    airline: "SkyAir",
    code: "SA 127",
    logo: "✈",
    from: "HYD",
    to: "JFK",
    depTime: "02:15 PM",
    arrTime: "08:40 PM",
    duration: "16h 25m",
    stops: "Non-stop",
    aircraft: "Boeing 787-9",
    price: 72450,
    priceDisplay: "₹72,450",
    valueScore: 98,
    amenities: ["Free Wi-Fi", "USB Power", "2x 23kg Luggage"]
  },
  {
    id: "GA442",
    airline: "Global Airways",
    code: "GA 442",
    logo: "🌐",
    from: "HYD",
    to: "JFK",
    depTime: "06:40 AM",
    arrTime: "02:15 PM",
    duration: "17h 35m",
    stops: "1 Stop (DXB)",
    aircraft: "Airbus A350-1000",
    price: 68900,
    priceDisplay: "₹68,900",
    valueScore: 92,
    amenities: ["Onboard Dining", "Live TV", "2x 23kg Luggage"]
  },
  {
    id: "NV208",
    airline: "Nova Airlines",
    code: "NV 208",
    logo: "◆",
    from: "HYD",
    to: "JFK",
    depTime: "11:20 PM",
    arrTime: "07:10 AM",
    duration: "18h 50m",
    stops: "1 Stop (DOH)",
    aircraft: "Boeing 777-300ER",
    price: 64750,
    priceDisplay: "₹64,750",
    valueScore: 89,
    amenities: ["Lie-flat Option", "In-seat Power", "1x 30kg Luggage"]
  },
  {
    id: "EK521",
    airline: "Emirates Connect",
    code: "EK 521",
    logo: "★",
    from: "HYD",
    to: "JFK",
    depTime: "09:50 AM",
    arrTime: "06:10 PM",
    duration: "17h 10m",
    stops: "1 Stop (DXB)",
    aircraft: "Airbus A380",
    price: 76800,
    priceDisplay: "₹76,800",
    valueScore: 95,
    amenities: ["Gourmet Meals", "Ice Entertainment", "2x 23kg Luggage"]
  }
];

let activeTrackedFlight = FLIGHTS_DATA[0];
let activeSortFilter = "best";
let activeTripType = "round";

document.addEventListener("DOMContentLoaded", () => {
  initDefaultDates();
  renderFlightsList();
  startTelemetrySimulation();
  initExperienceCarousel();
  updateClockDisplay();
  setInterval(updateClockDisplay, 1000);
});

function initDefaultDates() {
  const departInput = document.getElementById("departDate");
  if (departInput) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    departInput.value = nextWeek.toISOString().split("T")[0];
  }
}

function updateClockDisplay() {
  const clockEl = document.getElementById("currentTimeDisplay");
  if (clockEl) {
    const now = new Date();
    const utcHours = String(now.getUTCHours()).padStart(2, "0");
    const utcMin = String(now.getUTCMinutes()).padStart(2, "0");
    const utcSec = String(now.getUTCSeconds()).padStart(2, "0");
    clockEl.textContent = `UTC ${utcHours}:${utcMin}:${utcSec}`;
  }
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");
if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => mobileNav.classList.toggle("open"));
}
function closeMobileNav() {
  if (mobileNav) mobileNav.classList.remove("open");
}

function handleTripTypeChange(type) {
  activeTripType = type;
  const returnLabel = document.getElementById("returnLabel");
  if (returnLabel) {
    if (type === "oneway") returnLabel.textContent = "One Way Flight";
    else if (type === "multi") returnLabel.textContent = "Multi-City Trip";
    else returnLabel.textContent = "Return: Flexible";
  }
}

function swapAirports() {
  const originInput = document.getElementById("originInput");
  const destInput = document.getElementById("destInput");
  const originName = document.getElementById("originName");
  const destName = document.getElementById("destName");

  if (originInput && destInput) {
    const tempVal = originInput.value;
    originInput.value = destInput.value;
    destInput.value = tempVal;

    const tempName = originName.textContent;
    originName.textContent = destName.textContent;
    destName.textContent = tempName;

    triggerSearch();
  }
}

function triggerSearch() {
  const origin = document.getElementById("originInput")?.value.trim().toUpperCase() || "HYD";
  const dest = document.getElementById("destInput")?.value.trim().toUpperCase() || "JFK";
  const resultsStatus = document.getElementById("resultsStatus");

  if (resultsStatus) {
    resultsStatus.textContent = `Showing live available flights from ${origin} to ${dest} • Real-time transponder verified`;
  }

  const countLabel = document.getElementById("flightMatchesLabel");
  if (countLabel) countLabel.textContent = `${FLIGHTS_DATA.length} flights found`;

  renderFlightsList(origin, dest);
  scrollToSection("flights");
}

function sortFlights(criteria, btnElement) {
  activeSortFilter = criteria;
  if (btnElement) {
    document.querySelectorAll(".tab-pill").forEach(pill => pill.classList.remove("active"));
    btnElement.classList.add("active");
  }
  renderFlightsList();
}

function renderFlightsList(customOrigin, customDest) {
  const container = document.getElementById("flightList");
  if (!container) return;

  const origin = customOrigin || document.getElementById("originInput")?.value.trim().toUpperCase() || "HYD";
  const dest = customDest || document.getElementById("destInput")?.value.trim().toUpperCase() || "JFK";

  let sorted = [...FLIGHTS_DATA];
  if (activeSortFilter === "cheap") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (activeSortFilter === "fast") {
    sorted.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
  } else {
    sorted.sort((a, b) => b.valueScore - a.valueScore);
  }

  container.innerHTML = sorted.map(flight => `
    <div class="flight-tile">
      <div class="airline-profile">
        <div class="airline-badge">${flight.logo}</div>
        <div>
          <div class="airline-name">${flight.airline}</div>
          <span class="airline-num">${flight.code} • ${flight.aircraft}</span>
        </div>
      </div>

      <div class="flight-route-graph">
        <div class="origin-node">
          <span class="node-code">${origin}</span>
          <span class="node-time">${flight.depTime}</span>
        </div>

        <div class="graph-axis">
          <span class="graph-duration">${flight.duration} • ${flight.stops}</span>
          <div class="graph-vector"></div>
        </div>

        <div class="dest-node">
          <span class="node-code">${dest}</span>
          <span class="node-time">${flight.arrTime}</span>
        </div>
      </div>

      <div class="flight-amenities">
        ${flight.amenities.map(a => `<span class="amenity-tag">✓ ${a}</span>`).join("")}
      </div>

      <div class="flight-fare">
        <div class="fare-value">${flight.priceDisplay}</div>
        <span class="fare-term">${activeTripType === "round" ? "round trip total" : "one way total"}</span>
      </div>

      <button class="btn-primary" onclick="initiateBooking('${flight.id}')">
        Book Flight
      </button>
    </div>
  `).join("");
}

function startTelemetrySimulation() {
  const altEl = document.getElementById("altValue");
  const speedEl = document.getElementById("speedValue");
  const progressBar = document.getElementById("flightProgressBar");
  const progressPercent = document.getElementById("progressPercent");
  const trackedCount = document.getElementById("trackedCount");

  let progress = 68;

  setInterval(() => {
    const randomAlt = 35800 + Math.floor(Math.random() * 2200);
    const randomSpeed = 535 + Math.floor(Math.random() * 40);

    if (altEl) altEl.innerHTML = `${randomAlt.toLocaleString()} <small>ft</small>`;
    if (speedEl) speedEl.innerHTML = `${randomSpeed} <small>mph</small>`;

    progress = progress >= 99 ? 12 : progress + 0.15;
    if (progressBar) progressBar.style.width = `${progress.toFixed(1)}%`;
    if (progressPercent) progressPercent.textContent = `${Math.floor(progress)}% Complete`;

    if (trackedCount && Math.random() > 0.6) {
      const delta = Math.floor(Math.random() * 7) - 3;
      const current = parseInt(trackedCount.textContent.replace(/,/g, "")) || 18492;
      trackedCount.textContent = (current + delta).toLocaleString();
    }
  }, 2500);
}

function openFlightRadarPicker() {
  const currentIndex = FLIGHTS_DATA.findIndex(f => f.id === activeTrackedFlight.id);
  const nextFlight = FLIGHTS_DATA[(currentIndex + 1) % FLIGHTS_DATA.length];
  setActiveTrackedFlight(nextFlight);
}

function setActiveTrackedFlight(flight) {
  activeTrackedFlight = flight;
  document.getElementById("radarFlightNum").textContent = flight.code;
  document.getElementById("telemetryCallsign").textContent = flight.code;
  document.querySelector(".aircraft-model").textContent = flight.aircraft;
  document.getElementById("etaValue").textContent = flight.arrTime;
  alert(`Live radar transponder locked onto ${flight.airline} (${flight.code})`);
}

let currentExpStep = 0;
let expInterval;

function setExperienceStep(stepIndex) {
  currentExpStep = stepIndex;
  document.querySelectorAll(".exp-step").forEach((step, idx) => {
    step.classList.toggle("active", idx === stepIndex);
  });
  document.querySelectorAll(".mint-content-step").forEach((mint, idx) => {
    mint.classList.toggle("active", idx === stepIndex);
  });
}

function initExperienceCarousel() {
  expInterval = setInterval(() => {
    currentExpStep = (currentExpStep + 1) % 4;
    setExperienceStep(currentExpStep);
  }, 3500);

  document.querySelectorAll(".exp-step").forEach(step => {
    step.addEventListener("mouseenter", () => clearInterval(expInterval));
  });
}

function toggleFaq(btn) {
  const item = btn.closest(".faq-item");
  const isOpen = item.classList.contains("open");
  document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
  if (!isOpen) item.classList.add("open");
}

function toggleChat() {
  const chatWindow = document.getElementById("chatWindow");
  if (!chatWindow) return;
  const isOpen = chatWindow.classList.contains("open");
  if (isOpen) {
    chatWindow.classList.remove("open");
  } else {
    chatWindow.classList.add("open");
    setTimeout(() => document.getElementById("chatUserInput")?.focus(), 100);
  }
}

function handleChatEnter(event) {
  if (event.key === "Enter") sendChatMessage();
}

function askQuickPrompt(text) {
  const input = document.getElementById("chatUserInput");
  if (input) {
    input.value = text;
    sendChatMessage();
  }
}

function sendChatMessage() {
  const input = document.getElementById("chatUserInput");
  const messagesContainer = document.getElementById("chatMessages");
  const text = input ? input.value.trim() : "";
  if (!text) return;

  const userBubble = document.createElement("div");
  userBubble.className = "chat-bubble user";
  userBubble.textContent = text;
  messagesContainer.appendChild(userBubble);

  input.value = "";
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  setTimeout(() => {
    const botResponse = generateAIResponse(text.toLowerCase());
    const botBubble = document.createElement("div");
    botBubble.className = "chat-bubble bot";
    botBubble.innerHTML = botResponse;
    messagesContainer.appendChild(botBubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 500);
}

function generateAIResponse(query) {
  if (query.includes("cheap") || query.includes("fare") || query.includes("price") || query.includes("lowest")) {
    return "The lowest verified fare right now is <b>Nova Airlines NV 208</b> at <b>₹64,750</b> round-trip. It includes 30kg check-in baggage and 1 stop at DOH.";
  }
  if (query.includes("track") || query.includes("sa 127") || query.includes("where") || query.includes("status")) {
    return "<b>SkyAir SA 127</b> is currently in flight at <b>36,420 ft</b>, ground speed <b>548 mph</b>. Estimated touchdown at JFK is <b>08:40 PM</b> at Terminal 4, Gate B12.";
  }
  if (query.includes("baggage") || query.includes("luggage") || query.includes("weight")) {
    return "Standard transatlantic flights on SkyTrack include <b>2 checked bags (23kg each)</b> and <b>1 cabin bag (7kg)</b>. Free cancellation is valid for the first 24 hours.";
  }
  if (query.includes("book") || query.includes("reserve") || query.includes("ticket")) {
    return "You can select any flight from the Available Routes section above and click <b>Book Flight</b>. Your digital ticket and wallet boarding pass are issued instantly.";
  }
  if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
    return "Greetings from SkyTrack Flight Ops! ✈️ How can I assist with your journey or aircraft tracking today?";
  }
  return "I'm monitoring global ADS-B transponders and live airline reservation systems. Try asking about cheapest flights, flight tracking, or baggage allowances!";
}

let pendingBookingFlight = null;

function initiateBooking(flightId) {
  const flight = FLIGHTS_DATA.find(f => f.id === flightId) || FLIGHTS_DATA[0];
  pendingBookingFlight = flight;

  const origin = document.getElementById("originInput")?.value.trim().toUpperCase() || "HYD";
  const dest = document.getElementById("destInput")?.value.trim().toUpperCase() || "JFK";

  document.getElementById("modalFlightTitle").textContent = `${flight.airline} (${flight.code})`;
  document.getElementById("modalRouteSummary").textContent = `${origin} → ${dest} (${flight.duration})`;
  document.getElementById("modalPriceSummary").textContent = flight.priceDisplay;

  const modal = document.getElementById("bookingModal");
  if (modal) modal.classList.add("open");
}

function closeBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) modal.classList.remove("open");
}

function completeBooking() {
  const passengerName = document.getElementById("passengerInput")?.value.trim() || "Alex Harrison";
  const flight = pendingBookingFlight || FLIGHTS_DATA[0];
  const bookingId = `SKY-${Math.floor(10000 + Math.random() * 90000)}A`;

  document.getElementById("bookingRefDisplay").textContent = bookingId;
  document.getElementById("passengerDisplayName").textContent = passengerName;

  closeBookingModal();
  alert(`🎉 Booking Confirmed!\n\nReference: ${bookingId}\nPassenger: ${passengerName}\nFlight: ${flight.airline} ${flight.code}\n\nYour digital boarding pass has been loaded under "My Journey".`);
  scrollToSection("bookings");
}

function printBoardingPass() {
  window.print();
}

function subscribeNewsletter() {
  const emailInput = document.getElementById("ctaEmailInput");
  const email = emailInput ? emailInput.value.trim() : "";
  if (!email || !email.includes("@")) {
    alert("Please enter a valid email address for fare alerts.");
    emailInput?.focus();
    return;
  }
  alert(`✓ Subscribed! You will receive instant fare drops and flight telemetry updates at ${email}.`);
  if (emailInput) emailInput.value = "";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeBookingModal();
    const chat = document.getElementById("chatWindow");
    if (chat) chat.classList.remove("open");
  }
});