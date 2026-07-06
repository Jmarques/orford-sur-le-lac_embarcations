import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parserGrille, normaliserGrille, analyserStructures, numerosOrphelins, statutEmplacement, compterStatuts } = require('../apps-script/grille.js');

// Une ligne de l'onglet Structures, telle que renvoyée par l'API.
function structureSheet(surcharges = {}) {
  return {
    id: 'S01',
    type: 'horizontal',
    embarcations: 'Kayak',
    saisie: 'niveaux',
    emplacements: '[[5, 6], [1, 2]]',
    notes: '',
    ...surcharges,
  };
}

test('une grille explicite se parse en arrays de numéros', () => {
  assert.deepEqual(parserGrille('[[1, 2], [3, 4]]'), [[1, 2], [3, 4]]);
});

test('un texte malformé est rejeté en nommant le fragment fautif', () => {
  assert.throws(() => parserGrille('[[1, douze]]'), /douze/);
  assert.throws(() => parserGrille('[[1, 2]'), /\]/);
  assert.throws(() => parserGrille('[1, 2]'), /\[/);
  assert.throws(() => parserGrille(''), /\[/);
  assert.throws(() => parserGrille('[[1]] x'), /x|traîne/);
});

test('une plage a..b se déplie, ascendante comme descendante', () => {
  assert.deepEqual(parserGrille('[ [74..77], [82, 80..78] ]'), [
    [74, 75, 76, 77],
    [82, 80, 79, 78],
  ]);
});

test('une horizontale saisie=niveaux : lignes = arrays (le plus haut en premier), niveau 1 = le plus bas', () => {
  const { structures } = analyserStructures([structureSheet()], ['Kayak']);
  const analyse = structures[0];
  assert.deepEqual(analyse.problemes, []);
  assert.deepEqual(analyse.lignes, [[5, 6], [1, 2]]);
  assert.deepEqual(analyse.emplacements, [
    { numero: 5, structure: 'S01', niveau: 2, ligne: 0, colonne: 0 },
    { numero: 6, structure: 'S01', niveau: 2, ligne: 0, colonne: 1 },
    { numero: 1, structure: 'S01', niveau: 1, ligne: 1, colonne: 0 },
    { numero: 2, structure: 'S01', niveau: 1, ligne: 1, colonne: 1 },
  ]);
});

test('saisie=colonnes : les arrays sont des colonnes, transposées en lignes (premier élément = côté haut)', () => {
  const { structures } = analyserStructures(
    [structureSheet({ saisie: 'colonnes', emplacements: '[[5, 1], [6, 2]]' })],
    ['Kayak'],
  );
  const analyse = structures[0];
  assert.deepEqual(analyse.problemes, []);
  assert.deepEqual(analyse.lignes, [[5, 6], [1, 2]]);
  assert.deepEqual(
    analyse.emplacements.map((e) => [e.numero, e.niveau, e.ligne, e.colonne]),
    [[5, 2, 0, 0], [6, 2, 0, 1], [1, 1, 1, 0], [2, 1, 1, 1]],
  );
});

test('une structure verticale (embarcations debout) n\'a pas de niveaux : niveau vide', () => {
  const { structures } = analyserStructures(
    [structureSheet({ type: 'vertical', saisie: 'niveaux', emplacements: '[[200..202]]' })],
    ['Kayak'],
  );
  assert.deepEqual(structures[0].emplacements.map((e) => e.niveau), ['', '', '']);
});

test('saisie vide : défaut niveaux pour une horizontale, colonnes pour une verticale', () => {
  const { structures } = analyserStructures(
    [
      structureSheet({ id: 'H', saisie: '', emplacements: '[[5, 6], [1, 2]]' }),
      structureSheet({ id: 'V', type: 'vertical', saisie: '', emplacements: '[[10, 11], [12, 13]]' }),
    ],
    ['Kayak'],
  );
  assert.equal(structures[0].saisie, 'niveaux');
  assert.deepEqual(structures[0].lignes, [[5, 6], [1, 2]]);
  assert.equal(structures[1].saisie, 'colonnes');
  assert.deepEqual(structures[1].lignes, [[10, 12], [11, 13]]);
});

test('une grille irrégulière (arrays de longueurs différentes) est une erreur, mais reste affichable', () => {
  const { structures } = analyserStructures(
    [structureSheet({ emplacements: '[[1..3], [4, 5]]' })],
    ['Kayak'],
  );
  const analyse = structures[0];
  assert.deepEqual(analyse.lignes, [[1, 2, 3], [4, 5]]);
  assert.equal(analyse.problemes.length, 1);
  assert.equal(analyse.problemes[0].severite, 'erreur');
  assert.match(analyse.problemes[0].message, /3/);
  assert.match(analyse.problemes[0].message, /2/);
});

test('un numéro répété dans la même structure est une erreur qui nomme le numéro', () => {
  const { structures } = analyserStructures(
    [structureSheet({ emplacements: '[[198, 1], [2, 198]]' })],
    ['Kayak'],
  );
  const problemes = structures[0].problemes;
  assert.equal(problemes.length, 1);
  assert.equal(problemes[0].severite, 'erreur');
  assert.match(problemes[0].message, /198/);
  // La page marque les cellules fautives : les doublons sont aussi des données.
  assert.deepEqual(structures[0].doublons, [198]);
});

test('un numéro présent dans deux structures est un conflit marqué dans chacune — aucune ne gagne', () => {
  const { structures, conflits } = analyserStructures(
    [
      structureSheet({ id: 'S02', emplacements: '[[7, 8], [9, 10]]' }),
      structureSheet({ id: 'S03', emplacements: '[[7, 11], [12, 13]]' }),
    ],
    ['Kayak'],
  );
  assert.deepEqual(conflits, [{ numero: 7, structures: ['S02', 'S03'] }]);
  for (const analyse of structures) {
    assert.equal(analyse.problemes.length, 1);
    assert.equal(analyse.problemes[0].severite, 'erreur');
    assert.match(analyse.problemes[0].message, /7/);
    assert.match(analyse.problemes[0].message, analyse.id === 'S02' ? /S03/ : /S02/);
  }
});

test('les conflits avec une même structure sont groupés en un seul message, plages compactées', () => {
  const { structures } = analyserStructures(
    [
      structureSheet({ id: 'S02', emplacements: '[[143..149], [150..156]]' }),
      structureSheet({ id: 'S03', emplacements: '[[143..149], [150..156]]' }),
    ],
    ['Kayak'],
  );
  const problemes = structures[0].problemes;
  assert.equal(problemes.length, 1);
  assert.match(problemes[0].message, /143\.\.156/);
  assert.match(problemes[0].message, /S03/);
});

test('type, saisie ou embarcation inconnus : avertissements nommant la valeur, la grille reste dérivée', () => {
  const { structures } = analyserStructures(
    [structureSheet({ type: 'diagonal', saisie: 'spirale', embarcations: 'Kayak, Pédalo' })],
    ['Kayak', 'Canoë'],
  );
  const analyse = structures[0];
  assert.deepEqual(analyse.problemes.map((p) => p.severite), [
    'avertissement', 'avertissement', 'avertissement',
  ]);
  const messages = analyse.problemes.map((p) => p.message).join(' ');
  assert.match(messages, /diagonal/);
  assert.match(messages, /spirale/);
  assert.match(messages, /Pédalo/);
  assert.equal(analyse.emplacements.length, 4);
});

test('un numéro de l\'onglet Emplacements absent de toutes les grilles est orphelin', () => {
  const { structures } = analyserStructures([structureSheet()], ['Kayak']);
  const lignesEmplacements = [{ numero: 5 }, { numero: 42 }, { numero: '6' }];
  assert.deepEqual(numerosOrphelins(structures, lignesEmplacements), [42]);
});

test('le statut se dérive du croisement attribution × occupation — jamais stocké (0011)', () => {
  const ligne = (surcharges) => ({ numero: 74, numeroAdresse: '', rue: '', ...surcharges });
  const attribue = { numeroAdresse: 234, rue: 'Rue du Pré' };
  // Les 5 cases, dont les 2 problèmes. « Pas encore observé » couvre les deux
  // côtés de l'attribution : « inconnu » n'est pas une observation, c'est
  // l'absence d'observation.
  assert.equal(statutEmplacement(ligne({ ...attribue, occupationObservee: 'occupé' })).code, 'conforme');
  assert.equal(statutEmplacement(ligne({ ...attribue, occupationObservee: 'libre' })).code, 'peutEtreALiberer');
  assert.equal(statutEmplacement(ligne({ ...attribue, occupationObservee: '' })).code, 'pasObserve');
  assert.equal(statutEmplacement(ligne({ occupationObservee: 'occupé' })).code, 'orphelin');
  assert.equal(statutEmplacement(ligne({ occupationObservee: 'libre' })).code, 'disponible');
  assert.equal(statutEmplacement(ligne({ occupationObservee: '' })).code, 'pasObserve');
  // Les problèmes sont marqués comme tels.
  assert.equal(statutEmplacement(ligne({ ...attribue, occupationObservee: 'libre' })).probleme, true);
  assert.equal(statutEmplacement(ligne({ occupationObservee: 'occupé' })).probleme, true);
  assert.equal(statutEmplacement(ligne({ ...attribue, occupationObservee: 'occupé' })).probleme, false);
});

test('chaque statut porte une explication générique en français simple, au vocabulaire du glossaire', () => {
  const codes = [
    { numeroAdresse: 234, rue: 'x', occupationObservee: 'libre' },
    { numeroAdresse: 234, rue: 'x', occupationObservee: 'occupé' },
    { occupationObservee: 'occupé' },
    { occupationObservee: 'libre' },
    undefined,
  ];
  for (const exemple of codes) {
    const statut = statutEmplacement(exemple && { numero: 1, ...exemple });
    assert.ok(statut.explication.length > 20, statut.code);
    // « place » est banni par le glossaire (Emplacement — Avoid: place).
    assert.doesNotMatch(statut.explication, /\bplaces?\b/i, statut.code);
  }
  const attribueLibre = statutEmplacement({ numero: 1, numeroAdresse: 234, rue: 'x', occupationObservee: 'libre' });
  assert.match(attribueLibre.explication, /attribué/i);
  assert.match(attribueLibre.explication, /libre/i);
});

test('compterStatuts compte les cellules par statut et les numéros marqués en conflit/doublon', () => {
  const { structures, conflits } = analyserStructures(
    [
      structureSheet({ id: 'S02', emplacements: '[[7, 8], [9, 10]]' }),
      structureSheet({ id: 'S03', emplacements: '[[7, 11], [12, 198], [198, 13]]' }),
    ],
    ['Kayak'],
  );
  const lignes = [
    { numero: 7, numeroAdresse: 234, rue: 'x', occupationObservee: 'occupé' },
    { numero: 8, numeroAdresse: '', rue: '', occupationObservee: 'occupé' },
    { numero: 9, numeroAdresse: 234, rue: 'x', occupationObservee: 'libre' },
  ];
  const comptes = compterStatuts(structures, conflits, lignes);
  // 7 apparaît dans les deux structures : compté deux fois (comme sur la grille).
  assert.equal(comptes.parCode.conforme, 2);
  assert.equal(comptes.parCode.orphelin, 1);
  assert.equal(comptes.parCode.peutEtreALiberer, 1);
  assert.equal(comptes.parCode.disponible, undefined);
  assert.equal(comptes.parCode.pasObserve, 6);
  // Numéros marqués : 7 (conflit inter-structures) + 198 (doublon interne).
  assert.equal(comptes.enConflit, 2);
});

test('le statut tolère les données manuelles : valeur hors ensemble = pas observé, ligne absente = pas observé', () => {
  const ligne = { numero: 74, numeroAdresse: 234, rue: 'Rue du Pré', occupationObservee: 'inconnu' };
  // « inconnu » (ancien état, ou saisi à la main — 0002) n'est plus une valeur : pas observé.
  assert.equal(statutEmplacement(ligne).code, 'pasObserve');
  assert.equal(statutEmplacement({ ...ligne, occupationObservee: 'ocupé' }).code, 'pasObserve');
  // Un emplacement sans ligne du tout (numéro dans une grille, jamais observé).
  assert.equal(statutEmplacement(undefined).code, 'pasObserve');
});

// Les grilles réelles saisies à la main dans la Sheet (2026-07-05), avec leurs
// défauts connus : elles sont la donnée initiale que la page doit encaisser.
const SHEET_REELLE = [
  { id: 'S01', type: 'horizontal', embarcations: 'Canoë, Kayak', saisie: 'niveaux', emplacements: '[ [74..81], [82..89], [90..97]]' },
  { id: 'S02', type: 'horizontal', embarcations: 'Canoë, Kayak', saisie: 'niveaux', emplacements: '[ [107..229], [13..27], [28..42], [43..57] ]' },
  { id: 'S03', type: 'horizontal', embarcations: 'Planche (SUP)', saisie: 'colonnes', emplacements: '[ [143..149], [150..156], [157, 158, 184, 185, 186, 187, 188], [189..195] ]' },
  { id: 'S05', type: 'horizontal', embarcations: 'Kayak', saisie: 'niveaux', emplacements: '[ [103..106], [1..4], [5..8], [9..12] ]' },
  { id: 'S06', type: 'vertical', embarcations: 'Planche (SUP)', saisie: 'niveaux', emplacements: '[ [200..220]]' },
  { id: 'S07', type: 'horizontal', embarcations: 'Kayak', saisie: 'niveaux', emplacements: '[ [230..234], [58..62], [64..68], [69..73] ]' },
  { id: 'S08', type: 'horizontal', embarcations: 'Kayak', saisie: 'niveaux', emplacements: '[ [167,166,165,164,163,162,161,160, 198], [175, 174, 173, 172, 171, 170, 169, 168, 197], [183, 182, 181, 180, 179, 178, 177, 176, 198] ]' },
  { id: 'S04', type: 'horizontal', embarcations: 'Kayak', saisie: 'niveaux', emplacements: '[ [100, 113, 116, 117, 118, 125, 128, 131, 132, 133, 140], [101, 114, 119, 120, 121, 126, 129, 134, 135, 136, 141], [102, 115, 122, 123, 124, 137, 138, 139, 142] ]' },
];

test('les grilles réelles de la Sheet s\'analysent sans planter, défauts connus signalés', () => {
  const { structures, conflits } = analyserStructures(SHEET_REELLE, ['Kayak', 'Canoë', 'Planche (SUP)']);

  const parId = Object.fromEntries(structures.map((s) => [s.id, s]));
  // S01 est saine : 3 niveaux de 8, niveau 3 en premier.
  assert.deepEqual(parId.S01.problemes, []);
  assert.equal(parId.S01.emplacements.length, 24);
  assert.deepEqual(parId.S01.emplacements.slice(0, 2).map((e) => [e.numero, e.niveau]), [[74, 3], [75, 3]]);
  // S08 contient le 198 en double (faute de frappe réelle).
  assert.ok(parId.S08.problemes.some((p) => /198/.test(p.message)));
  // S02 : [107..229] est irrégulier ET chevauche S03/S04/S06/S08.
  assert.ok(parId.S02.problemes.some((p) => /irrégulière/.test(p.message)));
  assert.ok(conflits.length > 0);
  for (const conflit of conflits) assert.ok(conflit.structures.includes('S02'));
});

test('la normalisation compacte les suites de 3+ en plages (dans les deux sens) et espace proprement', () => {
  assert.equal(
    normaliserGrille([[167, 166, 165, 164, 198], [1, 2], [5, 6, 7]]),
    '[[167..164, 198], [1, 2], [5..7]]',
  );
});
