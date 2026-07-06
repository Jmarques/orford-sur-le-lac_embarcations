// Boucle de feedback visuelle des agents (décision 0006).
// `npm run screenshots`         : API mockée, tous les états, desktop + mobile.
// `npm run screenshots -- --live` : vraie API (lecture seule), états par défaut seulement.
// `npm run screenshots -- --page structures` : seulement les scénarios d'une page
//   (boucle interne rapide — la revue et verify restent sur la génération complète).
// À la fin, chaque capture est comparée à la baseline committée (HEAD) : seules
// les captures listées « modifiée/nouvelle » ont besoin d'une revue visuelle.

import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
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
import {
  comparerCapture,
  fichiersBaseline,
  preparerDossierDiff,
} from './diff-captures.mjs';

const PORT = 8907;
const BASE = `http://localhost:${PORT}`;
const SORTIE = fileURLToPath(new URL('../screenshots/', import.meta.url));
const DOSSIER_DIFF = `${SORTIE}.diff/`;
const enDirect = process.argv.includes('--live');
const indexArgPage = process.argv.indexOf('--page');
const pageFiltree = indexArgPage === -1 ? null : process.argv[indexArgPage + 1].replace(/\.html$/, '');

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

  let scenarios = enDirect ? CAPTURES.filter((c) => !c.etat) : CAPTURES;
  if (pageFiltree) {
    scenarios = scenarios.filter((c) => c.page === `${pageFiltree}.html`);
    if (scenarios.length === 0) {
      throw new Error(`Aucun scénario pour la page « ${pageFiltree} » — voir tools/captures.mjs.`);
    }
  }
  const problemes = [];
  const generees = [];
  preparerDossierDiff(DOSSIER_DIFF);
  const navigateur = await chromium.launch();
  for (const scenario of scenarios) {
    for (const [nomViewport, viewport] of Object.entries(VIEWPORTS)) {
      // reducedMotion : les animations du thème (toutes sous
      // prefers-reduced-motion) ne polluent pas le diff pixel vs baseline.
      const page = await navigateur.newPage({ viewport, reducedMotion: 'reduce' });
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
          const requete = route.request();
          let reponse = REPONSES_MOCK.config;
          if (requete.method() === 'POST') {
            // Même routage que doPost (apps-script/Code.js) : `action` dans le corps.
            const corps = JSON.parse(requete.postData() || '{}');
            // `reponses` d'un scénario : mock spécifique (ex. échec simulé).
            reponse = (scenario.reponses && scenario.reponses[corps.action])
              || REPONSES_MOCK[corps.action] || REPONSES_MOCK.creation;
          }
          route.fulfill({ contentType: 'application/json', body: JSON.stringify(reponse) });
        });
        await page.route('**/config.js', (route) => {
          route.fulfill({ contentType: 'application/javascript', body: CONFIG_JS_MOCK });
        });
      }
      await page.goto(urlDeScenario(BASE, scenario));
      // `cliquer` : un sélecteur ou une liste, cliqués dans l'ordre. Avant
      // chaque clic : plus aucun custom element en attente d'upgrade — le
      // loader Web Awesome charge à la demande, un clic trop tôt tombe sur un
      // composant pas encore câblé et se perd.
      for (const selecteur of [].concat(scenario.cliquer || [])) {
        await page.waitForSelector(selecteur, { timeout: 15000 });
        await page.waitForFunction(
          () => document.querySelectorAll(':not(:defined)').length === 0,
          { timeout: 15000 },
        );
        await page.click(selecteur);
      }
      // `presenceSeule` : attend l'existence du sélecteur (attributs d'état des
      // web components dont le host est « invisible » pour Playwright), pas sa
      // visibilité.
      await page.waitForSelector(scenario.attendre, {
        timeout: 15000,
        state: scenario.presenceSeule ? 'attached' : 'visible',
      });
      if (scenario.defiler) {
        await page.$$eval(scenario.defiler, (zones) => {
          for (const zone of zones) zone.scrollLeft = zone.scrollWidth;
        });
      }
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(600);
      const nomFichier = `${scenario.nom}--${nomViewport}.png`;
      await page.screenshot({ path: `${SORTIE}${nomFichier}`, fullPage: !scenario.pleinVue });
      generees.push(nomFichier);
      console.log(`✓ ${scenario.nom} (${nomViewport})`);
      await page.close();
    }
  }
  await navigateur.close();

  // Comparaison à la baseline (HEAD) : la revue visuelle ne porte que sur ce
  // delta, pas sur l'ensemble des captures.
  const modifiees = [];
  const nouvelles = [];
  for (const nomFichier of generees) {
    const resultat = comparerCapture(nomFichier, readFileSync(`${SORTIE}${nomFichier}`), DOSSIER_DIFF);
    if (resultat.statut === 'nouvelle') nouvelles.push(nomFichier);
    if (resultat.statut === 'modifiee') modifiees.push({ nom: nomFichier, ...resultat });
  }
  const obsoletes = (enDirect || pageFiltree)
    ? []
    : fichiersBaseline().filter((nomFichier) => !generees.includes(nomFichier));

  console.log('');
  if (modifiees.length === 0 && nouvelles.length === 0 && obsoletes.length === 0) {
    console.log('✓ Aucune différence visuelle avec la baseline committée — rien à revoir.');
  } else {
    console.log(`Δ vs baseline (HEAD) : ${modifiees.length} modifiée(s), ${nouvelles.length} nouvelle(s), ${obsoletes.length} obsolète(s).`);
    for (const capture of modifiees) {
      const detail = capture.pixels === null ? 'dimensions différentes' : `${capture.pixels} px`;
      console.log(`  ~ ${capture.nom} (${detail}) — avant/différence dans screenshots/.diff/`);
    }
    for (const nomFichier of nouvelles) console.log(`  + ${nomFichier}`);
    for (const nomFichier of obsoletes) console.log(`  - ${nomFichier} (dans HEAD mais plus générée — à supprimer du dépôt)`);
    console.log('Revue visuelle : ces captures-là seulement ; intentionnel → committer les PNG avec le code.');
  }
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
