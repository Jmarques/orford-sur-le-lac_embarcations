import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { preparerIntervention, preparerLiberation } = require('../apps-script/traitement.js');
const { fusionnerLigne } = require('../apps-script/tableur.js');

const ATTRIBUE = { numero: 75, numeroAdresse: 12, rue: 'Rue des Érables', note: '', occupationObservee: 'libre', dateObservation: '2026-06-20T12:00:00.000Z' };

// --- Intervention (0014) : texte libre appendé au Journal, rien d'autre ---

test('une intervention vide ou blanche est refusée — le Journal ne reçoit jamais de ligne muette', () => {
  assert.throws(() => preparerIntervention({ numero: 75, texte: '' }), /vide/i);
  assert.throws(() => preparerIntervention({ numero: 75, texte: '   ' }), /vide/i);
  assert.throws(() => preparerIntervention({ numero: 75 }), /vide/i);
});

test('un numéro d\'emplacement invalide est refusé en nommant l\'attendu', () => {
  assert.throws(() => preparerIntervention({ numero: 'quatorze', texte: 'Appel fait.' }), /numéro/i);
  assert.throws(() => preparerIntervention({ numero: -3, texte: 'Appel fait.' }), /numéro/i);
});

test('une intervention valide devient un événement Journal dédié, rattaché au numéro, texte épuré', () => {
  const { evenement } = preparerIntervention(
    { numero: 75, texte: '  Toléré jusqu\'à la fin juin. — Jeremy  ' },
  );
  assert.equal(evenement.action, 'intervention');
  assert.equal(evenement.numero, 75);
  assert.equal(evenement.details, 'Toléré jusqu\'à la fin juin. — Jeremy');
});

// --- Libération (0014) : l'adresse est retirée, l'événement garde sa trace ---

test('libérer un emplacement sans attribution est refusé avec un message clair', () => {
  const libre = { ...ATTRIBUE, numero: 77, numeroAdresse: '', rue: '' };
  assert.throws(() => preparerLiberation({ numero: 77 }, [libre]), /attribué/i);
});

test('libérer un numéro sans ligne dans Emplacements est refusé — rien à libérer', () => {
  assert.throws(() => preparerLiberation({ numero: 90 }, [ATTRIBUE]), /90/);
});

test('une libération valide vide l\'adresse (et rien d\'autre) et journalise l\'adresse retirée', () => {
  const { miseAJour, evenement } = preparerLiberation({ numero: 75 }, [ATTRIBUE]);
  // Seules les deux colonnes d'attribution sont réécrites : note, occupation
  // et toute colonne ajoutée à la main par le comité restent intactes (0012).
  assert.deepEqual(miseAJour, { numeroAdresse: '', rue: '' });
  assert.equal(evenement.action, 'libération');
  assert.equal(evenement.numero, 75);
  assert.match(evenement.details, /12 Rue des Érables/);
});

test('la mise à jour survit à des colonnes réordonnées à la main (0012) : fusion par nom, jamais par position', () => {
  const { miseAJour } = preparerLiberation({ numero: 75 }, [ATTRIBUE]);
  const entetesReordonnes = ['note', 'rue', 'numero', 'occupationObservee', 'numeroAdresse'];
  const ligneExistante = ['Kayak rouge.', 'Rue des Érables', 75, 'libre', 12];
  assert.deepEqual(
    fusionnerLigne(entetesReordonnes, ligneExistante, miseAJour),
    ['Kayak rouge.', '', 75, 'libre', ''],
  );
});
