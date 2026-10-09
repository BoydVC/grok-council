"""Inline web/ into one self-contained offline file: dist/grok-council.html"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
W = os.path.join(HERE, "web")
html = open(os.path.join(W, "index.html"), encoding="utf-8").read()
css = open(os.path.join(W, "style.css"), encoding="utf-8").read()
html = html.replace('<link rel="stylesheet" href="style.css">', "<style>\n" + css + "\n</style>")
for js in ("mock.js", "app.js"):
    src = open(os.path.join(W, js), encoding="utf-8").read().replace("</script", "<\\/script")
    html = html.replace(f'<script src="{js}"></script>', "<script>\n" + src + "\n</script>")
assert 'src="' not in html and 'href="style' not in html
os.makedirs(os.path.join(HERE, "dist"), exist_ok=True)
out = os.path.join(HERE, "dist", "grok-council.html")
open(out, "w", encoding="utf-8").write(html)
print(f"wrote {out} ({os.path.getsize(out):,} bytes)")
