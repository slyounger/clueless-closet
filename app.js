// Clueless Closet — outfit engine + weather + calendar log + swap + feedback
// All in-browser. Log lives on the phone (localStorage). No server, no accounts.
// Log model: { "YYYY-MM-DD": [ {items:[ids], note, source}, ... ] }   (array = one entry per "look")

const FAYETTEVILLE = { lat: 36.0626, lon: -94.1574, tz: "America/Chicago", name: "Fayetteville, AR", ac: true };
const CAMDEN = { lat: 44.2098, lon: -69.0648, tz: "America/New_York", name: "Camden, ME", ac: false };
const LOG_KEY = "clueless_closet_log_v1";
const DISLIKE_KEY = "clueless_closet_dislikes_v1";
const SYNC_CODE_KEY = "clueless_closet_sync_code_v1";
// Firebase Realtime Database REST base (e.g. https://xxxx-default-rtdb.firebaseio.com). Empty = sync off.
const SYNC_DB_URL = "";
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
// offer: false pieces are owned but never offered as part of a look — they are chosen
// for function, not as an all-day outfit (rain jacket, swimsuits).
const items = (cat) => WARDROBE.filter(i => i.cat === cat && i.offer !== false);
// Which wardrobe is in rotation. The generator only suggests from this; the calendar editor
// still lists everything, so a teaching day can be logged before that capsule is switched on.
const CAPSULE_KEY = "clueless_closet_capsule_v1";
function activeCapsule() { return localStorage.getItem(CAPSULE_KEY) || "maine"; }
function setActiveCapsule(c) { localStorage.setItem(CAPSULE_KEY, c); }
const capsulePool = (cat) => items(cat).filter(i => (i.capsules || []).includes(activeCapsule()));
// Layers = true layers PLUS tops flagged canLayer (e.g. rugby worn open over a tank).
// A canLayer top is returned as a layer-role copy so it labels/sorts as a Layer; its id is unchanged for logging.
const layerPool = () => capsulePool("layer").concat(
  capsulePool("top").filter(i => i.canLayer).map(i => ({ ...i, cat: "layer" })));
