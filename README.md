# 除雪契約書メーカー

除雪等業務委託契約書（別紙・別表1つき）を入力フォームから作り、A4のPDFで保存するWebアプリです。

- 発注者・請負者・契約期間（和暦で自動表示）・現場情報・単価表を入力
- 入力内容はその場でA4プレビューに反映（プレビューとPDFは同じレイアウト）
- PDFは文字が選択できるベクター形式（pdf-lib + Noto Serif CJK JP の部分埋め込み）
- 契約書データをサーバーに保存し、「見る」「編集」で呼び出し可能

## 動作環境

- **claude.ai のアーティファクト**: PDFの保存とサーバー保存に `window.claude` の `downloads` / `db` を使います。
- **Vercel**: PDFはブラウザの標準ダウンロードで保存します。サーバー保存は `api/contracts.js` が
  Vercel Blob（非公開ストア）に JSON で保存します。ストアをプロジェクトに接続すると環境変数 `BLOB_READ_WRITE_TOKEN` が入ります。
  APIに独自の認証はなく、公開範囲は Vercel の Deployment Protection（チームメンバーのみ）に任せています。
  保護を外して公開する場合は、先に認証を追加してください。
- **API が無い環境**（GitHub Pages など）: 入力・プレビュー・PDF保存は動き、「保存した契約書」欄は出ません。

## 構成

| パス | 内容 |
|---|---|
| `index.html` | フォントを埋め込んだ完成版（約4MB）。`tools/build.py` で作る |
| `api/contracts.js` | 契約書の保存API（Vercel Blob） |
| `src/app.src.html` | フォント部分をプレースホルダーにした編集用ソース |
| `tools/mkfont_regular.py`, `tools/mkfont_bold.py` | Noto Serif CJK JP からJIS X 0208範囲を切り出してTTF化 |
| `tools/build.py` | ソースにフォントを埋め込んで `index.html` を作成 |

## ビルド

```
python3 tools/mkfont_regular.py /usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc 0 fonts/serif-regular.ttf
python3 tools/mkfont_bold.py    /usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc    0 fonts/serif-bold.ttf
python3 tools/build.py
```

`fonttools` が必要です。`fonts/` は生成物のためコミットしません。フォントは SIL Open Font License 1.1 の Noto Serif CJK JP を使用しています。
