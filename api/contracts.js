// 契約書の保存API。Vercel Blob（非公開ストア）に JSON で保存する。
//   GET    /api/contracts          一覧（メタ情報のみ）
//   GET    /api/contracts?id=ID    1件（メタ情報 + 入力内容）
//   PUT    /api/contracts?id=ID    保存 { meta, state }
//   DELETE /api/contracts?id=ID    削除
// ログイン済み（共通パスワード）のセッションだけが使える。
const { put, get, list, del } = require("@vercel/blob");
const { isAuthed } = require("./_auth");

const ID = /^c[a-z0-9]{3,40}$/;
const META = (id) => "meta/" + id + ".json";
const DOC = (id) => "doc/" + id + ".json";

async function readText(pathname) {
  const r = await get(pathname, { access: "private", useCache: false });
  if (!r || r.statusCode !== 200) return null;
  return new Response(r.stream).text();
}

function cleanMeta(m) {
  m = m && typeof m === "object" ? m : {};
  return {
    title: String(m.title || "").slice(0, 200),
    job: String(m.job || "").slice(0, 200),
    start: String(m.start || "").slice(0, 10),
    end: String(m.end || "").slice(0, 10),
    nSites: Math.max(0, Math.min(99, Number(m.nSites) || 0)),
    updatedAt: Number(m.updatedAt) || Date.now()
  };
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!isAuthed(req)) return res.status(401).json({ error: "unauthorized" });
  try {
    const id = req.query && req.query.id;
    if (id !== undefined && !ID.test(String(id))) return res.status(400).json({ error: "invalid id" });

    if (req.method === "GET" && !id) {
      const blobs = [];
      let cursor;
      do {
        const r = await list({ prefix: "meta/", cursor, limit: 1000 });
        blobs.push(...r.blobs);
        cursor = r.hasMore ? r.cursor : undefined;
      } while (cursor);
      const items = (await Promise.all(blobs.map(async (b) => {
        try { return Object.assign({ id: b.pathname.slice(5, -5) }, JSON.parse(await readText(b.pathname))); } catch (e) { return null; }
      }))).filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 200);
      return res.status(200).json({ items });
    }

    if (!id) return res.status(400).json({ error: "id required" });

    if (req.method === "GET") {
      const [m, d] = await Promise.all([readText(META(id)), readText(DOC(id))]);
      if (!m || !d) return res.status(404).json({ error: "not found" });
      return res.status(200).json({ meta: JSON.parse(m), state: JSON.parse(d) });
    }

    if (req.method === "PUT") {
      const body = req.body && typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
      if (!body.state || typeof body.state !== "object" || !Array.isArray(body.state.sites) || !Array.isArray(body.state.prices)) {
        return res.status(400).json({ error: "invalid state" });
      }
      const opts = { access: "private", allowOverwrite: true, addRandomSuffix: false, contentType: "application/json" };
      await put(DOC(id), JSON.stringify(body.state), opts);
      await put(META(id), JSON.stringify(cleanMeta(body.meta)), opts);
      return res.status(204).end();
    }

    if (req.method === "DELETE") {
      await del([DOC(id), META(id)]);
      return res.status(204).end();
    }

    res.setHeader("Allow", "GET, PUT, DELETE");
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server error" });
  }
};
