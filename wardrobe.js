// Clueless Closet — wardrobe data (mirrors Maine_wardrobe.docx)
// tone: dark | light | bright | neutral   (Winter palette: aim for dark + light + bright)
// warmth: 1 = coolest base ... higher = warmer   |   rain: true = fine in rain
// sneaker: true = Sat/Sun only (unless athletic + workout day)
// summer: true = distinctly a warm-weather piece (used for the seasonal swap; the others carry into fall)

const WARDROBE = [
  // ---- TOPS: tanks (all summer) ----
  { id: "tank-white-henley",   name: "White ribbed Henley tank",        cat: "top", sub: "tank", tone: "light",  warmth: 1, rain: true, summer: true },
  { id: "tank-white-scoop",    name: "White scoop-neck tank",           cat: "top", sub: "tank", tone: "light",  warmth: 1, rain: true, summer: true },
  { id: "tank-white-highneck", name: "White high-neck ribbed tank",     cat: "top", sub: "tank", tone: "light",  warmth: 1, rain: true, summer: true },
  { id: "tank-navy-cami",      name: "Navy pointelle cami",             cat: "top", sub: "tank", tone: "dark",   warmth: 1, rain: true, summer: true, navy: true },
  { id: "tank-royal-mock",     name: "Royal blue mock turtleneck tank", cat: "top", sub: "tank", tone: "bright", warmth: 1, rain: true, summer: true },

  // ---- TOPS: t-shirts (all summer) ----
  { id: "tee-white-fitted",    name: "White fitted tee",                cat: "top", sub: "tee", tone: "light",   warmth: 2, rain: true, summer: true },
  { id: "tee-white-varsity",   name: "White graphic tee (Varsity meat shop)", cat: "top", sub: "tee", tone: "light", warmth: 2, rain: true, summer: true },
  { id: "tee-black-zeus",      name: "Black graphic tee (Zeus)",        cat: "top", sub: "tee", tone: "dark",    warmth: 2, rain: true, summer: true, black: true },
  { id: "tee-hot-pink",        name: "Hot pink tee",                    cat: "top", sub: "tee", tone: "bright",  warmth: 2, rain: true, summer: true },
  { id: "tee-gray-roadtripper",name: "Gray knit roadtripper tee",       cat: "top", sub: "tee", tone: "neutral", warmth: 2, rain: true, summer: true },

  // ---- TOPS: long sleeves (year-round / transitional) ----
  { id: "ls-green-poplin",     name: "Green & white J.Crew mandarin poplin shirt", cat: "top", sub: "longsleeve", tone: "bright", warmth: 3, rain: true, overshirt: true },
  { id: "ls-rugby",            name: "Blue & white rugby shirt",        cat: "top", sub: "longsleeve", tone: "bright", warmth: 3, rain: true, canLayer: true },

  // ---- LAYERS ----
  { id: "layer-pink-sweatshirt", name: "Hot pink sweatshirt",          cat: "layer", sub: "sweatshirt", tone: "bright", warmth: 4, rain: true, summer: true },
  { id: "layer-red-wisco",       name: "Red Wisconsin sweatshirt",     cat: "layer", sub: "sweatshirt", tone: "bright", warmth: 4, rain: true },
  { id: "layer-green-sweater",   name: "Green & white cotton sweater", cat: "layer", sub: "sweater",    tone: "bright", warmth: 4, rain: false, summer: true },
  { id: "layer-blue-cardi",      name: "Blue & white cotton cardigan", cat: "layer", sub: "cardigan",   tone: "bright", warmth: 3, rain: false },
  { id: "layer-red-cardi",       name: "Red & white cotton cardigan",  cat: "layer", sub: "cardigan",   tone: "bright", warmth: 3, rain: false },
  { id: "layer-red-vest",        name: "Red Alex Mill cotton vest",    cat: "layer", sub: "vest",       tone: "bright", warmth: 2, rain: true, standalone: true },

  // ---- DRESSES ----
  { id: "dress-white-strappy", name: "White strappy long dress",       cat: "dress", tone: "light", warmth: 1, rain: true, summer: true },
  { id: "dress-blue-tshirt",   name: "Blue t-shirt dress",             cat: "dress", tone: "dark",  warmth: 2, rain: true, summer: true },

  // ---- BOTTOMS ----
  { id: "bot-denim-shorts",    name: "Denim shorts",                   cat: "bottom", sub: "shorts", tone: "neutral", warmth: 1, rain: true, summer: true },
  { id: "bot-blue-shorts",     name: "Blue elastic-waist shorts",      cat: "bottom", sub: "shorts", tone: "neutral", warmth: 1, rain: true, summer: true },
  { id: "bot-black-linen",     name: "Black linen shorts",             cat: "bottom", sub: "shorts", tone: "dark",    warmth: 1, rain: true, summer: true, black: true },
  { id: "bot-black-skort",     name: "Athletic black skort",           cat: "bottom", sub: "skort",  tone: "dark",    warmth: 1, rain: true, summer: true, black: true },
  { id: "bot-black-leggings",  name: "Athletic black leggings",        cat: "bottom", sub: "leggings", tone: "dark",  warmth: 2, rain: true, black: true },
  { id: "bot-blue-jeans",      name: "Blue jeans",                     cat: "bottom", sub: "pants",  tone: "neutral", warmth: 3, rain: true },
  { id: "bot-white-jeans",     name: "White denim jeans",              cat: "bottom", sub: "pants",  tone: "light",   warmth: 3, rain: true },
  { id: "bot-pistola",         name: "Blue Pistola wide-leg pants",    cat: "bottom", sub: "pants",  tone: "neutral", warmth: 3, rain: true },
  { id: "bot-green-track",     name: "Green track pants",              cat: "bottom", sub: "pants",  tone: "bright",  warmth: 3, rain: true },

  // ---- WORKOUT (only on a requested workout day) ----
  { id: "wk-tank-blue",        name: "Blue workout tank",              cat: "workout", sub: "top",    tone: "neutral", warmth: 1, rain: true },
  { id: "wk-tank-red",         name: "Red workout tank",               cat: "workout", sub: "top",    tone: "neutral", warmth: 1, rain: true },
  { id: "wk-tank-flowy-blue",  name: "Blue flowy workout tank",        cat: "workout", sub: "top",    tone: "neutral", warmth: 1, rain: true },
  { id: "wk-leggings",         name: "Workout leggings",               cat: "workout", sub: "bottom", tone: "neutral", warmth: 2, rain: true },
  { id: "wk-shorts",           name: "Workout spandex shorts",         cat: "workout", sub: "bottom", tone: "neutral", warmth: 1, rain: true },

  // ---- SWIM ----
  { id: "swim-1",              name: "Swimsuit 1",                     cat: "swim", tone: "neutral", rain: true, summer: true },
  { id: "swim-2",              name: "Swimsuit 2",                     cat: "swim", tone: "neutral", rain: true, summer: true },

  // ---- SHOES ----  (sneaker: true = Sat/Sun only, unless athletic on a workout day)
  { id: "shoe-sneakers",     name: "Tennis shoes / sneakers",          cat: "shoe", tone: "neutral", rain: true,  sneaker: true, athletic: true },
  { id: "shoe-cow",          name: "Cow-print shoes",                  cat: "shoe", tone: "neutral", rain: true },
  { id: "shoe-birks-black",  name: "Black Birkenstocks",               cat: "shoe", tone: "neutral", rain: true },
  { id: "shoe-white-sandals",name: "White sandals",                    cat: "shoe", tone: "neutral", rain: false, summer: true },
  { id: "shoe-black-sandals",name: "Black sandals",                    cat: "shoe", tone: "neutral", rain: false, summer: true },

  // ---- OUTERWEAR (rain only) ----
  { id: "outer-rain",     name: "Lightweight rain jacket",             cat: "outer", tone: "neutral", rain: true },

  // ---- HATS (optional accent) ----
  { id: "hat-black-grimpeurs", name: "Black Grimpeurs cap",            cat: "hat", tone: "dark",   rain: true },
  { id: "hat-blue-timber",     name: "Light blue Timber & Trout cap",  cat: "hat", tone: "light",  rain: true },
  { id: "hat-red",             name: "Red cap",                        cat: "hat", tone: "bright", rain: true },
  { id: "hat-maroon",          name: "Maroon cap",                     cat: "hat", tone: "bright", rain: true },
];

if (typeof module !== "undefined") module.exports = { WARDROBE };
