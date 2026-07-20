// Clueless Closet — outfit engine + weather + calendar log + swap + feedback
// All in-browser. Log lives on the phone (localStorage). No server, no accounts.
// Log model: { "YYYY-MM-DD": [ {items:[ids], note, source}, ... ] }   (array = one entry per "look")

const FAYETTEVILLE = { lat: 36.0626, lon: -94.1574, tz: "America/Chicago", name: "Fayetteville, AR", ac: true };
const CAMDEN = { lat: 44.2098, lon: -69.0648, tz: "America/New_York", name: "Camden, ME", ac: false };
const LOG_KEY = "clueless_closet_log_v1";
const DISLIKE_KEY = "clueless_closet_dislikes_v1";
// Temporary: through this date, workout clothes + sneakers are fine any day of the week.
const SNEAKER_FREE_UNTIL = "2026-07-26";
// Still in Maine through this date — pull weather from Camden until then, Fayetteville after.
const MAINE_UNTIL = "2026-07-25";
function currentLocation() { return todayStr() <= MAINE_UNTIL ? CAMDEN : FAYETTEVILLE; }

// ---------- storage ----------
function loadLog() { try { return JSON.parse(localStorage.getItem(LOG_KEY)) || {}; } catch { return {}; } }
function saveLog(log) { localStorage.setItem(LOG_KEY, JSON.stringify(log)); }
function loadDislikes() { try { return JSON.parse(localStorage.getItem(DISLIKE_KEY)) || []; } catch { return []; } }
function saveDislikes(d) { localStorage.setItem(DISLIKE_KEY, JSON.stringify(d)); }
function dayLooks(log, ds) { const v = log[ds]; return Array.isArray(v) ? v : []; }

function coreKey(pieces) {
  return pieces.filter(p => ["top", "bottom", "dress", "layer"].includes(p.cat))
    .map(p => p.id).sort().join("|");
}
function allLooks(log) {
  const out = [];
  Object.entries(log).forEach(([date, looks]) => looks.forEach(l => out.push({ date, items: l.items })));
  return out;
}
function daysSinceWorn(itemId, log) {
  const dates = allLooks(log).filter(l => l.items.includes(itemId)).map(l => l.date).sort();
  if (!dates.length) return 999;
  const last = new Date(dates[dates.length - 1] + "T00:00:00");
  return Math.max(0, Math.round((new Date() - last) / 86400000));
}
function comboUses(pieces, log) {
  const key = coreKey(pieces);
  return allLooks(log).filter(l => coreKey(l.items.map(byId).filter(Boolean)) === key).length;
}

