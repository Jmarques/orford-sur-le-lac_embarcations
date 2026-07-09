import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { gestesEmplacement } = require('../apps-script/grille.js');

// Une ligne de l'onglet Emplacements, telle que renvoyée par l'API. Par défaut :
// attribuée au 12 Rue des Érables, observée LIBRE → statut « Attribué, libre »
// (peutEtreALiberer), le seul état où un remède a une raison (0024).
function ligneEmplacement(surcharges = {}) {
  return {
    numero: 75,
    numeroAdresse: 12,
    rue: 'Rue des Érables',
    note: '',
    occupationObservee: 'libre',
    dateObservation: '2026-06-20T12:00:00.000Z',
    ...surcharges,
  };
}

// Une ligne de l'onglet Membres (contact courant d'une adresse, 0010).
function membre(surcharges = {}) {
  return {
    numeroAdresse: 12,
    rue: 'Rue des Érables',
    nom: 'Louise Bédard',
    courriel: 'louise.bedard@exemple.ca',
    telephone: '819 555-8765',
    ...surcharges,
  };
}

// --- Gestes de la fiche (décisions 0018/0024) : un remède n'apparaît que face à
// une RAISON — écrire seulement sur « Attribué, libre » (avec courriel), libérer
// seulement sur « Attribué, libre » OU adresse hors quota. Dérivés du statut et
// du contexte quota (comme depassementQuota), jamais de la page qui ouvre. ---

test('Attribué, libre avec courriel : écrire ET libérer sont offerts', () => {
  const ligne = ligneEmplacement();
  assert.deepEqual(gestesEmplacement(ligne, [ligne], [membre()]),
    { liberer: true, ecrire: true });
});

test('Attribué, libre sans courriel : libérer seulement (rien à écrire sans adresse)', () => {
  const ligne = ligneEmplacement();
  assert.deepEqual(gestesEmplacement(ligne, [ligne], [membre({ courriel: '' })]),
    { liberer: true, ecrire: false });
});

test('Attribué, libre sans ligne Membres : libérer seulement', () => {
  const ligne = ligneEmplacement();
  assert.deepEqual(gestesEmplacement(ligne, [ligne], []),
    { liberer: true, ecrire: false });
});

test('Attribué, libre — courriel fait d\'espaces seulement : écrire n\'est pas offert', () => {
  const ligne = ligneEmplacement();
  assert.deepEqual(gestesEmplacement(ligne, [ligne], [membre({ courriel: '   ' })]),
    { liberer: true, ecrire: false });
});

test('En ordre (attribué, occupé), adresse dans les règles : ni écrire ni libérer', () => {
  const ligne = ligneEmplacement({ occupationObservee: 'occupé' });
  assert.deepEqual(gestesEmplacement(ligne, [ligne], [membre()]),
    { liberer: false, ecrire: false });
});

test('En ordre mais adresse HORS QUOTA : libérer (rattaché au dépassement), pas écrire', () => {
  // Trois attributions à la même adresse, quota par défaut 2 → dépassement 1.
  // L'emplacement ciblé est sain (occupé) : aucune raison d'écrire, mais libérer
  // résout le dépassement de l'adresse (0024).
  const a = ligneEmplacement({ numero: 75, occupationObservee: 'occupé' });
  const b = ligneEmplacement({ numero: 76, occupationObservee: 'occupé' });
  const c = ligneEmplacement({ numero: 77, occupationObservee: 'occupé' });
  assert.deepEqual(gestesEmplacement(a, [a, b, c], [membre()]),
    { liberer: true, ecrire: false });
});

test('Attribué, libre ET adresse hors quota : écrire et libérer restent offerts', () => {
  const a = ligneEmplacement({ numero: 75, occupationObservee: 'libre' });
  const b = ligneEmplacement({ numero: 76, occupationObservee: 'occupé' });
  const c = ligneEmplacement({ numero: 77, occupationObservee: 'occupé' });
  assert.deepEqual(gestesEmplacement(a, [a, b, c], [membre()]),
    { liberer: true, ecrire: true });
});

test('Non observé (attribué, jamais observé), dans les règles : aucun geste', () => {
  const ligne = ligneEmplacement({ occupationObservee: '', dateObservation: '' });
  assert.deepEqual(gestesEmplacement(ligne, [ligne], [membre()]),
    { liberer: false, ecrire: false });
});

test('Disponible (non attribué, observé libre) : aucun geste, même si un membre existe', () => {
  const ligne = ligneEmplacement({ numeroAdresse: '', rue: '' });
  assert.deepEqual(gestesEmplacement(ligne, [ligne], [membre()]),
    { liberer: false, ecrire: false });
});

test('À identifier (non attribué, observé occupé) : aucun geste', () => {
  const ligne = ligneEmplacement({ numeroAdresse: '', rue: '', occupationObservee: 'occupé' });
  assert.deepEqual(gestesEmplacement(ligne, [ligne], [membre()]),
    { liberer: false, ecrire: false });
});

test("ligne d'Emplacements absente (numéro jamais observé) : aucun geste", () => {
  assert.deepEqual(gestesEmplacement(undefined, [], []),
    { liberer: false, ecrire: false });
});

test('attribution partielle (rue sans numéro — Sheet éditée à la main, 0002) : non attribué', () => {
  const ligne = ligneEmplacement({ numeroAdresse: '  ' });
  assert.deepEqual(gestesEmplacement(ligne, [ligne], [membre()]),
    { liberer: false, ecrire: false });
});

test('inventaire/membres omis : pas de plantage, hors quota indéterminable → non hors quota', () => {
  // Attribué, libre : le geste écrire vient du statut seul (avec courriel) ;
  // libérer reste offert par le statut, sans dépendre du contexte quota.
  const ligne = ligneEmplacement();
  assert.deepEqual(gestesEmplacement(ligne, undefined, undefined),
    { liberer: true, ecrire: false });
});
