// Clueless Closet — historical backfill from the Maine wear log (2026).
// Loaded once on first open so you don't hand-enter anything.
// Each date maps to an array of "looks"; most days have one, AND-days have two.
// ids come from wardrobe.js. Days marked ??? in the log are left blank.

const SEED = {
  "2026-06-26": [["bot-blue-shorts", "tank-white-henley", "shoe-white-sandals"]],
  "2026-06-27": [["tank-white-henley", "bot-denim-shorts", "shoe-white-sandals"]],
  // 2026-06-28: ??? (unrecorded)
  "2026-06-29": [["wk-tank-red", "wk-shorts"]],
  "2026-06-30": [["swim-1", "dress-blue-tshirt"]],
  "2026-07-01": [["wk-tank-blue", "bot-black-skort"]],
  "2026-07-02": [["bot-blue-shorts", "tee-black-zeus", "shoe-birks-black"]],
  "2026-07-03": [["tee-white-fitted", "bot-denim-shorts", "shoe-sneakers"]],
  // 2026-07-04: ?? (unrecorded)
  "2026-07-05": [["tank-white-highneck", "layer-pink-sweatshirt", "bot-blue-shorts", "shoe-sneakers"]],
  "2026-07-06": [["bot-green-track", "tee-white-fitted", "ls-rugby", "shoe-white-sandals"]],
  "2026-07-07": [["wk-leggings", "tee-hot-pink", "layer-pink-sweatshirt", "shoe-cow"]],
  "2026-07-08": [["shoe-cow", "bot-black-linen", "tank-white-highneck", "layer-blue-cardi"]],
  "2026-07-09": [["bot-blue-shorts", "tank-white-scoop", "layer-green-sweater", "shoe-birks-black"]],
  "2026-07-10": [["wk-leggings", "shoe-sneakers", "wk-tank-flowy-blue", "layer-pink-sweatshirt"]],
  "2026-07-11": [["bot-pistola", "tee-black-zeus", "shoe-birks-black", "layer-red-wisco", "hat-black-grimpeurs"]],
  "2026-07-12": [
    ["bot-denim-shorts", "ls-green-poplin", "shoe-white-sandals"],
    ["bot-denim-shorts", "tee-hot-pink", "layer-pink-sweatshirt", "shoe-birks-black", "hat-blue-timber"],
  ],
  "2026-07-13": [["bot-denim-shorts", "tank-white-henley", "ls-rugby", "shoe-black-sandals"]],
  "2026-07-14": [["bot-blue-shorts", "tank-navy-cami", "shoe-white-sandals", "layer-blue-cardi"]],
  "2026-07-15": [["shoe-black-sandals", "bot-black-linen", "tee-white-varsity", "layer-red-cardi"]],
  "2026-07-16": [
    ["tee-gray-roadtripper", "bot-denim-shorts", "shoe-white-sandals"],
    ["bot-pistola", "ls-green-poplin", "shoe-white-sandals"],
  ],
  "2026-07-17": [["bot-green-track", "shoe-cow", "tank-white-scoop", "layer-pink-sweatshirt"]],
  "2026-07-18": [["bot-blue-shorts", "tee-hot-pink", "layer-green-sweater", "shoe-cow"]],
  // The log's final row was labeled "July 17" again but falls after July 18 — read as July 19.
  "2026-07-19": [["wk-leggings", "shoe-sneakers", "layer-red-wisco", "wk-tank-red"]],
};

(function seedLog() {
  const FLAG = "clueless_closet_seeded_v1";
  if (localStorage.getItem(FLAG)) return;
  if (!Object.keys(SEED).length) return;
  let log = {};
  try { log = JSON.parse(localStorage.getItem("clueless_closet_log_v1")) || {}; } catch {}
  Object.entries(SEED).forEach(([date, looks]) => {
    if (!log[date]) log[date] = looks.map(ids => ({ items: ids, note: "", source: "seed" }));
  });
  localStorage.setItem("clueless_closet_log_v1", JSON.stringify(log));
  localStorage.setItem(FLAG, "1");
})();
