import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';

import {
  bandesDuMasque,
  avecMarge,
  tuiles,
  recadrer,
} from '../tools/decoupe-captures.mjs';

// Masque façon pixelmatch diffMask : transparent partout, opaque sur les
// pixels différents listés.
function masqueAvec(largeur, hauteur, pixels) {
  const masque = new PNG({ width: largeur, height: hauteur });
  for (const [x, y] of pixels) {
    const position = (y * largeur + x) * 4;
    masque.data[position] = 255;
    masque.data[position + 3] = 255;
  }
  return masque;
}

test('un masque vide ne produit aucune bande', () => {
  assert.deepEqual(bandesDuMasque(masqueAvec(100, 100, []), 50), []);
});

test('des pixels groupés produisent une bande qui les englobe', () => {
  const masque = masqueAvec(100, 200, [[10, 20], [30, 25], [15, 40]]);
  assert.deepEqual(bandesDuMasque(masque, 50), [
    { x: 10, y: 20, largeur: 21, hauteur: 21 },
  ]);
});

test("deux zones éloignées de plus que l'écart donnent deux bandes", () => {
  const masque = masqueAvec(100, 500, [[10, 20], [80, 400]]);
  assert.deepEqual(bandesDuMasque(masque, 100), [
    { x: 10, y: 20, largeur: 1, hauteur: 1 },
    { x: 80, y: 400, largeur: 1, hauteur: 1 },
  ]);
});

test("deux zones séparées de moins que l'écart fusionnent en une bande", () => {
  const masque = masqueAvec(100, 500, [[10, 20], [80, 100]]);
  assert.deepEqual(bandesDuMasque(masque, 100), [
    { x: 10, y: 20, largeur: 71, hauteur: 81 },
  ]);
});

test('la marge élargit la bande sans sortir de l’image', () => {
  assert.deepEqual(
    avecMarge({ x: 10, y: 20, largeur: 30, hauteur: 40 }, 100, 390, 844),
    { x: 0, y: 0, largeur: 140, hauteur: 160 },
  );
  assert.deepEqual(
    avecMarge({ x: 300, y: 800, largeur: 50, hauteur: 40 }, 100, 390, 844),
    { x: 200, y: 700, largeur: 190, hauteur: 144 },
  );
});

test('une image plus courte que la hauteur max tient en une seule tuile', () => {
  assert.deepEqual(tuiles(844, 1500, 60), [{ y: 0, hauteur: 844 }]);
});

test('une image haute se découpe en tuiles qui se chevauchent', () => {
  const decoupe = tuiles(5213, 1500, 60);
  assert.equal(decoupe[0].y, 0);
  for (const tuile of decoupe) assert.ok(tuile.hauteur <= 1500);
  // Chaque tuile suivante reprend `chevauchement` px avant la fin de la
  // précédente : aucune ligne de texte perdue à la couture.
  for (let i = 1; i < decoupe.length; i++) {
    assert.equal(decoupe[i].y, decoupe[i - 1].y + decoupe[i - 1].hauteur - 60);
  }
  const derniere = decoupe[decoupe.length - 1];
  assert.equal(derniere.y + derniere.hauteur, 5213);
});

test('recadrer extrait le rectangle demandé', () => {
  const image = masqueAvec(100, 100, [[50, 60]]);
  const crop = recadrer(image, { x: 45, y: 55, largeur: 10, hauteur: 10 });
  assert.equal(crop.width, 10);
  assert.equal(crop.height, 10);
  // Le pixel opaque retombe en (5,5) dans le repère du crop.
  assert.equal(crop.data[(5 * 10 + 5) * 4], 255);
});
