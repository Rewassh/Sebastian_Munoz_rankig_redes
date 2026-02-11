// =====================
// 1) Elementos a rankear
// =====================

const redes = [
  "Instagram",
  "TikTok",
  "WhatsApp",
  "Facebook",
  "X (Twitter)",
  "YouTube",
  "Snapchat",
  "LinkedIn"
];

// =====================
// 2) Segmentos (EDADES)
// =====================

const segmentos = {
  E1: "15 a 18 años",
  E2: "18 a 30 años",
  E3: "30 años o más"
};

// =====================
// 3) Contextos
// =====================

const contextos = {
  ENT: "¿Qué red social prefieren para ENTRETENIMIENTO?",
  COM: "¿Qué red social prefieren para COMUNICARSE?",
  INF: "¿Qué red social prefieren para INFORMARSE?"
};

// =====================
// 4) Parámetros Elo
// =====================

const RATING_INICIAL = 1000;
const K = 32;

// =====================
// 5) Estado
// =====================

const STORAGE_KEY = "socialmash_state";

function defaultState() {
  const buckets = {};
  for (const edad in segmentos) {
    for (const ctx in contextos) {
      const key = `${edad}__${ctx}`;
      buckets[key] = {};
      redes.forEach(r => buckets[key][r] = RATING_INICIAL);
    }
  }
  return { buckets };
}

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// =====================
// 6) Algoritmo Elo
// =====================

function expected(ra, rb) {
  return 1 / (1 + Math.pow(10, (rb - ra) / 400));
}

function updateElo(bucket, a, b, winner) {
  const ra = bucket[a];
  const rb = bucket[b];

  const ea = expected(ra, rb);
  const eb = expected(rb, ra);

  const sa = winner === "A" ? 1 : 0;
  const sb = winner === "B" ? 1 : 0;

  bucket[a] = ra + K * (sa - ea);
  bucket[b] = rb + K * (sb - eb);
}

// =====================
// 7) UI
// =====================

const segmentSelect = document.getElementById("segmentSelect");
const contextSelect = document.getElementById("contextSelect");
const labelA = document.getElementById("labelA");
const labelB = document.getElementById("labelB");
const question = document.getElementById("question");
const topBox = document.getElementById("topBox");

let currentA, currentB;

function fill(select, obj) {
  for (const k in obj) {
    const o = document.createElement("option");
    o.value = k;
    o.textContent = obj[k];
    select.appendChild(o);
  }
}

fill(segmentSelect, segmentos);
fill(contextSelect, contextos);

function randomPair() {
  const a = redes[Math.floor(Math.random() * redes.length)];
  let b = a;
  while (b === a) b = redes[Math.floor(Math.random() * redes.length)];
  return [a, b];
}

function newDuel() {
  [currentA, currentB] = randomPair();
  labelA.textContent = currentA;
  labelB.textContent = currentB;
  question.textContent = contextos[contextSelect.value];
}

function renderTop() {
  const key = `${segmentSelect.value}__${contextSelect.value}`;
  const bucket = state.buckets[key];

  const sorted = Object.entries(bucket)
    .sort((a, b) => b[1] - a[1]);

  topBox.innerHTML = sorted.map(
    ([r, score], i) =>
      `<div class="toprow">
        <div>${i + 1}. ${r}</div>
        <div>${score.toFixed(1)}</div>
      </div>`
  ).join("");
}

function vote(winner) {
  const key = `${segmentSelect.value}__${contextSelect.value}`;
  updateElo(state.buckets[key], currentA, currentB, winner);
  save();
  renderTop();
  newDuel();
}

document.getElementById("btnA").onclick = () => vote("A");
document.getElementById("btnB").onclick = () => vote("B");
document.getElementById("btnNewPair").onclick = newDuel;
document.getElementById("btnShowTop").onclick = renderTop;
document.getElementById("btnReset").onclick = () => {
  state = defaultState();
  save();
  renderTop();
};

newDuel();
renderTop();
