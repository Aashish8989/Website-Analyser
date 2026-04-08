/* ═══════════════════════════════════════════════
   WebGuard — App Logic + Particle System
   ═══════════════════════════════════════════════ */

const API_BASE = "http://localhost:5000";

// ════════════════════════════════════════════════
// CUSTOM CURSOR
// ════════════════════════════════════════════════
const cursorDot  = document.getElementById("cursorDot");
const cursorRing = document.getElementById("cursorRing");

let mouseX = window.innerWidth  / 2;
let mouseY = window.innerHeight / 2;
let ringX  = mouseX, ringY = mouseY;

document.addEventListener("mousemove", e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursorDot.style.left = mouseX + "px";
  cursorDot.style.top  = mouseY + "px";
});

(function ringFollow() {
  ringX += (mouseX - ringX) * 0.13;
  ringY += (mouseY - ringY) * 0.13;
  cursorRing.style.left = ringX + "px";
  cursorRing.style.top  = ringY + "px";
  requestAnimationFrame(ringFollow);
})();

// Cursor hover expand
document.addEventListener("mouseover", e => {
  if (e.target.closest("button, a, input, .hint-chip, .feature-card, .stat-box, .mod-card, .split-card")) {
    cursorDot.style.transform  = "translate(-50%,-50%) scale(1.8)";
    cursorRing.style.transform = "translate(-50%,-50%) scale(1.6)";
    cursorRing.style.borderColor = "#7C3AED";
    cursorDot.style.background   = "#7C3AED";
    cursorDot.style.boxShadow    = "0 0 10px rgba(124,58,237,0.6)";
  }
});
document.addEventListener("mouseout", e => {
  if (e.target.closest("button, a, input, .hint-chip, .feature-card, .stat-box, .mod-card, .split-card")) {
    cursorDot.style.transform  = "translate(-50%,-50%) scale(1)";
    cursorRing.style.transform = "translate(-50%,-50%) scale(1)";
    cursorRing.style.borderColor = "#4F46E5";
    cursorDot.style.background   = "#4F46E5";
    cursorDot.style.boxShadow    = "0 0 6px rgba(79,70,229,0.5)";
  }
});

// ════════════════════════════════════════════════
// PARTICLE CANVAS (white bg — colored dots)
// ════════════════════════════════════════════════
const pc  = document.getElementById("particleCanvas");
const pctx = pc.getContext("2d");
let W = pc.width  = window.innerWidth;
let H = pc.height = window.innerHeight;
window.addEventListener("resize", () => { W = pc.width = window.innerWidth; H = pc.height = window.innerHeight; });

const COLORS = [
  "rgba(79,70,229,",   // indigo
  "rgba(124,58,237,",  // violet
  "rgba(6,182,212,",   // cyan
  "rgba(16,185,129,",  // emerald
  "rgba(245,158,11,",  // amber
  "rgba(244,63,94,",   // rose
  "rgba(168,85,247,",  // purple
];

class Dot {
  constructor() { this.init(); }
  init() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.55;
    this.vy = (Math.random() - 0.5) * 0.55;
    this.r  = Math.random() * 3 + 1.5;
    this.col = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.baseA = Math.random() * 0.28 + 0.1;
    this.a = this.baseA;
    this.isStar = Math.random() < 0.08;
  }
  update() {
    const dx = this.x - mouseX, dy = this.y - mouseY;
    const d  = Math.sqrt(dx * dx + dy * dy);
    const REPEL = 110;
    if (d < REPEL) {
      const f = (REPEL - d) / REPEL;
      this.vx += (dx / d) * f * 0.55;
      this.vy += (dy / d) * f * 0.55;
      this.a = Math.min(0.85, this.baseA + f * 0.55);
    } else {
      this.a += (this.baseA - this.a) * 0.06;
    }
    this.vx *= 0.985; this.vy *= 0.985;
    this.x  += this.vx; this.y += this.vy;
    if (this.x < 0)  { this.x = 0;  this.vx *= -1; }
    if (this.x > W)  { this.x = W;  this.vx *= -1; }
    if (this.y < 0)  { this.y = 0;  this.vy *= -1; }
    if (this.y > H)  { this.y = H;  this.vy *= -1; }
  }
  draw() {
    pctx.save();
    pctx.fillStyle = this.col + this.a + ")";
    if (this.isStar) {
      drawStar5(pctx, this.x, this.y, this.r * 2.2, this.r * 0.9);
    } else {
      pctx.beginPath();
      pctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      pctx.shadowBlur  = 8;
      pctx.shadowColor = this.col + "0.3)";
    }
    pctx.fill();
    pctx.restore();
  }
}

