"""Grok Council smoke test. Run: python3 tests/smoke_test.py"""
import json, os, re, socket, subprocess, sys, time, urllib.request
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(HERE, "dist", "grok-council.html")
LINES, RES = [], []

def log(s):
    print(s, flush=True)
    LINES.append(s)

def check(ok, msg):
    RES.append(bool(ok))
    log(("PASS " if ok else "FAIL ") + msg)

log(f"Grok Council smoke test · {time.strftime('%Y-%m-%d %H:%M %Z')}")
subprocess.run([sys.executable, os.path.join(HERE, "build.py")], check=True, capture_output=True)
html = open(DIST, encoding="utf-8").read()
check(os.path.getsize(DIST) > 8000, f"offline snapshot built ({os.path.getsize(DIST):,} bytes)")

srcs = {
    f: open(os.path.join(HERE, "web", f), encoding="utf-8").read()
    for f in os.listdir(os.path.join(HERE, "web"))
    if f.endswith((".js", ".css", ".html"))
}
ext = [m for t in [html, *srcs.values()] for m in re.findall(r"https?://[^\s'\"<>)]+", t)]
ext = [e for e in ext if not e.startswith("http://127.0.0.1")]
check(not ext, f"no external http(s) references in dist or web/ ({ext[:3]})")
check(
    not re.search(
        r"<script[^>]+src=|<link[^>]+href=\"(?!data:)|@import\b|url\((?!['\"]?(?:data:|#))",
        html,
    ),
    "snapshot has no external script/link/import/url() refs",
)
check("GC_MOCK" in html and "window.GC" in html and "--grok" in html,
      "snapshot inlines mock.js, app.js and style.css")
check("Grok Council" in html, "title/brand present")
check("Start Debate" in html, "Start Debate button present")

mock = open(os.path.join(HERE, "web", "mock.js"), encoding="utf-8").read()
seeds_block = re.search(r"seeds:\s*\[(.*?)\]", mock, re.S)
n_seeds = len(re.findall(r'"[^"]+"', seeds_block.group(1))) if seeds_block else 0
check(n_seeds >= 6, f"at least 6 seed questions ({n_seeds})")
check("localStorage" in html and "grok-council-history" in html, "history persists via localStorage")
check(all(s in html for s in ("Position", "Rebut / refine", "Synthesis", "Round ${n}")),
      "debate round labels present in app logic")
check(all(s in html for s in ("runDebate", "scoreDebate", "pickTopic", "GC_MOCK", "window.GC")),
      "core JS symbols present")

def free(p):
    with socket.socket() as s:
        return s.connect_ex(("127.0.0.1", p)) != 0

port = 4271 if free(4271) else 42719
srv = subprocess.Popen(
    [sys.executable, os.path.join(HERE, "server.py")],
    env={**os.environ, "GC_PORT": str(port)},
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)
try:
    body = health = snap = None
    for _ in range(40):
        try:
            body = urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=2).read().decode()
            health = urllib.request.urlopen(f"http://127.0.0.1:{port}/health", timeout=2).read().decode()
            snap = urllib.request.urlopen(
                f"http://127.0.0.1:{port}/dist/grok-council.html", timeout=2
            ).read().decode()
            break
        except Exception:
            time.sleep(0.15)
    check(bool(body) and "Grok Council" in (body or ""), f"server.py serves web/ on 127.0.0.1:{port}")
    ok_health = False
    try:
        ok_health = bool(health) and json.loads(health).get("ok") is True and "grok-council" in health
    except Exception:
        ok_health = bool(health) and "ok" in (health or "") and "grok-council" in (health or "")
    check(ok_health, f"health endpoint ok")
    check(snap == html, "server serves matching dist snapshot")
finally:
    srv.terminate()
    try:
        srv.wait(timeout=2)
    except Exception:
        srv.kill()

shots = os.path.join(HERE, "screenshots")
have = [f for f in os.listdir(shots) if f.endswith(".png")] if os.path.isdir(shots) else []
check(any(h.startswith("00-best") for h in have), f"best screenshot present ({have})")

n, p = len(RES), sum(RES)
log(f"RESULT: {p}/{n} checks passed" + ("" if p == n else f" ({n - p} FAILED)"))
open(os.path.join(HERE, "tests", "smoke-test.log"), "w").write("\n".join(LINES) + "\n")
sys.exit(0 if p == n else 1)
