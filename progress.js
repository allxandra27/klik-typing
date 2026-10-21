// «Мій прогрес»: історія спроб, графіки росту, теплова клавіатура, досягнення.
// Використовує глобальні змінні головного скрипта: state, save, LESSONS, LAYOUT, FCOL, $, show, isOpen, prevOf, startLesson, renderList, baseKey.
"use strict";

state.history = state.history || [];   // [{id, ts, acc, cpm, errs, sec, stars, rhythm, beat}]
state.keys = state.keys || {};         // {ua: {ф: {n, e, t, c}}}  n — правильних, e — помилок, t/c — сума й кількість пауз перед клавішею

/* ---------- збір даних ---------- */
function keyRec(layout, ch) {
  const k = baseKey(layout, ch);
  if (k === " ") return null;
  const L1 = state.keys[layout] = state.keys[layout] || {};
  return L1[k] = L1[k] || { n: 0, e: 0, t: 0, c: 0 };
}
function recordKey(layout, ch, ok) {
  const r = keyRec(layout, ch); if (!r) return;
  ok ? r.n++ : r.e++;
}
function recordAttempt(a, R) {
  if (R) R.gaps.forEach(g => { const r = keyRec(L.layout, g.ch); if (r) { r.t += g.dt; r.c++; } });
  state.history.push(a);
  if (state.history.length > 400) state.history.splice(0, state.history.length - 400);
  save();
}

/* ---------- допоміжне ---------- */
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmtTime = s => s >= 3600 ? `${Math.floor(s / 3600)} год ${Math.round(s % 3600 / 60)} хв` : s >= 60 ? `${Math.round(s / 60)} хв` : `${s} с`;
const fmtDate = ts => new Date(ts).toLocaleDateString("uk-UA", { day: "numeric", month: "short" }) + ", " + new Date(ts).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
const passed = l => (state.lessons[l.id]?.stars || 0) >= 2;

/* ---------- підсумки ---------- */
function renderTiles() {
  const H = state.history, done = LESSONS.filter(passed).length;
  const best = H.reduce((m, a) => Math.max(m, a.acc >= 90 ? a.cpm : 0), 0);
  const time = H.reduce((s, a) => s + (a.sec || 0), 0);
  const tiles = [
    [`${done} з ${LESSONS.length}`, "уроків пройдено"],
    [H.length, H.length % 10 === 1 && H.length % 100 !== 11 ? "спроба" : "спроб"],
    [best ? `${best}` : "—", "найкраща швидкість, зн/хв<br><small>(з точністю від 90%)</small>"],
    [time ? fmtTime(time) : "—", "часу тренувань"]
  ];
  $("pTiles").innerHTML = tiles.map(([v, l]) => `<div class="tile"><b>${v}</b><span>${l}</span></div>`).join("");
}

/* ---------- мій шлях ---------- */
function renderPath() {
  const groups = {}; LESSONS.forEach(l => (groups[l.group] = groups[l.group] || []).push(l));
  let currentMarked = {};
  $("pPath").innerHTML = Object.entries(groups).map(([g, ls]) => `<div class="pathgroup"><div class="pathname">${g}</div><div class="path">${
    ls.map(l => {
      const st = state.lessons[l.id]?.stars || 0, open = isOpen(l), ok = st >= 2;
      let cls = ok ? "done" : open ? "open" : "locked";
      if (!ok && open && !currentMarked[l.layout]) { cls += " current"; currentMarked[l.layout] = true; }
      const num = (l.title.match(/\d+/) || [""])[0];
      const stars = [1, 2, 3].map(i => i <= st ? "★" : `<span class="off">★</span>`).join("");
      return `<button class="node ${cls}" data-id="${l.id}" ${open ? "" : "disabled"} title="${esc(l.title)}">
        <span class="dot">${open ? num : "🔒"}</span><span class="nkeys">${esc(l.keys)}</span><span class="nstars">${stars}</span></button>`;
    }).join('<i class="link"></i>')}</div></div>`).join("");
}

