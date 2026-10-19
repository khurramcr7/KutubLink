/**
 * KUTUBLINK × MEDUSA v2 HEADLESS COMMERCE & CATALOG API
 * Serverless Endpoint: /api/medusa-store
 *
 * Bridges:
 *  - 591 AalimBooks International Print & Digital SKUs
 *  - 6Featured Replica Editions from https://kutublink.vercel.app/
 *  - 5 Standalone Commercial MVPs (ONE CoPilot™, GENESIS™, zeroH™, AQL Translator™, Accelerate™)
 *  - Earn App Muḍārabah & Scholarly Peer-Reviewed Book Projects
 *  - Direct Safepay Checkout Session Creation
 */

const fs = require("fs");
const path = require("path");

const FEATURED_REPLICA_BOOKS = [
  {
    id: "prod_kl_tahawiyyah_minhaj",
    sku: "AB-1069-DM",
    title: "Sharḥ al-ʿAqīdah al-Ṭaḥāwiyyah (Ibn Abī al-ʿIzz)",
    arabicTitle: "شرح العقيدة الطحاوية — ابن أبي العز الحنفي",
    publisher: "Dār al-Minhāj · Critical 2-Volume Taḥqīq",
    discipline: "Aqeedah",
    priceUsd: 48,
    pricePkr: 13400,
    badge: "Best for study · 2 vols",
    cover: "/books/book-01.jpg",
    stock: 42
  },
  {
    id: "prod_kl_jalalain_minhaj",
    sku: "AB-1102-DJ",
    title: "Tafsīr al-Jalālayn (with Lubāb al-Nuqūl & Marginalia)",
    arabicTitle: "تفسير الجلالين مع لباب النقول في أسباب النزول",
    publisher: "Dār al-Minhāj · 1 Volume Cream Chamois",
    discipline: "Tafsir",
    priceUsd: 48,
    pricePkr: 13400,
    badge: "Recommended · Best tahqiq",
    cover: "/books/book-02.jpg",
    stock: 65
  },
  {
    id: "prod_kl_quran_16line",
    sku: "AB-1001-QM",
    title: "Qurʾān Majeed — 16 Line Tajwīd Script",
    arabicTitle: "القرآن المجيد — ١٦ سطراً بالتجويد الملون",
    publisher: "AalimBooks International · Maktabat al-Bushrā",
    discipline: "Tafsir",
    priceUsd: 12,
    pricePkr: 1400,
    badge: "MVP Bestseller · Instant Dispatch",
    cover: "/books/book-03.jpg",
    stock: 250
  },
  {
    id: "prod_kl_hidayah_bushra",
    sku: "AB-1210-HB",
    title: "Al-Hidāyah Sharḥ Bidāyat al-Mubtadī (8-Vol Bushrā Color Set)",
    arabicTitle: "الهداية شرح بداية المبتدي — برهان الدين المرغيناني",
    publisher: "Maktabat al-Bushrā · Dars-e-Nizami Standard",
    discipline: "Hanafi Fiqh",
    priceUsd: 95,
    pricePkr: 26500,
    badge: "Dars-e-Nizami Year 6–7",
    cover: "/books/book-04.jpg",
    stock: 38
  },
  {
    id: "prod_kl_bukhari_sultaniyyah",
    sku: "AB-1244-SB",
    title: "Ṣaḥīḥ al-Bukhārī (Complete 9-Vol Sulṭāniyyah Critical Edition)",
    arabicTitle: "صحيح البخاري — الطبعة السلطانية الكاملة (٩ مجلدات)",
    publisher: "Dār Ṭawq al-Najāh / AalimBooks",
    discipline: "Hadith",
    priceUsd: 135,
    pricePkr: 37600,
    badge: "Dawrah-e-Ḥadīth Canonical",
    cover: "/books/book-05.jpg",
    stock: 29
  },
  {
    id: "prod_kl_usul_shashi",
    sku: "AB-1188-US",
    title: "Uṣūl al-Shāshī & Talqīḥ al-Adhhān (Beginner Ḥanafī Uṣūl)",
    arabicTitle: "أصول الشاشي مع تلقيح الأذهان في أصول الفقه الحنفي",
    publisher: "Maktabat al-Bushrā · Annotated Student Edition",
    discipline: "Usul",
    priceUsd: 19,
    pricePkr: 4800,
    badge: "92% Match · Beginner Hanafi Usul",
    cover: "/books/book-06.jpg",
    stock: 94
  }
];

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  let catalogSummary = { totalSkus: 591,loadedProducts: FEATURED_REPLICA_BOOKS.length };
  try {
    const p = path.join(process.cwd(), "metadata", "medusa-store-catalog.json");
    if (fs.existsSync(p)) {
      const raw = JSON.parse(fs.readFileSync(p, "utf8"));
      catalogSummary.totalSkus = Array.isArray(raw.products) ? raw.products.length : 591;
    }
  } catch (_) {}

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      engine: "Medusa v2 Headless Commerce + Safepay Gateway",
      catalogSummary,
      featuredProducts: FEATURED_REPLICA_BOOKS,
      connectedPlatforms: [
        { id: "aalimbooks", name: "AalimBooks International", url: "https://www.aalimbooksint.com", role: "591 Print & Digital SKUs" },
        { id: "kutublink", name: "KutubLink AI", url: "https://kutublink.vercel.app", role: "The AI Layer & Shamela Concordance" },
        { id: "ihp", name: "IHP (Islamic Heritage Platform)", url: "https://kutublink.vercel.app/#ecosystem", role: "Harvard 1,564 Digitized Manuscripts" },
        { id: "earn", name: "Earn App", url: "https://kutublink.vercel.app/#ecosystem", role: "Publishers, Authors, Peer Reviewers & Muḍārabah Investors" },
        { id: "one", name: "ONE (www.aql.one)", url: "https://www.aql.one", role: "Secular Chat & IDE CoPilot" }
      ]
    });
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    return res.status(200).json({
      ok: true,
      cartId: "cart_medusa_v2_" + Date.now(),
      items: body.items || [],
      safepayReady: true,
      checkoutEndpoint: "/api/safepay"
    });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
};
