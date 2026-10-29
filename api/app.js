// GET / → ログイン済みなら本体、未ログインならログイン画面を返す
const fs = require("fs");
const path = require("path");
const { configured, isAuthed } = require("./_auth");

const LOGIN = (ok) => `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>ログイン｜除雪契約書メーカー</title>
<style>
:root{--bg:#eaf0f4;--panel:#fff;--ink:#16212b;--muted:#566878;--line:#d3dce4;--accent:#1d5d8a;--accent-ink:#fff;--warn:#a8480f;--field:#f5f8fa;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#10161c;--panel:#172029;--ink:#e5ecf2;--muted:#92a3b2;--line:#2b3945;--accent:#6bb4e6;--accent-ink:#07202f;--warn:#e5955c;--field:#1d2933;color-scheme:dark}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:16px;background:var(--bg);color:var(--ink);font:14px/1.6 "Noto Sans JP","Hiragino Sans","Yu Gothic",Meiryo,sans-serif}
form{width:100%;max-width:360px;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:24px}
h1{font-size:17px;margin:0 0 4px;letter-spacing:.04em}p{margin:0 0 16px;color:var(--muted);font-size:12px}
label{display:block;font-size:12px;color:var(--muted);margin-bottom:4px}
input{width:100%;font:inherit;font-size:16px;padding:9px 10px;border:1px solid var(--line);border-radius:6px;background:var(--field);color:var(--ink)}
button{width:100%;margin-top:14px;font:inherit;font-weight:700;padding:10px;border:0;border-radius:6px;background:var(--accent);color:var(--accent-ink);cursor:pointer}
button[disabled]{opacity:.55;cursor:progress}.err{color:var(--warn);font-size:12px;min-height:1.5em;margin:8px 0 0}
input:focus-visible,button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
</style></head><body>
<form id="f"><h1>除雪契約書メーカー</h1><p>パスワードを入力してください。</p>
<label for="pw">パスワード</label><input id="pw" type="password" autocomplete="current-password" autofocus required>
<div class="err" id="err" role="alert">${ok ? "" : "サーバーの設定が完了していません。管理者に連絡してください。"}</div>
<button id="b" type="submit"${ok ? "" : " disabled"}>ログイン</button></form>
<script>
document.getElementById("f").addEventListener("submit",async function(e){
  e.preventDefault();var b=document.getElementById("b"),err=document.getElementById("err");
  b.disabled=true;err.textContent="";
  try{var r=await fetch("/api/auth",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({password:document.getElementById("pw").value})});
    if(r.ok){location.reload();return}
    err.textContent=r.status===401?"パスワードが違います。":"ログインできませんでした（"+r.status+"）。";
  }catch(x){err.textContent="通信できませんでした。"}
  b.disabled=false;document.getElementById("pw").select();
});
</script></body></html>`;

module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Robots-Tag", "noindex");
  if (isAuthed(req)) return res.status(200).send(fs.readFileSync(path.join(__dirname, "..", "private", "app.html")));
  return res.status(200).send(LOGIN(configured()));
};
