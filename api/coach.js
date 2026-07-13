import { createHash } from "node:crypto";

const requestBuckets = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  const recent = (requestBuckets.get(userId) || []).filter(timestamp => now - timestamp < 60_000);
  recent.push(now);
  requestBuckets.set(userId, recent);
  return recent.length > 12;
}

function extractText(response) {
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  return "Не удалось сформировать ответ. Попробуйте ещё раз.";
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") return response.status(204).end();
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });

  const openaiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = (process.env.SUPABASE_URL || "")
    .trim()
    .replace(/\/(?:rest|auth)\/v1\/?$/i, "")
    .replace(/\/$/, "");
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!openaiKey || !supabaseUrl || !supabaseAnonKey) return response.status(503).json({ error: "Server is not configured" });

  const token = String(request.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return response.status(401).json({ error: "Authentication required" });

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` }
  });
  if (!userResponse.ok) return response.status(401).json({ error: "Invalid session" });
  const user = await userResponse.json();
  if (isRateLimited(user.id)) return response.status(429).json({ error: "Too many requests" });

  const { message, profile = {}, stats = {}, workout = [], history = [] } = request.body || {};
  const cleanMessage = String(message || "").trim().slice(0, 2000);
  if (!cleanMessage) return response.status(400).json({ error: "Message is required" });

  const compactHistory = history.slice(-8).map(item => ({ role: item.role === "assistant" ? "assistant" : "user", content: String(item.text || "").slice(0, 1000) }));
  const context = JSON.stringify({
    profile: {
      name: profile.name,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      level: profile.level,
      goal: profile.goal,
      dumbbells: `${profile.dumbbellCount || 2} × ${profile.dumbbellWeight || 5} кг`,
      notes: String(profile.notes || "").slice(0, 500)
    },
    stats,
    todayWorkout: workout
  });

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      reasoning: { effort: "low" },
      store: false,
      max_output_tokens: 650,
      safety_identifier: createHash("sha256").update(`sportik:${user.id}`).digest("hex").slice(0, 32),
      instructions: "Ты SPORTIK Coach — внимательный русскоязычный ассистент домашних силовых тренировок. Используй только доступное пользователю оборудование. Давай короткие, конкретные и безопасные рекомендации, предлагай изменить повторения, темп и подходы раньше, чем советовать купить другой вес. Не ставь диагнозы и не заменяй врача. При острой, нарастающей или необычной боли рекомендуй прекратить упражнение и обратиться к медицинскому специалисту. Не обещай автоматически изменить данные приложения — чётко отделяй совет от уже сохранённого изменения.",
      input: [
        ...compactHistory,
        { role: "user", content: `Мои актуальные данные: ${context}\n\nСообщение: ${cleanMessage}` }
      ]
    })
  });

  const data = await openaiResponse.json();
  if (!openaiResponse.ok) return response.status(openaiResponse.status).json({ error: "OpenAI request failed", detail: data.error?.message });
  response.status(200).json({ reply: extractText(data) });
}
