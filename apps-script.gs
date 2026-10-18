// Код для Google Таблиці: Розширення → Apps Script → вставити цей код → Розгорнути як веб-застосунок.
// Приймає результати з тренажера «Клік» і дописує рядок на аркуш «Результати».

const SHEET_NAME = 'Результати';
const HEADER = ['Дата і час', 'Група', 'Учень', 'Урок', 'Назва уроку', 'Зірочки', 'Точність, %', 'Швидкість, зн/хв', 'Помилки', 'Час, с',
                'Ритмічність, %', 'Метроном, уд/хв', 'Темп учня, уд/хв'];

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADER);
    sh.setFrozenRows(1);
  } else if (sh.getRange(1, HEADER.length).getValue() === '') {
    // Дописати заголовки нових колонок, не чіпаючи вже заповнені.
    const cur = sh.getRange(1, 1, 1, HEADER.length).getValues()[0];
    sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER.map((h, i) => cur[i] || h)]);
  }
  sh.appendRow([
    new Date(), clean(d.cls), clean(d.name), clean(d.lesson), clean(d.title),
    num(d.stars), num(d.accuracy), num(d.cpm), num(d.errors), num(d.seconds),
    num(d.rhythm), num(d.metronome), num(d.tempo)
  ]);
  return ContentService.createTextOutput('ok');
}

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
