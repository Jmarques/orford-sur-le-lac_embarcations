import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { filesATraiter, serieLibreObservee, fenetreApparition, historiqueEmplacement } = require('../apps-script/grille.js');

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

// Un événement du Journal (dates en JSON, comme sur le fil de l'API).
function observation(numero, details, date) {
  return { date, action: 'observation', numero, demandeId: '', details };
}

// --- Files dérivées (décision 0014) : rien n'est stocké, tout se recalcule ---

test('les deux files se dérivent du statut : attribué+libre → « Attribué, libre », non attribué+occupé → « À identifier »', () => {
  const files = filesATraiter([
    ligneEmplacement({ numero: 74, occupationObservee: 'occupé' }), // En ordre
    ligneEmplacement({ numero: 75 }), // Attribué, libre
    ligneEmplacement({ numero: 76, numeroAdresse: '', rue: '', occupationObservee: 'occupé' }), // À identifier
    ligneEmplacement({ numero: 77, numeroAdresse: '', rue: '' }), // Disponible
    ligneEmplacement({ numero: 90, occupationObservee: '', dateObservation: '' }), // Non observé
  ], []);
  assert.deepEqual(files.attribueLibre.map((cas) => cas.numero), [75]);
  assert.deepEqual(files.aIdentifier.map((cas) => cas.numero), [76]);
});

test('une ligne illisible (numéro absent, Sheet éditée à la main — 0002) est ignorée sans planter', () => {
  const files = filesATraiter([
    { numero: '', numeroAdresse: 12, rue: 'Rue des Érables', occupationObservee: 'libre' },
    null,
    ligneEmplacement({ numero: 75 }),
  ], []);
  assert.deepEqual(files.attribueLibre.map((cas) => cas.numero), [75]);
});

test('la file « Attribué, libre » sort du plus anciennement libre au plus récent, numéro croissant à égalité (tri stable)', () => {
  const evenements = [
    observation(80, 'libre', '2026-06-01T12:00:00.000Z'),
    observation(75, 'libre', '2026-05-01T12:00:00.000Z'),
    observation(81, 'libre', '2026-06-01T12:00:00.000Z'),
  ];
  const files = filesATraiter([
    ligneEmplacement({ numero: 81 }),
    ligneEmplacement({ numero: 80 }),
    ligneEmplacement({ numero: 75 }),
  ], evenements);
  assert.deepEqual(files.attribueLibre.map((cas) => cas.numero), [75, 80, 81]);
});

test('un cas sans début de série connu (signal le plus faible) passe en fin de file', () => {
  const files = filesATraiter([
    ligneEmplacement({ numero: 75, dateObservation: 'pas une date' }),
    ligneEmplacement({ numero: 80 }),
  ], [observation(80, 'libre', '2026-06-01T12:00:00.000Z')]);
  assert.deepEqual(files.attribueLibre.map((cas) => cas.numero), [80, 75]);
});

// --- « Libre depuis » = faits observés, jamais des mois calendaires (0014) ---

test('une série « libre » ininterrompue donne son début, son nombre d\'observations et la dernière date', () => {
  const serie = serieLibreObservee(ligneEmplacement(), [
    observation(75, 'occupé', '2026-04-01T12:00:00.000Z'),
    observation(75, 'libre', '2026-05-01T12:00:00.000Z'),
    observation(75, 'libre', '2026-06-01T12:00:00.000Z'),
    observation(75, 'libre', '2026-06-20T12:00:00.000Z'),
    observation(76, 'libre', '2026-03-01T12:00:00.000Z'), // autre emplacement : hors série
  ]);
  assert.equal(serie.nombre, 3);
  assert.equal(serie.debut.toISOString(), '2026-05-01T12:00:00.000Z');
  assert.equal(serie.derniere.toISOString(), '2026-06-20T12:00:00.000Z');
});

test('un « occupé » casse la série : le compteur repart à l\'observation « libre » suivante', () => {
  const serie = serieLibreObservee(ligneEmplacement(), [
    observation(75, 'libre', '2026-04-01T12:00:00.000Z'),
    observation(75, 'occupé', '2026-05-01T12:00:00.000Z'),
    observation(75, 'libre', '2026-06-01T12:00:00.000Z'),
  ]);
  assert.equal(serie.nombre, 1);
  assert.equal(serie.debut.toISOString(), '2026-06-01T12:00:00.000Z');
});

test('les événements arrivent dans n\'importe quel ordre : la série se calcule sur l\'ordre chronologique', () => {
  const serie = serieLibreObservee(ligneEmplacement(), [
    observation(75, 'libre', '2026-06-01T12:00:00.000Z'),
    observation(75, 'occupé', '2026-05-01T12:00:00.000Z'),
    observation(75, 'libre', '2026-05-15T12:00:00.000Z'),
  ]);
  assert.equal(serie.nombre, 2);
  assert.equal(serie.debut.toISOString(), '2026-05-15T12:00:00.000Z');
});

