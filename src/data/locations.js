// We are adding lat/lon coordinates to each district
export const madhyaPradeshMarkets = {
  "Chhindwara": {
    name_hi: "छिंदवाड़ा", lat: 22.05, lon: 78.93,
    markets: [ { name_en: "Chhindwara", name_hi: "छिंदवाड़ा" } ]
  },
  "Bhopal": {
    name_hi: "भोपाल", lat: 23.25, lon: 77.41,
    markets: [ { name_en: "Bhopal(F&V)", name_hi: "भोपाल (फल-सब्जी)" }, { name_en: "Bhopal", name_hi: "भोपाल" } ]
  },
  "Indore": {
    name_hi: "इंदौर", lat: 22.71, lon: 75.85,
    markets: [ { name_en: "Indore", name_hi: "इंदौर" }, { name_en: "Indore(F&V)", name_hi: "इंदौर (फल-सब्जी)" } ]
  },
  "Jabalpur": {
    name_hi: "जबलपुर", lat: 23.18, lon: 79.98,
    markets: [ { name_en: "Jabalpur", name_hi: "जबलपुर" }, { name_en: "Jabalpur(F&V)", name_hi: "जबलपुर (फल-सब्जी)" } ]
  },
  "Gwalior": {
    name_hi: "ग्वालियर", lat: 26.21, lon: 78.18,
    markets: [ { name_en: "Gwalior(F&V)", name_hi: "ग्वालियर (फल-सब्जी)" } ]
  },
  "Ujjain": {
    name_hi: "उज्जैन", lat: 23.17, lon: 75.78,
    markets: [ { name_en: "Ujjain", name_hi: "उज्जैन" } ]
  },
};

export const districts = Object.keys(madhyaPradeshMarkets);