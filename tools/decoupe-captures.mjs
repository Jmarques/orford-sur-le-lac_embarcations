// Découpe des artefacts de revue visuelle (issue 03) : une capture pleine
// page réduite à 1568 px par l'API vision devient illisible — la revue lit
// des crops centrés sur les zones changées, ou des tuiles pour une capture
// sans baseline. Logique pure, testée dans tests/decoupe-captures.test.mjs.

import { PNG } from 'pngjs';

// Regroupe les pixels opaques d'un masque (sortie pixelmatch diffMask) en
// bandes verticales : deux zones dont les rangées sont séparées de plus de
// `ecartMax` px donnent deux bandes distinctes. Retourne des rectangles
// { x, y, largeur, hauteur } dans l'ordre de lecture.
export function bandesDuMasque(masque, ecartMax) {
  const { width, height, data } = masque;
  // Étendue horizontale des pixels différents, rangée par rangée.
  const rangees = [];
  for (let y = 0; y < height; y++) {
    let minX = -1;
    let maxX = -1;
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] === 0) continue;
      if (minX === -1) minX = x;
      maxX = x;
    }
    if (minX !== -1) rangees.push({ y, minX, maxX });
  }

  const bandes = [];
  let courante = null;
  for (const rangee of rangees) {
    if (courante && rangee.y - courante.finY <= ecartMax) {
      courante.finY = rangee.y;
      courante.minX = Math.min(courante.minX, rangee.minX);
      courante.maxX = Math.max(courante.maxX, rangee.maxX);
    } else {
      courante = { debutY: rangee.y, finY: rangee.y, minX: rangee.minX, maxX: rangee.maxX };
      bandes.push(courante);
    }
  }
  return bandes.map((bande) => ({
    x: bande.minX,
    y: bande.debutY,
    largeur: bande.maxX - bande.minX + 1,
    hauteur: bande.finY - bande.debutY + 1,
  }));
}

// Élargit un rectangle de `marge` px de chaque côté, borné aux dimensions de
// l'image.
export function avecMarge(rectangle, marge, largeurImage, hauteurImage) {
  const x = Math.max(0, rectangle.x - marge);
  const y = Math.max(0, rectangle.y - marge);
  return {
    x,
    y,
    largeur: Math.min(largeurImage, rectangle.x + rectangle.largeur + marge) - x,
    hauteur: Math.min(hauteurImage, rectangle.y + rectangle.hauteur + marge) - y,
  };
}

// Découpe une hauteur d'image en tuiles d'au plus `hauteurMax` px qui se
// chevauchent de `chevauchement` px — aucune ligne de texte perdue à la
// couture. Une image qui tient entière donne une seule tuile.
export function tuiles(hauteurImage, hauteurMax, chevauchement) {
  if (hauteurImage <= hauteurMax) return [{ y: 0, hauteur: hauteurImage }];
  const decoupe = [];
  let y = 0;
  while (y + hauteurMax < hauteurImage) {
    decoupe.push({ y, hauteur: hauteurMax });
    y += hauteurMax - chevauchement;
  }
  decoupe.push({ y, hauteur: hauteurImage - y });
  return decoupe;
}

// Extrait un rectangle d'un PNG en nouveau PNG.
export function recadrer(image, rectangle) {
  const crop = new PNG({ width: rectangle.largeur, height: rectangle.hauteur });
  PNG.bitblt(image, crop, rectangle.x, rectangle.y, rectangle.largeur, rectangle.hauteur, 0, 0);
  return crop;
}