test('Journal vide ou illisible : la ligne elle-même est le fait de repli (une observation, sa date)', () => {
  const serie = serieLibreObservee(ligneEmplacement(), []);
  assert.equal(serie.nombre, 1);
  assert.equal(serie.debut.toISOString(), '2026-06-20T12:00:00.000Z');
  assert.equal(serie.derniere.toISOString(), '2026-06-20T12:00:00.000Z');

  const illisible = serieLibreObservee(ligneEmplacement({ dateObservation: 'pas une date' }), [
    observation(75, 'libre', 'pas une date non plus'),
    { action: 'observation' },
  ]);
  assert.equal(illisible.nombre, 1);
  assert.equal(illisible.debut, null);
  assert.equal(illisible.derniere, null);
});

test('le Journal contredit par la ligne (édition manuelle — 0002) : repli sur la ligne, jamais de série vide', () => {
  // La ligne dit « libre » mais le dernier événement lisible est « occupé ».
  const serie = serieLibreObservee(ligneEmplacement(), [
    observation(75, 'occupé', '2026-06-25T12:00:00.000Z'),
  ]);
  assert.equal(serie.nombre, 1);
  assert.equal(serie.debut.toISOString(), '2026-06-20T12:00:00.000Z');
});

// --- Fenêtre d'apparition d'un « À identifier » (0014) ---

test('l\'apparition est bornée par la dernière observation « libre » avant la série « occupé »', () => {
  const fenetre = fenetreApparition(ligneEmplacement({ numero: 76, occupationObservee: 'occupé' }), [
    observation(76, 'libre', '2026-05-03T12:00:00.000Z'),
    observation(76, 'occupé', '2026-06-12T12:00:00.000Z'),
  ]);
  assert.equal(fenetre.nombre, 1);
  assert.equal(fenetre.debut.toISOString(), '2026-06-12T12:00:00.000Z');
  assert.equal(fenetre.libreAvant.toISOString(), '2026-05-03T12:00:00.000Z');
});

test('sans observation « libre » antérieure, la fenêtre n\'a pas de borne basse ; la série compte ses occurrences', () => {
  const fenetre = fenetreApparition(ligneEmplacement({ numero: 76, occupationObservee: 'occupé' }), [
    observation(76, 'occupé', '2026-05-01T12:00:00.000Z'),
    observation(76, 'occupé', '2026-06-12T12:00:00.000Z'),
  ]);
  assert.equal(fenetre.nombre, 2);
  assert.equal(fenetre.debut.toISOString(), '2026-05-01T12:00:00.000Z');
  assert.equal(fenetre.derniere.toISOString(), '2026-06-12T12:00:00.000Z');
  assert.equal(fenetre.libreAvant, null);
});

test('aucune observation « occupé » lisible : pas de fenêtre — la ligne reste le seul fait (0002)', () => {
  assert.equal(fenetreApparition(ligneEmplacement({ numero: 76 }), []), null);
  assert.equal(fenetreApparition(ligneEmplacement({ numero: 76 }), [
    observation(76, 'occupé', 'pas une date'),
  ]), null);
});

// --- Historique d'un emplacement : le Journal filtré par numéro, en ordre chronologique ---

test('l\'historique fusionne tous les types d\'événements du numéro, du plus ancien au plus récent', () => {
  const historique = historiqueEmplacement([
    observation(75, 'libre', '2026-06-01T12:00:00.000Z'),
    { date: '2026-05-10T12:00:00.000Z', action: 'note', numero: 75, demandeId: '', details: 'Message laissé au membre — Jeremy' },
    observation(75, 'occupé', '2026-04-01T12:00:00.000Z'),
    { date: '2026-06-15T12:00:00.000Z', action: 'libération', numero: 75, demandeId: '', details: 'Adresse retirée' },
    observation(76, 'libre', '2026-03-01T12:00:00.000Z'), // autre numéro
    { date: '2026-05-01T12:00:00.000Z', action: 'structure', numero: '', demandeId: '', details: 'S01 → …' }, // sans numéro
  ], 75);
  assert.deepEqual(historique.map((e) => e.action),
    ['observation', 'note', 'observation', 'libération']);
  assert.deepEqual(historique.map((e) => e.date.toISOString()), [
    '2026-04-01T12:00:00.000Z',
    '2026-05-10T12:00:00.000Z',
    '2026-06-01T12:00:00.000Z',
    '2026-06-15T12:00:00.000Z',
  ]);
  assert.equal(historique[1].details, 'Message laissé au membre — Jeremy');
});

test('un événement illisible (date invalide, ligne trouée) est ignoré sans planter l\'historique', () => {
  const historique = historiqueEmplacement([
    { date: 'pas une date', action: 'observation', numero: 75, details: 'libre' },
    null,
    {},
    observation(75, 'libre', '2026-06-01T12:00:00.000Z'),
  ], 75);
  assert.equal(historique.length, 1);
  assert.equal(historique[0].details, 'libre');
});