function drawStar5(ctx, cx, cy, outer, inner) {
  const spikes = 5;
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outer);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer); rot += step;
    ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner); rot += step;
  }
  ctx.closePath();
}

// Cursor trail
const trail = [];
let lastTrail = 0;
document.addEventListener("mousemove", e => {
  const now = Date.now();
  if (now - lastTrail > 35) {
    trail.push({ x: e.clientX, y: e.clientY, a: 0.7, r: Math.random() * 5 + 2, col: COLORS[Math.floor(Math.random() * COLORS.length)] });
    if (trail.length > 20) trail.shift();
    lastTrail = now;
  }
});

const DOTS = Array.from({ length: 80 }, () => new Dot());
const CONN = 120;

function drawConnections() {
  for (let i = 0; i < DOTS.length; i++) {
    for (let j = i + 1; j < DOTS.length; j++) {
      const dx = DOTS[i].x - DOTS[j].x, dy = DOTS[i].y - DOTS[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < CONN) {
        pctx.beginPath();
        pctx.moveTo(DOTS[i].x, DOTS[i].y);
        pctx.lineTo(DOTS[j].x, DOTS[j].y);
        pctx.strokeStyle = `rgba(79,70,229,${(1 - d / CONN) * 0.14})`;
        pctx.lineWidth = 0.8;
        pctx.stroke();
      }
    }
  }
}

function drawTrail() {
  trail.forEach(t => {
    t.a *= 0.86;
    if (t.a < 0.03) return;
    pctx.beginPath();
    pctx.arc(t.x, t.y, t.r * t.a, 0, Math.PI * 2);
    pctx.fillStyle = t.col + (t.a * 0.5) + ")";
    pctx.shadowBlur  = 10;
    pctx.shadowColor = t.col + "0.4)";
    pctx.fill();
    pctx.shadowBlur = 0;
  });
}

(function loop() {
  pctx.clearRect(0, 0, W, H);
  drawConnections();
  DOTS.forEach(d => { d.update(); d.draw(); });
  drawTrail();
  requestAnimationFrame(loop);
})();

// ════════════════════════════════════════════════
// STEP HELPERS
// ════════════════════════════════════════════════
const STEPS = ["step-fetch","step-content","step-structure","step-behavior","step-risk"];
const STEP_DELAYS = [200,700,1400,2100,2700];

function resetSteps() {
  STEPS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = "step-pill";
  });
}

function simulateSteps() {
  STEPS.forEach((id, i) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.className = "step-pill is-active";
    }, STEP_DELAYS[i]);
    if (i < STEPS.length - 1) {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) { el.className = "step-pill is-done"; el.querySelector(".sp-ico").textContent = "✅"; }
      }, STEP_DELAYS[i + 1] - 80);
    }
  });
}

// ════════════════════════════════════════════════
// ANALYZE
// ════════════════════════════════════════════════
async function analyzeWebsite(e) {
  e.preventDefault();
  const urlInput = document.getElementById("urlInput");
  const url = urlInput.value.trim();
  if (!url) { urlInput.focus(); shake(document.getElementById("searchBar")); return; }

  setUIState("loading", url);
  simulateSteps();

  try {
    const res  = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    await sleep(900);

    if (!res.ok || data.error) { setUIState("error", data.error || "Analysis failed."); return; }
    setUIState("results");
    renderResults(data);
  } catch {
    await sleep(500);
    setUIState("error", "Cannot connect to the analysis server. Make sure Flask is running on port 5000.");
  }
}

