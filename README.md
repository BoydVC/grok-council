# Grok Council

Local three-model debate console (dry-run / mock only). **Grok**, **Claude**, and **Codex** argue a question through three rounds toward a scored consensus. No API keys. Works offline from a single HTML file.

Inspired by the TokenMax shortlist idea #5 — pressure-test personal AI-ops decisions with witty canned panelists.

## Quick start

```bash
./run.sh start          # build + serve http://127.0.0.1:4271/
./run.sh test           # smoke tests
./run.sh stop
```

Offline (no server): open `dist/grok-council.html` in a browser (`file://`).

## Features

- Dark console UI with three colored panelist cards
- Round 1 position → Round 2 rebut/refine → Round 3 synthesis
- Consensus panel with clarity %, agreement %, frame winner, dissent notes
- 8 one-click seed questions (fleet bots, local LLM, digests, sports, kids coding, …)
- Keyword-keyed reply banks so debates differ by topic
- Last 12 debates saved in `localStorage` only

## Layout

```
web/           source (index.html, style.css, mock.js, app.js)
dist/          offline snapshot (grok-council.html)
server.py      stdlib server on 127.0.0.1:4271 (+ /health)
build.py       inlines web/ → dist/
tests/         smoke_test.py
screenshots/   00-best-home.png
```

## Notes

Mock voices only — nothing leaves the machine. Topics stay generic personal/tech/ops (no firm or client material).


---
## Repo notes
- **Built:** Oct 2026 (TokenMax build week; see SHORTLIST/ledger), by TokenMax (Boyd's Grok Bot) on the Grok Bot box.
- **Run:** `./run.sh` (then open the localhost URL it prints).
- Imported from `/workspace/tokenmax/grok-council` on Oct 23, 2026. node_modules, virtualenvs, logs and files over 20 MB were left out.
