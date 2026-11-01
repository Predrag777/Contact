// Live metrics dashboard for Heroes of Alatyr.
// Data: Firebase Realtime Database, players/{uid} (written by the game, see MetricsCloud.cs).
// Login: Firebase Auth e-mail/password; the database rules allow reading only to that account.
import { firebaseConfig, loginEmailDomain, levels as LEVEL_ORDER, levelNames } from "./config.js";

const FIREBASE_CDN = "https://www.gstatic.com/firebasejs/10.12.2/";
// The game refreshes lastSeen at least once a minute while it is open.
const ONLINE_MS = 3 * 60 * 1000;
const DAY_MS = 86400000;
const PLAYERS_PAGE = 100;

const $ = (sel) => document.querySelector(sel);

// localStorage only remembers view preferences (period, sort); it may be unavailable.
const prefs = {
  get(key, fallback) {
    try { const v = localStorage.getItem("metrics." + key); return v == null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("metrics." + key, JSON.stringify(value)); } catch { /* ignore */ }
  },
};

const state = {
  players: {},
  period: prefs.get("period", 7),
  demo: false,
  lastUpdate: null,
  playersShown: PLAYERS_PAGE,
  search: "",
};

let fb = null;           // { auth, db, authMod, dbMod } once Firebase is loaded
let stopListening = [];  // unsubscribe functions of the live listeners
let demoTimer = null;
let loginMessage = null; // error to show on the login screen after a forced sign-out

// ---------- Formatting ----------

