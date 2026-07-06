import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { entetesGaranties, fusionnerLigne } = require('../apps-script/tableur.js');

test('les en-têtes requis manquants sont ajoutés en fin, l\'ordre existant du comité est préservé', () => {
  // Le comité a réordonné (numeroAdresse avant rue) et il manque dateObservation.
  const actuels = ['numero', 'numeroAdresse', 'rue', 'note', 'occupationObservee'];
  const requis = ['numero', 'numeroAdresse', 'rue', 'note', 'occupationObservee', 'dateObservation'];
  assert.deepEqual(entetesGaranties(actuels, requis), [
    'numero', 'numeroAdresse', 'rue', 'note', 'occupationObservee', 'dateObservation',
  ]);
});

test('un onglet vide (aucun en-tête) reçoit les en-têtes requis dans l\'ordre par défaut', () => {
  assert.deepEqual(entetesGaranties([], ['numeroAdresse', 'rue', 'nom']), ['numeroAdresse', 'rue', 'nom']);
  // Une ligne d'en-tête faite de cellules vides = pas d'en-tête.
  assert.deepEqual(entetesGaranties(['', '', ''], ['numeroAdresse', 'rue']), ['numeroAdresse', 'rue']);
});

test('une colonne ajoutée à la main par le comité est conservée, jamais supprimée', () => {
  const actuels = ['numero', 'couleurKayak', 'occupationObservee'];
  const requis = ['numero', 'occupationObservee', 'dateObservation'];
  assert.deepEqual(entetesGaranties(actuels, requis), [
    'numero', 'couleurKayak', 'occupationObservee', 'dateObservation',
  ]);
});

test('une mise à jour n\'écrit que les colonnes de l\'objet, par nom ; le reste de la ligne est préservé', () => {
  // En-têtes réordonnés + une colonne comité (couleurKayak) hors de l'objet.
  const entetes = ['id', 'couleurKayak', 'emplacements', 'type'];
  const existante = ['S02', 'rouge', '[[1]]', 'horizontal'];
  const objet = { id: 'S02', type: 'vertical', emplacements: '[[2, 3]]' };
  assert.deepEqual(fusionnerLigne(entetes, existante, objet), ['S02', 'rouge', '[[2, 3]]', 'vertical']);
});

test('une clé de l\'objet absente des en-têtes est ignorée (elle n\'a pas de colonne)', () => {
  const entetes = ['id', 'type'];
  const existante = ['S02', 'horizontal'];
  const objet = { id: 'S02', type: 'vertical', inconnue: 'x' };
  assert.deepEqual(fusionnerLigne(entetes, existante, objet), ['S02', 'vertical']);
});