/* ---------- графіки ---------- */
function lessonsWithHistory() { const ids = new Set(state.history.map(a => a.id)); return LESSONS.filter(l => ids.has(l.id)); }
function renderGrowth() {
  const sel = $("pLesson"), list = lessonsWithHistory();
  if (!list.length) {
    sel.innerHTML = ""; sel.disabled = true;
    $("pGrowNote").textContent = "Тут з'являться графіки, щойно ти пройдеш перший урок.";
    $("chSpeed").innerHTML = $("chAcc").innerHTML = $("pTable").innerHTML = ""; return;
  }
  sel.disabled = false;
  // за замовчуванням — останній урок, який учень проходив щонайменше двічі (інакше — просто останній)
  const H = state.history, cnt = id => H.filter(a => a.id === id).length;
  const recent = [...H].reverse().find(a => cnt(a.id) >= 2) || H[H.length - 1];
  const keep = list.some(l => l.id === sel.value) ? sel.value : recent.id;
  sel.innerHTML = list.map(l => `<option value="${l.id}">${esc(l.title)}</option>`).join("");
  sel.value = keep;
  const A = state.history.filter(a => a.id === keep);
  $("pGrowNote").textContent = A.length < 2 ? "Пройди цей урок ще раз, щоб побачити, як змінюються результати." : `Спроб: ${A.length}`;
  lineChart($("chSpeed"), "Швидкість, знаків за хвилину", A, [{ key: "cpm", name: "Швидкість", color: "var(--s1)", unit: " зн/хв" }], null);
  lineChart($("chAcc"), "Точність і ритмічність, %", A, [
    { key: "acc", name: "Точність", color: "var(--s1)", unit: "%" },
    { key: "rhythm", name: "Ритмічність", color: "var(--s2)", unit: "%" }], 100);
  $("pTable").innerHTML = `<div class="tablewrap"><table><thead><tr><th>#</th><th>Дата</th><th>Зірочки</th><th>Точність</th><th>Швидкість</th><th>Ритмічність</th><th>Помилки</th><th>Час</th></tr></thead><tbody>${
    A.map((a, i) => `<tr><td>${i + 1}</td><td>${fmtDate(a.ts)}</td><td>${"★".repeat(a.stars)}</td><td>${a.acc}%</td><td>${a.cpm} зн/хв</td><td>${a.rhythm == null ? "—" : a.rhythm + "%"}</td><td>${a.errs}</td><td>${fmtTime(a.sec)}</td></tr>`).reverse().join("")}</tbody></table></div>`;
}

