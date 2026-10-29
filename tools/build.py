"""src/app.src.html にフォントを埋め込んで index.html を作る。
先に tools/mkfont_*.py で fonts/serif-regular.ttf と fonts/serif-bold.ttf を作っておく。
"""
import base64, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "src/app.src.html").read_text(encoding="utf-8")
reg = base64.b64encode((root / "fonts/serif-regular.ttf").read_bytes()).decode()
bold = base64.b64encode((root / "fonts/serif-bold.ttf").read_bytes()).decode()
(root / "index.html").write_text(src.replace("__FONT_REG__", reg).replace("__FONT_BOLD__", bold), encoding="utf-8")
print("index.html を作成しました")
