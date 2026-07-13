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
      experienceLevel: profile.levelConfirmed ? profile.level : "не подтверждено — обязательно спросить пользователя",
      goal: profile.goal,
      preferredSessionsPerWeek: profile.frequency,
      preferredSessionMinutes: profile.sessionMinutes,
      equipmentConfirmed: Boolean(profile.equipmentConfirmed),
      homeEquipment: profile.equipmentConfirmed
        ? String(profile.equipmentNotes || "не указано").slice(0, 500)
        : "не подтверждено — обязательно спросить пользователя",
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
      max_output_tokens: 1000,
      safety_identifier: createHash("sha256").update(`sportik:${userId}`).digest("hex").slice(0, 32),
      instructions: `Ты SPORTIK Coach — внимательный русскоязычный ассистент домашних силовых тренировок для здоровых взрослых.

ПЕРВИЧНОЕ ИНТЕРВЬЮ:
1. До первого плана последовательно выясни: главную цель; возраст; опыт и текущую активность; сколько тренировок в неделю и какие дни удобны; длительность одной тренировки; всё доступное дома оборудование с количеством и весом; травмы, боль, диагнозы или медицинские ограничения; упражнения, которые нравятся или не подходят.
2. Учитывай уже известные данные профиля и историю. Не задавай повторно вопросы, на которые есть ясный ответ.
3. Задавай за одно сообщение только один короткий вопрос. Если пользователь сразу сообщил несколько пунктов, сохрани их и спроси следующий недостающий.
4. Пока обязательные данные не собраны, planUpdated=false. Заполняй profilePatch только фактами, которые пользователь сообщил явно; для неизвестного возвращай пустую строку или 0.
5. Когда обязательных данных достаточно, создай полный план, верни planUpdated=true и начни reply словами: «Готово — я создал для вас персональный план. Откройте раздел „Мой план“, чтобы всё проверить.»
6. В replyOptions возвращай короткие варианты ответа на текущий вопрос. Для вопроса об оборудовании обязательно верни: «Гантели», «Штанга и блины», «Гири», «Тренировочная скамья», «Турник», «Резинки», «Эспандер», «Петли TRX», «Стул или табурет», «Рюкзак с книгами», «Бутылки с водой», «Только собственный вес», «Другое». Эти варианты интерфейс покажет как множественный выбор. Если выбраны гантели, гири или штанга, следующим вопросом уточни количество и вес.

ПЛАН И БЕЗОПАСНОСТЬ:
- Используй только упражнения из разрешённого списка и только подтверждённое оборудование. Если у пользователя есть инвентарь, для которого в библиотеке пока нет упражнения и изображения, сообщи об этом и не выдумывай технику.
- Для общего здоровья ориентируйся на регулярную работу основных мышечных групп не менее двух дней в неделю, но индивидуализируй частоту, объём и интенсивность. Последовательность важнее сложных схем.
- Начинай консервативно, оставляй запас повторений, повышай нагрузку постепенно по реакции пользователя. Не требуй отказных повторений и не обещай медицинский результат.
- Не ставь диагнозы и не назначай лечение. При острой, усиливающейся, необычной боли, боли в груди, обмороке, выраженной одышке или неврологических симптомах рекомендуй прекратить тренировку и обратиться за медицинской помощью.
- При хронических заболеваниях, беременности, восстановлении после операции или травмы проси согласовать программу с врачом или профильным специалистом.
- Отвечай кратко, спокойно и конкретно на русском.`,
      text: {
        format: {
          type: "json_schema",
          name: "sportik_coach_update",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["reply", "replyOptions", "planUpdated", "profilePatch", "plan"],
            properties: {
              reply: { type: "string" },
              replyOptions: { type: "array", maxItems: 13, items: { type: "string" } },
              planUpdated: { type: "boolean" },
              profilePatch: {
                type: "object",
                additionalProperties: false,
                required: ["goal", "level", "age", "frequency", "sessionMinutes", "equipmentNotes", "limitations"],
                properties: {
                  goal: { type: "string", enum: ["", "Стать сильнее", "Набор мышц", "Снижение веса", "Поддержание формы"] },
                  level: { type: "string", enum: ["", "Начинающий", "Средний", "Продвинутый"] },
                  age: { type: "integer", minimum: 0, maximum: 120 },
                  frequency: { type: "integer", minimum: 0, maximum: 7 },
                  sessionMinutes: { type: "integer", minimum: 0, maximum: 120 },
                  equipmentNotes: { type: "string" },
                  limitations: { type: "string" }
                }
              },
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
    response.status(200).json({ reply: raw, replyOptions: [], planUpdated: false, profilePatch: { goal: "", level: "", age: 0, frequency: 0, sessionMinutes: 0, equipmentNotes: "", limitations: "" }, plan: { title: "", intensity: "", duration: 30, exercises: [], schedule: [] } });
  }
}
