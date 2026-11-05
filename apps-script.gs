// Код для Google Таблиці «Клік — тренажер друку».
// Розширення → Apps Script → вставити цей код → Розгорнути як веб-застосунок (доступ: Усі).
//
// Аркуші:
//   «Учні»       — учитель вписує групу та прізвище й ім'я; коди генерує меню «Клік → Згенерувати коди».
//   «Результати» — кожна пройдена спроба уроку (дописує тренажер).
//   «Стан»       — службові дані учня: статистика клавіш і налаштування (не редагувати).

const SHEET_NAME = 'Результати', STUDENTS = 'Учні', STATE = 'Стан';
const HEADER = ['Дата і час', 'Група', 'Учень', 'Урок', 'Назва уроку', 'Зірочки', 'Точність, %', 'Швидкість, зн/хв', 'Помилки', 'Час, с',
                'Ритмічність, %', 'Метроном, уд/хв', 'Темп учня, уд/хв', 'Влучання в такт, %', 'Код учня'];
const ST_HEADER = ['Група', "Прізвище та ім'я", 'Код', 'Примітка'];
const STATE_HEADER = ['Група', 'Код', 'Учень', 'Дані (не редагувати)', 'Оновлено'];
// Слова для кодів: англійські, короткі, з тем IT, космос, високі технології й автомобілі (друкувати англійською розкладкою).
const WORDS = [
  // IT
  'code', 'byte', 'pixel', 'cloud', 'server', 'router', 'script', 'binary', 'kernel', 'cache', 'debug', 'python',
  // космос
  'rocket', 'comet', 'orbit', 'galaxy', 'planet', 'nova', 'nebula', 'meteor', 'cosmos', 'lunar', 'solar', 'saturn', 'mars', 'venus',
  // високі технології
  'robot', 'laser', 'drone', 'chip', 'cyber', 'matrix', 'vector', 'quantum', 'neon', 'fusion', 'radar', 'sensor',
  // автомобілі
  'turbo', 'motor', 'engine', 'piston', 'nitro', 'racer', 'drift', 'rally', 'coupe', 'wheel', 'gear', 'rover'
];

/* ---------- меню в таблиці ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Клік')
    .addItem('Згенерувати коди для нових учнів', 'generateCodes')
    .addItem('Підготувати аркуші', 'setup')
    .addToUi();
}

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const st = ensure(ss, STUDENTS, ST_HEADER);
  st.getRange('A:C').setNumberFormat('@'); // група «2026-61» і коди — завжди текст, не дата
  ensure(ss, STATE, STATE_HEADER);
  resultsSheet(ss);
  return 'ok';
}

function ensure(ss, name, header) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(header);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, header.length).setFontWeight('bold');
  }
  return sh;
}

function resultsSheet(ss) {
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADER);
    sh.setFrozenRows(1);
  } else if (sh.getRange(1, HEADER.length).getValue() === '') {
    // Дописати заголовки нових колонок, не чіпаючи вже заповнені.
    const cur = sh.getRange(1, 1, 1, HEADER.length).getValues()[0];
    sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER.map((h, i) => cur[i] || h)]);
  }
  return sh;
}

// Для кожного рядка «Учні», де є група й ім'я, але немає коду, створює унікальний код «слово + 2 цифри».
function generateCodes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ensure(ss, STUDENTS, ST_HEADER);
  const n = sh.getLastRow();
  let made = 0;
  if (n >= 2) {
    const v = sh.getRange(2, 1, n - 1, 3).getValues();
    const used = new Set(v.map(r => norm(r[2])).filter(Boolean));
    const codes = v.map(r => {
      if (String(r[0]).trim() && String(r[1]).trim() && !String(r[2]).trim()) {
        let c;
        do { c = WORDS[Math.floor(Math.random() * WORDS.length)] + (10 + Math.floor(Math.random() * 90)); } while (used.has(c));
        used.add(c); made++;
        return [c];
      }
      return [r[2]];
    });
    sh.getRange(2, 3, n - 1, 1).setNumberFormat('@').setValues(codes);
    sh.getRange(2, 1, n - 1, 1).setNumberFormat('@').setValues(v.map(r => [groupText(r[0])])); // групи — текстом, не датою
  }
  try { SpreadsheetApp.getUi().alert(made ? `Створено нових кодів: ${made}` : 'Нових учнів без коду не знайдено.'); } catch (e) {}
  return made;
}

/* ---------- пошук учня ---------- */
// Якщо таблиця сама перетворила «2026-1» на дату (1 січня 2026), повертаємо назад текст групи.
function dateText(v) {
  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  return Utilities.formatDate(v, tz, v.getDate() === 1 ? 'yyyy-M' : 'yyyy-M-d');
}
function groupText(v) { return v instanceof Date ? dateText(v) : String(v == null ? '' : v).trim(); }

