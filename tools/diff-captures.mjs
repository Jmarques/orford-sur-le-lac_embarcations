// Comparaison des captures fraîches à la baseline committée (HEAD).
// La baseline, c'est git : une capture modifiée intentionnellement se committe
// avec le changement de code. Ici on ne fait qu'observer l'écart et matérialiser
// les artefacts (avant + différence) dans screenshots/.diff/ pour la revue —
// les subagents de revue n'ont pas de shell, ils doivent pouvoir tout Read.

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

// Pixels réellement différents tolérés par capture (bruit d'antialiasing).
const PIXELS_TOLERES = 0;

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

// Compare une capture fraîche à sa baseline. Retourne :
//   { statut: 'identique' | 'nouvelle' | 'modifiee', pixels?, artefacts? }
// et écrit <nom>--avant.png (+ <nom>--difference.png si dimensions égales)
// dans dossierDiff quand la capture diffère. Une capture visuellement
// identique mais aux octets différents (bruit sous le seuil, ex. frame de
// spinner) est ramenée aux octets de la baseline : git reste propre.
export function comparerCapture(nom, octetsFrais, cheminFrais, dossierDiff) {
  const baseline = baselineDe(`screenshots/${nom}`);
  if (baseline === null) return { statut: 'nouvelle' };
  if (baseline.equals(octetsFrais)) return { statut: 'identique' };

  const avant = PNG.sync.read(baseline);
  const apres = PNG.sync.read(octetsFrais);
  const artefacts = [];
  const ecrireAvant = () => {
    const chemin = `${dossierDiff}${nom.replace('.png', '')}--avant.png`;
    writeFileSync(chemin, baseline);
    artefacts.push(chemin);
  };

  if (avant.width !== apres.width || avant.height !== apres.height) {
    ecrireAvant();
    return { statut: 'modifiee', pixels: null, artefacts };
  }

  const difference = new PNG({ width: avant.width, height: avant.height });
  const pixels = pixelmatch(avant.data, apres.data, difference.data, avant.width, avant.height, {
    threshold: 0.1,
  });
  if (pixels <= PIXELS_TOLERES) {
    writeFileSync(cheminFrais, baseline);
    return { statut: 'identique' };
  }

  ecrireAvant();
  const cheminDiff = `${dossierDiff}${nom.replace('.png', '')}--difference.png`;
  writeFileSync(cheminDiff, PNG.sync.write(difference));
  artefacts.push(cheminDiff);
  return { statut: 'modifiee', pixels, artefacts };
}
