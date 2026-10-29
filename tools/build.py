"""src/app.src.html から単体Webページ private/app.html を作る。
- フォントは埋め込まず、public/fonts/*.ttf を実行時に読み込む（関数の応答サイズ上限を避けるため）。
- public/fonts/*.ttf は tools/mkfont_*.py で作る。
- src/app.src.html は claude.ai のアーティファクト用の断片なので、doctype・charset・viewport などをここで補う。
"""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "src/app.src.html").read_text(encoding="utf-8")
head = ('<!doctype html><html lang="ja"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<meta name="robots" content="noindex">'
        '<style>body{margin:0}[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>'
        '<script>window.__FONT_URLS={reg:"/fonts/serif-regular.ttf",bold:"/fonts/serif-bold.ttf"};</script>\n')
out = src.replace("__FONT_REG__", "").replace("__FONT_BOLD__", "")
(root / "private/app.html").write_text(head + out + "</html>\n", encoding="utf-8")
print("private/app.html を作成しました")
