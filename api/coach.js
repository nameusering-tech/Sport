import { createHash } from "node:crypto";

const requestBuckets = new Map();

const COACH_INSTRUCTIONS = `Ты SPORTIK Coach — внимательный русскоязычный ассистент домашних силовых тренировок для здоровых взрослых.

ПЕРВИЧНОЕ ИНТЕРВЬЮ:
1. До первого плана последовательно выясни: главную цель; возраст; опыт и текущую активность; сколько тренировок в неделю и какие дни удобны; длительность одной тренировки; всё доступное дома оборудование с количеством и весом; травмы, боль, диагнозы или медицинские ограничения; упражнения, которые нравятся или не подходят.
2. Учитывай уже известные данные профиля и историю. Не задавай повторно вопросы, на которые есть ясный ответ.
3. Задавай за одно сообщение только один короткий вопрос. Если пользователь сразу сообщил несколько пунктов, сохрани их и спроси следующий недостающий.
4. Пока обязательные данные не собраны, planUpdated=false. Заполняй profilePatch только фактами, которые пользователь сообщил явно; для неизвестного возвращай пустую строку или 0.
5. Когда обязательных данных достаточно, создай полный план, верни planUpdated=true и начни reply словами: «Готово — я создал для вас персональный план. Откройте раздел „Мой план“, чтобы всё проверить.»
6. В replyOptions возвращай короткие варианты ответа на текущий вопрос. Для вопроса об оборудовании обязательно верни: «Гантели», «Штанга и блины», «Гири», «Тренировочная скамья», «Турник», «Резинки», «Эспандер», «Петли TRX», «Стул или табурет», «Рюкзак с книгами», «Бутылки с водой», «Только собственный вес», «Другое». Эти варианты интерфейс покажет как множественный выбор. Если выбраны гантели, гири или штанга, следующим вопросом уточни количество и вес.

ПЛАН И БЕЗОПАСНОСТЬ:
- Используй только упражнения из разрешённого списка и только подтверждённое оборудование. Если у пользователя есть инвентарь, для которого в библиотеке пока нет упражнения и изображения, сообщи об этом и не выдумывай технику.
- В schedule поле day всегда является целым числом: 0=понедельник, 1=вторник, 2=среда, 3=четверг, 4=пятница, 5=суббота, 6=воскресенье. Никогда не пиши название дня в поле day.
- Создавай ровно одну запись schedule на каждую запланированную тренировку, ставь её на выбранный пользователем день и не размещай несколько тренировок в один день. Если пользователь выбрал только частоту, но не конкретные дни, равномерно распредели тренировки по неделе с днями отдыха между ними.
- Для общего здоровья ориентируйся на регулярную работу основных мышечных групп не менее двух дней в неделю, но индивидуализируй частоту, объём и интенсивность. Последовательность важнее сложных схем.
- Начинай консервативно, оставляй запас повторений, повышай нагрузку постепенно по реакции пользователя. Не требуй отказных повторений и не обещай медицинский результат.
- Не ставь диагнозы и не назначай лечение. При острой, усиливающейся, необычной боли, боли в груди, обмороке, выраженной одышке или неврологических симптомах рекомендуй прекратить тренировку и обратиться за медицинской помощью.
- При хронических заболеваниях, беременности, восстановлении после операции или травмы проси согласовать программу с врачом или профильным специалистом.
- Отвечай кратко, спокойно и конкретно на русском.

ФОРМАТ ОТВЕТА:
Всегда возвращай только один JSON-объект без Markdown и пояснений вокруг него:
{"reply":"короткий ответ или один следующий вопрос","replyOptions":["вариант 1","вариант 2"],"planUpdated":false,"profilePatch":{"goal":"","level":"","age":0,"frequency":0,"sessionMinutes":0,"equipmentNotes":"","limitations":""},"plan":{"title":"","intensity":"","duration":30,"exercises":[],"schedule":[]}}
Если создаёшь план, exercises содержит объекты {"id","sets","reps","weightMode"}, schedule — объекты {"day","title","time"}. Пример трёх тренировок: [{"day":0,"title":"Верх тела","time":"По плану"},{"day":2,"title":"Низ тела","time":"По плану"},{"day":4,"title":"Всё тело","time":"По плану"}]. Не пропускай ни одно поле.`;

const COACH_SCHEMA = {
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
            properties: {
              day: { type: "integer", minimum: 0, maximum: 6 },
              title: { type: "string" },
              time: { type: "string" }
            }
          }
        }
      }
    }
  }
};

function emptyCoachResult(reply) {
  return {
    reply,
    replyOptions: [],
    planUpdated: false,
    profilePatch: { goal: "", level: "", age: 0, frequency: 0, sessionMinutes: 0, equipmentNotes: "", limitations: "" },
    plan: { title: "", intensity: "", duration: 30, exercises: [], schedule: [] }
  };
}

