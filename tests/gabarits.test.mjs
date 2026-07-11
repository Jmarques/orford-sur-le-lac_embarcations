import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { GABARITS_DEFAUT, gabaritsEffectifs } = require('../apps-script/gabarits.js');

// Le registre déclare les deux relances, avec leurs jetons — le contrat de
// données complet de chaque courriel (PRD gabarits-courriels).
test('le registre déclare relanceEmplacement avec ses quatre jetons', () => {
  const relance = GABARITS_DEFAUT.find((g) => g.id === 'relanceEmplacement');
  assert.ok(relance, 'relanceEmplacement absent du registre');
  assert.match(relance.sujet, /\{numéro\}/);
  for (const jeton of ['{nom}', '{numéro}', '{adresse}', '{depuis quand}']) {
    assert.ok(relance.corps.includes(jeton), `corps sans ${jeton}`);
  }
});

test('le registre déclare relanceHorsQuota avec ses cinq jetons (conditionnelles = jetons calculés)', () => {
  const relance = GABARITS_DEFAUT.find((g) => g.id === 'relanceHorsQuota');
  assert.ok(relance, 'relanceHorsQuota absent du registre');
  for (const jeton of ['{nom}', '{adresse}', '{nombre d\'emplacements}', '{numéros}', '{règle du quota}']) {
    assert.ok(relance.corps.includes(jeton), `corps sans ${jeton}`);
  }
});

// --- Fusion ligne/défaut (tickets 05/07) : le texte effectif est la ligne de
// la Sheet quand elle est utilisable, sinon le défaut du code — silencieusement.
// Chaque gabarit voyage avec son défaut : « Revenir au texte d'origine » (page
// à venir) l'utilise sans que le client connaisse jamais les textes. ---

test('sans ligne Sheet, chaque gabarit du registre sort avec ses textes d\'origine', () => {
  const gabarits = gabaritsEffectifs([]);
  assert.equal(gabarits.length, GABARITS_DEFAUT.length);
  for (const [i, gabarit] of gabarits.entries()) {
    assert.equal(gabarit.id, GABARITS_DEFAUT[i].id);
    assert.equal(gabarit.sujet, GABARITS_DEFAUT[i].sujet);
    assert.equal(gabarit.corps, GABARITS_DEFAUT[i].corps);
    assert.deepEqual(gabarit.defaut, { sujet: GABARITS_DEFAUT[i].sujet, corps: GABARITS_DEFAUT[i].corps });
  }
});

test('une ligne personnalisée gagne sur le défaut, qui reste disponible à côté', () => {
  const [gabarit] = gabaritsEffectifs([
    { id: 'relanceEmplacement', sujet: 'Objet ajusté {numéro}', corps: 'Allo {nom} !' },
  ]);
  assert.equal(gabarit.sujet, 'Objet ajusté {numéro}');
  assert.equal(gabarit.corps, 'Allo {nom} !');
  assert.equal(gabarit.defaut.sujet, GABARITS_DEFAUT[0].sujet);
  assert.equal(gabarit.defaut.corps, GABARITS_DEFAUT[0].corps);
});

test('le repli est champ par champ : corps vidé à la main → corps d\'origine, sujet ajusté conservé', () => {
  const [gabarit] = gabaritsEffectifs([
    { id: 'relanceEmplacement', sujet: 'Objet ajusté', corps: '   ' },
  ]);
  assert.equal(gabarit.sujet, 'Objet ajusté');
  assert.equal(gabarit.corps, GABARITS_DEFAUT[0].corps);
});

test('une cellule illisible (pas un texte) retombe sur le défaut, sans erreur', () => {
  for (const illisible of [42, null, undefined, new Date('2026-07-01')]) {
    const [gabarit] = gabaritsEffectifs([
      { id: 'relanceEmplacement', sujet: illisible, corps: illisible },
    ]);
    assert.equal(gabarit.sujet, GABARITS_DEFAUT[0].sujet, `sujet=${String(illisible)}`);
    assert.equal(gabarit.corps, GABARITS_DEFAUT[0].corps, `corps=${String(illisible)}`);
  }
});

test('une ligne au id inconnu du registre est ignorée — jamais un gabarit fantôme', () => {
  const gabarits = gabaritsEffectifs([
    { id: 'ancienGabaritSupprime', sujet: 'x', corps: 'y' },
  ]);
  assert.deepEqual(gabarits.map((g) => g.id), GABARITS_DEFAUT.map((g) => g.id));
});

test('l\'appariement par id tolère les espaces d\'une édition manuelle (0002)', () => {
  const [gabarit] = gabaritsEffectifs([
    { id: '  relanceEmplacement ', sujet: 'Objet ajusté', corps: 'Corps ajusté' },
  ]);
  assert.equal(gabarit.sujet, 'Objet ajusté');
  assert.equal(gabarit.corps, 'Corps ajusté');
});
