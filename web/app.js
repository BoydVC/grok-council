/** Grok Council — client-side mock debate console */
(function () {
  const MODELS = ["grok", "claude", "codex"];
  const LABELS = { grok: "Grok", claude: "Claude", codex: "Codex" };
  const STORE_KEY = "grok-council-history-v1";
  const MAX_HIST = 12;

  const $ = (id) => document.getElementById(id);
  const qEl = $("question");
  const btnStart = $("btn-start");
  const seedsEl = $("seeds");
  const finalEl = $("final");
  const consensusEl = $("consensus");
  const scoresEl = $("scores");
  const drawer = $("drawer");
  const histList = $("hist-list");

  let busy = false;

  function loadHist() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); }
    catch (_) { return []; }
  }
  function saveHist(entries) {
    localStorage.setItem(STORE_KEY, JSON.stringify(entries.slice(0, MAX_HIST)));
  }

  function pickTopic(q) {
    const lower = (q || "").toLowerCase();
    const topics = window.GC_MOCK.topics;
    for (const [name, t] of Object.entries(topics)) {
      if (t.keys.some((k) => lower.includes(k))) return { name, bank: t };
    }
    return { name: "general", bank: null };
  }

  function linesFor(topic, model) {
    const src = topic.bank ? topic.bank[model] : window.GC_MOCK.fallback[model];
    return [src.r1, src.r2, src.r3];
  }

  function clearStreams() {
    MODELS.forEach((m) => {
      const el = $("stream-" + m);
      el.innerHTML = "";
    });
  }

  function addRound(model, n, text, typing) {
    const el = $("stream-" + model);
    const div = document.createElement("div");
    div.className = "round" + (typing ? " typing" : "");
    div.dataset.round = String(n);
    const labels = { 1: "Position", 2: "Rebut / refine", 3: "Synthesis" };
    div.innerHTML = `<span class="rlabel">Round ${n} · ${labels[n]}</span><p></p>`;
    div.querySelector("p").textContent = text;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
    return div;
  }

  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  async function typeInto(div, text) {
    const p = div.querySelector("p");
    p.textContent = "";
    div.classList.add("typing");
    const step = Math.max(8, Math.min(22, Math.floor(800 / Math.max(text.length, 1))));
    for (let i = 0; i < text.length; i++) {
      p.textContent = text.slice(0, i + 1);
      if (i % 3 === 0) await sleep(step);
    }
    div.classList.remove("typing");
  }

  function scoreDebate(question, topic, transcripts) {
    // Simple local scoring: clarity from length band, agreement from shared keywords, dissent notes
    const words = (s) => (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    const sets = MODELS.map((m) => new Set(words(transcripts[m].join(" "))));
    let shared = 0, total = 0;
    const all = new Set([...sets[0], ...sets[1], ...sets[2]]);
    all.forEach((w) => {
      if (w.length < 4) return;
      total++;
      const hits = sets.filter((s) => s.has(w)).length;
      if (hits >= 2) shared++;
    });
    const agreement = total ? Math.round((shared / total) * 100) : 55;
    const clarity = Math.min(98, 62 + Math.round(question.length / 12) + (topic.name !== "general" ? 12 : 0));
    // "Winner" = model whose r3 mentions consensus/vote/ship first-ish; slight personality bias by topic
    const bias = {
      local_llm: "codex", digest: "claude", sports: "grok", kids_code: "grok",
      tokenmax: "codex", bot_island: "claude", paging: "claude", skill_test: "codex", general: "claude"
    };
    const winner = bias[topic.name] || "claude";
    const dissent = [];
    if (agreement < 70) dissent.push("Panel split on pace vs caution.");
    if (topic.name === "local_llm") dissent.push("Claude wants a slower pilot; Grok wants hybrid now.");
    if (topic.name === "paging") dissent.push("Sports logistics may feel P1 even when systems are fine.");
    if (!dissent.length) dissent.push("Minor tone differences only — substance aligned.");
    const consensusMap = {
      local_llm: "Run a hybrid setup: local for high-volume routine work, cloud for hard calls, with explicit escalation rules and a one-family pilot.",
      digest: "Ship one weekday morning digest (capped sections) plus an interrupt channel for true surprises — not three competing briefings.",
      sports: "Use one sports desk with a priority game focus and a live strip; modes for Sunday vs midweek, kept local/read-only first.",
      kids_code: "Prebake two finishable Saturday starters (file:// HTML/JS) with fridge checklists — toys that ship, not platforms.",
      tokenmax: "Pace Grok Bot pool to a straight-line target with small self-contained builds; wrap up early; polish-only near reset.",
      bot_island: "Keep the island as a glance layer, freeze feature creep, and track whether it actually gets opened.",
      paging: "Adopt a severity ladder and quiet hours: page for P0/P1 surprises, digest the rest.",
      skill_test: "Stage trust: fixtures → supervised evening → overnight only if blast radius is draft/local and allowlists hold.",
      general: "Run the smallest reversible pilot with a written abort metric, then decide — avoid clever irreversible bets."
    };
    return {
      clarity,
      agreement,
      winner,
      dissent: dissent.join(" "),
      consensus: consensusMap[topic.name] || consensusMap.general
    };
  }

  function renderScores(s) {
    scoresEl.innerHTML = `
      <div class="score"><span class="k">Clarity</span><span class="v">${s.clarity}%</span></div>
      <div class="score"><span class="k">Agreement</span><span class="v">${s.agreement}%</span></div>
      <div class="score win"><span class="k">Frame won by</span><span class="v">${LABELS[s.winner]}</span></div>
      <div class="score"><span class="k">Dissent</span><span class="v" style="font-size:0.85rem;font-weight:500">${s.dissent}</span></div>`;
  }

  async function runDebate(question) {
    if (busy) return;
    const q = (question || "").trim();
    if (!q) { qEl.focus(); return; }
    busy = true;
    btnStart.disabled = true;
    finalEl.hidden = true;
    clearStreams();
    MODELS.forEach((m) => {
      $("stream-" + m).innerHTML = `<p class="idle">Thinking…</p>`;
    });

    const topic = pickTopic(q);
    const transcripts = { grok: [], claude: [], codex: [] };

    for (let round = 1; round <= 3; round++) {
      for (const m of MODELS) {
        const lines = linesFor(topic, m);
        const text = lines[round - 1];
        transcripts[m].push(text);
        const stream = $("stream-" + m);
        if (round === 1) stream.innerHTML = "";
        const div = addRound(m, round, "", true);
        await typeInto(div, text);
        await sleep(120);
      }
      await sleep(180);
    }

    const scored = scoreDebate(q, topic, transcripts);
    consensusEl.textContent = scored.consensus;
    renderScores(scored);
    finalEl.hidden = false;

    const entry = {
      ts: Date.now(),
      question: q,
      topic: topic.name,
      consensus: scored.consensus,
      clarity: scored.clarity,
      agreement: scored.agreement,
      winner: scored.winner,
      dissent: scored.dissent,
      transcripts
    };
    const hist = loadHist();
    hist.unshift(entry);
    saveHist(hist);

    busy = false;
    btnStart.disabled = false;
    finalEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderSeeds() {
    seedsEl.innerHTML = "";
    (window.GC_MOCK.seeds || []).forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "seed";
      b.textContent = s.length > 64 ? s.slice(0, 62) + "…" : s;
      b.title = s;
      b.addEventListener("click", () => { qEl.value = s; qEl.focus(); });
      seedsEl.appendChild(b);
    });
  }

  function openHistory() {
    const hist = loadHist();
    histList.innerHTML = "";
    if (!hist.length) {
      histList.innerHTML = `<li><div class="q">No debates yet</div><div class="meta">Run one and it will show up here.</div></li>`;
    } else {
      hist.forEach((h, i) => {
        const li = document.createElement("li");
        const when = new Date(h.ts).toLocaleString();
        li.innerHTML = `<div class="q">${escapeHtml(h.question)}</div>
          <div class="meta">${when} · agree ${h.agreement}% · frame ${LABELS[h.winner] || h.winner}</div>`;
        li.addEventListener("click", () => replay(h));
        histList.appendChild(li);
      });
    }
    drawer.hidden = false;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function replay(h) {
    drawer.hidden = true;
    qEl.value = h.question;
    clearStreams();
    MODELS.forEach((m) => {
      const stream = $("stream-" + m);
      stream.innerHTML = "";
      (h.transcripts[m] || []).forEach((t, i) => addRound(m, i + 1, t, false));
    });
    consensusEl.textContent = h.consensus;
    renderScores(h);
    finalEl.hidden = false;
  }

  // Expose for smoke tests / console
  window.GC = {
    start: () => runDebate(qEl.value),
    pickTopic,
    loadHist,
    MODELS,
    version: "1.0.0"
  };

  btnStart.addEventListener("click", () => runDebate(qEl.value));
  $("btn-history").addEventListener("click", openHistory);
  $("btn-close-hist").addEventListener("click", () => { drawer.hidden = true; });
  drawer.addEventListener("click", (e) => { if (e.target === drawer) drawer.hidden = true; });
  qEl.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runDebate(qEl.value);
  });

  renderSeeds();
})();
