import { createHash } from "node:crypto";

const buckets = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  const recent = (buckets.get(userId) || []).filter(timestamp => now - timestamp < 60_000);
  recent.push(now);
  buckets.set(userId, recent);
  return recent.length > 8;
}

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });

  const provider = String(process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "openai")).toLowerCase();
  const providerKey = provider === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY;
  const supabaseUrl = (process.env.SUPABASE_URL || "").trim().replace(/\/(?:rest|auth)\/v1\/?$/i, "").replace(/\/$/, "");
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!providerKey || !supabaseUrl || !supabaseAnonKey) return response.status(503).json({ error: "Server is not configured" });

  const token = String(request.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return response.status(401).json({ error: "Authentication required" });
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` } });
  if (!userResponse.ok) return response.status(401).json({ error: "Invalid session" });
  const user = await userResponse.json();
  if (isRateLimited(user.id)) return response.status(429).json({ error: "Too many voice requests" });

  const audio = String(request.body?.audio || "");
  const mimeType = String(request.body?.mimeType || "audio/webm").split(";")[0];
  if (!audio || audio.length > 8_000_000) return response.status(400).json({ error: "Audio is empty or too large" });

  let bytes;
  try { bytes = Buffer.from(audio, "base64"); } catch { return response.status(400).json({ error: "Invalid audio" }); }
  if (bytes.length < 100 || bytes.length > 6_000_000) return response.status(400).json({ error: "Audio is empty or too large" });

  if (provider === "gemini") {
    const model = process.env.GEMINI_TRANSCRIBE_MODEL || process.env.GEMINI_MODEL || "gemini-3.5-flash";
    const transcriptionResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": providerKey },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { text: "Точно расшифруй русскую речь. Верни только произнесённый текст без комментариев, кавычек и форматирования. Контекст: домашние силовые тренировки, гантели, скамья, подходы и повторения." },
            { inlineData: { mimeType, data: audio } }
          ]
        }],
        generationConfig: { temperature: 0, maxOutputTokens: 1200 }
      })
    });
    const data = await transcriptionResponse.json();
    if (!transcriptionResponse.ok) return response.status(transcriptionResponse.status).json({ error: "Transcription failed", detail: data.error?.message });
    const text = (data.candidates?.[0]?.content?.parts || []).map(part => part.text || "").join("").trim();
    if (!text) return response.status(422).json({ error: "Speech was not recognized" });
    return response.status(200).json({ text });
  }

  const extension = mimeType.includes("mp4") ? "m4a" : mimeType.includes("ogg") ? "ogg" : "webm";
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mimeType }), `sportik-voice.${extension}`);
  form.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-transcribe");
  form.append("language", "ru");
  form.append("prompt", "Домашние силовые тренировки, гантели, скамья, подходы, повторения, SPORTIK.");

  const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${providerKey}`, "X-Client-Request-Id": createHash("sha256").update(`${user.id}:${Date.now()}`).digest("hex").slice(0, 32) },
    body: form
  });
  const data = await transcriptionResponse.json();
  if (!transcriptionResponse.ok) return response.status(transcriptionResponse.status).json({ error: "Transcription failed", detail: data.error?.message });
  const text = String(data.text || "").trim();
  if (!text) return response.status(422).json({ error: "Speech was not recognized" });
  response.status(200).json({ text });
}
