# 除雪契約書メーカー

除雪等業務委託契約書（別紙・別表1つき）を入力フォームから作り、A4のPDFで保存するWebアプリです。

- 発注者・請負者・契約期間（和暦で自動表示）・現場情報・単価表を入力
- 入力内容はその場でA4プレビューに反映（プレビューとPDFは同じレイアウト）
- PDFは文字が選択できるベクター形式（pdf-lib + Noto Serif CJK JP の部分埋め込み）
- 契約書データをサーバーに保存し、「見る」「編集」で呼び出し可能

## 動作環境

- **claude.ai のアーティファクト**: PDFの保存とサーバー保存（`window.claude` の `downloads` / `db`）を使います。
- **Vercel・GitHub Pagesなど一般のWeb**: 入力・プレビュー・PDF保存（ブラウザの標準ダウンロード）は動きます。
  サーバー保存は保存先がないため、「保存した契約書」欄は表示されません。入力内容はそのブラウザにだけ自動保存されます。

## 構成

| パス | 内容 |
|---|---|
| `index.html` | フォントを埋め込んだ完成版（約4MB） |
| `src/app.src.html` | フォント部分をプレースホルダーにした編集用ソース |
| `tools/mkfont_regular.py`, `tools/mkfont_bold.py` | Noto Serif CJK JP からJIS X 0208範囲を切り出してTTF化 |
| `tools/build.py` | ソースにフォントを埋め込んで `index.html` を作成 |

## ビルド

```
python3 tools/mkfont_regular.py /usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc 0 fonts/serif-regular.ttf
python3 tools/mkfont_bold.py    /usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc    0 fonts/serif-bold.ttf
python3 tools/build.py
```

`fonttools` が必要です。フォントは SIL Open Font License 1.1 の Noto Serif CJK JP を使用しています。
