// Boucle de feedback visuelle des agents (décision 0006).
// `npm run screenshots`         : API mockée, tous les états, desktop + mobile.
// `npm run screenshots -- --live` : vraie API (lecture seule), états par défaut seulement.
// `npm run screenshots -- --page structures` : seulement les scénarios d'une page
//   (boucle interne rapide — la revue et verify restent sur la génération complète).
// À la fin, chaque capture est comparée à la baseline committée (HEAD) : seules
// les captures listées « modifiée/nouvelle » ont besoin d'une revue visuelle.

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
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

const SORTIE = fileURLToPath(new URL('../screenshots/', import.meta.url));
const DOSSIER_DIFF = `${SORTIE}.diff/`;

// Cache disque des réponses CDN (webawesome.css, loader, SVG d'icônes,
// fontes) : la latence réseau était la racine des faux positifs — une graisse
// arrivée tard = gras synthétique capturé, un SVG arrivé tard = icône
// manquante, des métriques de repli = retours à la ligne décalés. Le premier
// run remplit le cache (gitignoré), les suivants rejouent les mêmes octets
// instantanément, quelle que soit la charge.
const CACHE_CDN = fileURLToPath(new URL('./.cache-cdn/', import.meta.url));
const MOTIF_CDN = /^https:\/\/(ka-f\.webawesome\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;

async function servirDepuisLeCache(route) {
  const url = route.request().url();
  const cle = createHash('sha256').update(url).digest('hex').slice(0, 32);
  const cheminCorps = `${CACHE_CDN}${cle}`;
  const cheminType = `${CACHE_CDN}${cle}.type`;
  if (existsSync(cheminCorps) && existsSync(cheminType)) {
    route.fulfill({
      body: readFileSync(cheminCorps),
      contentType: readFileSync(cheminType, 'utf8'),
    });
    return;
  }
  const reponse = await route.fetch();
  const corps = await reponse.body();
  const type = reponse.headers()['content-type'] || 'application/octet-stream';
  // Écriture atomique (temp + rename) : une page concurrente qui lit pendant
  // qu'une autre écrit ne voit jamais un fichier partiel.
  const ecrire = (chemin, contenu) => {
    const temporaire = `${chemin}.tmp-${process.pid}-${cle}`;
    writeFileSync(temporaire, contenu);
    renameSync(temporaire, chemin);
  };
  ecrire(cheminCorps, corps);
  ecrire(cheminType, type);
  route.fulfill({ body: corps, contentType: type });
}
const enDirect = process.argv.includes('--live');
const indexArgPage = process.argv.indexOf('--page');
const pageFiltree = indexArgPage === -1 ? null : process.argv[indexArgPage + 1].replace(/\.html$/, '');

// Port libre attribué par l'OS : un port fixe se fait voler par les serveurs
// orphelins des autres sessions (npx tué ≠ http-server tué), et on capture
// alors le site d'un AUTRE checkout sans s'en apercevoir.
async function portLibre() {
  return new Promise((resoudre, rejeter) => {
    const sonde = createServer();
    sonde.once('error', rejeter);
    sonde.listen(0, '127.0.0.1', () => {
      const { port } = sonde.address();
      sonde.close(() => resoudre(port));
    });
  });
}

const PORT = await portLibre();
const BASE = `http://localhost:${PORT}`;

async function attendreServeur() {
  for (let essai = 0; essai < 40; essai++) {
    if (serveurMort) {
      throw new Error('http-server est mort au démarrage — port volé ou dépendance absente.');
    }
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
// Si le serveur meurt en cours de run, échouer bruyamment plutôt que de
// laisser un autre processus répondre à sa place.
let serveurMort = false;
serveur.on('exit', () => {
  serveurMort = true;
});

let codeSortie = 0;
try {
  await attendreServeur();
  mkdirSync(SORTIE, { recursive: true });
  mkdirSync(CACHE_CDN, { recursive: true });

  let scenarios = enDirect ? CAPTURES.filter((c) => !c.etat) : CAPTURES;
  if (pageFiltree) {
    // Accepte le fichier (« index », « structures.html ») ou le préfixe des
    // noms de scénarios (« accueil ») — les deux vocabulaires coexistent.
    scenarios = scenarios.filter(
      (c) => c.page === `${pageFiltree}.html` || c.nom.startsWith(`${pageFiltree}-`),
    );
    if (scenarios.length === 0) {
      throw new Error(`Aucun scénario pour la page « ${pageFiltree} » — voir tools/captures.mjs.`);
    }
  }
  const problemes = [];
  const generees = [];
  preparerDossierDiff(DOSSIER_DIFF);
  const navigateur = await chromium.launch();

  // Génération parallèle : une file de travaux (scénario × viewport) épuisée
  // par un pool de pages concurrentes sur le même navigateur — ~3 min
  // séquentielles ramenées sous la minute. Chaque page a son propre mock et
  // sa propre attribution console : la concurrence ne mélange rien.
  const PAGES_CONCURRENTES = 6;
  const travaux = scenarios.flatMap((scenario) => Object.entries(VIEWPORTS)
    .map(([nomViewport, viewport]) => ({ scenario, nomViewport, viewport })));

  // Overlays et défilements capturés HORS du pool (issue 04) : sous concurrence,
  // ces captures flakent — le stitch fullPage re-clampe le scroll horizontal
  // (`defiler`), et l'ouverture d'un drawer/dialog (`pleinVue`) ou un
  // scrollIntoView (`voir`) ne se stabilisent pas au même sous-pixel selon
  // l'ordonnancement des pages voisines (faux positifs bi-stables, de 62 px à
  // des dizaines de milliers). Un run entièrement séquentiel est déterministe ;
  // on ne séquentialise donc QUE cette classe, après que le pool a drainé les
  // états simples. Le gros des captures reste concurrent — run toujours bien
  // sous les 3 min séquentielles d'origine.
  const estSequentiel = (s) => s.pleinVue || s.defiler || s.voir;
  const travauxConcurrents = travaux.filter((t) => !estSequentiel(t.scenario));
  const travauxSequentiels = travaux.filter((t) => estSequentiel(t.scenario));

  async function capturer({ scenario, nomViewport, viewport }) {
      // reducedMotion : les animations du thème (toutes sous
      // prefers-reduced-motion) ne polluent pas le diff pixel vs baseline.
      const page = await navigateur.newPage({ viewport, reducedMotion: 'reduce' });
      const contexte = `${scenario.nom} (${nomViewport})`;
      // Dans les deux modes (mock et --live) : les assets CDN sont statiques,
      // les servir du cache rend le rendu indépendant du réseau.
      await page.route(MOTIF_CDN, servirDepuisLeCache);
      page.on('console', (message) => {
        if (estProblemeConsole(message.type(), message.text(), CONSOLE_IGNOREE)) {
          problemes.push(`${contexte} — console.${message.type()} : ${message.text()}`);
        }
      });
      page.on('pageerror', (erreur) => {
        problemes.push(`${contexte} — exception non attrapée : ${erreur.message}`);
      });
      if (!enDirect) {
        // Appels comptés par action : `reponsesApres` d'un scénario sert un
        // mock différent à partir du DEUXIÈME appel (ex. l'inventaire rechargé
        // après une libération, où le cas a quitté la file).
        const appelsParAction = {};
        await page.route('**/script.google.com/**', (route) => {
          const requete = route.request();
          let reponse = REPONSES_MOCK.config;
          if (requete.method() === 'POST') {
            // Même routage que doPost (apps-script/Code.js) : `action` dans le corps.
            const corps = JSON.parse(requete.postData() || '{}');
            appelsParAction[corps.action] = (appelsParAction[corps.action] || 0) + 1;
            // `reponses` d'un scénario : mock spécifique (ex. échec simulé).
            reponse = (appelsParAction[corps.action] > 1
                && scenario.reponsesApres && scenario.reponsesApres[corps.action])
              || (scenario.reponses && scenario.reponses[corps.action])
              || REPONSES_MOCK[corps.action] || REPONSES_MOCK.creation;
          }
          route.fulfill({ contentType: 'application/json', body: JSON.stringify(reponse) });
        });
        await page.route('**/config.js', (route) => {
          route.fulfill({ contentType: 'application/javascript', body: CONFIG_JS_MOCK });
        });
      }
      await page.goto(urlDeScenario(BASE, scenario));
      // Toutes les faces déclarées chargées AVANT les interactions : une
      // graisse vue pour la première fois dans un drawer (la 600 du journal)
      // se chargerait pendant les attentes finales — gras synthétique capturé
      // selon le timing. allSettled : une face inutilisée qui échoue ne doit
      // pas faire échouer le run.
      await page.evaluate(() => Promise.allSettled(
        [...document.fonts].map((face) => face.load()),
      ));
      // `ouvrir` : clics d'ouverture AVANT le remplissage (ex. la rangée qui
      // ouvre la fiche où vit le champ) — même mécanique que `cliquer`.
      for (const selecteur of [].concat(scenario.ouvrir || [])) {
        await page.waitForSelector(selecteur, { timeout: 15000 });
        await page.waitForFunction(
          () => document.querySelectorAll(':not(:defined)').length === 0,
          { timeout: 15000 },
        );
        await page.click(selecteur);
      }
      // `remplir` : champs remplis AVANT les clics ({ selecteur, valeur }) —
      // le sélecteur traverse le shadow DOM (ex. le <textarea> interne d'un
      // wa-textarea), même garde d'upgrade que les clics.
      for (const remplissage of [].concat(scenario.remplir || [])) {
        await page.waitForSelector(remplissage.selecteur, { timeout: 15000 });
        await page.waitForFunction(
          () => document.querySelectorAll(':not(:defined)').length === 0,
          { timeout: 15000 },
        );
        await page.fill(remplissage.selecteur, remplissage.valeur);
      }
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
      // Souris garée hors de la page : après un clic d'ouverture, Chromium
      // applique (ou non, selon le timing) :hover à l'élément qui vient
      // d'apparaître sous le curseur — le lien courriel de la fiche basculait
      // entre soulignement pointillé (repos) et plein (survol) d'un run à
      // l'autre. Garer le curseur rend l'état « au repos » systématique.
      await page.mouse.move(0, 0);
      // Aucune animation finie encore en cours : sous charge, la capture peut
      // attraper la queue d'une transition d'ouverture (drawer) — un écart
      // d'opacité global que le seuil pixelmatch ne filtre que sur les textes
      // pâles. Les animations infinies (spinners) sont exclues : elles ne se
      // terminent jamais et leur bruit sous le seuil est déjà géré au diff.
      await page.waitForFunction(
        () => document.getAnimations().every(
          (animation) => animation.effect?.getTiming().iterations === Infinity
            || animation.playState !== 'running',
        ),
        { timeout: 15000 },
      );
      if (scenario.defiler) {
        await page.$$eval(scenario.defiler, (zones) => {
          for (const zone of zones) zone.scrollLeft = zone.scrollWidth;
        });
      }
      // `voir` : amène un élément sous le pli dans la vue (ex. la ligne d'aide
      // en pied de drawer) — le conteneur défilant peut vivre dans un shadow
      // DOM (part body de wa-drawer), scrollIntoView le trouve tout seul.
      if (scenario.voir) {
        await page.$eval(scenario.voir, (element) => element.scrollIntoView({ block: 'nearest' }));
      }
      // `fonts.status` plutôt que `fonts.ready` : la promesse ready peut être
      // déjà résolue alors qu'une graisse (ex. la 600 du journal, vue pour la
      // première fois dans le drawer) commence seulement à charger — la
      // capture attrapait alors un gras synthétique au lieu de la vraie face.
      await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 15000 });
      // Plus aucun custom element en attente d'upgrade au moment de capturer :
      // la garde d'avant-clic ne couvre pas les composants montés APRÈS les
      // interactions (contenu d'un drawer, d'un dialog).
      await page.waitForFunction(
        () => document.querySelectorAll(':not(:defined)').length === 0,
        { timeout: 15000 },
      );
      // Les wa-icon chargent leur SVG à la demande : une capture prise avant
      // la fin du fetch perd des glyphes (chevron absent au premier passage,
      // présent une fois le cache chaud). On attend chaque icône visible —
      // un nom d'icône invalide fait échouer le run, c'est voulu.
      await page.waitForFunction(
        () => [...document.querySelectorAll('wa-icon')]
          .filter((icone) => icone.checkVisibility())
          .every((icone) => icone.shadowRoot && icone.shadowRoot.querySelector('svg')),
        { timeout: 15000 },
      );
      await page.waitForTimeout(600);
      const nomFichier = `${scenario.nom}--${nomViewport}.png`;
      await page.screenshot({ path: `${SORTIE}${nomFichier}`, fullPage: !scenario.pleinVue });
      generees.push(nomFichier);
      console.log(`✓ ${scenario.nom} (${nomViewport})`);
      await page.close();
  }

  async function epuiser(liste, concurrence) {
    let prochain = 0;
    async function ouvrier() {
      while (prochain < liste.length) {
        if (serveurMort) {
          throw new Error('http-server est mort en cours de run — captures interrompues.');
        }
        await capturer(liste[prochain++]);
      }
    }
    await Promise.all(Array.from({ length: concurrence }, ouvrier));
  }
  await epuiser(travauxConcurrents, PAGES_CONCURRENTES);
  await epuiser(travauxSequentiels, 1);
  await navigateur.close();

  // Comparaison à la baseline (HEAD) : la revue visuelle ne porte que sur ce
  // delta, pas sur l'ensemble des captures.
  const modifiees = [];
  const nouvelles = [];
  for (const nomFichier of generees) {
    const chemin = `${SORTIE}${nomFichier}`;
    const resultat = comparerCapture(nomFichier, readFileSync(chemin), chemin, DOSSIER_DIFF);
    if (resultat.statut === 'nouvelle') nouvelles.push({ nom: nomFichier, ...resultat });
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
    // Chemins des artefacts de revue, relatifs au dépôt : le prompt du
    // subagent de revue (sans shell) pointe directement dessus.
    const cheminAffiche = (chemin) => chemin.slice(chemin.indexOf('screenshots/'));
    for (const capture of modifiees) {
      const detail = capture.pixels === null ? 'dimensions différentes' : `${capture.pixels} px`;
      console.log(`  ~ ${capture.nom} (${detail})`);
      for (const artefact of capture.artefacts) console.log(`      ${cheminAffiche(artefact)}`);
    }
    for (const capture of nouvelles) {
      console.log(`  + ${capture.nom}`);
      for (const artefact of capture.artefacts) console.log(`      ${cheminAffiche(artefact)}`);
    }
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