// ════════════════════════════════════════════════
// UI STATE
// ════════════════════════════════════════════════
function setUIState(state, extra = "") {
  const hero     = document.querySelector(".hero-section");
  const featSec  = document.querySelector(".features-section");
  const progress = document.getElementById("progressSection");
  const error    = document.getElementById("errorSection");
  const results  = document.getElementById("resultsSection");

  // Hide all
  [hero, featSec, progress, error, results].forEach(el => { if (el) el.style.display = "none"; });

  if (state === "loading") {
    progress.style.display = "block";
    document.getElementById("progressUrl").textContent = extra;
    resetSteps();
  } else if (state === "error") {
    error.style.display = "block";
    document.getElementById("errorMsg").textContent = extra;
  } else if (state === "results") {
    results.style.display = "block";
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    // show home
    if (hero)    hero.style.display    = "block";
    if (featSec) featSec.style.display = "block";
  }
}

function resetForm() {
  document.getElementById("urlInput").value = "";
  setUIState("home");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ════════════════════════════════════════════════
// RENDER RESULTS
// ════════════════════════════════════════════════
function renderResults(data) {
  const { url, page_title, content, structure, behavior, risk } = data;

  // Site bar
  document.getElementById("siteTitle").textContent = page_title || "Unknown Page";
  document.getElementById("siteUrl").textContent   = url;
  try {
    const domain = new URL(url).hostname;
    document.getElementById("faviconWrapper").innerHTML =
      `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=32" alt="" onerror="this.parentNode.textContent='🌐'"/>`;
  } catch { document.getElementById("faviconWrapper").textContent = "🌐"; }

  // Gauge + counter
  animateGauge(risk.trust_score, risk.risk_color);
  animateCounter(document.getElementById("gaugeScore"), risk.trust_score, 1500);

  // Risk pill
  const riskEl = document.getElementById("riskBadge");
  riskEl.className = `risk-pill risk-${risk.risk_color}`;
  riskEl.textContent = `${riskIcon(risk.risk_color)} ${risk.risk_level} Risk`;

  // Recommendation
  document.getElementById("trustRecommendation").textContent = risk.recommendation;

  // Bars
  animateBar("contentBarFill",   "contentBarPct",   risk.breakdown.content);
  animateBar("structureBarFill", "structureBarPct", risk.breakdown.structure);
  animateBar("behaviorBarFill",  "behaviorBarPct",  risk.breakdown.behavior);

  // Issues
  document.getElementById("issuesList").innerHTML = risk.all_issues.length
    ? risk.all_issues.map(i => `<li>${escHtml(i)}</li>`).join("")
    : `<li class="empty-state">🎉 No issues detected!</li>`;

  // Strengths
  document.getElementById("strengthsList").innerHTML = risk.strengths.length
    ? risk.strengths.map(s => `<li>${escHtml(s)}</li>`).join("")
    : `<li class="empty-state">No trust signals found</li>`;

  // Content module
  const cs = content.content_score;
  document.getElementById("contentModuleScore").innerHTML = `<span style="color:${sc(cs)}">${cs}</span><span style="font-size:0.9rem;color:#9CA3AF">/100</span>`;
  document.getElementById("contentMetrics").innerHTML = [
    mr("Quality",       content.content_quality,        qc(content.content_quality)),
    mr("Spam Keywords", content.spam_count,             content.spam_count > 5 ? "warn" : "ok"),
    mr("Ad Signals",    content.ad_signals,             content.ad_signals > 5 ? "warn" : "ok"),
    mr("Word Count",    content.word_count,             content.word_count < 50 ? "warn" : "ok"),
    mr("Text Ratio",    content.text_ratio + "%",       content.text_ratio < 5 ? "warn" : "ok"),
  ].join("");

  // Structure module
  const ss = structure.structure_score;
  document.getElementById("structureModuleScore").innerHTML = `<span style="color:${sc(ss)}">${ss}</span><span style="font-size:0.9rem;color:#9CA3AF">/100</span>`;
  document.getElementById("structureMetrics").innerHTML = [
    mr("HTTPS",          structure.has_https ? "✓ Yes" : "✗ No",            structure.has_https ? "ok" : "bad"),
    mr("Contact Page",   structure.has_contact ? "✓ Found" : "✗ Missing",   structure.has_contact ? "ok" : "warn"),
    mr("Privacy Policy", structure.has_privacy ? "✓ Found" : "✗ Missing",   structure.has_privacy ? "ok" : "warn"),
    mr("Navigation",     structure.has_nav ? "✓ Present" : "✗ Missing",     structure.has_nav ? "ok" : "warn"),
    mr("Suspicious TLD", structure.has_suspicious_tld ? "⚠ Yes" : "✓ No",  structure.has_suspicious_tld ? "bad" : "ok"),
  ].join("");

  // Behavior module
  const bs = behavior.behavior_score;
  document.getElementById("behaviorModuleScore").innerHTML = `<span style="color:${sc(bs)}">${bs}</span><span style="font-size:0.9rem;color:#9CA3AF">/100</span>`;
  document.getElementById("behaviorMetrics").innerHTML = [
    mr("Load Time",    behavior.load_time_ms + " ms",                behavior.load_time_ms > 3000 ? "warn" : "ok"),
    mr("Redirects",    behavior.redirect_count,                     behavior.redirect_count > 3 ? "bad" : behavior.redirect_count > 1 ? "warn" : "ok"),
    mr("HTTP Status",  behavior.final_status,                       behavior.final_status === 200 ? "ok" : "warn"),
    mr("Meta Refresh", behavior.has_meta_refresh ? "⚠ Yes" : "✓ None",   behavior.has_meta_refresh ? "bad" : "ok"),
    mr("Obfusc. JS",   behavior.has_obfuscated_js ? "⚠ Found" : "✓ Clean", behavior.has_obfuscated_js ? "bad" : "ok"),
  ].join("");

  // Redirect chain
  if (behavior.redirect_chain && behavior.redirect_chain.length > 0) {
    document.getElementById("redirectCard").style.display = "block";
    document.getElementById("redirectChain").innerHTML = behavior.redirect_chain.map((s, i) =>
      `<div class="redirect-step">
        <div class="redirect-num">${i+1}</div>
        <div class="redirect-url">${escHtml(s.url)}</div>
        <div class="redirect-status">${s.status}</div>
      </div>`).join("");
  } else {
    document.getElementById("redirectCard").style.display = "none";
  }
}

// ════════════════════════════════════════════════
// GAUGE
// ════════════════════════════════════════════════
function animateGauge(score, colorKey) {
  const c  = document.getElementById("gaugeCanvas");
  const cx2 = c.getContext("2d");
  const cx = c.width / 2, cy = c.height / 2;
  const R = 86, lw = 16;
  const CM = { safe:["#10B981","#34D399"], warning:["#F59E0B","#FBBF24"], danger:["#F43F5E","#FB7185"], critical:["#EF4444","#FCA5A5"] };
  const [c1, c2] = CM[colorKey] || CM.warning;
  const sA = Math.PI * 0.75, tA = Math.PI * 1.5;
  let t0 = null;
  const target = score / 100;

  (function draw(ts) {
    if (!t0) t0 = ts;
    const p = Math.min((ts - t0) / 1500, 1);
    const e = 1 - Math.pow(1 - p, 3);
    const cur = e * target;
    cx2.clearRect(0, 0, c.width, c.height);
    // Track outer (ink)
    cx2.beginPath(); cx2.arc(cx, cy, R, sA, sA + tA);
    cx2.strokeStyle = "rgba(0,0,0,0.1)"; cx2.lineWidth = lw + 4; cx2.lineCap = "round"; cx2.stroke();
    // Track inner (light)
    cx2.beginPath(); cx2.arc(cx, cy, R, sA, sA + tA);
    cx2.strokeStyle = "#E5E7EB"; cx2.lineWidth = lw; cx2.stroke();
    // Fill
    if (cur > 0.01) {
      const eA = sA + tA * cur;
      const g  = cx2.createLinearGradient(cx - R, cy, cx + R, cy);
      g.addColorStop(0, c1); g.addColorStop(1, c2);
      cx2.beginPath(); cx2.arc(cx, cy, R, sA, eA);
      cx2.strokeStyle = g; cx2.lineWidth = lw; cx2.lineCap = "round";
      cx2.shadowBlur = 8; cx2.shadowColor = c1; cx2.stroke(); cx2.shadowBlur = 0;
      // Tip dot
      const tx = cx + R * Math.cos(eA), ty = cy + R * Math.sin(eA);
      cx2.beginPath(); cx2.arc(tx, ty, lw / 2 + 1, 0, Math.PI * 2); cx2.fillStyle = "#111827"; cx2.fill();
      cx2.beginPath(); cx2.arc(tx, ty, lw / 2 - 1, 0, Math.PI * 2); cx2.fillStyle = c2; cx2.fill();
    }
    if (p < 1) requestAnimationFrame(draw);
  })(0);
  requestAnimationFrame(ts => {
    (function draw(ts2) {
      const t0v = ts;
      const p = Math.min((ts2 - t0v) / 1500, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const cur = e * target;
      cx2.clearRect(0, 0, c.width, c.height);
      cx2.beginPath(); cx2.arc(cx, cy, R, sA, sA + tA);
      cx2.strokeStyle = "rgba(0,0,0,0.1)"; cx2.lineWidth = lw + 4; cx2.lineCap = "round"; cx2.stroke();
      cx2.beginPath(); cx2.arc(cx, cy, R, sA, sA + tA);
      cx2.strokeStyle = "#E5E7EB"; cx2.lineWidth = lw; cx2.stroke();
      if (cur > 0.01) {
        const eA = sA + tA * cur;
        const g = cx2.createLinearGradient(cx - R, cy, cx + R, cy);
        g.addColorStop(0, c1); g.addColorStop(1, c2);
        cx2.beginPath(); cx2.arc(cx, cy, R, sA, eA);
        cx2.strokeStyle = g; cx2.lineWidth = lw; cx2.lineCap = "round";
        cx2.shadowBlur = 8; cx2.shadowColor = c1; cx2.stroke(); cx2.shadowBlur = 0;
        const tx = cx + R * Math.cos(eA), ty = cy + R * Math.sin(eA);
        cx2.beginPath(); cx2.arc(tx, ty, lw / 2 + 1, 0, Math.PI * 2); cx2.fillStyle = "#111827"; cx2.fill();
        cx2.beginPath(); cx2.arc(tx, ty, lw / 2 - 1, 0, Math.PI * 2); cx2.fillStyle = c2; cx2.fill();
      }
      if (p < 1) requestAnimationFrame(draw);
    })(ts);
  });
}

// ════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════
function animateCounter(el, target, duration) {
  const start = Date.now();
  (function tick() {
    const p = Math.min((Date.now() - start) / duration, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(tick);
  })();
}

function animateBar(fId, pId, score) {
  setTimeout(() => {
    document.getElementById(fId).style.width = score + "%";
    document.getElementById(pId).textContent  = score + "%";
  }, 400);
}

function sc(score) { return score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444"; }
function qc(q) { return q === "High" ? "ok" : q === "Medium" ? "warn" : "bad"; }
function mr(label, value, cls) {
  return `<div class="metric-row"><span class="metric-label">${label}</span><span class="metric-value metric-${cls||''}">${value}</span></div>`;
}
function riskIcon(c) { return {safe:"✅",warning:"⚠️",danger:"🚨",critical:"☠️"}[c]||"⚠️"; }
function escHtml(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function fillHint(url) { document.getElementById("urlInput").value = url; document.getElementById("urlInput").focus(); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function shake(el) {
  el.style.animation = "none"; el.offsetHeight;
  el.style.animation = "shake 0.4s ease";
  setTimeout(() => el.style.animation = "", 400);
}

// Shake keyframe
const _s = document.createElement("style");
_s.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`;
document.head.appendChild(_s);

document.getElementById("urlInput").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("analyzeForm").dispatchEvent(new Event("submit"));
});
