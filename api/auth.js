// POST /api/auth   { password } → ログイン
// DELETE /api/auth               → ログアウト
const { configured, passwordOk, startSession, endSession } = require("./_auth");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "DELETE") { endSession(res); return res.status(204).end(); }
  if (req.method !== "POST") { res.setHeader("Allow", "POST, DELETE"); return res.status(405).json({ error: "method not allowed" }); }
  if (!configured()) return res.status(503).json({ error: "not configured" });
  let body = req.body;
  try { if (typeof body === "string") body = JSON.parse(body); } catch (e) { body = {}; }
  if (passwordOk(body && body.password)) { startSession(res); return res.status(200).json({ ok: true }); }
  await new Promise((r) => setTimeout(r, 800)); // 総当たりを遅くする
  return res.status(401).json({ error: "invalid password" });
};
