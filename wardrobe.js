// Clueless Closet — wardrobe data (mirrors Maine_wardrobe.docx)
// tone: dark | light | bright | neutral   (Winter palette: aim for dark + light + bright)
//   white = light, black = dark, navy = dark, red = bright. Blue depends on the outfit.
// offer: false = owned, but never offered as part of a look (chosen for function, not looks)
// warmth: 1 = coolest base ... higher = warmer   |   rain: true = fine in rain
// sneaker: true = Sat/Sun only (unless athletic + workout day)
// capsules: which wardrobes an item belongs to. An item can be in several — the blue Pistola
//   pants work in Maine and for teaching. Swapping wardrobes = changing which capsule is
//   active, not re-tagging every item. "maine" is the summer-2026 trip set.
// tone "blue" resolves against the rest of the look: bright when something else is dark,
//   otherwise dark. A tone may also be a pair, e.g. the poplin reads light AND bright.

const WARDROBE = [
  // ---- TOPS: tanks (all summer) ----
  { id: "tank-white-henley",   name: "White ribbed Henley tank",        cat: "top", sub: "tank", tone: "light",  warmth: 1, rain: true, capsules: ["maine"] },
  { id: "tank-white-scoop",    name: "White scoop-neck tank",           cat: "top", sub: "tank", tone: "light",  warmth: 1, rain: true, capsules: ["maine"] },
  { id: "tank-white-highneck", name: "White high-neck ribbed tank",     cat: "top", sub: "tank", tone: "light",  warmth: 1, rain: true, capsules: ["maine"] },
  { id: "tank-navy-cami",      name: "Navy pointelle cami",             cat: "top", sub: "tank", tone: "dark",   warmth: 1, rain: true, navy: true, capsules: ["maine"] },
  { id: "tank-royal-mock",     name: "Royal blue mock turtleneck tank", cat: "top", sub: "tank", tone: "blue", warmth: 1, rain: true, capsules: ["maine"] },

  // ---- TOPS: t-shirts (all summer) ----
  { id: "tee-white-fitted",    name: "White fitted tee",                cat: "top", sub: "tee", tone: "light",   warmth: 2, rain: true, capsules: ["maine"] },
  { id: "tee-white-varsity",   name: "White graphic tee (Varsity meat shop)", cat: "top", sub: "tee", tone: "light", warmth: 2, rain: true, capsules: ["maine"] },
  { id: "tee-black-zeus",      name: "Black graphic tee (Zeus)",        cat: "top", sub: "tee", tone: "dark",    warmth: 2, rain: true, black: true, capsules: ["maine"] },
  { id: "tee-hot-pink",        name: "Hot pink tee",                    cat: "top", sub: "tee", tone: "bright",  warmth: 2, rain: true, capsules: ["maine"] },
  { id: "tee-gray-roadtripper",name: "Gray knit roadtripper tee",       cat: "top", sub: "tee", tone: "neutral", warmth: 2, rain: true, capsules: ["maine"] },

  // ---- TOPS: long sleeves (year-round / transitional) ----
  { id: "ls-green-poplin",     name: "Green & white J.Crew mandarin poplin shirt", cat: "top", sub: "longsleeve", tone: ["light", "bright"], warmth: 3, rain: true, overshirt: true, capsules: ["maine"] },
  { id: "ls-rugby",            name: "Blue & white rugby shirt",        cat: "top", sub: "longsleeve", tone: "blue", warmth: 3, rain: true, canLayer: true, capsules: ["maine"] },

  // ---- LAYERS ----
  { id: "layer-pink-sweatshirt", name: "Hot pink sweatshirt",          cat: "layer", sub: "sweatshirt", tone: "bright", warmth: 4, rain: true, capsules: ["maine"] },
  { id: "layer-red-wisco",       name: "Red Wisconsin sweatshirt",     cat: "layer", sub: "sweatshirt", tone: "bright", warmth: 4, rain: true, capsules: ["maine"] },
  { id: "layer-green-sweater",   name: "Green & white cotton sweater", cat: "layer", sub: "sweater",    tone: ["light", "bright"], warmth: 4, rain: false, capsules: ["maine"] },
  { id: "layer-blue-cardi",      name: "Blue & white cotton cardigan", cat: "layer", sub: "cardigan",   tone: ["light", "bright"], warmth: 3, rain: false, capsules: ["maine"] },
  { id: "layer-red-cardi",       name: "Red & white cotton cardigan",  cat: "layer", sub: "cardigan",   tone: ["light", "bright"], warmth: 3, rain: false, capsules: ["maine"] },
  { id: "layer-red-vest",        name: "Red Alex Mill cotton vest",    cat: "layer", sub: "vest",       tone: "bright", warmth: 2, rain: true, standalone: true, capsules: ["maine"] },

  // ---- DRESSES ----
  { id: "dress-white-strappy", name: "White strappy long dress",       cat: "dress", tone: "light", warmth: 1, rain: true, capsules: ["maine"] },
  { id: "dress-blue-tshirt",   name: "Blue t-shirt dress",             cat: "dress", tone: "blue",  warmth: 2, rain: true, capsules: ["maine"] },

  // ---- BOTTOMS ----
  { id: "bot-denim-shorts",    name: "Denim shorts",                   cat: "bottom", sub: "shorts", tone: "neutral", warmth: 1, rain: true, capsules: ["maine"] },
  { id: "bot-blue-shorts",     name: "Blue elastic-waist shorts",      cat: "bottom", sub: "shorts", tone: "blue", warmth: 1, rain: true, capsules: ["maine"] },
  { id: "bot-black-linen",     name: "Black linen shorts",             cat: "bottom", sub: "shorts", tone: "dark",    warmth: 1, rain: true, black: true, capsules: ["maine"] },
  { id: "bot-black-skort",     name: "Athletic black skort",           cat: "bottom", sub: "skort",  tone: "dark",    warmth: 1, rain: true, black: true, capsules: ["maine"] },
  { id: "bot-black-leggings",  name: "Athletic black leggings",        cat: "bottom", sub: "leggings", tone: "dark",  warmth: 2, rain: true, black: true, capsules: ["maine"] },
  { id: "bot-blue-jeans",      name: "Blue jeans",                     cat: "bottom", sub: "pants",  tone: "blue", warmth: 3, rain: true, capsules: ["maine"] },
  { id: "bot-pistola",         name: "Blue Pistola wide-leg pants",    cat: "bottom", sub: "pants",  tone: "blue", warmth: 3, rain: true, capsules: ["maine"] },
  { id: "bot-green-track",     name: "Green track pants",              cat: "bottom", sub: "pants",  tone: "bright",  warmth: 3, rain: true, capsules: ["maine"] },

  // ---- WORKOUT (only on a requested workout day) ----
  { id: "wk-tank-blue",        name: "Blue workout tank",              cat: "workout", sub: "top",    tone: "blue", warmth: 1, rain: true, capsules: ["gym"] },
  { id: "wk-tank-red",         name: "Red workout tank",               cat: "workout", sub: "top",    tone: "bright", warmth: 1, rain: true, capsules: ["gym"] },
  { id: "wk-tank-flowy-blue",  name: "Blue flowy workout tank",        cat: "workout", sub: "top",    tone: "blue", warmth: 1, rain: true, capsules: ["gym"] },
  { id: "wk-leggings",         name: "Workout leggings",               cat: "workout", sub: "bottom", tone: "neutral", warmth: 2, rain: true, capsules: ["gym"] },
  { id: "wk-shorts",           name: "Workout spandex shorts",         cat: "workout", sub: "bottom", tone: "neutral", warmth: 1, rain: true, capsules: ["gym"] },

  // ---- SWIM ----
  { id: "swim-1",              name: "Swimsuit 1",                     cat: "swim", tone: "neutral", rain: true, offer: false, capsules: ["maine"] },
  { id: "swim-2",              name: "Swimsuit 2",                     cat: "swim", tone: "neutral", rain: true, offer: false, capsules: ["maine"] },

  // ---- SHOES ----  (sneaker: true = Sat/Sun only, unless athletic on a workout day)
  { id: "shoe-sneakers",     name: "Tennis shoes / sneakers",          cat: "shoe", tone: "neutral", rain: true,  sneaker: true, athletic: true, capsules: ["maine"] },
  { id: "shoe-cow",          name: "Cow-print shoes",                  cat: "shoe", tone: ["light", "dark"], rain: true, capsules: ["maine", "teaching2026"] },
  { id: "shoe-birks-black",  name: "Black Birkenstocks",               cat: "shoe", tone: "dark", rain: true, black: true, capsules: ["maine"] },
  { id: "shoe-white-sandals",name: "White sandals",                    cat: "shoe", tone: "light", rain: false, capsules: ["maine"] },
  { id: "shoe-black-sandals",name: "Black sandals",                    cat: "shoe", tone: "dark", rain: false, black: true, capsules: ["maine"] },

  // ---- OUTERWEAR (rain only) ----
  { id: "outer-rain",     name: "Lightweight rain jacket",             cat: "outer", tone: "neutral", rain: true, offer: false, capsules: ["maine"] },

  // ---- HATS (optional accent) ----
  { id: "hat-black-grimpeurs", name: "Black Grimpeurs cap",            cat: "hat", tone: "dark",   rain: true, black: true, capsules: ["maine"] },
  { id: "hat-blue-timber",     name: "Light blue Timber & Trout cap",  cat: "hat", tone: "light",  rain: true, capsules: ["maine"] },
  { id: "hat-red",             name: "Red cap",                        cat: "hat", tone: "bright", rain: true, capsules: ["maine"] },
  { id: "hat-maroon",          name: "Maroon cap",                     cat: "hat", tone: "bright", rain: true, capsules: ["maine"] },

  // ---- TEACHING 2026 (fall) — captured from what Shannon actually taught in.
  //      warmth/rain are first guesses; correct them as you go.
  { id: "top-vintage-sweater",  name: "Black, tan & white vintage short-sleeve sweater", cat: "top", sub: "sweater", tone: ["light", "dark"], warmth: 3, rain: true, black: true, capsules: ["teaching2026"] },
  { id: "bot-black-wideleg",    name: "Black wide-leg pants",             cat: "bottom", sub: "pants", tone: "dark",  warmth: 3, rain: true, black: true, capsules: ["teaching2026"] },
  { id: "layer-blue-blazer",    name: "Blue blazer",                      cat: "layer", sub: "blazer", tone: "blue",  warmth: 3, rain: true, capsules: ["teaching2026"] },
  { id: "top-denim-vest",       name: "Madewell denim vest",              cat: "top", sub: "vest",     tone: "neutral", warmth: 2, rain: true, capsules: ["teaching2026"] },
  { id: "dress-choir",          name: "White & black choir dress",        cat: "dress", tone: ["light", "dark"], warmth: 2, rain: true, black: true, capsules: ["teaching2026"] },
  { id: "shoe-black-heels",     name: "Black heels",                      cat: "shoe", tone: "dark",    rain: false, black: true, capsules: ["teaching2026"] },
  { id: "shoe-witch-flats",     name: "Black witch flats",                cat: "shoe", tone: "dark",    rain: false, black: true, capsules: ["teaching2026"] },
  { id: "shoe-moccasin-loafers",name: "Black Maine moccasin loafers",     cat: "shoe", tone: "dark",    rain: true,  black: true, capsules: ["teaching2026"] },
  { id: "shoe-leopard-flats",   name: "Leopard flats",                    cat: "shoe", tone: "neutral", rain: false, capsules: ["teaching2026"] },
  { id: "top-cream-nubby",      name: "Cream nubby tank",                 cat: "top", sub: "tank",     tone: "light", warmth: 1, rain: true, capsules: ["teaching2026"] },
  { id: "top-black-mesh-polo",  name: "Black mesh polo",                  cat: "top", sub: "polo",     tone: "dark",  warmth: 2, rain: true, black: true, capsules: ["teaching2026"] },
  { id: "bot-black-pleated",    name: "Black Ali Golden pleated pants",   cat: "bottom", sub: "pants", tone: "dark",  warmth: 3, rain: true, black: true, capsules: ["teaching2026"] },
  { id: "shoe-black-brogues",   name: "Black brogues",                    cat: "shoe", tone: "dark",   rain: true, black: true, capsules: ["teaching2026"] },
  { id: "scarf-berry",          name: "Berry scarf",                      cat: "scarf", tone: "bright", warmth: 1, rain: true, capsules: ["teaching2026"] },
];

if (typeof module !== "undefined") module.exports = { WARDROBE };
