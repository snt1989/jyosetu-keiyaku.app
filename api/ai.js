// AIで契約書の内容を読み解き・編集するAPI。Anthropic API を呼ぶ。
//   POST /api/ai  { prompt }  →  { text }
// ログイン済みのセッションだけが使える。環境変数 ANTHROPIC_API_KEY が必要（任意で AI_MODEL）。
const { isAuthed } = require("./_auth");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!isAuthed(req)) return res.status(401).json({ error: "unauthorized" });
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(501).json({ error: "AI機能を使うには、Vercelの環境変数 ANTHROPIC_API_KEY を設定してください。" });
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const prompt = body && typeof body.prompt === "string" ? body.prompt : "";
  if (!prompt || prompt.length > 120000) return res.status(400).json({ error: "依頼の内容が空か、長すぎます。" });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.AI_MODEL || "claude-sonnet-5-5", max_tokens: 8000, messages: [{ role: "user", content: prompt }] })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ error: "AIの呼び出しに失敗しました（" + r.status + "）" + (j && j.error && j.error.message ? "：" + j.error.message : "") });
    const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: "AIに接続できませんでした。" });
  }
};
