// KutubLink Intelligent Pixabay & Sovereign HD Video Backdrop Director
const CURATED_PIXABAY_ISLAMIC_AND_NATURE_VIDEOS = [
  { id: "px-mosque-dawn", realm: "sakinah", root: "س-ك-ن", topic: "fiqh hanafi aqeedah salah wudu mosque prayer fatwa tahawiyyah quduri hidayah فقه صلاة عقيدة مسجد", label: "Sacred Sanctuary & Golden Dome", query: "mosque architecture golden light", videoUrl: "https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4", fallbackLocal: "/ambient-videos/01-forest-canopy-sunbeams.mp4" },
  { id: "px-calligraphy-manuscript", realm: "hikmah", root: "ع-ل-م", topic: "dars nizami darsenizami hadithhadithgrader sanad bukhari muslim nahw sarf kafiyah tarkib درس نظامي حديث نحو صرف مخطوطة", label: "Illuminated Manuscript & Classical Ink", query: "ancient book library pages", videoUrl: "https://cdn.pixabay.com/video/2021/08/18/85506-589919442_large.mp4", fallbackLocal: "/ambient-videos/02-alpine-emerald-river.mp4" },
  { id: "px-desert-stars", realm: "cosmology", root: "س-م-و", topic: "poetry diwan arabic translation balaghah muallaqat cosmology stars sky heaven شعر بلاغة ترجمة سماء فلك", label: "Arabian Desert Night & Celestial Stars", query: "desert night stars milky way", videoUrl: "https://cdn.pixabay.com/video/2020/04/18/36466-409971490_large.mp4", fallbackLocal: "/ambient-videos/10-desert-dunes-sunset.mp4" },
  { id: "px-ocean-horizon", realm: "sabr", root: "ب-ح-ر", topic: "investors publishers authors mudarabah waqf editions earn finance ocean sea مضاربة وقف طبعات بحر", label: "Emerald Ocean Horizon & Two Seas", query: "ocean waves golden sunset", videoUrl: "https://cdn.pixabay.com/video/2019/06/04/24178-340670744_large.mp4", fallbackLocal: "/ambient-videos/05-turquoise-ocean-waves.mp4" },
  { id: "px-mountain-clouds", realm: "hikmah", root: "ح-ك-م", topic: "tafsir tabari quranic logic compare multipage comparative academic mountain تفسير طبري مقارنة جبال", label: "Mountain Clouds & Exegetical Horizon", query: "mountain peaks clouds sunrise", videoUrl: "https://cdn.pixabay.com/video/2020/07/30/45961-447087582_large.mp4", fallbackLocal: "/ambient-videos/03-misty-mountain-sunrise.mp4" },
  { id: "px-rain-leaves", realm: "rahmah", root: "ر-ح-م", topic: "mercy peace calm dhikr auditorium quran recitation tibb medicine biology رحمة قرآن تلاوة طب", label: "Gentle Rain on Emerald Sanctuary Leaves", query: "rain drops green leaves", videoUrl: "https://cdn.pixabay.com/video/2021/04/12/70868-536976693_large.mp4", fallbackLocal: "/ambient-videos/06-raindrops-green-leaves.mp4" },
  { id: "px-golden-nebula", realm: "quantum", root: "ف-ت-ح", topic: "mantiq logic algebra faraid geometry lingo math root extractor منطق جبر فرائض هندسة", label: "Sacred Geometry & Golden Horizon", query: "golden particles light abstract", videoUrl: "https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4", fallbackLocal: "/ambient-videos/04-golden-wheat-breeze.mp4" },
  { id: "px-waterfall-sanctuary", realm: "rahmah", root: "ط-ه-ر", topic: "taharah water purification zakat ihsan tazkiyah طهارة ماء زكاة تزكية إحسان", label: "Crystal Waterfall & Pure Springs", query: "waterfall forest stream pure water", videoUrl: "https://cdn.pixabay.com/video/2021/08/18/85506-589919442_large.mp4", fallbackLocal: "/ambient-videos/07-crystal-forest-waterfall.mp4" }
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const q = String((req.query && req.query.q) || (req.body && req.body.q) || "islamic nature").toLowerCase().trim();
  const apiKey = process.env.PIXABAY_API_KEY || "";

  // 1. If a live PIXABAY_API_KEY is configured, query Pixabay Videos API directly
  if (apiKey) {
    try {
      const url = `https://pixabay.com/api/videos/?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(q)}&safesearch=true&per_page=10`;
      const r = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (r.ok) {
        const data = await r.json();
        const hits = Array.isArray(data.hits) ? data.hits : [];
        const videos = hits
          .map((h) => {
            const v = (h.videos && (h.videos.medium || h.videos.small || h.videos.large)) || null;
            if (!v || !v.url) return null;
            return {
              id: `pixabay-${h.id}`,
              label: h.tags || q,
              realm: "cosmology",
              root: "ن-و-ر",
              videoUrl: v.url,
              fallbackLocal: "/ambient-videos/01-forest-canopy-sunbeams.mp4",
              source: "Pixabay Live API",
            };
          })
          .filter(Boolean);
        if (videos.length > 0) {
          return res.status(200).json({ status: "OK", query: q, videos, selected: videos[0] });
        }
      }
    } catch (e) {}
  }

  // 2. Semantic Topic Scoring across Curated Pixabay CDN + Local 35-Video Vault
  const scored = CURATED_PIXABAY_ISLAMIC_AND_NATURE_VIDEOS.map((item) => {
    const words = q.split(/[\s,.;:!?/\\-]+/).filter(Boolean);
    let score = 0;
    for (const w of words) {
      if (w.length >= 2 && (item.topic.includes(w) || item.query.includes(w) || item.label.toLowerCase().includes(w))) {
        score += 12;
      }
    }
    return { ...item, score };
  }).sort((a, b) => b.score - a.score);

  return res.status(200).json({
    status: "OK",
    query: q,
    videos: scored,
    selected: scored[0],
  });
}
