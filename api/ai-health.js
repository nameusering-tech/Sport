const TOKEN = "d6d104c4e6fb484398d8a3cc6af6c79f";

export default async function handler(request, response) {
  if (request.method !== "GET" || request.headers["x-sportik-diagnostic"] !== TOKEN) {
    return response.status(404).json({ error: "Not found" });
  }
  const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: "Верни только JSON без Markdown." }] },
      contents: [{ role: "user", parts: [{ text: "Верни объект с полями reply='Какова ваша главная цель?' и planUpdated=false." }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 120, responseMimeType: "application/json" }
    })
  });
  const data = await upstream.json();
  return response.status(200).json({ status: upstream.status, ok: upstream.ok, detail: data.error?.message, text: data.candidates?.[0]?.content?.parts?.[0]?.text || "" });
}
