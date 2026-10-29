// 共通パスワードでのログイン。セッションは署名つきCookie（HMAC-SHA256）。
// 環境変数: APP_PASSWORD（共通パスワード）, SESSION_SECRET（署名用の長いランダム文字列）
// パスワードを変えると、既存のセッションはすべて無効になる。
const crypto = require("crypto");

const COOKIE = "jk_session";
const MAX_AGE = 7 * 24 * 3600;

const configured = () => !!(process.env.APP_PASSWORD && process.env.SESSION_SECRET);
const sign = (v) => crypto.createHmac("sha256", process.env.SESSION_SECRET + "|" + process.env.APP_PASSWORD).update(v).digest("base64url");

function cookies(header) {
  const out = {};
  String(header || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}

function isAuthed(req) {
  if (!configured()) return false;
  const t = cookies(req.headers.cookie)[COOKIE];
  if (!t) return false;
  const [v, s] = t.split(".");
  if (!v || !s || !(Number(v) > Date.now() / 1000)) return false;
  const a = Buffer.from(s), b = Buffer.from(sign(v));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function passwordOk(input) {
  if (!configured()) return false;
  const h = (x) => crypto.createHash("sha256").update(String(x)).digest();
  return crypto.timingSafeEqual(h(input), h(process.env.APP_PASSWORD));
}

function startSession(res) {
  const v = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  res.setHeader("Set-Cookie", COOKIE + "=" + v + "." + sign(v) + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + MAX_AGE);
}

function endSession(res) {
  res.setHeader("Set-Cookie", COOKIE + "=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
}

module.exports = { configured, isAuthed, passwordOk, startSession, endSession };