function normalizeCoachResult(value) {
  const fallback = emptyCoachResult("");
  const source = value && typeof value === "object" ? value : {};
  const profilePatch = source.profilePatch && typeof source.profilePatch === "object" ? source.profilePatch : {};
  const plan = source.plan && typeof source.plan === "object" ? source.plan : {};
  return {
    reply: String(source.reply || "Не удалось сформировать ответ. Попробуйте ещё раз."),
    replyOptions: Array.isArray(source.replyOptions) ? source.replyOptions.map(String).slice(0, 13) : [],
    planUpdated: Boolean(source.planUpdated),
    profilePatch: { ...fallback.profilePatch, ...profilePatch },
    plan: {
      ...fallback.plan,
      ...plan,
      exercises: Array.isArray(plan.exercises) ? plan.exercises.slice(0, 10) : [],
      schedule: Array.isArray(plan.schedule) ? plan.schedule.slice(0, 7) : []
    }
  };
}

function parseCoachJson(raw) {
  const clean = String(raw || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return normalizeCoachResult(JSON.parse(clean));
}

function isRateLimited(userId) {
  const now = Date.now();
  const recent = (requestBuckets.get(userId) || []).filter(timestamp => now - timestamp < 60_000);
  recent.push(now);
  requestBuckets.set(userId, recent);
  return recent.length > 12;
}

function extractOpenAIText(result) {
  for (const item of result.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  return "";
}

function extractGeminiText(result) {
  return (result.candidates?.[0]?.content?.parts || []).map(part => part.text || "").join("").trim();
}

async function askGemini({ apiKey, history, prompt }) {
  const selectedModel = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const models = [...new Set(["gemini-3.1-flash-lite", selectedModel, "gemini-flash-lite-latest"])];
  let lastError;
  for (const model of models) {
    try {
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: COACH_INSTRUCTIONS }] },
          contents: [
            ...history.map(item => ({ role: item.role === "assistant" ? "model" : "user", parts: [{ text: item.content }] })),
            { role: "user", parts: [{ text: prompt }] }
          ],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1400, responseMimeType: "application/json" }
        })
      });
      const data = await geminiResponse.json();
      if (geminiResponse.ok) {
        const text = extractGeminiText(data);
        if (text) return text;
        lastError = Object.assign(new Error("Gemini returned an empty response"), { status: 502 });
        continue;
      }
      lastError = Object.assign(new Error(data.error?.message || "Gemini request failed"), { status: geminiResponse.status });
      if ([401, 403].includes(geminiResponse.status)) break;
    } catch (error) {
      lastError = Object.assign(error, { status: error.status || 502 });
    }
  }
  throw lastError || new Error("Gemini request failed");
}

async function askOpenAI({ apiKey, userId, history, prompt }) {
  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      reasoning: { effort: "low" },
      store: false,
      max_output_tokens: 1000,
      safety_identifier: createHash("sha256").update(`sportik:${userId}`).digest("hex").slice(0, 32),
      instructions: COACH_INSTRUCTIONS,
      text: { format: { type: "json_schema", name: "sportik_coach_update", strict: true, schema: COACH_SCHEMA } },
      input: [...history, { role: "user", content: prompt }]
    })
  });
  const data = await openaiResponse.json();
  if (!openaiResponse.ok) {
    const error = new Error(data.error?.message || "OpenAI request failed");
    error.status = openaiResponse.status;
    throw error;
  }
  return extractOpenAIText(data);
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") return response.status(204).end();
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });

  const provider = String(process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "openai")).toLowerCase();
  const providerKey = provider === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY;
  const supabaseUrl = (process.env.SUPABASE_URL || "").trim().replace(/\/(?:rest|auth)\/v1\/?$/i, "").replace(/\/$/, "");
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const missing = [
    !providerKey ? (provider === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY") : "",
    !supabaseUrl ? "SUPABASE_URL" : "",
    !supabaseAnonKey ? "SUPABASE_ANON_KEY" : ""
  ].filter(Boolean);
  if (missing.length) return response.status(503).json({ error: "Server is not configured", provider, missing });

  const token = String(request.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return response.status(401).json({ error: "Authentication required" });
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` } });
  if (!userResponse.ok) return response.status(401).json({ error: "Invalid session" });
  const user = await userResponse.json();
  if (isRateLimited(user.id)) return response.status(429).json({ error: "Too many requests" });

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
      homeEquipment: profile.equipmentConfirmed ? String(profile.equipmentNotes || "не указано").slice(0, 500) : "не подтверждено — обязательно спросить пользователя",
      notes: String(profile.notes || "").slice(0, 500)
    },
    stats,
    todayWorkout: workout,
    schedule
  });
  const prompt = `Разрешённые упражнения: floor-press, one-arm-row, overhead-press, bench-crunch, plank-shoulder-tap, push-up, lateral-raise, biceps-curl, dumbbell-squat, bulgarian-split-squat.\nМои актуальные данные: ${context}\n\nСообщение: ${cleanMessage}`;

  try {
    const raw = provider === "gemini"
      ? await askGemini({ apiKey: providerKey, history: compactHistory, prompt })
      : await askOpenAI({ apiKey: providerKey, userId: user.id, history: compactHistory, prompt });
    if (!raw) return response.status(502).json({ error: `${provider} returned an empty response` });
    try {
      return response.status(200).json(parseCoachJson(raw));
    } catch {
      return response.status(200).json(emptyCoachResult(raw));
    }
  } catch (error) {
    return response.status(error.status || 502).json({ error: `${provider} request failed`, detail: error.message });
  }
}
