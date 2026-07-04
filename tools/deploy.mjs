// npm run deploy — déploie le BACKEND (Apps Script) seulement ; le frontend se
// déploie par simple push sur main (workflow Pages). Décision 0005.
// Ne commit ni ne pousse jamais : ne touche que Google et les fichiers d'état.

import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { empreinteDeContenus, mettreAJourApiUrl } from './deploiement.mjs';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const DOSSIER_GAS = `${RACINE}apps-script/`;
const FICHIER_ETAT = `${RACINE}.deployment.json`;
const ANCIEN_FICHIER_ID = `${RACINE}.deployment-id`;
const FICHIER_CONFIG = `${RACINE}site/config.js`;
const forcer = process.argv.includes('--force');

const fichiers = readdirSync(DOSSIER_GAS)
  .filter((nom) => !nom.startsWith('.'))
  .map((chemin) => ({ chemin, contenu: readFileSync(DOSSIER_GAS + chemin, 'utf8') }));
if (fichiers.length === 0) throw new Error(`Aucune source dans ${DOSSIER_GAS}.`);
const empreinte = empreinteDeContenus(fichiers);

let etat = existsSync(FICHIER_ETAT) ? JSON.parse(readFileSync(FICHIER_ETAT, 'utf8')) : null;
if (!etat && existsSync(ANCIEN_FICHIER_ID)) {
  etat = { id: readFileSync(ANCIEN_FICHIER_ID, 'utf8').trim(), empreinteSources: null };
}
if (!etat || !etat.id) {
  throw new Error(
    'Aucun ID de déploiement connu (.deployment.json absent). Première mise en service : voir README « Première mise en service ».'
  );
}

if (etat.empreinteSources === empreinte && !forcer) {
  console.log('Backend inchangé depuis le dernier déploiement — rien à faire.');
  console.log('(`npm run deploy -- --force` pour redéployer quand même ; frontend = git push.)');
  process.exit(0);
}

console.log('Déploiement du backend Apps Script…');
execFileSync('clasp', ['push', '-f'], { stdio: 'inherit', cwd: RACINE });
execFileSync('clasp', ['deploy', '-i', etat.id, '-d', new Date().toISOString().slice(0, 10)], {
  stdio: 'inherit',
  cwd: RACINE,
});

writeFileSync(FICHIER_ETAT, JSON.stringify({ id: etat.id, empreinteSources: empreinte }, null, 2) + '\n');
if (existsSync(ANCIEN_FICHIER_ID)) unlinkSync(ANCIEN_FICHIER_ID);

const config = readFileSync(FICHIER_CONFIG, 'utf8');
const configMiseAJour = mettreAJourApiUrl(config, etat.id);
if (configMiseAJour !== config) {
  writeFileSync(FICHIER_CONFIG, configMiseAJour);
  console.log('site/config.js mis à jour (URL de l\'API) — commitez et poussez pour déployer le frontend.');
}

console.log('Backend déployé (URL /exec inchangée). Pensez à commiter .deployment.json.');
