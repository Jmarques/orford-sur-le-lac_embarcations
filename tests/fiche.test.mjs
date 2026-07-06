import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { gestesEmplacement } = require('../apps-script/grille.js');

// Une ligne de l'onglet Emplacements, telle que renvoyée par l'API.
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

// --- Gestes de la fiche (décision 0018) : dérivés du statut, jamais de la page ---

test('attribué avec membre et courriel : libérer et écrire sont offerts', () => {
  assert.deepEqual(gestesEmplacement(ligneEmplacement(), membre()),
    { liberer: true, ecrire: true });
});

test('attribué mais membre sans courriel : libérer seulement', () => {
  assert.deepEqual(gestesEmplacement(ligneEmplacement(), membre({ courriel: '' })),
    { liberer: true, ecrire: false });
});

test('attribué sans ligne Membres : libérer seulement', () => {
  assert.deepEqual(gestesEmplacement(ligneEmplacement(), undefined),
    { liberer: true, ecrire: false });
});

test('non attribué : aucun geste de traitement structuré, même si un membre existe', () => {
  assert.deepEqual(gestesEmplacement(ligneEmplacement({ numeroAdresse: '', rue: '' }), membre()),
    { liberer: false, ecrire: false });
});

test("ligne d'Emplacements absente (numéro jamais observé) : aucun geste structuré", () => {
  assert.deepEqual(gestesEmplacement(undefined, undefined),
    { liberer: false, ecrire: false });
});

test('attribution partielle (rue sans numéro — Sheet éditée à la main, 0002) : non attribué', () => {
  assert.deepEqual(gestesEmplacement(ligneEmplacement({ numeroAdresse: '  ' }), membre()),
    { liberer: false, ecrire: false });
});

test('courriel fait d\'espaces seulement : écrire n\'est pas offert', () => {
  assert.deepEqual(gestesEmplacement(ligneEmplacement(), membre({ courriel: '   ' })),
    { liberer: true, ecrire: false });
});
