import crypto from "crypto";

function normalizeUthmaniForTts(t) {
  return String(t || "")
    .replace(/\u0671/g, "\u0627")
    .replace(/\u0640*\u0670/g, "\u0627")
    .replace(/[\u06D6-\u06ED\u06DD\u06DE\u06E9\u08F0-\u08FF۝۞]/g, " ")
    .replace(/\u0640/g, "")
    .replace(/[`*_#~>|«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitBilingualSegments(text, langHint) {
  const cleaned = normalizeUthmaniForTts(text).slice(0, 2200);
  if (!cleaned) return [];
  if (String(langHint || "").toLowerCase().startsWith("ar")) {
    return [{ lang: "ar", text: cleaned }];
  }
  const arRe = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:[\s،؛؟.!:«»()\-]+[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*)/g;
  const segments = [];
  let lastIdx = 0;
  let match;
  while ((match = arRe.exec(cleaned)) !== null) {
    if (match.index > lastIdx) {
      const enPart = cleaned.slice(lastIdx, match.index).trim();
      if (enPart) segments.push({ lang: "en", text: enPart });
    }
    const arPart = match[0].trim();
    if (arPart) segments.push({ lang: "ar", text: arPart });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < cleaned.length) {
    const tail = cleaned.slice(lastIdx).trim();
    if (tail) segments.push({ lang: "en", text: tail });
  }
  return segments.length > 0 ? segments : [{ lang: "en", text: cleaned }];
}

function chunkSegmentText(text, maxLen = 175) {
  const sentences = text.match(/[^.!?؟।\n،]+[.!?؟।\n،]*/g) || [text];
  const out = [];
  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if (trimmed.length <= maxLen) {
      out.push(trimmed);
    } else {
      const words = trimmed.split(/\s+/);
      let cur = "";
      for (const w of words) {
        if ((cur + " " + w).trim().length > maxLen) {
          if (cur) out.push(cur);
          cur = w;
        } else {
          cur = (cur + " " + w).trim();
        }
      }
      if (cur) out.push(cur);
    }
  }
  return out;
}

// Curated Qur'anic & Classical Arabic Studio Audio Map (EveryAyah / Mishary Rashid Alafasy 128kbps)
const QURANIC_STUDIO_PHRASE_MAP = [
  { match: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", norm: "بسم الله الرحمن الرحيم", url: "https://everyayah.com/data/Alafasy_128kbps/001001.mp3" },
  { match: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ", norm: "الحمد لله رب العالمين", url: "https://everyayah.com/data/Alafasy_128kbps/001002.mp3" },
  { match: "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", norm: "الرحمن الرحيم", url: "https://everyayah.com/data/Alafasy_128kbps/001003.mp3" },
  { match: "مَـٰلِكِ يَوْمِ ٱلدِّينِ", norm: "مالك يوم الدين", url: "https://everyayah.com/data/Alafasy_128kbps/001004.mp3" },
  { match: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", norm: "قل هو الله أحد", url: "https://everyayah.com/data/Alafasy_128kbps/112001.mp3" },
  { match: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ", norm: "الله لا إله إلا هو الحي القيوم", url: "https://everyayah.com/data/Alafasy_128kbps/002255.mp3" },
  { match: "أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ", norm: "ألا بذكر الله تطمئن القلوب", url: "https://everyayah.com/data/Alafasy_128kbps/013028.mp3" },
  { match: "وَقُل رَّبِّ زِدْنِى عِلْمًا", norm: "وقل رب زدني علما", url: "https://everyayah.com/data/Alafasy_128kbps/020114.mp3" },
  { match: "يَرْفَعِ ٱللَّهُ ٱلَّذِينَ ءَامَنُوا۟", norm: "يرفع الله الذين آمنوا منكم والذين أوتوا العلم درجات", url: "https://everyayah.com/data/Alafasy_128kbps/058011.mp3" },
  { match: "وَٱلسَّمَآءَ بَنَيْنَـٰهَا بِأَيْي۟دٍ وَإِنَّا لَمُوسِعُونَ", norm: "والسماء بنيناها بأيد وإنا لموسعون", url: "https://everyayah.com/data/Alafasy_128kbps/051047.mp3" },
  { match: "وَجَعَلْنَا مِنَ ٱلْمَآءِ كُلَّ شَىْءٍ حَىٍّ", norm: "وجعلنا من الماء كل شيء حي", url: "https://everyayah.com/data/Alafasy_128kbps/021030.mp3" },
  { match: "مَرَجَ ٱلْبَحْرَيْنِ يَلْتَقِيَانِ", norm: "مرج البحرين يلتقيان", url: "https://everyayah.com/data/Alafasy_128kbps/055019.mp3" },
  { match: "وَأَنزَلْنَا ٱلْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ", norm: "وأنزلنا الحديد فيه بأس شديد", url: "https://everyayah.com/data/Alafasy_128kbps/057025.mp3" },
  { match: "ٱللَّهُ نُورُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ", norm: "الله نور السماوات والأرض", url: "https://everyayah.com/data/Alafasy_128kbps/024035.mp3" }
];

function stripArabicDiacritics(str) {
  return String(str || "")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

function generateSecMsGec() {
  const WIN_EPOCH = 11644473600;
  let ticks = Math.floor(Date.now() / 1000) + WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= 1e7;
  const strToHash = `${ticks.toFixed(0)}6A5AA1D4EAFF4E9FB37E23D68491D6F4`;
  return crypto.createHash("sha256").update(strToHash, "ascii").digest("hex").toUpperCase();
}

async function fetchEdgeNeuralChunk(text, voiceName, rateStr = "-2%", pitchStr = "-2Hz") {
  if (typeof WebSocket === "undefined") return null;
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 3200);
    try {
      const connId = crypto.randomUUID().replace(/-/g, "");
      const secMsGec = generateSecMsGec();
      const wsUrl =
        `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` +
        `?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4` +
        `&ConnectionId=${connId}` +
        `&Sec-MS-GEC=${secMsGec}` +
        `&Sec-MS-GEC-Version=1-130.0.2849.68`;

      const ws = new WebSocket(wsUrl);
      const audioChunks = [];
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        const configMsg =
          `X-Timestamp:${new Date().toISOString()}\r\n` +
          `Content-Type:application/json; charset=utf-8\r\n` +
          `Path:speech.config\r\n\r\n` +
          JSON.stringify({
            context: {
              synthesis: {
                audio: {
                  metadataoptions: { sentenceBoundaryEnabled: "false", wordBoundaryEnabled: "false" },
                  outputFormat: "audio-24khz-96kbitrate-mono-mp3",
                },
              },
            },
          });
        ws.send(configMsg);

        const escaped = String(text)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const langAttr = voiceName.startsWith("ar-") ? "ar-SA" : "en-US";
        const ssml =
          `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${langAttr}'>` +
          `<voice name='${voiceName}'>` +
          `<prosody pitch='${pitchStr}' rate='${rateStr}' volume='+0%'>${escaped}</prosody>` +
          `</voice></speak>`;

        const ssmlMsg =
          `X-RequestId:${connId}\r\n` +
          `Content-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${new Date().toISOString()}Z\r\n` +
          `Path:ssml\r\n\r\n` +
          ssml;
        ws.send(ssmlMsg);
      };

      ws.onmessage = (event) => {
        if (typeof event.data === "string") {
          if (event.data.includes("Path:turn.end")) {
            clearTimeout(timer);
            try { ws.close(); } catch (e) {}
            if (audioChunks.length > 0) {
              resolve(Buffer.concat(audioChunks));
            } else {
              resolve(null);
            }
          }
        } else if (event.data instanceof ArrayBuffer) {
          const buf = Buffer.from(event.data);
          if (buf.length > 2) {
            const headerLen = buf.readUInt16BE(0);
            if (buf.length > headerLen + 2) {
              const headerStr = buf.subarray(2, 2 + headerLen).toString("utf8");
              if (headerStr.includes("Path:audio")) {
                audioChunks.push(buf.subarray(2 + headerLen));
              }
            }
          }
        }
      };

      ws.onerror = () => {
        clearTimeout(timer);
        resolve(null);
      };
      ws.onclose = () => {
        clearTimeout(timer);
        if (audioChunks.length > 0) resolve(Buffer.concat(audioChunks));
        else resolve(null);
      };
    } catch (e) {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

async function fetchStreamElementsPollyChunk(text, lang, voicePref) {
  try {
    let pollyVoice = "Brian";
    if (lang === "ar") {
      pollyVoice = "Zeina";
    } else if (voicePref === "Warm") {
      pollyVoice = "Matthew";
    } else if (voicePref === "Calm") {
      pollyVoice = "Arthur";
    } else {
      pollyVoice = "Brian";
    }
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(pollyVoice)}&text=${encodeURIComponent(text)}`;
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(4500),
    });
    if (resp.ok) {
      const arr = await resp.arrayBuffer();
      if (arr.byteLength > 256) return Buffer.from(arr);
    }
  } catch (e) {}
  return null;
}

async function fetchGoogleNeuralChunk(text, lang) {
  const endpoints = [
    `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`,
    `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=${lang}&q=${encodeURIComponent(text)}`
  ];
  for (const url of endpoints) {
    try {
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(4500),
      });
      if (resp.ok) {
        const arr = await resp.arrayBuffer();
        if (arr.byteLength > 128) return Buffer.from(arr);
      }
    } catch (e) {}
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let body = {};
  if (req.method === "POST") {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } else {
    body = req.query || {};
  }

  const rawText = String(body.text || "").trim();
  const langHint = String(body.lang || "auto").toLowerCase();
  const personaId = String(body.persona || body.voice || "andrew").toLowerCase();
  const voicePref = personaId.includes("chris") || personaId === "calm"
    ? "Calm"
    : personaId.includes("ryan") || personaId === "clear"
    ? "Clear"
    : "Warm";
  const userRate = Number(body.rate || 0.96);

  if (!rawText) {
    return res.status(400).json({ error: "text is required" });
  }

  // Check if the Arabic text matches a famous Qur'anic verse for direct studio Qari audio
  const strippedInput = stripArabicDiacritics(rawText);
  if (strippedInput.length >= 8 && strippedInput.length <= 160) {
    for (const qItem of QURANIC_STUDIO_PHRASE_MAP) {
      if (strippedInput.includes(stripArabicDiacritics(qItem.norm)) || stripArabicDiacritics(qItem.norm).includes(strippedInput)) {
        try {
          const qResp = await fetch(qItem.url, { signal: AbortSignal.timeout(4500) });
          if (qResp.ok) {
            const qBuf = Buffer.from(await qResp.arrayBuffer());
            if (qBuf.length > 512) {
              const uri = `data:audio/mpeg;base64,${qBuf.toString("base64")}`;
              return res.status(200).json({
                status: "OK",
                voice: "ar-SA-MisharyAlafasyStudio",
                language: "ar-SA",
                normalized_text: normalizeUthmaniForTts(rawText),
                audio_data_uri: uri,
                audio_chunks: [{ uri, lang: "ar", text: normalizeUthmaniForTts(rawText) }],
                substrate: "AQL Studio Qur'an & Neural Audio Engine",
              });
            }
          }
        } catch (e) {}
      }
    }
  }

  const segments = splitBilingualSegments(rawText, langHint);
  if (segments.length === 0) {
    return res.status(200).json({ status: "FALLBACK", error: "Empty text" });
  }

  let enVoice = "en-US-AndrewMultilingualNeural";
  if (voicePref === "Calm") enVoice = "en-US-ChristopherNeural";
  else if (voicePref === "Clear") enVoice = "en-GB-RyanNeural";
  const arVoice = "ar-SA-HamedNeural";

  const ratePct = Math.max(-22, Math.min(25, Math.round((userRate - 1.0) * 100)));
  const rateStr = `${ratePct >= 0 ? "+" : ""}${ratePct}%`;

  const tasks = [];
  for (const seg of segments) {
    const chunks = chunkSegmentText(seg.text, 175);
    const tl = seg.lang === "ar" ? "ar" : "en";
    const targetVoice = seg.lang === "ar" ? arVoice : enVoice;
    for (const chunk of chunks) {
      tasks.push({ chunk, tl, targetVoice });
    }
  }

  let usedSubstrate = "Microsoft Edge Studio Neural TTS";
  const results = await Promise.all(
    tasks.slice(0, 12).map(async ({ chunk, tl, targetVoice }) => {
      // 1. Try Microsoft Edge Neural TTS WebSocket first
      let buf = await fetchEdgeNeuralChunk(chunk, targetVoice, tl === "ar" ? "-5%" : rateStr, "-2Hz");

      // 2. Fallback to StreamElements Amazon Polly Neural
      if (!buf) {
        buf = await fetchStreamElementsPollyChunk(chunk, tl, voicePref);
        if (buf) usedSubstrate = "Polly Studio Neural TTS";
      }

      // 3. Fallback to Google Cloud Neural TTS HD
      if (!buf) {
        buf = await fetchGoogleNeuralChunk(chunk, tl);
        if (buf) usedSubstrate = "Cloud Neural HD TTS";
      }

      if (buf && buf.length > 128) {
        return {
          buf,
          uri: `data:audio/mpeg;base64,${buf.toString("base64")}`,
          lang: tl,
          text: chunk,
        };
      }
      return null;
    })
  );

  const validChunks = results.filter((r) => r !== null);
  if (validChunks.length === 0) {
    return res.status(200).json({ status: "FALLBACK", error: "All neural streams unreachable" });
  }

  const combined = Buffer.concat(validChunks.map((c) => c.buf));
  const primaryLang = segments.length === 1 && segments[0].lang === "ar" ? "ar-SA" : "en-US";

  return res.status(200).json({
    status: "OK",
    voice: primaryLang === "ar-SA" ? arVoice : enVoice,
    language: primaryLang,
    normalized_text: normalizeUthmaniForTts(rawText).slice(0, 2200),
    audio_data_uri: `data:audio/mpeg;base64,${combined.toString("base64")}`,
    audio_chunks: validChunks.map((c) => ({ uri: c.uri, lang: c.lang, text: c.text })),
    substrate: usedSubstrate,
  });
}
