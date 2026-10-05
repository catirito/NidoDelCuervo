const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

(async () => {
  const context = {};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('vendor/xlsx.full.min.js', 'utf8'), context);
  const xlsx = context.XLSX;
  const fields = ['PERSONAJE', 'CLASS', 'SUBCLASS', 'SPECIE', 'NIVEL', 'RANGO', 'ESTADO', 'PROPIETARIO', 'NOTAS'];
  const source = xlsx.read(fs.readFileSync('Registro de personajes.xlsx'), { type: 'buffer' });
  let characters = xlsx.utils.sheet_to_json(source.Sheets['Nido del Cuervo']).map((row, index) => ({ ...Object.fromEntries(fields.map(field => [field, row[field] ?? null])), id: `character-${index}`, sourceRow: index + 2, version: 1 }));
  const catalogs = { classes: [], subclasses: [], species: [] };
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ acceptDownloads: true });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let mode = 'ok';
    let releaseSave;
    await page.route('**/api/characters', route => mode === 'error' ? route.fulfill({ status: 500 }) : route.fulfill({ json: { characters: mode === 'empty' ? [] : characters, catalogs } }));
    await page.route('**/api/characters/batch', async route => {
      const { changes } = route.request().postDataJSON();
      await new Promise(resolve => { releaseSave = resolve; });
      characters = characters.map(character => {
        const change = changes.find(item => item.id === character.id);
        return change ? { ...character, ...change.fields, version: character.version + 1 } : character;
      });
      await route.fulfill({ json: { characters, catalogs } });
    });
    const base = process.argv[2] || 'http://127.0.0.1:8790';
    assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Solo pruebas locales.');
    await page.goto(base);
    const button = page.locator('#export-button');
    await button.waitFor();
    await page.waitForFunction(() => !document.querySelector('#export-button').disabled);
    const total = characters.length;
    await page.fill('#name-search', 'NO-EXISTE-123');
    assert.equal(await page.locator('#characters-body tr').count(), 0);
    assert.equal(await button.isEnabled(), true);
    await page.selectOption('#filter-class', { index: 1 });
    await page.click('th[data-sort="CLASS"] button');
    const requests = [];
    page.on('request', request => requests.push(request.url()));
    async function download() {
      requests.length = 0;
      const event = page.waitForEvent('download');
      await button.click();
      const result = await event;
      assert.match(result.suggestedFilename(), /^nido-del-cuervo-personajes-\d{4}-\d{2}-\d{2}\.xlsx$/);
      const workbook = xlsx.read(fs.readFileSync(await result.path()), { type: 'buffer' });
      assert.deepEqual(Array.from(workbook.SheetNames), ['Personajes']);
      assert.equal(requests.length, 0);
      return xlsx.utils.sheet_to_json(workbook.Sheets.Personajes, { header: 1, defval: null });
    }
    const rows = await download();
    assert.equal(rows.length, total + 1);
    const textOrder = new Intl.Collator('es', { sensitivity: 'variant', numeric: false });
    const expected = [...characters].sort((a, b) => !a.CLASS || !b.CLASS ? (!a.CLASS !== !b.CLASS ? (!a.CLASS ? 1 : -1) : a.sourceRow - b.sourceRow) : textOrder.compare(a.CLASS, b.CLASS) || a.sourceRow - b.sourceRow);
    assert.deepEqual(Array.from(rows.slice(1), row => row[0]), expected.map(character => character.PERSONAJE));
    await page.evaluate(() => { window.originalWrite = XLSX.writeFile; XLSX.writeFile = () => { throw new Error('failure'); }; });
    await button.click();
    assert.match(await page.locator('#export-status').innerText(), /No se pudo/);
    assert.equal(await button.isEnabled(), true);
    await page.evaluate(() => { XLSX.writeFile = window.originalWrite; });
    await download();
    await page.click('#reset-filters');
    await page.click('#edit-button');
    assert.equal(await button.isDisabled(), true);
    await page.click('#edit-button');
    assert.equal(await button.isEnabled(), true);
    await page.click('#edit-button');
    await page.locator('[data-editor="PERSONAJE"]').first().fill('Exportación actualizada');
    await page.click('#edit-button');
    await page.waitForFunction(() => document.querySelector('#edit-button').textContent === 'Guardando…');
    assert.equal(await button.isDisabled(), true);
    await page.waitForTimeout(100);
    releaseSave();
    await page.waitForFunction(() => !document.querySelector('#export-button').disabled);
    assert((await download()).some(row => row[0] === 'Exportación actualizada'));
    await button.focus();
    assert.equal(await button.evaluate(element => element === document.activeElement), true);
    const keyboardDownload = page.waitForEvent('download');
    await page.keyboard.press('Enter');
    await keyboardDownload;
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      const box = await button.boundingBox();
      assert(box.x >= 0 && box.x + box.width <= width);
      if (width === 390) await page.screenshot({ path: '/private/tmp/nido-export-mobile.png' });
    }
    mode = 'empty';
    await page.reload();
    await page.waitForFunction(() => document.querySelector('.results').getAttribute('aria-busy') === 'false');
    assert.equal(await button.isDisabled(), true);
    mode = 'error';
    await page.reload();
    await page.locator('#error-state').waitFor({ state: 'visible' });
    assert.equal(await button.isDisabled(), true);
    mode = 'ok';
    await page.click('#retry-load');
    await page.waitForFunction(() => !document.querySelector('#export-button').disabled);
    assert.deepEqual(errors, []);
    console.log(`Browser export verified: ${total} characters, filters, order, errors, editing, saved updates, keyboard and mobile. API intercepted; D1 untouched.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
