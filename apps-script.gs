// Код для Google Таблиці: Розширення → Apps Script → вставити цей код → Розгорнути як веб-застосунок.
// Приймає результати з тренажера й дописує рядок на аркуш «Результати».

const SHEET_NAME = 'Результати';
const HEADER = ['Дата і час', 'Клас', 'Учень', 'Урок', 'Назва уроку', 'Зірочки', 'Точність, %', 'Швидкість, зн/хв', 'Помилки', 'Час, с'];

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADER);
    sh.setFrozenRows(1);
  }
  sh.appendRow([
    new Date(), clean(d.cls), clean(d.name), clean(d.lesson), clean(d.title),
    num(d.stars), num(d.accuracy), num(d.cpm), num(d.errors), num(d.seconds)
  ]);
  return ContentService.createTextOutput('ok');
}

// Текст від учнів завжди зберігається як текст: не стане ні формулою, ні датою.
function clean(v) {
  const s = String(v == null ? '' : v).slice(0, 60);
  return "'" + s; // апостроф: таблиця зберігає як текст (клас «6-1» не стане датою)
}

function num(v) {
  const n = Number(v);
  return isFinite(n) ? n : '';
}
