// Comparaison des captures fraîches à la baseline committée (HEAD).
// La baseline, c'est git : une capture modifiée intentionnellement se committe
// avec le changement de code. Ici on ne fait qu'observer l'écart et matérialiser
// les artefacts (avant + différence) dans screenshots/.diff/ pour la revue —
// les subagents de revue n'ont pas de shell, ils doivent pouvoir tout Read.

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { bandesDuMasque, avecMarge, tuiles, recadrer } from './decoupe-captures.mjs';

// Pixels réellement différents tolérés par capture (bruit d'antialiasing).
const PIXELS_TOLERES = 0;

// Artefacts de revue (issue 03) : l'API vision réduit toute image à ~1568 px
// de grand côté — une pleine page mobile de 5000 px y devient illisible. La
// revue lit donc des crops centrés sur les zones changées (marge de contexte
// autour de la bbox du diff) ou, sans baseline, des tuiles lisibles.
const MARGE_CROP = 100;
// Deux zones changées séparées de plus de cet écart vertical → deux crops.
const ECART_BANDES = 200;
// Au-delà de cette part de la hauteur couverte par les zones, le crop ne
// résume plus rien (refonte globale) : on retombe sur la pleine page.
const COUVERTURE_PLEINE_PAGE = 0.8;
const HAUTEUR_TUILE = 1500;
const CHEVAUCHEMENT_TUILE = 60;

export function preparerDossierDiff(dossierDiff) {
  rmSync(dossierDiff, { recursive: true, force: true });
  mkdirSync(dossierDiff, { recursive: true });
}

// Octets d'un fichier tel que committé dans HEAD, ou null s'il n'y est pas.
export function baselineDe(cheminDansDepot) {
  try {
    return execFileSync('git', ['show', `HEAD:${cheminDansDepot}`], {
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

// Fichiers de captures présents dans HEAD (baseline complète), noms nus.
export function fichiersBaseline() {
  try {
    const sortie = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD', 'screenshots/'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return sortie
      .toString()
      .split('\n')
      .filter((ligne) => ligne.endsWith('.png'))
      .map((ligne) => ligne.replace('screenshots/', ''));
  } catch {
    return [];
  }
}

// Tuiles de lecture d'une capture sans point de comparaison (nouvelle, ou
// dimensions changées) : chaque tuile reste lisible une fois réduite par
// l'API vision. Une image qui tient entière ne produit pas d'artefact — la
// capture de screenshots/ se lit telle quelle.
function ecrireTuiles(nom, image, dossierDiff) {
  const decoupe = tuiles(image.height, HAUTEUR_TUILE, CHEVAUCHEMENT_TUILE);
  if (decoupe.length === 1) return [];
  return decoupe.map((tuile, index) => {
    const chemin = `${dossierDiff}${nom.replace('.png', '')}--tuile${index + 1}.png`;
    const rectangle = { x: 0, y: tuile.y, largeur: image.width, hauteur: tuile.hauteur };
    writeFileSync(chemin, PNG.sync.write(recadrer(image, rectangle)));
    return chemin;
  });
}

// Compare une capture fraîche à sa baseline. Retourne :
//   { statut: 'identique' | 'nouvelle' | 'modifiee', pixels?, artefacts? }
// et écrit les artefacts de revue dans dossierDiff quand la capture diffère :
// crops avant/après/différence par zone changée (pleine page si la refonte
// couvre presque tout), tuiles pour une capture sans baseline comparable.
// Une capture visuellement identique mais aux octets différents (bruit sous
// le seuil, ex. frame de spinner) est ramenée aux octets de la baseline :
// git reste propre.
export function comparerCapture(nom, octetsFrais, cheminFrais, dossierDiff) {
  const baseline = baselineDe(`screenshots/${nom}`);
  if (baseline === null) {
    return {
      statut: 'nouvelle',
      artefacts: ecrireTuiles(nom, PNG.sync.read(octetsFrais), dossierDiff),
    };
  }
  if (baseline.equals(octetsFrais)) return { statut: 'identique' };

  const avant = PNG.sync.read(baseline);
  const apres = PNG.sync.read(octetsFrais);
  const prefixe = `${dossierDiff}${nom.replace('.png', '')}`;

  if (avant.width !== apres.width || avant.height !== apres.height) {
    // Pas de diff pixel possible : l'avant entier, l'après en tuiles lisibles.
    const cheminAvant = `${prefixe}--avant.png`;
    writeFileSync(cheminAvant, baseline);
    return {
      statut: 'modifiee',
      pixels: null,
      artefacts: [cheminAvant, ...ecrireTuiles(nom, apres, dossierDiff)],
    };
  }

  const difference = new PNG({ width: avant.width, height: avant.height });
  const pixels = pixelmatch(avant.data, apres.data, difference.data, avant.width, avant.height, {
    threshold: 0.1,
  });
  if (pixels <= PIXELS_TOLERES) {
    writeFileSync(cheminFrais, baseline);
    return { statut: 'identique' };
  }

  // Second passage en diffMask : seuls les pixels différents, pour la bbox
  // des zones changées (la sortie visuelle `difference` garde tout le
  // contexte estompé, inutilisable comme masque).
  const masque = new PNG({ width: avant.width, height: avant.height });
  pixelmatch(avant.data, apres.data, masque.data, avant.width, avant.height, {
    threshold: 0.1,
    diffMask: true,
  });
  const zones = bandesDuMasque(masque, ECART_BANDES)
    .map((bande) => avecMarge(bande, MARGE_CROP, avant.width, avant.height));

  const hauteurCouverte = zones.reduce((somme, zone) => somme + zone.hauteur, 0);
  const artefacts = [];
  if (hauteurCouverte >= avant.height * COUVERTURE_PLEINE_PAGE) {
    // Refonte quasi globale : le crop ne résume rien, pleine page comme avant.
    const cheminAvant = `${prefixe}--avant.png`;
    writeFileSync(cheminAvant, baseline);
    const cheminDiff = `${prefixe}--difference.png`;
    writeFileSync(cheminDiff, PNG.sync.write(difference));
    artefacts.push(cheminAvant, cheminDiff);
  } else {
    zones.forEach((zone, index) => {
      const zonePrefixe = zones.length === 1 ? prefixe : `${prefixe}--zone${index + 1}`;
      for (const [suffixe, image] of [['avant', avant], ['apres', apres], ['difference', difference]]) {
        const chemin = `${zonePrefixe}--${suffixe}.png`;
        writeFileSync(chemin, PNG.sync.write(recadrer(image, zone)));
        artefacts.push(chemin);
      }
    });
  }
  return { statut: 'modifiee', pixels, artefacts };
}
