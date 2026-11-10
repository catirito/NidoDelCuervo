const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const XLSX = require('../vendor/xlsx.full.min.js');
const base = process.argv[2] || 'http://127.0.0.1:8788';

(async () => {
  assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname));
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const settled = text => page.waitForFunction(expected => document.querySelector('#result-status')?.textContent.includes(expected), text);
  const start = await (await fetch(base + '/api/mascoteria?pageSize=all')).json();
  const tinka = start.pets.find(pet => pet.name === 'Tinka del clan Pirrika');
  const fixture = 'Prueba local ' + Date.now();
  let created;
  try {
    await page.goto(base);
    const link = page.getByRole('link', { name: 'Mascotería', exact: true });
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    assert.equal(await link.evaluate(element => element === document.activeElement), true);
    await page.keyboard.press('Enter');
    await settled('55');
    assert.equal(await page.getByRole('link', { name: 'Mascotería', exact: true }).getAttribute('aria-current'), 'page');
    assert.deepEqual((await page.locator('th:visible').allTextContents()).map(text => text.trim()), ['Nombre', 'Propietario', 'Animal', 'Ubicación']);
    assert.equal(await page.locator('tbody tr').count(), 50);
    if (process.env.MASCOTERIA_CAPTURE) await page.screenshot({ path: process.env.MASCOTERIA_CAPTURE });
    await page.selectOption('#filter-location', 'value:' + tinka.location);
    await page.fill('#name-search', 'Tinka del clan');
    await settled('1 de 55');
    for (const owner of tinka.owners) {
      const filtered = page.waitForResponse(response => new URL(response.url()).searchParams.get('owner') === owner.id);
      await page.selectOption('#filter-owner', 'value:' + owner.id);
      const { pets } = await (await filtered).json();
      assert.deepEqual(pets.map(pet => pet.id), [tinka.id]);
    }
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar Excel' }).click();
    const book = XLSX.read(readFileSync(await (await downloaded).path()));
    const rows = XLSX.utils.sheet_to_json(book.Sheets.Mascotería, { header: 1 });
    assert.equal(rows.length, 56);
    assert.equal(rows.find(row => row[0] === tinka.name)[1], tinka.owners.map(owner => owner.name).join(', '));
    await page.click('#reset-filters');
    await settled('55 de 55');
    await page.getByRole('button', { name: 'Añadir mascota' }).click();
    await page.getByLabel('Nombre', { exact: true }).fill(fixture);
    assert.equal(await page.locator('#pet-animal').evaluate(el => el.tagName), 'SELECT');
    assert.equal(await page.locator('#pet-location').evaluate(el => el.tagName), 'SELECT');
    await page.selectOption('#pet-animal', 'new');
    await page.getByLabel('Nuevo animal').fill('Animal de prueba');
    await page.selectOption('#pet-location', 'new');
    await page.getByLabel('Nueva ubicación').fill('Ubicación de prueba');
    const creation = page.waitForResponse(response => response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Guardar mascota' }).click();
    created = (await (await creation).json()).id;
    assert.deepEqual((await (await fetch(base + '/api/mascoteria?search=' + encodeURIComponent(fixture))).json()).pets.map(({ animal, location }) => [animal, location]), [['Animal de prueba', 'Ubicación de prueba']]);
    await settled('56 de 56');
    await page.getByRole('button', { name: 'Editar', exact: true }).click();
    const actionFontSizes = await page.locator('.results-bar .edit-actions button').evaluateAll(
      buttons => buttons.map(button => getComputedStyle(button).fontSize)
    );
    assert.deepEqual(actionFontSizes, ['13px', '13px', '13px', '13px']);
    await page.getByRole('button', { name: `Editar ${fixture}` }).click();
    const ownerSelect = page.getByLabel('Propietarios', { exact: true });
    assert.equal(await page.locator('select#owner-picker').count(), 1);
    await page.selectOption('#pet-location', { label: 'Mascotería' });
    for (const owner of tinka.owners.slice(0, 2)) {
      await ownerSelect.selectOption(owner.id);
      assert.equal(await ownerSelect.inputValue(), '');
      assert.equal(await ownerSelect.locator('option').evaluateAll((options, id) => options.some(option => option.value === id), owner.id), false);
    }
    await page.getByRole('button', { name: 'Aplicar al borrador' }).click();
    await page.click('#next-page');
    await page.waitForFunction(() => document.querySelector('#page-status').textContent === 'Página 2 de 2');
    await page.click('#previous-page');
    const pending = page.getByRole('row').filter({ hasText: fixture });
    await pending.getByRole('cell', { name: tinka.owners.slice(0, 2).map(owner => owner.name).join(', '), exact: true }).waitFor();
    await page.route('**/api/mascoteria/batch', route => route.abort());
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await page.locator('#pet-message').getByText('Se conservan los cambios pendientes.', { exact: false }).waitFor();
    await page.unroute('**/api/mascoteria/batch');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await page.getByRole('button', { name: 'Editar', exact: true }).waitFor();
    await page.reload();
    await settled('56 de 56');
    await page.getByRole('button', { name: 'Editar', exact: true }).click();
    const row = page.getByRole('row').filter({ hasText: fixture });
    await row.getByRole('cell', { name: tinka.owners.slice(0, 2).map(owner => owner.name).join(', '), exact: true }).waitFor();
    await row.getByRole('button', { name: 'Eliminar' }).click();
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await settled('55 de 55');
    const mobile = await browser.newPage({ viewport: { width: 320, height: 844 }, colorScheme: 'light' });
    mobile.on('pageerror', error => errors.push(error.message));
    await mobile.goto(page.url());
    await mobile.waitForSelector('tbody tr');
    assert.equal(await mobile.locator('tbody tr').count(), 20);
    assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await mobile.click('#theme-toggle');
    assert.equal(await mobile.locator('html').getAttribute('data-theme'), 'dark');
    await mobile.getByRole('link', { name: 'Registro de personajes' }).click();
    await mobile.getByRole('link', { name: 'Registro de personajes' }).waitFor();
    assert.deepEqual(errors, []);
    console.log('Mascotería en Chrome: menú y teclado, filtros, descarga completa, alta, borradores, error, baja, temas y móvil.');
  } finally {
    if (created) {
      const data = await (await fetch(base + '/api/mascoteria?pageSize=all')).json();
      const pet = data.pets.find(pet => pet.id === created);
      if (pet) await fetch(base + '/api/mascoteria/batch', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes: [{ id: pet.id, expectedVersion: pet.version, fields: { name: pet.name, isDeleted: true } }] })
      });
    }
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