// Лінійний графік: одна вісь Y, тонкі лінії, точки з обводкою, підписи в кінці ліній, підказка при наведенні.
function lineChart(el, title, A, series, yMax) {
  const W = 480, H = 220, m = { l: 38, r: 52, t: 14, b: 28 }, iw = W - m.l - m.r, ih = H - m.t - m.b, n = A.length;
  const vals = series.flatMap(s => A.map(a => a[s.key]).filter(v => v != null));
  let top = yMax || Math.max(10, ...vals);
  if (!yMax) { // «круглі» поділки: 4 інтервали з кроком 1, 2, 2.5, 5 × 10ⁿ
    const raw = top * 1.1 / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    top = 4 * p * (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10);
  }
  const x = i => m.l + (n === 1 ? iw / 2 : iw * i / (n - 1)), y = v => m.t + ih - ih * v / top;
  const ticks = [0, .25, .5, .75, 1].map(f => Math.round(top * f));
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">`;
  ticks.forEach(t => { svg += `<line class="grid" x1="${m.l}" x2="${m.l + iw}" y1="${y(t)}" y2="${y(t)}"/><text class="tick" x="${m.l - 8}" y="${y(t) + 4}" text-anchor="end">${t}</text>`; });
  const every = Math.max(1, Math.ceil(n / 10));
  A.forEach((a, i) => { if (i % every === 0 || i === n - 1) svg += `<text class="tick" x="${x(i)}" y="${H - 8}" text-anchor="middle">${i + 1}</text>`; });
  const labels = [];
  series.forEach(s => {
    const pts = A.map((a, i) => a[s.key] == null ? null : [x(i), y(a[s.key])]);
    let d = "", pen = false; // пропуск (немає значення) розриває лінію
    pts.forEach(p => { if (!p) { pen = false; return; } d += (pen ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); pen = true; });
    if (d) svg += `<path class="ln" d="${d}" style="stroke:${s.color}"/>`;
    pts.forEach(p => { if (p) svg += `<circle class="pt" cx="${p[0]}" cy="${p[1]}" r="4.5" style="fill:${s.color}"/>`; });
    const last = [...pts].reverse().find(p => p), lastVal = [...A].reverse().find(a => a[s.key] != null)?.[s.key];
    if (last) labels.push({ y: last[1], x: last[0], text: `${lastVal}${s.unit.trim() === "%" ? "%" : ""}`, color: s.color });
  });
  labels.sort((a, b) => a.y - b.y).forEach((lb, i, arr) => { if (i && lb.y - arr[i - 1].y < 16) lb.y = arr[i - 1].y + 16; });
  labels.forEach(lb => { svg += `<text class="dl" x="${m.l + iw + 10}" y="${lb.y + 4}" style="fill:var(--fg)">${esc(lb.text)}</text>`; });
  svg += `<line class="xhair" id="${el.id}X" y1="${m.t}" y2="${m.t + ih}" x1="0" x2="0" visibility="hidden"/><rect class="hit" x="${m.l - 10}" y="0" width="${iw + 20}" height="${H}"/></svg>`;
  const legend = series.length > 1 ? `<div class="legend2">${series.map(s => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join("")}</div>` : "";
  el.innerHTML = `<figcaption>${esc(title)} <small>· за спробами</small></figcaption>${legend}<div class="plot">${svg}<div class="tip" hidden></div></div>`;
  const plot = el.querySelector(".plot"), tip = el.querySelector(".tip"), xh = el.querySelector(".xhair"), sv = el.querySelector("svg");
  const move = ev => {
    const r = sv.getBoundingClientRect(), px = (ev.clientX - r.left) * W / r.width;
    let i = n === 1 ? 0 : Math.round((px - m.l) / iw * (n - 1)); i = Math.max(0, Math.min(n - 1, i));
    const a = A[i];
    xh.setAttribute("x1", x(i)); xh.setAttribute("x2", x(i)); xh.setAttribute("visibility", "visible");
    tip.innerHTML = `<b>Спроба ${i + 1}</b> · ${fmtDate(a.ts)}<br>` + series.map(s => `<span><i style="background:${s.color}"></i>${s.name}: <b>${a[s.key] == null ? "—" : a[s.key] + s.unit}</b></span>`).join("<br>");
    tip.hidden = false;
    const left = x(i) / W * r.width;
    tip.style.left = Math.min(r.width - tip.offsetWidth - 4, Math.max(4, left + 12)) + "px";
  };
  plot.addEventListener("pointermove", move);
  plot.addEventListener("pointerdown", move);
  plot.addEventListener("pointerleave", () => { tip.hidden = true; xh.setAttribute("visibility", "hidden"); });
}

