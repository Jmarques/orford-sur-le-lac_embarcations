import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { preparerSauvegardeStructure } = require('../apps-script/structures.js');

const EXISTANTES = [
  { id: 'S01', type: 'horizontal', embarcations: 'Kayak', saisie: 'niveaux', emplacements: '[[1, 2]]', notes: '' },
];

test('une grille parsable est normalisée avant écriture (plages compactées)', () => {
  const { ligne } = preparerSauvegardeStructure(
    { id: 'S01', type: 'horizontal', saisie: 'niveaux', embarcations: 'Kayak', emplacements: '[ [5,6,7, 9] ]', notes: '' },
    EXISTANTES,
    [],
  );
  assert.equal(ligne.emplacements, '[[5..7, 9]]');
});

test('un id inconnu de l\'onglet Structures crashe en le nommant (création = à la main dans la Sheet)', () => {
  assert.throws(
    () => preparerSauvegardeStructure(
      { id: 'S99', type: 'horizontal', saisie: '', embarcations: '', emplacements: '[[1]]', notes: '' },
      EXISTANTES,
      [],
    ),
    /S99/,
  );
});

test('une grille non parsable est enregistrée telle quelle — la sauvegarde n\'est jamais bloquée (0009)', () => {
  const { ligne } = preparerSauvegardeStructure(
    { id: 'S01', type: 'horizontal', saisie: 'niveaux', embarcations: 'Kayak', emplacements: '[[1, douze]', notes: '' },
    EXISTANTES,
    [],
  );
  assert.equal(ligne.emplacements, '[[1, douze]');
});

test('les numéros sans ligne dans Emplacements donnent des lignes neuves (seul numero renseigné), triées ; jamais de suppression', () => {
  const { nouveauxEmplacements } = preparerSauvegardeStructure(
    { id: 'S01', type: 'horizontal', saisie: 'niveaux', embarcations: 'Kayak', emplacements: '[[7, 5], [2, 1]]', notes: '' },
    EXISTANTES,
    [{ numero: 5 }, { numero: '7' }, { numero: 999 }],
  );
  // Écriture pilotée par en-têtes (0012) : les autres colonnes se remplissent en vide.
  assert.deepEqual(nouveauxEmplacements, [{ numero: 1 }, { numero: 2 }]);
});

test('une grille non parsable ne crée aucune ligne d\'emplacement', () => {
  const { nouveauxEmplacements } = preparerSauvegardeStructure(
    { id: 'S01', type: 'horizontal', saisie: 'niveaux', embarcations: 'Kayak', emplacements: 'n\'importe quoi [', notes: '' },
    EXISTANTES,
    [],
  );
  assert.deepEqual(nouveauxEmplacements, []);
});
