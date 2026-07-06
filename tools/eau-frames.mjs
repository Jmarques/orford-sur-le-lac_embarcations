// Vérifie EN MOUVEMENT la scène sous l'eau de la bande d'identité
// (site/eau.js, décision 0015) : une animation ne se juge jamais sur une
// capture statique.
//   - trois frames espacées doivent différer (l'animation vit) ;
//   - en prefers-reduced-motion, deux frames doivent être identiques (fixe).
// Échoue sur toute erreur/avertissement console hors CONSOLE_IGNOREE.
// ?etat=chargement fige la page sans appel réseau (hook décision 0006).
// `npm run frames-eau` — frames témoins dans screenshots/eau-frame-*.png.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { CONSOLE_IGNOREE, estProblemeConsole } from './captures.mjs';

const PORT = 8913;
const BASE = `http://localhost:${PORT}`;
const SORTIE = fileURLToPath(new URL('../screenshots/', import.meta.url));

async function attendreServeur() {
  for (let essai = 0; essai < 40; essai++) {
    try {
      const reponse = await fetch(`${BASE}/index.html`);
      if (reponse.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Le serveur local ne répond pas sur ${BASE}.`);
}

const serveur = spawn('npx', ['http-server', 'site', '-p', String(PORT), '-c-1', '--silent'], {
  stdio: 'ignore',
});

let codeSortie = 0;
try {
  await attendreServeur();
  mkdirSync(SORTIE, { recursive: true });
  const problemes = [];
  const navigateur = await chromium.launch();

  async function ouvrir(reducedMotion) {
    const page = await navigateur.newPage({
      viewport: { width: 1280, height: 900 },
      reducedMotion,
    });
    page.on('console', (message) => {
      if (estProblemeConsole(message.type(), message.text(), CONSOLE_IGNOREE)) {
        problemes.push(`eau (${reducedMotion}) — console.${message.type()} : ${message.text()}`);
      }
    });
    page.on('pageerror', (erreur) => {
      problemes.push(`eau (${reducedMotion}) — exception non attrapée : ${erreur.message}`);
    });
    await page.goto(`${BASE}/index.html?etat=chargement`);
    await page.waitForFunction(
      () => document.querySelectorAll(':not(:defined)').length === 0,
      { timeout: 15000 },
    );
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    return page;
  }

  async function frameBande(page) {
    const boite = await page.locator('.bande-lac').boundingBox();
    return page.screenshot({
      clip: { x: boite.x, y: boite.y, width: boite.width, height: boite.height },
    });
  }

  // 1) Animation active : trois frames espacées, toutes différentes.
  const pageAnimee = await ouvrir('no-preference');
  const frames = [];
  for (let i = 0; i < 3; i++) {
    frames.push(await frameBande(pageAnimee));
    writeFileSync(`${SORTIE}eau-frame-${i}.png`, frames[i]);
    if (i < 2) await pageAnimee.waitForTimeout(1200);
  }
  await pageAnimee.close();
  if (frames[0].equals(frames[1]) || frames[1].equals(frames[2])) {
    throw new Error('La bande d\'identité est figée : les frames espacées sont identiques.');
  }
  console.log('✓ animation vivante — 3 frames distinctes (eau-frame-*.png)');

  // 2) prefers-reduced-motion : image fixe, deux frames identiques.
  const pageReduite = await ouvrir('reduce');
  const fixe1 = await frameBande(pageReduite);
  await pageReduite.waitForTimeout(1200);
  const fixe2 = await frameBande(pageReduite);
  await pageReduite.close();
  if (!fixe1.equals(fixe2)) {
    throw new Error('En prefers-reduced-motion, la scène bouge encore.');
  }
  console.log('✓ prefers-reduced-motion — image fixe');

  await navigateur.close();
  if (problemes.length > 0) {
    console.error(`\n✗ ${problemes.length} problème(s) console :`);
    for (const probleme of problemes) console.error('  - ' + probleme);
    throw new Error('La console du navigateur contient des erreurs ou avertissements.');
  }
  console.log('\nVérification du mouvement réussie — console propre.');
} catch (erreur) {
  console.error(erreur);
  codeSortie = 1;
} finally {
  serveur.kill();
}
process.exit(codeSortie);