// Shannon doesn't wear navy and black together, anywhere — flag any outfit that has both (incl. shoes/hats).
function hasNavyBlackClash(pieces) {
  return pieces.some(p => p.navy) && pieces.some(p => p.black);
}
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
  return capsulePool("shoe").filter(s => {
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
  let hasBlue = false;
  // A tone may be a single value or a pair — the green-and-white poplin reads light AND bright.
  list.forEach(i => {
    if (!i || !i.tone) return;
    (Array.isArray(i.tone) ? i.tone : [i.tone]).forEach(x => {
      if (x === "blue") { hasBlue = true; return; }   // resolved below, once the rest is known
      if (x !== "neutral") t.add(x);
    });
  });
  // Blue takes its reading from the company it keeps: alongside something else dark it plays
  // the bright; with nothing else dark it is the dark.
  if (hasBlue) t.add(t.has("dark") ? "bright" : "dark");
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
    if (Math.random() < 0.4) pieces.push(pick(capsulePool("layer").filter(l => l.sub === "sweatshirt")));
  } else {
    const useDress = o.mode === "dress" ||
      (o.mode !== "separates" && Math.random() < 0.28 && capsulePool("dress").length);
    if (useDress) {
      pieces.push(pick(capsulePool("dress")));
    } else {
      pieces.push(pick(capsulePool("top")));
      pieces.push(pick(capsulePool("bottom").filter(b => !raining || b.rain)));
    }
    if (wantsLayer(weather, o)) {
      const topId = (pieces.find(p => p.cat === "top") || {}).id;
      const L = layerPool().filter(l => (!raining || l.rain) && l.id !== topId);
      if (L.length) pieces.push(pick(L));
    }
  }

  let shoes = allowedShoes(weather, o, o.dateStr);
  if (o.workout) { const ath = shoes.filter(s => s.athletic || s.sneaker || s.id === "shoe-cow"); if (ath.length) shoes = ath; }
  if (shoes.length) pieces.push(pick(shoes));
  if (!o.workout && Math.random() < 0.18) pieces.push(pick(capsulePool("hat")));  // hat is an occasional accent, not daily

  pieces = pieces.filter(Boolean);
  const freshness = pieces.reduce((a, p) => a + Math.min(daysSinceWorn(p.id, log), 30), 0) / pieces.length;
  const repeat = comboUses(pieces, log) * 8;
  const disliked = dislikes.includes(coreKey(pieces)) ? 1000 : 0;
  const clash = hasNavyBlackClash(pieces) ? 1000 : 0;
  const score = paletteScore(pieces) * 3 + freshness * 0.4 - repeat - disliked - clash;
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
  else if (cat === "bottom") pool = capsulePool("bottom").filter(b => !(weather.rainingNow || weather.rainChance >= 50) || b.rain);
  else if (cat === "layer") pool = layerPool();
  else if (cat === "workout") pool = outfit.pieces.find(p => p.cat === "workout" && p.sub === "top") ? workoutTops() : workoutBottoms();
  else pool = capsulePool(cat);
  const cur = outfit.pieces.find(p => p.cat === cat);
  pool = pool.filter(p => p.id !== (cur || {}).id && (cat !== "workout" || p.sub === cur.sub));
  pool = pool.filter(p => !outfit.pieces.some(x => x !== cur && x.id === p.id));   // no dup (e.g. rugby as both top + layer)
  // A swap must not sneak navy and black back together — the generator vetoes it, so this does too.
  const rest = outfit.pieces.filter(x => x !== cur);
  pool = pool.filter(p => !hasNavyBlackClash(rest.concat(p)));
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
  saveLog(log); pushSync();
  document.getElementById("worn-msg").textContent = "✓ Logged for today.";
  buildCalendar();
}
function giveFeedback() {
  if (!currentOutfit) return;
  const note = prompt("What didn't work? (It'll stop suggesting this exact combo.)");
  if (note === null) return;
  const d = loadDislikes();
  d.push(coreKey(currentOutfit.pieces));
  saveDislikes(d); pushSync();
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
function selectHtml(cat, chosen, includeBlank, look) {
  const L = look || "main";
  // Gym rows draw only from workout pieces and athletic shoes; the main look never offers them.
  const list = L === "gym"
    ? (cat === "top" ? workoutTops()
     : cat === "bottom" ? workoutBottoms()
     : cat === "shoe" ? items("shoe").filter(s => s.athletic || s.sneaker) : [])
    : items(cat);
  const opts = (includeBlank ? [`<option value="">— none —</option>`] : [])
    .concat(list.map(i => `<option value="${i.id}" ${i.id === chosen ? "selected" : ""}>${i.name}</option>`));
  return `<select data-cat="${cat}" data-look="${L}">${opts.join("")}</select>`;
}
function readEditor() {
  const grab = (look) => {
    const ids = [];
    document.querySelectorAll(`#editor select[data-look="${look}"]`).forEach(s => { if (s.value) ids.push(s.value); });
    return ids;
  };
  const on = (id) => { const el = document.getElementById(id); return !!(el && el.checked); };
  const noteEl = document.getElementById("ed-note");
  return {
    items: grab("main"),
    changed: on("ed-changed") ? grab("changed") : [],
    gym: on("ed-gym") ? grab("gym") : [],
    note: noteEl ? noteEl.value : "",
    usesDress: on("ed-dress"),
  };
}
function renderEditor(ds, look, usesDress, changed, gym) {
  const el = document.getElementById("editor");
  const pick = (src, cat) => ((src && src.items) || []).find(id => (byId(id) || {}).cat === cat) || "";
  const gymPick = (cat) => ((gym && gym.items) || []).find(id => {
    const i = byId(id) || {};
    return cat === "shoe" ? i.cat === "shoe" : (i.cat === "workout" && i.sub === cat);
  }) || "";
  const val = (cat) => pick(look, cat);
  const dateLbl = new Date(ds + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const hasChanged = !!(changed && changed.items && changed.items.length);
  const hasGym = !!(gym && gym.items && gym.items.length);

  const rows = (lk, dress) => `
    <div class="ed-row"><label>${dress ? "Dress" : "Top"}</label>${dress ? selectHtml("dress", pick(lk, "dress"), false) : selectHtml("top", pick(lk, "top"), false)}</div>
    ${dress ? "" : `<div class="ed-row"><label>Bottom</label>${selectHtml("bottom", pick(lk, "bottom"), false)}</div>`}
    <div class="ed-row"><label>Layer</label>${selectHtml("layer", pick(lk, "layer"), true)}</div>
    <div class="ed-row"><label>Shoes</label>${selectHtml("shoe", pick(lk, "shoe"), true)}</div>
    <div class="ed-row"><label>Hat</label>${selectHtml("hat", pick(lk, "hat"), true)}</div>`;

  el.innerHTML = `
    <h3>${dateLbl}</h3>
    ${rows(look, usesDress)}
    <div class="ed-toggle"><label><input type="checkbox" id="ed-dress" ${usesDress ? "checked" : ""}> Dress day</label></div>
    <div class="ed-row"><label>Note</label><input type="text" id="ed-note" placeholder="what did / didn't work" value="${(look.note || "").replace(/"/g, "&quot;")}"></div>

    <div class="ed-toggle"><label><input type="checkbox" id="ed-changed" ${hasChanged ? "checked" : ""}> Changed into something else</label></div>
    <div id="ed-changed-rows" class="${hasChanged ? "" : "hidden"}">
      <div class="ed-row"><label>Top</label>${selectHtml("top", pick(changed, "top"), true, "changed")}</div>
      <div class="ed-row"><label>Bottom</label>${selectHtml("bottom", pick(changed, "bottom"), true, "changed")}</div>
      <div class="ed-row"><label>Layer</label>${selectHtml("layer", pick(changed, "layer"), true, "changed")}</div>
      <div class="ed-row"><label>Shoes</label>${selectHtml("shoe", pick(changed, "shoe"), true, "changed")}</div>
    </div>

    <div class="ed-toggle"><label><input type="checkbox" id="ed-gym" ${hasGym ? "checked" : ""}> Went to the gym</label></div>
    <div id="ed-gym-rows" class="${hasGym ? "" : "hidden"}">
      <div class="ed-row"><label>Top</label>${selectHtml("top", gymPick("top"), true, "gym")}</div>
      <div class="ed-row"><label>Bottom</label>${selectHtml("bottom", gymPick("bottom"), true, "gym")}</div>
      <div class="ed-row"><label>Shoes</label>${selectHtml("shoe", gymPick("shoe"), true, "gym")}</div>
    </div>

    <div class="ed-actions">
      <button id="ed-save" class="btn primary">Save</button>
      ${log_has(ds) ? '<button id="ed-delete" class="btn secondary">Delete day</button>' : ""}
    </div>`;
  el.classList.add("open");

  const toggle = (box, rowsId) => document.getElementById(box).addEventListener("change", e => {
    document.getElementById(rowsId).classList.toggle("hidden", !e.target.checked);
  });
  toggle("ed-changed", "ed-changed-rows");
  toggle("ed-gym", "ed-gym-rows");

  document.getElementById("ed-dress").addEventListener("change", () => {
    const c = readEditor();
    renderEditor(ds, { items: c.items, note: c.note }, c.usesDress, { items: c.changed }, { items: c.gym });
  });
  document.getElementById("ed-save").addEventListener("click", saveEditor.bind(null, ds));
  const del = document.getElementById("ed-delete");
  if (del) del.addEventListener("click", () => {
    const l = loadLog(); delete l[ds]; saveLog(l); pushSync();
    el.classList.remove("open"); selectedDate = null; buildCalendar();
  });
}
function log_has(ds) { return dayLooks(loadLog(), ds).length > 0; }
function openEditor(ds) {
  selectedDate = ds;
  buildCalendar();
  const looks = dayLooks(loadLog(), ds);
  const isGym = (l) => l.kind === "gym" || l.items.every(id => (byId(id) || {}).cat === "workout");
  const main = looks.find(l => !isGym(l) && l.kind !== "changed") || looks[0] || { items: [], note: "" };
  const changed = looks.find(l => l.kind === "changed" && l !== main)
               || looks.filter(l => l !== main && !isGym(l))[0] || { items: [] };
  const gym = looks.find(isGym) || { items: [] };
  const usesDress = main.items.some(id => (byId(id) || {}).cat === "dress");
  renderEditor(ds, main, usesDress, changed, gym);
}
function saveEditor(ds) {
  const c = readEditor();
  if (!c.items.length) { alert("Pick at least one item."); return; }
  const entries = [{ items: c.items, note: c.note, source: "manual", kind: "day" }];
  // A day can hold more than one look: what she changed into, and what she wore to the gym.
  // Gym clothes are worn but are not an all-day outfit, so they are kept separate.
  if (c.changed.length) entries.push({ items: c.changed, note: "", source: "manual", kind: "changed" });
  if (c.gym.length) entries.push({ items: c.gym, note: "", source: "manual", kind: "gym" });
  const log = loadLog();
  log[ds] = entries;
  saveLog(log); pushSync();
  document.getElementById("editor").classList.remove("open");
  selectedDate = null;
  buildCalendar();
}

// ---------- cloud sync (Firebase RTDB REST — no SDK, no login) ----------
// A shared secret code namespaces the data. Same code on two devices = same closet.
function getSyncCode() { return localStorage.getItem(SYNC_CODE_KEY) || ""; }
function syncEnabled() { return !!SYNC_DB_URL && !!getSyncCode(); }
function syncUrl() {
  return SYNC_DB_URL.replace(/\/$/, "") + "/closets/" + encodeURIComponent(getSyncCode()) + ".json";
}
// Union of dates; the local device wins a same-day conflict (whoever edited last on that device).
function mergeLogs(remote, local) { return { ...(remote || {}), ...(local || {}) }; }
async function syncNow() {
  if (!syncEnabled()) return false;
  const url = syncUrl();
  let remote = {};
  try { remote = (await (await fetch(url)).json()) || {}; } catch { return false; }
  const mergedLog = mergeLogs(remote.log, loadLog());
  const mergedDis = Array.from(new Set((remote.dislikes || []).concat(loadDislikes())));
  saveLog(mergedLog); saveDislikes(mergedDis);
  try {
    await fetch(url, { method: "PUT", body: JSON.stringify({ log: mergedLog, dislikes: mergedDis }) });
  } catch { /* offline: local is saved, will push next time */ }
  return true;
}
function pushSync() { if (syncEnabled()) syncNow(); }   // fire-and-forget after a local change
function turnOnSync() {
  const code = (document.getElementById("sync-code").value || "").trim();
  const msg = document.getElementById("sync-msg");
  if (!SYNC_DB_URL) { msg.textContent = "Sync isn't switched on in this build yet."; return; }
  if (!code) { msg.textContent = "Enter a secret phrase first."; return; }
  localStorage.setItem(SYNC_CODE_KEY, code);
  msg.textContent = "Syncing…";
  syncNow().then(ok => {
    msg.textContent = ok ? "✓ Sync on. Use this same phrase on your other device." : "Couldn't reach sync — check your connection.";
    buildCalendar();
  });
}

// ---------- backup (export / import between devices) ----------
function exportBackup() {
  const text = JSON.stringify({ v: 1, log: loadLog(), dislikes: loadDislikes() });
  const done = () => { document.getElementById("backup-msg").textContent = "✓ Backup copied — paste it on your other device."; };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { prompt("Copy this backup code:", text); done(); });
  } else { prompt("Copy this backup code:", text); done(); }
}
function importBackup() {
  const text = prompt("Paste your backup code here:");
  if (!text) return;
  let payload;
  try { payload = JSON.parse(text.trim()); } catch { alert("That doesn't look like a valid backup code."); return; }
  if (!payload || typeof payload !== "object" || typeof payload.log !== "object") {
    alert("That doesn't look like a valid backup code."); return;
  }
  saveLog({ ...loadLog(), ...payload.log });   // on a same-day conflict, the pasted-in day wins
  saveDislikes(Array.from(new Set(loadDislikes().concat(payload.dislikes || []))));
  pushSync();
  document.getElementById("backup-msg").textContent = "✓ Restored — your logged days are here now.";
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
  document.getElementById("sync-on").addEventListener("click", turnOnSync);
  document.getElementById("sync-code").value = getSyncCode();
  document.getElementById("backup-export").addEventListener("click", exportBackup);
  document.getElementById("backup-import").addEventListener("click", importBackup);
  if (syncEnabled()) syncNow();
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
