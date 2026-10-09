// Capture 00-best-home.png via headless Chrome CDP
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const prof = mkdtempSync(join(tmpdir(), "gccdp-"));
const proc = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--mute-audio",
  "--no-first-run", "--remote-debugging-port=0", `--user-data-dir=${prof}`,
  "--window-size=1440,1100", "about:blank",
], { stdio: "ignore" });

let target;
for (let i = 0; i < 160 && !target; i++) {
  await sleep(200);
  try {
    const [port] = readFileSync(join(prof, "DevToolsActivePort"), "utf8").trim().split("\n");
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    target = list.find((t) => t.type === "page");
  } catch {}
}
if (!target) { proc.kill(); throw new Error("chrome did not start"); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.addEventListener("open", r); ws.addEventListener("error", j); });
let id = 0;
const pending = new Map();
ws.addEventListener("message", (m) => {
  const j = JSON.parse(m.data);
  if (j.id && pending.has(j.id)) { pending.get(j.id)(j); pending.delete(j.id); }
});
const send = (method, params = {}) => new Promise((r) => {
  const i = ++id; pending.set(i, (j) => r(j.result || {}));
  ws.send(JSON.stringify({ id: i, method, params }));
});
await send("Runtime.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://127.0.0.1:4271/" });
await sleep(900);
const evalResult = await send("Runtime.evaluate", {
  expression: `(() => {
    document.getElementById("drawer").hidden = true;
    const q = "Should I run local LLMs for fleet bots, or stick with cloud?";
    document.getElementById("question").value = q;
    const topic = GC.pickTopic(q);
    const bank = topic.bank || GC_MOCK.fallback;
    ["grok","claude","codex"].forEach(m => {
      const stream = document.getElementById("stream-" + m);
      stream.innerHTML = "";
      const lines = [bank[m].r1, bank[m].r2, bank[m].r3];
      const labels = {1:"Position",2:"Rebut / refine",3:"Synthesis"};
      lines.forEach((t,i) => {
        const div = document.createElement("div");
        div.className = "round";
        div.innerHTML = '<span class="rlabel">Round ' + (i+1) + ' · ' + labels[i+1] + '</span><p></p>';
        div.querySelector("p").textContent = t;
        stream.appendChild(div);
      });
    });
    document.getElementById("consensus").textContent =
      "Run a hybrid setup: local for high-volume routine work, cloud for hard calls, with explicit escalation rules and a one-family pilot.";
    document.getElementById("scores").innerHTML =
      '<div class="score"><span class="k">Clarity</span><span class="v">86%</span></div>' +
      '<div class="score"><span class="k">Agreement</span><span class="v">72%</span></div>' +
      '<div class="score win"><span class="k">Frame won by</span><span class="v">Codex</span></div>' +
      '<div class="score"><span class="k">Dissent</span><span class="v" style="font-size:0.85rem;font-weight:500">Claude wants a slower pilot; Grok wants hybrid now.</span></div>';
    document.getElementById("final").hidden = false;
    document.getElementById("final").scrollIntoView({ block: "end" });
    return document.title + "|" + !!document.getElementById("final") + "|" + document.querySelectorAll(".round").length;
  })()`,
  returnByValue: true,
});
console.log("eval", evalResult);
await sleep(500);
// Capture full page height roughly via clip of viewport showing ask + cards + consensus
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
const out = join(ROOT, "screenshots", "00-best-home.png");
writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log("wrote", out, Buffer.from(shot.data, "base64").length, "bytes");
ws.close();
proc.kill();
await sleep(300);
rmSync(prof, { recursive: true, force: true });