// ---------- weather ----------
async function getWeather() {
  const loc = currentLocation();
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}` +
    `&current=temperature_2m,precipitation,weather_code,relative_humidity_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code` +
    `&temperature_unit=fahrenheit&timezone=${loc.tz}&forecast_days=1`;
  const j = await (await fetch(u)).json();
  return {
    loc,
    now: Math.round(j.current.temperature_2m),
    hi: Math.round(j.daily.temperature_2m_max[0]),
    lo: Math.round(j.daily.temperature_2m_min[0]),
    rainChance: j.daily.precipitation_probability_max[0],
    rainingNow: j.current.precipitation > 0,
    desc: weatherDesc(j.current.weather_code),
    humidity: j.current.relative_humidity_2m,
  };
}
function weatherDesc(c) {
  if (c === 0) return "Clear";
  if ([1, 2, 3].includes(c)) return "Partly cloudy";
  if ([45, 48].includes(c)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(c)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(c)) return "Rain";
  if ([95, 96, 99].includes(c)) return "Thunderstorms";
  return "Mixed";
}

// ---------- helpers ----------
const items = (cat) => WARDROBE.filter(i => i.cat === cat);
const workoutTops = () => WARDROBE.filter(i => i.cat === "workout" && i.sub === "top");
const workoutBottoms = () => WARDROBE.filter(i => i.cat === "workout" && i.sub === "bottom");
const byId = (id) => WARDROBE.find(i => i.id === id);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function isWeekend(dateStr) {
  const g = new Date((dateStr || todayStr()) + "T00:00:00").getDay();
  return g === 0 || g === 6;
}
function allowedShoes(weather, o, dateStr) {
  const ds = dateStr || todayStr();
  const sneakerOK = isWeekend(ds) || ds <= SNEAKER_FREE_UNTIL;   // Sat/Sun, or the temporary free window
  const raining = weather.rainingNow || weather.rainChance >= 50;
  return items("shoe").filter(s => {
    if (s.sneaker && !sneakerOK && !(o.workout && s.athletic)) return false;
    if (raining && !s.rain) return false;
    return true;
  });
}
function wantsLayer(weather, o) {
  if (o.forceLayer === true) return true;
  if (o.forceLayer === false) return false;
  return weather.hi >= 92 ? Math.random() < 0.7 : Math.random() < 0.9;
}
function tonesOf(list) {
  const t = new Set();
  list.forEach(i => { if (i && i.tone && i.tone !== "neutral") t.add(i.tone); });
  return t;
}
function paletteScore(list) {
  const t = tonesOf(list);
  let s = 0;
  ["dark", "light", "bright"].forEach(x => { if (t.has(x)) s++; });
  if (t.size === 3) s += 2;
  if (t.size <= 1) s -= 1;
  return s;
}

// ---------- engine ----------
function buildCandidate(weather, o, log, dislikes) {
  const raining = weather.rainingNow || weather.rainChance >= 50;
  let pieces = [];

  if (o.workout) {
    pieces.push(pick(workoutTops()));
    pieces.push(pick(workoutBottoms()));
    if (Math.random() < 0.4) pieces.push(pick(items("layer").filter(l => l.sub === "sweatshirt")));
  } else {
    const useDress = o.mode === "dress" ||
      (o.mode !== "separates" && Math.random() < 0.28 && items("dress").length);
    if (useDress) {
      pieces.push(pick(items("dress")));
    } else {
      pieces.push(pick(items("top")));
      pieces.push(pick(items("bottom").filter(b => !raining || b.rain)));
    }
    if (wantsLayer(weather, o)) {
      const L = items("layer").filter(l => !raining || l.rain);
      if (L.length) pieces.push(pick(L));
    }
  }

  let shoes = allowedShoes(weather, o, o.dateStr);
  if (o.workout) { const ath = shoes.filter(s => s.athletic || s.sneaker || s.id === "shoe-cow"); if (ath.length) shoes = ath; }
  if (shoes.length) pieces.push(pick(shoes));
  if (raining) pieces.push(byId("outer-rain"));
  if (!o.workout && Math.random() < 0.18) pieces.push(pick(items("hat")));  // hat is an occasional accent, not daily

  pieces = pieces.filter(Boolean);
  const freshness = pieces.reduce((a, p) => a + Math.min(daysSinceWorn(p.id, log), 30), 0) / pieces.length;
  const repeat = comboUses(pieces, log) * 8;
  const disliked = dislikes.includes(coreKey(pieces)) ? 1000 : 0;
  const score = paletteScore(pieces) * 3 + freshness * 0.4 - repeat - disliked;
  return { pieces, score };
}
function generateOutfit(weather, o) {
  const log = loadLog(), dislikes = loadDislikes();
  let cands = [];
  for (let i = 0; i < 250; i++) cands.push(buildCandidate(weather, o, log, dislikes));
  cands.sort((a, b) => b.score - a.score);
  const top = cands.slice(0, 8);
  return top[Math.floor(Math.random() * top.length)];
}
function swapPiece(outfit, cat, weather, o) {
  const log = loadLog();
  let pool;
  if (cat === "shoe") pool = allowedShoes(weather, o, o.dateStr);
  else if (cat === "bottom") pool = items("bottom").filter(b => !(weather.rainingNow || weather.rainChance >= 50) || b.rain);
  else if (cat === "workout") pool = outfit.pieces.find(p => p.cat === "workout" && p.sub === "top") ? workoutTops() : workoutBottoms();
  else pool = items(cat);
  const cur = outfit.pieces.find(p => p.cat === cat);
  pool = pool.filter(p => p.id !== (cur || {}).id && (cat !== "workout" || p.sub === cur.sub));
  if (!pool.length) return outfit;
  pool.sort((a, b) => daysSinceWorn(b.id, log) - daysSinceWorn(a.id, log));
  const choice = pool[Math.floor(Math.random() * Math.min(4, pool.length))];
  outfit.pieces = outfit.pieces.map(p => p === cur ? choice : p);
  return outfit;
}

// ---------- UI state ----------
let currentOutfit = null, currentWeather = null, mode = "any";
let calYear, calMonth, selectedDate = null;

const CAT_ORDER = { top: 0, dress: 0, workout: 0, bottom: 1, layer: 2, shoe: 3, outer: 4, hat: 5 };
const CAT_LABEL = { top: "Top", dress: "Dress", workout: "Workout", bottom: "Bottom", layer: "Layer", shoe: "Shoes", outer: "Jacket", hat: "Hat" };

function opts() { return { mode, workout: document.getElementById("workout").checked, dateStr: todayStr() }; }
function tonesLabel(pieces) {
  const have = ["dark", "light", "bright"].filter(x => tonesOf(pieces).has(x));
  return have.length ? have.join(" · ") : "neutral";
}
function pieceRow(p, withSwap) {
  const swap = withSwap ? `<button class="swap" data-cat="${p.cat}" title="Swap">↺</button>` : "";
  return `<div class="piece"><span class="pcat">${CAT_LABEL[p.cat] || p.cat}</span><span class="pname">${p.name}</span>${swap}</div>`;
}
function renderOutfit(o) {
  const el = document.getElementById("outfit");
  const sorted = [...o.pieces].sort((a, b) => (CAT_ORDER[a.cat] ?? 9) - (CAT_ORDER[b.cat] ?? 9));
  el.innerHTML = sorted.map(p => pieceRow(p, true)).join("");
  el.querySelectorAll(".swap").forEach(b =>
    b.addEventListener("click", () => { swapPiece(currentOutfit, b.dataset.cat, currentWeather, opts()); renderOutfit(currentOutfit); }));
}
function renderWeather(w) {
  const where = w.loc ? w.loc.name : "";
  const tail = w.loc && w.loc.ac ? " · pack a layer for the AC" : "";
  document.getElementById("weather").innerHTML =
    `<strong>${w.hi}°</strong> / ${w.lo}° · ${w.desc}` +
    (w.rainChance >= 30 ? ` · ${w.rainChance}% rain` : "") +
    `<div class="wsub">${where} · now ${w.now}° · humidity ${w.humidity}%${tail}</div>`;
}
async function newOutfit() {
  if (!currentWeather) currentWeather = await getWeather();
  currentOutfit = generateOutfit(currentWeather, opts());
  renderOutfit(currentOutfit);
  document.getElementById("worn-msg").textContent = "";
}
function wearIt() {
  if (!currentOutfit) return;
  const log = loadLog();
  log[todayStr()] = [{ items: currentOutfit.pieces.map(p => p.id), note: "", source: "auto" }];
  saveLog(log);
  document.getElementById("worn-msg").textContent = "✓ Logged for today.";
  buildCalendar();
}
function giveFeedback() {
  if (!currentOutfit) return;
  const note = prompt("What didn't work? (It'll stop suggesting this exact combo.)");
  if (note === null) return;
  const d = loadDislikes();
  d.push(coreKey(currentOutfit.pieces));
  saveDislikes(d);
  document.getElementById("worn-msg").textContent = "Got it — won't suggest that combo again.";
  newOutfit();
}

// ---------- calendar ----------
function buildCalendar() {
  const log = loadLog();
  const first = new Date(calYear, calMonth, 1);
  const startDow = first.getDay();
  const days = new Date(calYear, calMonth + 1, 0).getDate();
  document.getElementById("cal-title").textContent = first.toLocaleString("en-US", { month: "long", year: "numeric" });

  let html = `<div class="cal-grid">`;
  ["S", "M", "T", "W", "T", "F", "S"].forEach(d => html += `<div class="cal-dow">${d}</div>`);
  for (let i = 0; i < startDow; i++) html += `<div class="cal-cell empty"></div>`;
  for (let day = 1; day <= days; day++) {
    const ds = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const looks = dayLooks(log, ds);
    const isToday = ds === todayStr();
    const sel = ds === selectedDate ? "sel" : "";
    const badge = looks.length > 1 ? `<i class="two">2</i>` : (looks.length ? `<i class="dot"></i>` : "");
    html += `<div class="cal-cell ${looks.length ? "logged" : ""} ${isToday ? "today" : ""} ${sel}" data-date="${ds}"><span>${day}</span>${badge}</div>`;
  }
  html += `</div>`;
  document.getElementById("calendar").innerHTML = html;
  document.querySelectorAll(".cal-cell[data-date]").forEach(c => c.addEventListener("click", () => openEditor(c.dataset.date)));
}
function selectHtml(cat, chosen, includeBlank) {
  const list = cat === "top"
    ? WARDROBE.filter(i => i.cat === "top" || i.cat === "workout")   // allow workout tanks as a "top" in the editor
    : items(cat);
  const opts = (includeBlank ? [`<option value="">— none —</option>`] : [])
    .concat(list.map(i => `<option value="${i.id}" ${i.id === chosen ? "selected" : ""}>${i.name}</option>`));
  return `<select data-cat="${cat}">${opts.join("")}</select>`;
}
function readEditor() {
  const ids = [];
  document.querySelectorAll("#editor select").forEach(s => { if (s.value) ids.push(s.value); });
  const noteEl = document.getElementById("ed-note");
  const usesDress = document.getElementById("ed-dress").checked;
  return { items: ids, note: noteEl ? noteEl.value : "", usesDress };
}
function renderEditor(ds, look, usesDress, extraLooks) {
  const el = document.getElementById("editor");
  const val = (cat) => (look.items.find(id => (byId(id) || {}).cat === cat) || "");
  const valTop = look.items.find(id => ["top", "workout"].includes((byId(id) || {}).cat)) || "";
  const dateLbl = new Date(ds + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  let extra = "";
  if (extraLooks && extraLooks.length) {
    extra = `<div class="ed-extra"><strong>Also worn (look 2):</strong> ` +
      extraLooks[0].items.map(id => (byId(id) || {}).name).filter(Boolean).join(", ") + `</div>`;
  }
  el.innerHTML = `
    <h3>${dateLbl}</h3>
    <div class="ed-row"><label>${usesDress ? "Dress" : "Top"}</label>${usesDress ? selectHtml("dress", val("dress"), false) : selectHtml("top", valTop, false)}</div>
    ${usesDress ? "" : `<div class="ed-row"><label>Bottom</label>${selectHtml("bottom", val("bottom"), false)}</div>`}
    <div class="ed-row"><label>Layer</label>${selectHtml("layer", val("layer"), true)}</div>
    <div class="ed-row"><label>Shoes</label>${selectHtml("shoe", val("shoe"), true)}</div>
    <div class="ed-row"><label>Hat</label>${selectHtml("hat", val("hat"), true)}</div>
    <div class="ed-row"><label>Jacket</label>${selectHtml("outer", val("outer"), true)}</div>
    <div class="ed-toggle"><label><input type="checkbox" id="ed-dress" ${usesDress ? "checked" : ""}> Dress day</label></div>
    <div class="ed-row"><label>Note</label><input type="text" id="ed-note" placeholder="what did / didn't work" value="${(look.note || "").replace(/"/g, "&quot;")}"></div>
    ${extra}
    <div class="ed-actions">
      <button id="ed-save" class="btn primary">Save</button>
      ${log_has(ds) ? '<button id="ed-delete" class="btn secondary">Delete day</button>' : ""}
    </div>`;
  el.classList.add("open");
  document.getElementById("ed-dress").addEventListener("change", () => {
    const cur = readEditor();
    renderEditor(ds, { items: cur.items, note: cur.note }, cur.usesDress, extraLooks);
  });
  document.getElementById("ed-save").addEventListener("click", () => saveEditor(ds, extraLooks));
  const del = document.getElementById("ed-delete");
  if (del) del.addEventListener("click", () => {
    const l = loadLog(); delete l[ds]; saveLog(l);
    el.classList.remove("open"); selectedDate = null; buildCalendar();
  });
}
function log_has(ds) { return dayLooks(loadLog(), ds).length > 0; }
function openEditor(ds) {
  selectedDate = ds;
  buildCalendar();
  const looks = dayLooks(loadLog(), ds);
  const first = looks[0] || { items: [], note: "" };
  const usesDress = first.items.some(id => (byId(id) || {}).cat === "dress");
  renderEditor(ds, first, usesDress, looks.slice(1));
}
function saveEditor(ds, extraLooks) {
  const c = readEditor();
  if (!c.items.length) { alert("Pick at least one item."); return; }
  const log = loadLog();
  const entries = [{ items: c.items, note: c.note, source: "manual" }];
  (extraLooks || []).forEach(l => entries.push(l));   // preserve a second look if the day had one
  log[ds] = entries;
  saveLog(log);
  document.getElementById("editor").classList.remove("open");
  selectedDate = null;
  buildCalendar();
}

// ---------- tabs ----------
function showTab(name) {
  ["today", "calendar"].forEach(t => {
    document.getElementById("tab-" + t).classList.toggle("active", t === name);
    document.getElementById("view-" + t).classList.toggle("hidden", t !== name);
  });
  if (name === "calendar") buildCalendar();
}

// ---------- init ----------
document.addEventListener("DOMContentLoaded", async () => {
  const now = new Date(); calYear = now.getFullYear(); calMonth = now.getMonth();

  document.getElementById("reroll").addEventListener("click", newOutfit);
  document.getElementById("wear").addEventListener("click", wearIt);
  document.getElementById("feedback").addEventListener("click", giveFeedback);
  document.getElementById("workout").addEventListener("change", newOutfit);
  document.getElementById("mode-any").addEventListener("click", () => setMode("any"));
  document.getElementById("mode-sep").addEventListener("click", () => setMode("separates"));
  document.getElementById("mode-dress").addEventListener("click", () => setMode("dress"));
  document.getElementById("tab-today").addEventListener("click", () => showTab("today"));
  document.getElementById("tab-calendar").addEventListener("click", () => showTab("calendar"));
  document.getElementById("cal-prev").addEventListener("click", () => { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } buildCalendar(); });
  document.getElementById("cal-next").addEventListener("click", () => { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } buildCalendar(); });

  try {
    currentWeather = await getWeather();
    renderWeather(currentWeather);
  } catch {
    document.getElementById("weather").innerHTML = "<em>Weather offline — dressing for a warm day.</em>";
    currentWeather = { hi: 88, lo: 70, now: 82, rainChance: 10, rainingNow: false, desc: "—", humidity: 50 };
  }
  await newOutfit();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
});

function setMode(m) {
  mode = m;
  ["any", "sep", "dress"].forEach(x => document.getElementById("mode-" + x).classList.remove("active"));
  document.getElementById("mode-" + (m === "separates" ? "sep" : m)).classList.add("active");
  newOutfit();
}