function norm(v) {
  if (v instanceof Date) v = dateText(v);
  return String(v == null ? '' : v).trim().toLowerCase().replace(/\s+/g, ' ');
}

// Група: лише числа без провідних нулів — «2026-61», «2026-6-1» і «2026 61» вважаються однією групою, «2026-01» = «2026-1».
function groupKey(v) {
  return groupText(v).split(/\D+/).filter(Boolean).map(x => String(Number(x))).join('');
}
// Ім'я: слова без цифр і розділових знаків, у будь-якому порядку — «Іван Петренко6 99» = «Петренко Іван».
function nameKey(v) {
  return norm(v).replace(/[^a-zа-яіїєґ' ]/g, ' ').split(' ').filter(w => w.length > 1).sort().join(' ');
}

function findStudent(group, code) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(STUDENTS);
  if (!sh || sh.getLastRow() < 2) return null;
  const g = groupKey(group), c = norm(code);
  if (!g || !c) return null;
  const v = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
  const r = v.find(r => groupKey(r[0]) === g && norm(r[2]) === c);
  return r ? { group: groupText(r[0]), name: String(r[1]).trim(), code: String(r[2]).trim() } : null;
}

/* ---------- читання прогресу (вхід учня) ---------- */
function doGet(e) {
  const p = e.parameter || {};
  if (p.action === 'setup') { setup(); return json({ ok: true }); }
  if (p.action === 'leaders') {
    const me = findStudent(p.group, p.code);
    return json(me ? leadersOf(me) : { ok: false, error: 'notfound' });
  }
  if (p.action !== 'login') return json({ ok: false, error: 'action' });
  const s = findStudent(p.group, p.code);
  if (!s) return json({ ok: false, error: 'notfound' });
  return json({ ok: true, name: s.name, group: s.group, history: historyOf(s), state: stateOf(s) });
}

function historyOf(s) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sh || sh.getLastRow() < 2) return [];
  const width = Math.min(HEADER.length, sh.getLastColumn());
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, width).getValues();
  const g = groupKey(s.group), nm = nameKey(s.name), c = norm(s.code);
  const val = v => (v === '' || v == null) ? null : Number(v);
  return rows.filter(r => {
    const rc = norm(r[14]);
    return rc ? rc === c : (groupKey(r[1]) === g && nameKey(r[2]) === nm); // старі рядки без коду — за групою та ім'ям
  }).map(r => ({
    id: String(r[3]), ts: r[0] instanceof Date ? r[0].getTime() : Date.parse(r[0]) || 0,
    stars: val(r[5]) || 1, acc: val(r[6]) || 0, cpm: val(r[7]) || 0, errs: val(r[8]) || 0, sec: val(r[9]) || 0,
    rhythm: val(r[10]), beat: val(r[13])
  }));
}

