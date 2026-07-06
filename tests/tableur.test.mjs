import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { objetsDepuisLignes } = require('../apps-script/tableur.js');

const ENTETES = ['id', 'date', 'rue', 'numero', 'nom', 'courriel', 'telephone', 'type', 'mobiliteReduite', 'note', 'statut'];

function ligneDemande(surcharges = {}) {
  const demande = {
    id: 'abc-123',
    date: new Date('2026-07-01T14:30:00Z'),
    rue: 'Rue du Pré',
    numero: 234,
    nom: 'John Tremblay',
    courriel: 'john@example.com',
    telephone: '',
    type: 'Kayak',
    mobiliteReduite: false,
    note: '',
    statut: 'nouvelle',
    ...surcharges,
  };
  return ENTETES.map((entete) => demande[entete]);
}

test('les lignes de la Sheet deviennent des objets, date en ISO', () => {
  const objets = objetsDepuisLignes([ENTETES, ligneDemande()]);
  assert.deepEqual(objets, [
    {
      id: 'abc-123',
      date: '2026-07-01T14:30:00.000Z',
      rue: 'Rue du Pré',
      numero: 234,
      nom: 'John Tremblay',
      courriel: 'john@example.com',
      telephone: '',
      type: 'Kayak',
      mobiliteReduite: false,
      note: '',
      statut: 'nouvelle',
    },
  ]);
});

test('les lignes vides (restes d\'édition manuelle) sont ignorées', () => {
  const vide = ENTETES.map(() => '');
  const objets = objetsDepuisLignes([ENTETES, vide, ligneDemande(), vide]);
  assert.equal(objets.length, 1);
  assert.equal(objets[0].id, 'abc-123');
});

test('les dates venant d\'un autre contexte JS (instanceof Date faux) sont quand même converties en ISO', () => {
  // Simule une Date d'Apps Script : expose toISOString sans être une Date d'ici.
  const dateEtrangere = { toISOString: () => '2026-07-01T14:30:00.000Z' };
  const lignes = [['id', 'date'], ['abc', dateEtrangere]];
  assert.equal(objetsDepuisLignes(lignes)[0].date, '2026-07-01T14:30:00.000Z');
});

test('les objets redeviennent des lignes dans l\'ordre des en-têtes, champs manquants vides', () => {
  const { lignesDepuisObjets } = require('../apps-script/tableur.js');
  const lignes = lignesDepuisObjets(['numero', 'rue', 'nom'], [
    { numero: 90, nom: 'Marie Gagnon' },
    { numero: 12, rue: 'Rue du Pré', nom: '' },
  ]);
  assert.deepEqual(lignes, [
    [90, '', 'Marie Gagnon'],
    [12, 'Rue du Pré', ''],
  ]);
});
