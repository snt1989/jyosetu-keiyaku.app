# 除雪契約書メーカー

除雪等業務委託契約書（別紙・別表1つき）を入力フォームから作り、A4のPDFで保存するWebアプリです。

- 発注者・請負者・契約期間（和暦で自動表示）・現場情報・単価表を入力
- 入力内容はその場でA4プレビューに反映（プレビューとPDFは同じレイアウト）
- PDFは文字が選択できるベクター形式（pdf-lib + Noto Serif CJK JP の部分埋め込み）
- 契約書データをサーバーに保存し、「見る」「編集」で呼び出し可能

## 動作環境

- **claude.ai のアーティファクト**: PDFの保存とサーバー保存に `window.claude` の `downloads` / `db` を使います。
- **Vercel**: 共通パスワードでログインします。PDFはブラウザの標準ダウンロードで保存し、サーバー保存は `api/contracts.js` が
  Vercel Blob（非公開ストア）に JSON で保存します。
  - `/` は `api/app.js` が返します。ログイン済みなら本体（`private/app.html`）、未ログインならログイン画面です。
  - Cookie（署名つき、7日間）を持たないAPI呼び出しは 401 になります。
  - 環境変数 `APP_PASSWORD`（共通パスワード）と `SESSION_SECRET`（署名用の長いランダム文字列）が必要です。
    パスワードを変えると、ログイン中の人は全員ログアウトされます。
  - ストアをプロジェクトに接続すると `BLOB_READ_WRITE_TOKEN` が入ります。
  - フォントは `public/fonts/` から読み込みます（関数の応答サイズ上限を避けるため）。
- **API が無い環境**（GitHub Pages など）: 入力・プレビュー・PDF保存は動き、「保存した契約書」欄は出ません。

## 構成

| パス | 内容 |
|---|---|
| `private/app.html` | Vercel用の本体。`tools/build.py` で作る（ログイン後にだけ配信） |
| `api/app.js`, `api/auth.js`, `api/_auth.js` | ログイン画面・ログイン/ログアウト・セッション確認 |
| `api/contracts.js` | 契約書の保存API（Vercel Blob） |
| `public/fonts/` | PDF用の日本語フォント（Noto Serif CJK JP の部分セット） |
| `vercel.json` | 出力先・東京リージョン・`/` の振り分け |
| `src/app.src.html` | フォント部分をプレースホルダーにした編集用ソース |
| `tools/mkfont_regular.py`, `tools/mkfont_bold.py` | Noto Serif CJK JP からJIS X 0208範囲を切り出してTTF化 |
| `tools/build.py` | ソースにフォントを埋め込んで `index.html` を作成 |

## データ読み取り

「契約書から読み取り」で Word(.docx)・PDF・写真/スキャン画像を選ぶと、内容を解析して入力欄に反映します（反映前に確認画面が出ます）。

- Word/PDF は文字を直接抽出します。画像と文字のないPDFは OCR（Tesseract.js）で読み取ります。
- OCR は誤読が出ることがあります。反映後に必ず内容を確認してください。
- 読み取りライブラリは jsDelivr から読み込みます（初回OCRは日本語辞書 約2MB をダウンロード）。

## ビルド

```
python3 tools/mkfont_regular.py /usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc 0 public/fonts/serif-regular.ttf   # フォントを作り直すとき
python3 tools/mkfont_bold.py    /usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc    0 public/fonts/serif-bold.ttf
python3 tools/build.py   # src/app.src.html を変えたとき
```

フォント生成には `fonttools` が必要です。フォントは SIL Open Font License 1.1 の Noto Serif CJK JP を使用しています。
