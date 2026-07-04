// Boucle de feedback visuelle des agents (décision 0006).
// `npm run screenshots`         : API mockée, tous les états, desktop + mobile.
// `npm run screenshots -- --live` : vraie API (lecture seule), états par défaut seulement.

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import {
  CAPTURES,
  VIEWPORTS,
  REPONSES_MOCK,
  CONFIG_JS_MOCK,
  CONSOLE_IGNOREE,
  estProblemeConsole,
  urlDeScenario,
} from './captures.mjs';

const PORT = 8907;
const BASE = `http://localhost:${PORT}`;
const SORTIE = fileURLToPath(new URL('../screenshots/', import.meta.url));
const enDirect = process.argv.includes('--live');

async function attendreServeur() {
  for (let essai = 0; essai < 40; essai++) {
    try {
      const reponse = await fetch(`${BASE}/index.html`);
      if (reponse.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Le serveur local ne répond pas sur ${BASE} — http-server est-il installé ?`);
}

const serveur = spawn('npx', ['http-server', 'site', '-p', String(PORT), '-c-1', '--silent'], {
  stdio: 'ignore',
});

let codeSortie = 0;
try {
  await attendreServeur();
  mkdirSync(SORTIE, { recursive: true });

  const scenarios = enDirect ? CAPTURES.filter((c) => !c.etat) : CAPTURES;
  const problemes = [];
  const navigateur = await chromium.launch();
  for (const scenario of scenarios) {
    for (const [nomViewport, viewport] of Object.entries(VIEWPORTS)) {
      const page = await navigateur.newPage({ viewport });
      const contexte = `${scenario.nom} (${nomViewport})`;
      page.on('console', (message) => {
        if (estProblemeConsole(message.type(), message.text(), CONSOLE_IGNOREE)) {
          problemes.push(`${contexte} — console.${message.type()} : ${message.text()}`);
        }
      });
      page.on('pageerror', (erreur) => {
        problemes.push(`${contexte} — exception non attrapée : ${erreur.message}`);
      });
      if (!enDirect) {
        await page.route('**/script.google.com/**', (route) => {
          const reponse = route.request().method() === 'GET' ? REPONSES_MOCK.config : REPONSES_MOCK.creation;
          route.fulfill({ contentType: 'application/json', body: JSON.stringify(reponse) });
        });
        await page.route('**/config.js', (route) => {
          route.fulfill({ contentType: 'application/javascript', body: CONFIG_JS_MOCK });
        });
      }
      await page.goto(urlDeScenario(BASE, scenario));
      if (scenario.cliquer) {
        await page.waitForSelector('#formulaire:not([hidden])', { timeout: 15000 });
        await page.click(scenario.cliquer);
      }
      await page.waitForSelector(scenario.attendre, { timeout: 15000 });
      await page.waitForTimeout(600);
      const fichier = `${SORTIE}${scenario.nom}--${nomViewport}.png`;
      await page.screenshot({ path: fichier, fullPage: true });
      console.log(`✓ ${scenario.nom} (${nomViewport})`);
      await page.close();
    }
  }
  await navigateur.close();
  if (problemes.length > 0) {
    console.error(`\n✗ ${problemes.length} problème(s) console détecté(s) :`);
    for (const probleme of problemes) console.error('  - ' + probleme);
    console.error('(Motifs tolérables : CONSOLE_IGNOREE dans tools/captures.mjs.)');
    throw new Error('La console du navigateur contient des erreurs ou avertissements.');
  }
  console.log(`\nCaptures dans screenshots/ (${scenarios.length * Object.keys(VIEWPORTS).length} fichiers, mode ${enDirect ? 'live' : 'mock'}) — console propre.`);
} catch (erreur) {
  console.error(erreur);
  codeSortie = 1;
} finally {
  serveur.kill();
}
process.exit(codeSortie);