/* ---------- лідери тижня ---------- */
// Рейтинг групи учня: усі учні групи за спаданням НОВИХ зірочок, здобутих з понеділка (за часом таблиці).
// Рейтинг бачать лише учні цієї самої групи (потрібен код). Вправи «слабкі клавіші» не рахуються.
function leadersOf(me) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const st = ss.getSheetByName(STUDENTS), sh = ss.getSheetByName(SHEET_NAME);
  const g = groupKey(me.group), tz = ss.getSpreadsheetTimeZone(), day = d => Utilities.formatDate(d, tz, 'yyyy-MM-dd');
  const now = new Date(), dow = Number(Utilities.formatDate(now, tz, 'u')) || now.getDay() || 7; // 1 — понеділок
  const monday = day(new Date(now.getTime() - (dow - 1) * 86400000));
  const studs = st.getRange(2, 1, st.getLastRow() - 1, 3).getValues()
    .filter(r => groupKey(r[0]) === g && String(r[1]).trim() && String(r[2]).trim())
    .map(r => ({ name: String(r[1]).trim(), code: norm(r[2]), nk: nameKey(r[1]), before: {}, week: {} }));
  if (sh && sh.getLastRow() >= 2) {
    const rows = sh.getRange(2, 1, sh.getLastRow() - 1, Math.min(HEADER.length, sh.getLastColumn())).getValues();
    rows.forEach(r => {
      const id = String(r[3]), stars = Number(r[5]) || 0, rc = norm(r[14]);
      if (!id || id.indexOf('weak-') === 0 || !(r[0] instanceof Date)) return;
      const s = rc ? studs.find(x => x.code === rc) : (groupKey(r[1]) === g ? studs.find(x => x.nk === nameKey(r[2])) : null);
      if (!s) return;
      const bucket = day(r[0]) >= monday ? s.week : s.before;
      bucket[id] = Math.max(bucket[id] || 0, stars);
    });
  }
  const list = studs.map(s => {
    let gain = 0, total = 0;
    Object.keys(s.week).forEach(id => { gain += Math.max(0, s.week[id] - (s.before[id] || 0)); });
    const ids = {}; Object.keys(s.before).concat(Object.keys(s.week)).forEach(id => { ids[id] = Math.max(s.before[id] || 0, s.week[id] || 0); });
    Object.keys(ids).forEach(id => { total += ids[id]; });
    return { name: s.name, gain: gain, total: total, me: s.code === norm(me.code) };
  }).sort((a, b) => b.gain - a.gain || b.total - a.total);
  let place = 0, prev = null;
  list.forEach(x => { if (x.gain !== prev) { place++; prev = x.gain; } x.place = place; });
  const mine = list.find(x => x.me) || { gain: 0, place: null };
  return { ok: true, since: monday, size: studs.length,
    top: list.map(x => ({ place: x.place, name: x.name, gain: x.gain, total: x.total, me: x.me })),
    me: { place: mine.place, gain: mine.gain } };
}

function stateOf(s) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(STATE);
  if (!sh || sh.getLastRow() < 2) return null;
  const v = sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues();
  const r = v.find(r => norm(r[1]) === norm(s.code));
  if (!r) return null;
  try { return JSON.parse(r[3]); } catch (e) { return null; }
}

/* ---------- запис результату ---------- */
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = null;
  if (d.code) {
    s = findStudent(d.cls, d.code);
    if (!s) return ContentService.createTextOutput('notfound');
  }
  if (d.kind !== 'state') {
    const sh = resultsSheet(ss);
    sh.appendRow([
      new Date(), clean(s ? s.group : d.cls), clean(s ? s.name : d.name), clean(d.lesson), clean(d.title),
      num(d.stars), num(d.accuracy), num(d.cpm), num(d.errors), num(d.seconds),
      num(d.rhythm), num(d.metronome), num(d.tempo), num(d.beat), clean(s ? s.code : '')
    ]);
  }
  if (s && d.state) saveState(ss, s, d.state);
  return ContentService.createTextOutput('ok');
}

function saveState(ss, s, blob) {
  const sh = ensure(ss, STATE, STATE_HEADER);
  const text = JSON.stringify(blob).slice(0, 45000);
  const n = sh.getLastRow();
  if (n >= 2) {
    const codes = sh.getRange(2, 2, n - 1, 1).getValues();
    const i = codes.findIndex(r => norm(r[0]) === norm(s.code));
    if (i >= 0) { sh.getRange(i + 2, 3, 1, 3).setValues([[clean(s.name), text, new Date()]]); return; }
  }
  sh.appendRow([clean(s.group), clean(s.code), clean(s.name), text, new Date()]);
}

/* ---------- допоміжне ---------- */
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Текст від учнів завжди зберігається як текст: не стане ні формулою, ні датою.
function clean(v) {
  const s = String(v == null ? '' : v).slice(0, 60);
  return "'" + s; // апостроф: таблиця зберігає як текст (група «2026-61» не стане датою)
}

// Порожнє значення (наприклад, метроном вимкнено) лишається порожнім, а не 0.
function num(v) {
  if (v === '' || v == null) return '';
  const n = Number(v);
  return isFinite(n) ? n : '';
}
