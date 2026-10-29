"""src/app.src.html にフォントを埋め込み、単体のWebページとして index.html を作る。
先に tools/mkfont_*.py で fonts/serif-regular.ttf と fonts/serif-bold.ttf を作っておく。
src/app.src.html は claude.ai のアーティファクト用の断片なので、ここで doctype・charset・viewport などを補う。
"""
import base64, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "src/app.src.html").read_text(encoding="utf-8")
reg = base64.b64encode((root / "fonts/serif-regular.ttf").read_bytes()).decode()
bold = base64.b64encode((root / "fonts/serif-bold.ttf").read_bytes()).decode()
head = ('<!doctype html><html lang="ja"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>body{margin:0}[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>\n')
(root / "index.html").write_text(head + src.replace("__FONT_REG__", reg).replace("__FONT_BOLD__", bold) + "</html>\n", encoding="utf-8")
print("index.html を作成しました")
