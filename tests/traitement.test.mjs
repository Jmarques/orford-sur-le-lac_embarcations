import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { preparerNote, preparerLiberation } = require('../apps-script/traitement.js');
const { fusionnerLigne } = require('../apps-script/tableur.js');

const ATTRIBUE = { numero: 75, numeroAdresse: 12, rue: 'Rue des Érables', note: '', occupationObservee: 'libre', dateObservation: '2026-06-20T12:00:00.000Z' };

// --- Note au journal (0014) : texte libre appendé au Journal, rien d'autre ---

test('une note vide ou blanche est refusée — le Journal ne reçoit jamais de ligne muette', () => {
  assert.throws(() => preparerNote({ numero: 75, texte: '' }), /vide/i);
  assert.throws(() => preparerNote({ numero: 75, texte: '   ' }), /vide/i);
  assert.throws(() => preparerNote({ numero: 75 }), /vide/i);
});

test('un numéro d\'emplacement invalide est refusé en nommant l\'attendu', () => {
  assert.throws(() => preparerNote({ numero: 'quatorze', texte: 'Appel fait.' }), /numéro/i);
  assert.throws(() => preparerNote({ numero: -3, texte: 'Appel fait.' }), /numéro/i);
});

test('une note valide devient un événement Journal dédié, rattaché au numéro, texte épuré', () => {
  const { evenement } = preparerNote(
    { numero: 75, texte: '  Toléré jusqu\'à la fin juin. — Jeremy  ' },
  );
  assert.equal(evenement.action, 'note');
  assert.equal(evenement.numero, 75);
  assert.equal(evenement.details, 'Toléré jusqu\'à la fin juin. — Jeremy');
});

// --- Note d'adresse (0019) : la note d'un cas hors quota parle de l'adresse ---

test('une note d\'adresse valide devient un événement Journal rattaché à l\'adresse, numéro vide', () => {
  const { evenement } = preparerNote(
    { adresse: '  234 Rue du Pré ', texte: 'Toléré à 3 tant que la liste d\'attente est vide. — Jeremy' },
  );
  assert.equal(evenement.action, 'note');
  assert.equal(evenement.adresse, '234 Rue du Pré');
  assert.equal(evenement.numero, '');
  assert.equal(evenement.details, 'Toléré à 3 tant que la liste d\'attente est vide. — Jeremy');
});

test('une note avec numéro ET adresse à la fois est refusée — le sujet doit être un seul', () => {
  assert.throws(
    () => preparerNote({ numero: 75, adresse: '234 Rue du Pré', texte: 'Appel fait.' }),
    /un seul/i,
  );
});

test('une note sans numéro ni adresse est refusée en nommant l\'attendu', () => {
  assert.throws(() => preparerNote({ texte: 'Appel fait.' }), /numéro.*adresse|adresse.*numéro/i);
  assert.throws(() => preparerNote({ adresse: '   ', texte: 'Appel fait.' }), /numéro.*adresse|adresse.*numéro/i);
});

test('une note d\'adresse vide est refusée comme une note d\'emplacement', () => {
  assert.throws(() => preparerNote({ adresse: '234 Rue du Pré', texte: '  ' }), /vide/i);
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
  // L'événement porte aussi la clé adresse (0019) : le journal du cas hors
  // quota raconte la libération même après que l'emplacement a quitté l'adresse.
  assert.equal(evenement.adresse, '12 Rue des Érables');
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
