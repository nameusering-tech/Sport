const DIAGNOSTIC_TOKEN = "02795b756dcfb44110b62e61affb26c9";

export default async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed" });
  if (request.headers["x-sportik-diagnostic"] !== DIAGNOSTIC_TOKEN) {
    return response.status(404).json({ error: "Not found" });
  }

  const provider = String(process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "openai")).toLowerCase();
  if (provider !== "gemini") return response.status(200).json({ provider, configured: Boolean(process.env.OPENAI_API_KEY) });
  if (!process.env.GEMINI_API_KEY) return response.status(503).json({ provider, configured: false });

  const selectedModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const models = [...new Set([selectedModel, "gemini-2.5-flash"])];
  const checks = [];
  for (const model of models) {
    try {
      const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Ответь только словом OK" }] }],
          generationConfig: { temperature: 0, maxOutputTokens: 10 }
        })
      });
      const data = await upstream.json();
      checks.push({ model, status: upstream.status, ok: upstream.ok, detail: data.error?.message || data.candidates?.[0]?.content?.parts?.[0]?.text || "empty" });
    } catch (error) {
      checks.push({ model, status: 0, ok: false, detail: error.message });
    }
  }
  let availableModels = [];
  try {
    const listResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=100", {
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY }
    });
    const listData = await listResponse.json();
    availableModels = (listData.models || [])
      .filter(item => item.supportedGenerationMethods?.includes("generateContent"))
      .map(item => item.name?.replace(/^models\//, ""))
      .filter(name => /gemini.*(?:flash|pro)/i.test(name));
  } catch {}
  return response.status(200).json({ provider, configured: true, checks, availableModels });
}
