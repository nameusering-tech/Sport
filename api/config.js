export default function handler(_request, response) {
  const supabaseUrl = (process.env.SUPABASE_URL || "")
    .trim()
    .replace(/\/(?:rest|auth)\/v1\/?$/i, "")
    .replace(/\/$/, "");

  response.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  response.status(200).json({
    supabaseUrl,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ""
  });
}
