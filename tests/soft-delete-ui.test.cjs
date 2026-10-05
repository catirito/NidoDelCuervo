const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { Miniflare, convertV4MiniflareOptions } = require(process.env.MINIFLARE_MODULE || 'miniflare');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
(async () => {
 const base = process.argv[2] || 'http://127.0.0.1:8788';
 assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname));
 const config = JSON.parse(fs.readFileSync('wrangler.jsonc','utf8')); assert.equal(config.d1_databases[0].remote,false);
 const runtime = new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {}',resourcePersistencePath:path.resolve('.wrangler/state/v3'),d1Databases:{DB:config.d1_databases[0].database_id}}));
 const db = await runtime.getD1Database('DB');
 const read = async query => (await (await fetch(`${base}/api/characters?${query || 'pageSize=all'}`)).json());
 const initial = await read(); const prefix = `UI borrar ${randomUUID().slice(0,8)}`; const fixtures=[];
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const page = await browser.newPage({viewport:{width:1900,height:1100},colorScheme:'dark'});
 const errors=[],writes=[]; page.on('pageerror',error=>errors.push(error.message)); page.on('request',request=>{if(request.method()==='PATCH')writes.push(request.postDataJSON());});
 const row=id=>page.locator(`tr[data-character-id="${id}"]`);
 const button=id=>row(id).locator('.delete-button');
 const ready=()=>page.waitForFunction(()=>document.querySelector('.results').getAttribute('aria-busy')==='false');
 const current=async id=>(await read(`ids=${id}`)).characters[0];
 const remotePatch=async (id,fields)=>{const character=await current(id);const response=await fetch(base+'/api/characters/batch',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({changes:[{id,expectedVersion:character.version,fields}]})});assert.equal(response.status,200);};
 async function visit(){await page.goto(base);await page.waitForSelector('tbody tr');await page.selectOption('#page-size','20');await ready();}
 try {
  for(let n=0;n<23;n++){
   const body={id:randomUUID(),fields:{PERSONAJE:`${prefix} ${n}`,CLASS:initial.catalogs.classes[0].name,SPECIE:initial.catalogs.species[0].name,PROPIETARIO:prefix,NIVEL:20}};
   const response=await fetch(base+'/api/characters',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert.equal(response.status,201);fixtures.push(body);
  }
  const [a,b,c,d,e,f]=fixtures;const last=fixtures.at(-1);
  await visit(); assert.equal(await page.locator('.delete-button').count(),0);
  await page.click('#edit-button'); assert.equal(await page.locator('.editing-table').count(),1); assert.equal(await row(a.id).locator('.editor-field-label').count(),9);
  await row(a.id).locator('input[data-editor="PERSONAJE"]').fill(`${prefix} editado`);
  await button(a.id).click(); assert.equal(await button(a.id).getAttribute('aria-pressed'),'true'); assert.equal(writes.length,0);
  assert.equal(await button(a.id).evaluate(element=>element===document.activeElement),true);
  await button(a.id).press('Enter'); assert.equal(await button(a.id).getAttribute('aria-pressed'),'false'); assert.equal(await row(a.id).locator('input[data-editor="PERSONAJE"]').inputValue(),`${prefix} editado`);
  await button(a.id).click();
  await page.click('#next-page');await ready();await button(last.id).click();
  assert.match(await page.locator('#draft-status').textContent(),/2 personajes modificados · 2 pendientes de eliminar/);
  await page.click('#previous-page');await ready();assert.equal(await button(a.id).getAttribute('aria-pressed'),'true');
  await button(a.id).scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/nido-010-desktop.png'});
  await page.route('**/api/characters/batch',async route=>{await route.fetch();await route.abort('failed');});
  await page.click('#edit-button');await page.waitForFunction(()=>!document.querySelector('#refresh-draft').hidden);
  assert.equal(await page.locator('#edit-button').isDisabled(),true);
  await page.unroute('**/api/characters/batch');const sent=writes.length;
  await page.click('#refresh-draft');await page.waitForFunction(()=>!document.querySelector('#edit-button').disabled);
  assert.match(await page.locator('#draft-status').textContent(),/eliminación y campos ya guardados/);
  assert.equal(await row(a.id).count(),0);assert.equal(writes.length,sent);
  await page.click('#edit-button');await page.waitForFunction(()=>document.querySelector('#edit-button').textContent==='Editar');
  assert.equal((await current(a.id)).PERSONAJE,`${prefix} editado`);assert.equal((await current(last.id)).is_deleted,true);
  const other=await browser.newPage();await other.goto(base);await other.waitForSelector('tbody tr');assert.equal(await other.locator(`tr[data-character-id="${a.id}"]`).count(),0);
  await page.click('#edit-button');await button(c.id).click();
  await page.route('**/api/characters?*',route=>route.fulfill({status:503,body:'{}'}));await page.click('#edit-button');
  await page.waitForFunction(()=>!document.querySelector('#error-state').hidden);assert.match(await page.locator('#draft-status').textContent(),/Cambios guardados/);
  const beforeRetry=writes.length;await page.unroute('**/api/characters?*');await page.click('#retry-load');await ready();assert.equal(writes.length,beforeRetry);assert.equal(await row(c.id).count(),0);
  await page.click('#edit-button');await row(d.id).locator('input[data-editor="PERSONAJE"]').fill(`${prefix} propuesta`);await button(d.id).click();
  await remotePatch(d.id,{PERSONAJE:`${prefix} remoto`,is_deleted:true});await page.click('#edit-button');await page.waitForFunction(()=>!document.querySelector('#refresh-draft').hidden);await page.click('#refresh-draft');
  await page.waitForFunction(()=>document.querySelector('#missing-drafts').textContent.includes('está eliminado'));
  assert.equal(await row(d.id).count(),0);assert.equal(await page.locator('#edit-button').isDisabled(),true);assert.match(await page.locator('#draft-status').textContent(),/retira explícitamente/);
  await page.locator('#missing-drafts button').click();await page.click('#edit-button');assert.equal((await current(d.id)).PERSONAJE,`${prefix} remoto`);
  await page.click('#edit-button');await row(e.id).locator('input[data-editor="PERSONAJE"]').fill('');await button(e.id).click();const noInvalidWrites=writes.length;await page.click('#edit-button');assert.equal(writes.length,noInvalidWrites);assert.equal((await current(e.id)).is_deleted,false);
  await row(e.id).locator('input[data-editor="PERSONAJE"]').fill(e.fields.PERSONAJE);await button(e.id).click();await page.click('#edit-button');
  await page.click('#create-button');await page.fill('#create-PERSONAJE',`${prefix} alta incierta`);await page.selectOption('#create-CLASS',a.fields.CLASS);await page.selectOption('#create-SPECIE',a.fields.SPECIE);await page.selectOption('#create-PROPIETARIO',prefix);
  let createdId;
  await page.route('**/api/characters',async route=>{const body=route.request().postDataJSON();createdId=body.id;fixtures.push(body);await route.fetch();await remotePatch(body.id,{is_deleted:true});await route.abort('failed');});
  await page.click('#submit-create');await page.waitForFunction(()=>document.querySelector('#submit-create').textContent==='Comprobar y reintentar');await page.unroute('**/api/characters');await page.click('#submit-create');await page.waitForFunction(()=>!document.querySelector('#create-dialog').open);await ready();
  assert.match(await page.locator('#creation-status').textContent(),/se guardó y ahora está eliminado/);assert.equal((await current(createdId)).is_deleted,true);
  for(const width of [390,320]){
   await page.setViewportSize({width,height:844});await page.click('#theme-toggle');await page.click('#edit-button');await button(f.id).click();await button(f.id).scrollIntoViewIfNeeded();await page.screenshot({path:`/private/tmp/nido-010-mobile-${width}.png`});
   assert.equal(await button(f.id).isVisible(),true);await button(f.id).click();await page.click('#edit-button');
  }
  assert.deepEqual(errors,[]);console.log('Soft delete Chrome: toggle/focus, mixed edits, pages, lost response, conflict divergence, refresh failure, validation, second session, uncertain create then deleted, themes/mobile pass.');
 } finally {
  for(const item of fixtures){await db.prepare('DELETE FROM creation_requests WHERE character_id = ?').bind(item.id).run();await db.prepare('DELETE FROM characters WHERE id = ?').bind(item.id).run();}
  assert.deepEqual(await read(),initial);await browser.close();await runtime.dispose();
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