/* ---------- теплова клавіатура ---------- */
let hmMode = "err", hmLayout = "ua";
function renderHeat() {
  const K = state.keys[hmLayout] || {}, MIN = 5; // замало натискань — не робимо висновків
  const score = r => hmMode === "err" ? r.e / (r.n + r.e) : r.c ? r.t / r.c : 0;
  const ready = Object.entries(K).filter(([, r]) => (r.n + r.e) >= MIN && (hmMode === "err" || r.c >= 3));
  const max = Math.max(...ready.map(([, r]) => score(r)), 0);
  const tipText = (ch, r) => !r ? `${ch.toUpperCase()}: ще не друкував` :
    hmMode === "err" ? `${ch.toUpperCase()}: ${r.e} помилок на ${r.n + r.e} натискань (${Math.round(100 * r.e / (r.n + r.e))}%)` :
      `${ch.toUpperCase()}: у середньому ${r.c ? (r.t / r.c / 1000).toFixed(2).replace(".", ",") : "—"} с на пошук`;
  $("pHeat").innerHTML = LAYOUT[hmLayout].map((row, ri) => `<div class="row r${ri + 1}">${row.map(ch => {
    const r = K[ch], ok = r && ready.some(([k]) => k === ch);
    const pct = ok && max > 0 ? Math.round(12 + 78 * score(r) / max) : 0;
    const style = ok ? `style="background:color-mix(in srgb, var(--heat) ${pct}%, var(--surface))"` : "";
    return `<div class="key ${ok ? "" : "nodata"}" ${style} title="${esc(tipText(ch, r))}">${esc(ch)}</div>`;
  }).join("")}</div>`).join("");
  const top3 = ready.filter(([, r]) => score(r) > 0).sort((a, b) => score(b[1]) - score(a[1])).slice(0, 3).map(([k]) => k.toUpperCase());
  $("pHeatNote").innerHTML = !ready.length ? "Даних поки замало: пройди кілька уроків у цій розкладці." :
    top3.length ? (hmMode === "err" ? "Найчастіше помиляєшся на: " : "Найдовше шукаєш: ") + `<b>${top3.join(", ")}</b>. Наведи на клавішу, щоб побачити подробиці.` :
      "Жодної помилки — чудово!";
  ["hmErr", "hmSlow"].forEach(id => $(id).setAttribute("aria-pressed", (id === "hmErr") === (hmMode === "err")));
  ["hmUa", "hmEn"].forEach(id => $(id).setAttribute("aria-pressed", (id === "hmUa") === (hmLayout === "ua")));
}
$("hmErr").onclick = () => { hmMode = "err"; renderHeat(); };
$("hmSlow").onclick = () => { hmMode = "slow"; renderHeat(); };
$("hmUa").onclick = () => { hmLayout = "ua"; renderHeat(); };
$("hmEn").onclick = () => { hmLayout = "en"; renderHeat(); };

/* ---------- досягнення ---------- */
const BADGES = [
  ["🚀", "Перший старт", "Пройди будь-який урок", H => H.length >= 1],
  ["⭐", "Три зірочки", "Отримай 3 зірочки за урок", H => H.some(a => a.stars === 3)],
  ["🎯", "Без жодної помилки", "Пройди урок без помилок", H => H.some(a => a.errs === 0)],
  ["💯", "П'ять бездоганних", "Пройди 5 уроків без жодної помилки", H => H.filter(a => a.errs === 0).length >= 5],
  ["⏱", "Ритм як годинник", "Досягни ритмічності 80%", H => H.some(a => a.rhythm >= 80)],
  ["🥁", "У такт", "Влучи в такт метронома в 70% натискань", H => H.some(a => a.beat >= 70)],
  ["⚡", "Швидкі пальці", "Надрукуй 100 знаків за хвилину з точністю від 90%", H => H.some(a => a.cpm >= 100 && a.acc >= 90)],
  ["💪", "Наполегливість", "Зроби 20 спроб", H => H.length >= 20],
  ["🇺🇦", "Українська розкладка", "Пройди всі українські уроки на 2+ зірочки", () => LESSONS.filter(l => l.layout === "ua").every(passed)],
  ["🇬🇧", "English", "Пройди всі англійські уроки на 2+ зірочки", () => LESSONS.filter(l => l.layout === "en").every(passed)]
];
function renderBadges() {
  const H = state.history;
  $("pBadges").innerHTML = BADGES.map(([ic, t, d, test]) => {
    const got = test(H);
    return `<div class="badge ${got ? "got" : ""}"><span class="bic">${got ? ic : "🔒"}</span><b>${t}</b><span>${d}</span></div>`;
  }).join("");
}

/* ---------- екран ---------- */
function renderProgress() { renderTiles(); renderPath(); renderGrowth(); renderHeat(); renderBadges(); show("vProgress"); }
$("pLesson").onchange = renderGrowth;
$("pPath").addEventListener("click", e => { const b = e.target.closest(".node"); if (b && !b.disabled) startLesson(b.dataset.id); });
$("btnProgress").onclick = renderProgress;
$("rProgress").onclick = renderProgress;
$("pBack").onclick = () => { renderList(); show("vList"); };