const nf = new Intl.NumberFormat("sr-Latn-ME");
const pf = new Intl.NumberFormat("sr-Latn-ME", { style: "percent", maximumFractionDigits: 1 });
const df = new Intl.NumberFormat("sr-Latn-ME", { maximumFractionDigits: 2 });
const dateTime = new Intl.DateTimeFormat("sr-Latn-ME", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const timeOnly = new Intl.DateTimeFormat("sr-Latn-ME", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = (v) => (v == null || Number.isNaN(v) ? "—" : nf.format(v));
const dec = (v) => (v == null || !Number.isFinite(v) ? "—" : df.format(v));
const ratio = (a, b) => (b > 0 ? a / b : null);

function pct(v, { goodAbove, badBelow } = {}) {
  if (v == null || !Number.isFinite(v)) return "—";
  let cls = "";
  if (goodAbove != null && v >= goodAbove) cls = "pct-good";
  else if (badBelow != null && v < badBelow) cls = "pct-bad";
  return `<span class="${cls}">${pf.format(v)}</span>`;
}

function duration(sec) {
  if (sec == null || !Number.isFinite(sec)) return "—";
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function ago(ms) {
  if (!ms) return "—";
  const d = Date.now() - ms;
  if (d < 60000) return "upravo";
  if (d < 3600000) return `prije ${Math.floor(d / 60000)} min`;
  if (d < DAY_MS) return `prije ${Math.floor(d / 3600000)} h`;
  return `prije ${Math.floor(d / DAY_MS)} d`;
}

const levelLabel = (key) => levelNames[key] || (key === "MainMenu" ? "Glavni meni" : key);
const utcKey = (ms) => new Date(ms).toISOString().slice(0, 10);

// ---------- Period ----------

function periodStart() {
  if (!state.period) return -Infinity;
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - (state.period - 1) * DAY_MS;
}
const dayInPeriod = (key, start) => Date.parse(key + "T00:00:00Z") >= start;

// Sum of one daily counter of a player inside the selected period.
function sumDays(p, field, start) {
  let total = 0;
  for (const [key, day] of Object.entries(p.days || {}))
    if (dayInPeriod(key, start)) total += day[field] || 0;
  return total;
}

const activeInPeriod = (p, start) =>
  !state.period || (p.lastSeen || 0) >= start || Object.keys(p.days || {}).some((k) => dayInPeriod(k, start));

// ---------- Sortable tables ----------

const tables = {};

// columns: { key, label, type: "text" | "num", value(row) -> sort value, html(row) -> cell }
function defineTable(id, columns, defaultSort) {
  const saved = prefs.get("sort." + id, null);
  const sort = saved && columns.some((c) => c.key === saved.key) ? saved : defaultSort;
  tables[id] = { columns, sort, rows: [] };

  const bar = document.querySelector(`[data-toolbar="${id}"]`);
  const label = document.createElement("label");
  label.textContent = "Sortiraj:";
  const select = document.createElement("select");
  select.id = `sort-${id}`;
  label.htmlFor = select.id;
  for (const c of columns) select.add(new Option(c.label, c.key));
  const dir = document.createElement("button");
  dir.type = "button";
  dir.className = "btn btn-ghost btn-sm dir";

  select.addEventListener("change", () => setSort(id, select.value));
  dir.addEventListener("click", () => setSort(id, tables[id].sort.key, tables[id].sort.dir === "asc" ? "desc" : "asc"));
  bar.append(label, select, dir);
  tables[id].controls = { select, dir };
}

function setSort(id, key, dir) {
  const t = tables[id];
  const col = t.columns.find((c) => c.key === key);
  if (!dir) dir = key === t.sort.key ? (t.sort.dir === "asc" ? "desc" : "asc") : col.type === "text" ? "asc" : "desc";
  t.sort = { key, dir };
  prefs.set("sort." + id, t.sort);
  drawTable(id);
}

function sortRows(t) {
  const col = t.columns.find((c) => c.key === t.sort.key) || t.columns[0];
  const sign = t.sort.dir === "asc" ? 1 : -1;
  const val = col.value || ((r) => r[col.key]);
  return [...t.rows].sort((a, b) => {
    const x = val(a), y = val(b);
    const xMissing = x == null || Number.isNaN(x), yMissing = y == null || Number.isNaN(y);
    if (xMissing || yMissing) return xMissing === yMissing ? 0 : xMissing ? 1 : -1; // empty values always last
    if (col.type === "text") return sign * String(x).localeCompare(String(y), "sr");
    return sign * (x - y);
  });
}

function renderTable(id, rows, limit) {
  tables[id].rows = rows;
  tables[id].limit = limit;
  drawTable(id);
}

function drawTable(id) {
  const t = tables[id];
  const { select, dir } = t.controls;
  select.value = t.sort.key;
  dir.textContent = t.sort.dir === "asc" ? "↑" : "↓";
  dir.setAttribute("aria-label", t.sort.dir === "asc" ? "Rastuće, klikni za opadajuće" : "Opadajuće, klikni za rastuće");
  dir.title = t.sort.dir === "asc" ? "Rastuće" : "Opadajuće";

  let rows = sortRows(t);
  const total = rows.length;
  if (t.limit) rows = rows.slice(0, t.limit);

  const head = t.columns.map((c) => {
    const active = c.key === t.sort.key;
    const aria = active ? ` aria-sort="${t.sort.dir === "asc" ? "ascending" : "descending"}"` : "";
    const arrow = active ? (t.sort.dir === "asc" ? "▲" : "▼") : "";
    return `<th class="${c.type === "text" ? "text" : ""}"${aria}><button type="button" data-sort="${c.key}">${esc(c.label)}<span class="arrow" aria-hidden="true">${arrow}</span></button></th>`;
  }).join("");

  const body = rows.length
    ? rows.map((r) => `<tr>${t.columns.map((c) =>
        `<td class="${c.type === "text" ? "text" : ""}">${c.html ? c.html(r) : num(r[c.key])}</td>`).join("")}</tr>`).join("")
    : `<tr><td class="empty" colspan="${t.columns.length}">Još nema podataka.</td></tr>`;

  const wrap = document.querySelector(`[data-table="${id}"]`);
  wrap.innerHTML = `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  wrap.querySelectorAll("[data-sort]").forEach((b) => b.addEventListener("click", () => setSort(id, b.dataset.sort)));

  if (id === "players") $("#players-more").hidden = total <= rows.length;
}

// ---------- Table definitions ----------

const SOURCES = { enemy: "Neprijatelj", arena: "Arena", cannon: "Top", build: "Popravka", ulti: "Ulti napad" };

function defineTables() {
  defineTable("levels", [
    { key: "order", label: "Nivo", type: "num", html: (r) => `<strong>${esc(levelLabel(r.level))}</strong>` },
    { key: "here", label: "Igrači ovdje", type: "num" },
    { key: "onlineHere", label: "Online ovdje", type: "num", html: (r) => (r.onlineHere ? `<span class="dot on"></span>${num(r.onlineHere)}` : "0") },
    { key: "players", label: "Igrali", type: "num" },
    { key: "starts", label: "Pokretanja", type: "num" },
    { key: "completes", label: "Pređeno", type: "num" },
    { key: "passRate", label: "Prolaznost", type: "num", html: (r) => pct(r.passRate, { goodAbove: 0.6, badBelow: 0.25 }) },
    { key: "deaths", label: "Smrti", type: "num" },
    { key: "deathsPerStart", label: "Smrti / pokretanje", type: "num", html: (r) => dec(r.deathsPerStart) },
    { key: "correct", label: "Tačni", type: "num" },
    { key: "wrong", label: "Netačni", type: "num" },
    { key: "accuracy", label: "Tačnost", type: "num", html: (r) => pct(r.accuracy, { goodAbove: 0.8, badBelow: 0.5 }) },
    { key: "timeouts", label: "Isteklo vrijeme", type: "num" },
    { key: "avgTime", label: "Prosj. vrijeme prolaza", type: "num", html: (r) => duration(r.avgTime) },
  ], { key: "order", dir: "asc" });

  defineTable("ads", [
    { key: "name", label: "Reklama", type: "text", html: (r) => `<strong>${esc(r.name)}</strong>` },
    { key: "started", label: "Pokrenuto / prikazano", type: "num" },
    { key: "finished", label: "Završeno", type: "num" },
    { key: "skipped", label: "Preskočeno", type: "num", html: (r) => (r.skipped == null ? "—" : num(r.skipped)) },
    { key: "failed", label: "Neuspješno", type: "num" },
    { key: "rate", label: "Završeno %", type: "num", html: (r) => pct(r.rate, { goodAbove: 0.8, badBelow: 0.5 }) },
  ], { key: "started", dir: "desc" });

  defineTable("answers", [
    { key: "name", label: "Izvor", type: "text", html: (r) => `<strong>${esc(r.name)}</strong>` },
    { key: "total", label: "Ukupno", type: "num" },
    { key: "correct", label: "Tačni", type: "num" },
    { key: "wrong", label: "Netačni", type: "num" },
    { key: "timeouts", label: "Isteklo vrijeme", type: "num" },
    { key: "accuracy", label: "Tačnost", type: "num", html: (r) => pct(r.accuracy, { goodAbove: 0.8, badBelow: 0.5 }) },
  ], { key: "total", dir: "desc" });

  defineTable("days", [
    { key: "day", label: "Datum", type: "text", html: (r) => `<strong>${esc(r.day)}</strong>` },
    { key: "installs", label: "Nove instalacije", type: "num" },
    { key: "active", label: "Aktivni igrači", type: "num" },
    { key: "sessions", label: "Sesije", type: "num" },
    { key: "starts", label: "Pokretanja nivoa", type: "num" },
    { key: "completes", label: "Pređeni nivoi", type: "num" },
    { key: "deaths", label: "Smrti", type: "num" },
    { key: "correct", label: "Tačni", type: "num" },
    { key: "wrong", label: "Netačni", type: "num" },
    { key: "accuracy", label: "Tačnost", type: "num", html: (r) => pct(r.accuracy, { goodAbove: 0.8, badBelow: 0.5 }) },
    { key: "rewardedStart", label: "Rewarded pokrenuto", type: "num" },
    { key: "rewardedComplete", label: "Rewarded završeno", type: "num" },
    { key: "interstitial", label: "Interstitial", type: "num" },
  ], { key: "day", dir: "desc" });

  defineTable("sessions", [
    { key: "min", label: "Broj sesija", type: "num", html: (r) => `<strong>${esc(r.name)}</strong>` },
    { key: "players", label: "Igrača", type: "num" },
    { key: "share", label: "Udio", type: "num", html: (r) => `${pct(r.share)}<span class="bar" style="width:${Math.round((r.share || 0) * 120)}px"></span>` },
  ], { key: "min", dir: "asc" });

  defineTable("players", [
    { key: "id", label: "Igrač", type: "text", html: (r) => `<span class="dot ${r.online ? "on" : ""}" title="${r.online ? "Online" : "Offline"}"></span><span class="mono">${esc(r.id.slice(0, 8))}</span>` },
    { key: "lastSeen", label: "Posljednji put", type: "num", html: (r) => `<span title="${r.lastSeen ? esc(dateTime.format(r.lastSeen)) : ""}">${ago(r.lastSeen)}</span>` },
    { key: "firstSeen", label: "Instalirao", type: "num", html: (r) => (r.firstSeen ? esc(dateTime.format(r.firstSeen)) : "—") },
    { key: "sessions", label: "Sesije", type: "num" },
    { key: "currentLevel", label: "Trenutni nivo", type: "text", html: (r) => esc(r.currentLevel ? levelLabel(r.currentLevel) : "—") },
    { key: "completes", label: "Pređeno nivoa", type: "num" },
    { key: "deaths", label: "Smrti", type: "num" },
    { key: "correct", label: "Tačni", type: "num" },
    { key: "wrong", label: "Netačni", type: "num" },
    { key: "accuracy", label: "Tačnost", type: "num", html: (r) => pct(r.accuracy, { goodAbove: 0.8, badBelow: 0.5 }) },
    { key: "rewarded", label: "Rewarded odgledano", type: "num" },
    { key: "interstitial", label: "Interstitial", type: "num" },
    { key: "version", label: "Verzija", type: "text", html: (r) => esc(r.version || "—") },
  ], { key: "lastSeen", dir: "desc" });
}

// ---------- Aggregation + render ----------

let renderQueued = false;
function queueRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => { renderQueued = false; render(); });
}

function render() {
  const now = Date.now();
  const start = periodStart();
  const all = Object.entries(state.players || {}).map(([id, p]) => ({ id, ...p, online: (p.lastSeen || 0) > now - ONLINE_MS }));
  const active = all.filter((p) => activeInPeriod(p, start));

  renderKpis(all, active, start);
  renderLevels(all);
  renderAds(all);
  renderAnswers(all);
  renderDays(all, start);
  renderSessions(all);
  renderPlayers(active);

  const when = state.lastUpdate ? timeOnly.format(state.lastUpdate) : "—";
  $("#updated").textContent = `Ažurirano u ${when} · ukupno ${num(all.length)} igrača`;
  $("#players-note").textContent = state.period
    ? `Igrači aktivni u izabranom periodu (${num(active.length)}).`
    : `Svi igrači (${num(active.length)}).`;
}

function renderKpis(all, active, start) {
  const inPeriod = (ms) => (ms || 0) >= start;
  const total = (field) => active.reduce((s, p) => s + sumDays(p, field, start), 0);
  const sessions = state.period ? total("sessions") : all.reduce((s, p) => s + (p.sessions || 0), 0);
  const correct = total("correct"), wrong = total("wrong");
  const rStart = total("rewardedStart"), rDone = total("rewardedComplete");
  const installs = state.period ? all.filter((p) => inPeriod(p.firstSeen)).length : all.length;
  const online = all.filter((p) => p.online).length;

  const cards = [
    { label: "Online sada", value: num(online), sub: "igraju u ovom trenutku", live: true },
    { label: state.period ? "Nove instalacije" : "Instalacije", value: num(installs), sub: `ukupno ${num(all.length)}` },
    { label: "Aktivni igrači", value: num(active.length), sub: "otvorili igru u periodu" },
    { label: "Sesije", value: num(sessions), sub: `${dec(ratio(sessions, active.length))} po igraču` },
    { label: "Pređeni nivoi", value: num(total("completes")), sub: `${num(total("starts"))} pokretanja · ${num(total("deaths"))} smrti` },
    { label: "Tačnost odgovora", value: pct(ratio(correct, correct + wrong)), sub: `${num(correct)} tačnih · ${num(wrong)} netačnih` },
    { label: "Rewarded odgledano", value: num(rDone), sub: `od ${num(rStart)} pokrenutih · ${pf.format(ratio(rDone, rStart) || 0)}` },
    { label: "Interstitial", value: num(total("interstitial")), sub: "prikazano" },
  ];
  $("#kpis").innerHTML = cards.map((c) =>
    `<div class="kpi${c.live ? " kpi--live" : ""}"><span class="kpi-label">${c.label}</span><span class="kpi-value">${c.value}</span><span class="kpi-sub">${c.sub}</span></div>`).join("");
}

function renderLevels(all) {
  const keys = new Set(LEVEL_ORDER);
  for (const p of all) Object.keys(p.levels || {}).forEach((k) => keys.add(k));

  const rows = [...keys].map((level) => {
    const r = { level, here: 0, onlineHere: 0, players: 0, starts: 0, completes: 0, deaths: 0, correct: 0, wrong: 0, timeouts: 0, seconds: 0 };
    const idx = LEVEL_ORDER.indexOf(level);
    r.order = idx >= 0 ? idx : LEVEL_ORDER.length + 1;
    for (const p of all) {
      if (p.currentLevel === level) { r.here++; if (p.online) r.onlineHere++; }
      const l = p.levels?.[level];
      if (!l) continue;
      if (l.starts > 0) r.players++;
      for (const f of ["starts", "completes", "deaths", "correct", "wrong", "timeouts", "seconds"]) r[f] += l[f] || 0;
    }
    r.passRate = ratio(r.completes, r.starts);
    r.deathsPerStart = ratio(r.deaths, r.starts);
    r.accuracy = ratio(r.correct, r.correct + r.wrong);
    r.avgTime = ratio(r.seconds, r.completes);
    return r;
  });
  renderTable("levels", rows);
}

function renderAds(all) {
  const sum = (path) => all.reduce((s, p) => s + (path.reduce((o, k) => o?.[k], p.ads) || 0), 0);
  const rewarded = (placement, name) => {
    const started = sum(["rewarded", placement, "start"]);
    const finished = sum(["rewarded", placement, "complete"]);
    return { name, started, finished, skipped: sum(["rewarded", placement, "skip"]), failed: sum(["rewarded", placement, "fail"]), rate: ratio(finished, started) };
  };
  const shown = sum(["interstitial", "show"]);
  const closed = sum(["interstitial", "close"]);
  renderTable("ads", [
    rewarded("revive", "Rewarded · oživljavanje (Play Again)"),
    rewarded("coins", "Rewarded · novčići u meniju"),
    { name: "Interstitial", started: shown, finished: closed, skipped: null, failed: sum(["interstitial", "fail"]), rate: ratio(closed, shown) },
  ]);
}

function renderAnswers(all) {
  const keys = new Set(Object.keys(SOURCES));
  for (const p of all) Object.keys(p.answers || {}).forEach((k) => keys.add(k));
  const rows = [...keys].map((src) => {
    const r = { name: SOURCES[src] || src, correct: 0, wrong: 0, timeouts: 0 };
    for (const p of all) {
      const a = p.answers?.[src];
      if (!a) continue;
      r.correct += a.correct || 0;
      r.wrong += a.wrong || 0;
      r.timeouts += a.timeouts || 0;
    }
    r.total = r.correct + r.wrong;
    r.accuracy = ratio(r.correct, r.total);
    return r;
  });
  renderTable("answers", rows);
}

function renderDays(all, start) {
  const days = new Map();
  const day = (key) => {
    if (!days.has(key)) days.set(key, { day: key, installs: 0, active: 0, sessions: 0, starts: 0, completes: 0, deaths: 0, correct: 0, wrong: 0, rewardedStart: 0, rewardedComplete: 0, interstitial: 0 });
    return days.get(key);
  };
  for (const p of all) {
    if (p.firstSeen && p.firstSeen >= start) day(utcKey(p.firstSeen)).installs++;
    for (const [key, d] of Object.entries(p.days || {})) {
      if (!dayInPeriod(key, start)) continue;
      const r = day(key);
      r.active++;
      for (const f of ["sessions", "starts", "completes", "deaths", "correct", "wrong", "rewardedStart", "rewardedComplete", "interstitial"]) r[f] += d[f] || 0;
    }
  }
  const rows = [...days.values()];
  rows.forEach((r) => { r.accuracy = ratio(r.correct, r.correct + r.wrong); });
  renderTable("days", rows);
}

function renderSessions(all) {
  const buckets = [
    { name: "1", min: 1, max: 1 }, { name: "2", min: 2, max: 2 }, { name: "3", min: 3, max: 3 },
    { name: "4–5", min: 4, max: 5 }, { name: "6–10", min: 6, max: 10 }, { name: "11–20", min: 11, max: 20 },
    { name: "21–50", min: 21, max: 50 }, { name: "51+", min: 51, max: Infinity },
  ].map((b) => ({ ...b, players: 0 }));
  for (const p of all) {
    const b = buckets.find((x) => (p.sessions || 0) >= x.min && (p.sessions || 0) <= x.max);
    if (b) b.players++;
  }
  buckets.forEach((b) => { b.share = ratio(b.players, all.length); });
  renderTable("sessions", buckets);
}

function renderPlayers(active) {
  const q = state.search.trim().toLowerCase();
  const rows = active
    .map((p) => {
      let completes = 0, deaths = 0, correct = 0, wrong = 0;
      for (const l of Object.values(p.levels || {})) {
        completes += l.completes || 0; deaths += l.deaths || 0; correct += l.correct || 0; wrong += l.wrong || 0;
      }
      const rewarded = Object.values(p.ads?.rewarded || {}).reduce((s, x) => s + (x.complete || 0), 0);
      return {
        id: p.id, online: p.online, lastSeen: p.lastSeen, firstSeen: p.firstSeen, sessions: p.sessions || 0,
        currentLevel: p.currentLevel, completes, deaths, correct, wrong, accuracy: ratio(correct, correct + wrong),
        rewarded, interstitial: p.ads?.interstitial?.show || 0, version: p.appVersion,
      };
    })
    .filter((r) => !q || r.id.toLowerCase().includes(q) || String(r.currentLevel || "").toLowerCase().includes(q) || levelLabel(r.currentLevel || "").toLowerCase().includes(q));
  renderTable("players", rows, state.playersShown);
}

// ---------- Live status ----------

function setLive(mode) {
  const el = $("#live");
  el.classList.toggle("is-on", mode === "on" || mode === "demo");
  el.classList.toggle("is-off", mode === "off");
  $("#live-text").textContent = { on: "Uživo", off: "Bez veze, čeka se…", demo: "Demo uživo", wait: "Povezivanje…" }[mode];
}

// ---------- Views ----------

function showLogin(message) {
  stopAll();
  $("#dash-view").hidden = true;
  $("#login-view").hidden = false;
  const err = $("#login-error");
  err.hidden = !message;
  err.textContent = message || "";
  $("#config-notice").hidden = Boolean(firebaseConfig.apiKey);
  $("#login-btn").disabled = false;
}

function showDashboard() {
  $("#login-view").hidden = true;
  $("#dash-view").hidden = false;
  $("#demo-banner").hidden = !state.demo;
  queueRender();
}

function stopAll() {
  stopListening.forEach((off) => off());
  stopListening = [];
  clearInterval(demoTimer);
  demoTimer = null;
}

async function loadFirebase() {
  const [appMod, authMod, dbMod] = await Promise.all([
    import(FIREBASE_CDN + "firebase-app.js"),
    import(FIREBASE_CDN + "firebase-auth.js"),
    import(FIREBASE_CDN + "firebase-database.js"),
  ]);
  const app = appMod.initializeApp(firebaseConfig);
  return { auth: authMod.getAuth(app), db: dbMod.getDatabase(app), authMod, dbMod };
}

function startLive() {
  stopAll();
  state.demo = false;
  setLive("wait");
  showDashboard();

  const { ref, onValue } = fb.dbMod;
  stopListening.push(onValue(ref(fb.db, ".info/connected"), (snap) => setLive(snap.val() === true ? "on" : "off")));
  stopListening.push(onValue(ref(fb.db, "players"),
    (snap) => { state.players = snap.val() || {}; state.lastUpdate = new Date(); queueRender(); },
    () => {
      // onAuthStateChanged shows the login with this message after the sign-out.
      loginMessage = "Ovaj nalog nema pravo da čita statistiku. Provjeri pravila baze (database.rules.json).";
      fb.authMod.signOut(fb.auth);
    }));
}

function startDemo() {
  stopAll();
  state.demo = true;
  state.players = demoPlayers();
  state.lastUpdate = new Date();
  setLive("demo");
  showDashboard();
  // Simulate players playing right now, so the live updates are visible.
  demoTimer = setInterval(() => { demoTick(state.players); state.lastUpdate = new Date(); queueRender(); }, 2500);
}

// ---------- Init ----------

function initControls() {
  const periodButtons = document.querySelectorAll("#period button");
  const markPeriod = () => periodButtons.forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.period) === state.period)));
  periodButtons.forEach((b) => b.addEventListener("click", () => {
    state.period = Number(b.dataset.period);
    state.playersShown = PLAYERS_PAGE;
    prefs.set("period", state.period);
    markPeriod();
    queueRender();
  }));
  markPeriod();

  $("#player-search").addEventListener("input", (e) => { state.search = e.target.value; state.playersShown = PLAYERS_PAGE; queueRender(); });
  $("#players-more").addEventListener("click", () => { state.playersShown += PLAYERS_PAGE; queueRender(); });

  $("#demo-btn").addEventListener("click", startDemo);

  $("#logout-btn").addEventListener("click", () => {
    if (state.demo || !fb) { state.demo = false; showLogin(); return; }
    fb.authMod.signOut(fb.auth); // onAuthStateChanged shows the login
  });

  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = $("#username").value.trim().toLowerCase();
    const password = $("#password").value;
    if (!username || !password) { showLogin("Upiši korisničko ime i šifru."); return; }
    if (!fb) { showLogin("Firebase još nije podešen (Metrics/config.js)."); return; }

    $("#login-btn").disabled = true;
    try {
      await fb.authMod.signInWithEmailAndPassword(fb.auth, `${username}@${loginEmailDomain}`, password);
      $("#password").value = "";
    } catch (err) {
      const code = err?.code || "";
      const msg = code === "auth/too-many-requests" ? "Previše pokušaja. Sačekaj malo pa probaj ponovo."
        : code === "auth/network-request-failed" ? "Nema internet veze."
        : "Pogrešno korisničko ime ili šifra.";
      showLogin(msg);
    }
  });

  // Relative times and the online dots age even without new data.
  setInterval(() => { if (!$("#dash-view").hidden) queueRender(); }, 20000);
}

async function init() {
  defineTables();
  initControls();

  if (new URLSearchParams(location.search).has("demo")) { startDemo(); return; }

  if (!firebaseConfig.apiKey) { showLogin(); return; }

  try {
    fb = await loadFirebase();
  } catch {
    showLogin("Firebase se nije učitao. Provjeri internet vezu i osvježi stranicu.");
    return;
  }
  fb.authMod.onAuthStateChanged(fb.auth, (user) => {
    if (user && !user.isAnonymous) startLive();
    else if (!state.demo) { showLogin(loginMessage); loginMessage = null; }
  });
}

init();

// ---------- Demo data (only for previewing the layout) ----------

function demoPlayers() {
  let seed = 7;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const pick = (n) => Math.floor(rnd() * n);
  const now = Date.now();
  const players = {};
  const placements = ["revive", "coins"];
  const sources = Object.keys(SOURCES);

  for (let i = 0; i < 160; i++) {
    const id = Array.from({ length: 28 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[pick(36)]).join("");
    const firstSeen = now - rnd() * 30 * DAY_MS;
    const sessions = 1 + Math.floor(Math.pow(rnd(), 2.2) * 40);
    const skill = 0.55 + rnd() * 0.4;
    const reached = Math.min(LEVEL_ORDER.length, 1 + Math.floor(Math.pow(rnd(), 1.6) * LEVEL_ORDER.length));
    const p = { firstSeen, lastSeen: firstSeen, sessions, platform: "Android", appVersion: rnd() < 0.7 ? "0.1.0" : "0.0.9", levels: {}, answers: {}, ads: { rewarded: {}, interstitial: { show: 0, close: 0, fail: 0 } }, days: {} };

    for (let l = 0; l < reached; l++) {
      const starts = 1 + pick(4);
      const passed = l < reached - 1 || rnd() < 0.3;
      const correct = starts * (8 + pick(14));
      const wrong = Math.round(correct * (1 - skill) / skill);
      p.levels[LEVEL_ORDER[l]] = {
        starts, completes: passed ? 1 + pick(Math.max(1, starts - 1)) : 0, deaths: pick(starts * 2 + 1),
        correct, wrong, timeouts: pick(Math.ceil(wrong / 3) + 1), seconds: passed ? 120 + pick(400) : 0,
      };
      for (let k = 0; k < 4; k++) {
        const src = sources[pick(sources.length)];
        const a = (p.answers[src] ||= { correct: 0, wrong: 0, timeouts: 0 });
        a.correct += Math.round(correct / 4); a.wrong += Math.round(wrong / 4); a.timeouts += pick(2);
      }
    }
    p.currentLevel = rnd() < 0.25 ? "MainMenu" : LEVEL_ORDER[reached - 1];

    for (const pl of placements) {
      const start = pick(pl === "revive" ? 8 : 4);
      const complete = Math.round(start * (0.6 + rnd() * 0.35));
      p.ads.rewarded[pl] = { start, complete, skip: start - complete, fail: pick(2) };
    }
    p.ads.interstitial.show = pick(reached + 2);
    p.ads.interstitial.close = p.ads.interstitial.show;
    p.ads.interstitial.fail = pick(2);

    for (let s = 0; s < sessions; s++) {
      const ts = firstSeen + rnd() * (now - firstSeen);
      const d = (p.days[utcKey(ts)] ||= { sessions: 0, starts: 0, completes: 0, deaths: 0, correct: 0, wrong: 0, rewardedStart: 0, rewardedComplete: 0, interstitial: 0 });
      d.sessions++;
      d.starts += 1 + pick(2); d.completes += pick(2); d.deaths += pick(3);
      d.correct += 10 + pick(20); d.wrong += pick(8);
      const rs = pick(3);
      d.rewardedStart += rs; d.rewardedComplete += pick(rs + 1); d.interstitial += pick(2);
      p.lastSeen = Math.max(p.lastSeen, ts);
    }
    if (i < 9) p.lastSeen = now - pick(90) * 1000; // a few players online now
    players[id] = p;
  }
  return players;
}

function demoTick(players) {
  const online = Object.values(players).filter((p) => p.lastSeen > Date.now() - ONLINE_MS);
  if (!online.length) return;
  const p = online[Math.floor(Math.random() * online.length)];
  const level = p.currentLevel && p.levels[p.currentLevel] ? p.currentLevel : Object.keys(p.levels)[0];
  const today = (p.days[utcKey(Date.now())] ||= { sessions: 1, starts: 0, completes: 0, deaths: 0, correct: 0, wrong: 0, rewardedStart: 0, rewardedComplete: 0, interstitial: 0 });
  const ok = Math.random() < 0.78;
  p.levels[level][ok ? "correct" : "wrong"]++;
  today[ok ? "correct" : "wrong"]++;
  p.lastSeen = Date.now();
}
