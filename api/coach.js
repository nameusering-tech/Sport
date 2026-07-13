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
  const userId = user.id;
  if (isRateLimited(userId)) return response.status(429).json({ error: "Too many requests" });

  const { message, profile = {}, stats = {}, workout = [], schedule = [], history = [] } = request.body || {};
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
    todayWorkout: workout,
    schedule
  });

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      reasoning: { effort: "low" },
      store: false,
      max_output_tokens: 650,
      safety_identifier: createHash("sha256").update(`sportik:${userId}`).digest("hex").slice(0, 32),
      instructions: "Ты SPORTIK Coach — внимательный русскоязычный ассистент домашних силовых тренировок. Сначала собери недостающие данные: цель, опыт, возраст, ограничения, доступные дни и длительность. Используй только упражнения из разрешённого списка и только доступное оборудование: гантели и скамья. Если данных достаточно или пользователь прямо просит составить/изменить план, верни planUpdated=true и полный актуальный план. Если уточняешь данные или просто отвечаешь, верни planUpdated=false. Не ставь диагнозы. При острой, нарастающей или необычной боли рекомендуй прекратить упражнение и обратиться к медицинскому специалисту. Отвечай кратко и конкретно на русском.",
      text: {
        format: {
          type: "json_schema",
          name: "sportik_coach_update",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["reply", "planUpdated", "plan"],
            properties: {
              reply: { type: "string" },
              planUpdated: { type: "boolean" },
              plan: {
                type: "object",
                additionalProperties: false,
                required: ["title", "intensity", "duration", "exercises", "schedule"],
                properties: {
                  title: { type: "string" },
                  intensity: { type: "string" },
                  duration: { type: "integer", minimum: 5, maximum: 120 },
                  exercises: {
                    type: "array",
                    maxItems: 10,
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["id", "sets", "reps", "weightMode"],
                      properties: {
                        id: { type: "string", enum: ["floor-press", "one-arm-row", "overhead-press", "bench-crunch", "plank-shoulder-tap", "push-up", "lateral-raise", "biceps-curl", "dumbbell-squat", "bulgarian-split-squat"] },
                        sets: { type: "integer", minimum: 1, maximum: 6 },
                        reps: { type: "string" },
                        weightMode: { type: "string", enum: ["body", "single", "pair"] }
                      }
                    }
                  },
                  schedule: {
                    type: "array",
                    maxItems: 7,
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["day", "title", "time"],
                      properties: { day: { type: "integer", minimum: 0, maximum: 6 }, title: { type: "string" }, time: { type: "string" } }
                    }
                  }
                }
              }
            }
          }
        }
      },
      input: [
        ...compactHistory,
        { role: "user", content: `Разрешённые упражнения: floor-press, one-arm-row, overhead-press, bench-crunch, plank-shoulder-tap, push-up, lateral-raise, biceps-curl, dumbbell-squat, bulgarian-split-squat.\nМои актуальные данные: ${context}\n\nСообщение: ${cleanMessage}` }
      ]
    })
  });

  const data = await openaiResponse.json();
  if (!openaiResponse.ok) return response.status(openaiResponse.status).json({ error: "OpenAI request failed", detail: data.error?.message });
  const raw = extractText(data);
  try {
    response.status(200).json(JSON.parse(raw));
  } catch {
    response.status(200).json({ reply: raw, planUpdated: false, plan: { title: "", intensity: "", duration: 30, exercises: [], schedule: [] } });
  }
}
