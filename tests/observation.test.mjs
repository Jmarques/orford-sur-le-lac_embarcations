import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { preparerObservation, preparerLotObservations } = require('../apps-script/observation.js');

const MAINTENANT = new Date('2026-07-05T15:00:00Z');

test('une occupation hors ensemble ou un numéro invalide sont rejetés en nommant l\'attendu', () => {
  assert.throws(
    () => preparerObservation({ numero: 74, occupation: 'ocupé' }, [], MAINTENANT),
    /occupé, libre/,
  );
  // « inconnu » n'est plus une observation saisissable : on voit une
  // embarcation ou pas.
  assert.throws(
    () => preparerObservation({ numero: 74, occupation: 'inconnu' }, [], MAINTENANT),
    /occupé, libre/,
  );
  assert.throws(
    () => preparerObservation({ numero: 'quatorze', occupation: 'libre' }, [], MAINTENANT),
    /numéro/i,
  );
});

test('un numéro sans ligne dans Emplacements est signalé à créer (create-if-missing, 0009)', () => {
  const { creer, miseAJour } = preparerObservation(
    { numero: 90, occupation: 'occupé' },
    [{ numero: 74 }],
    MAINTENANT,
  );
  assert.equal(creer, true);
  assert.equal(miseAJour.occupationObservee, 'occupé');
});

// --- Lot d'une tournée (décision 0013) : tout ou rien, un événement par observation ---

test('un lot mixte prépare créations et mises à jour, chacune datée au serveur et journalisée (0009, 0011)', () => {
  const lot = preparerLotObservations(
    { observations: [{ numero: 74, occupation: 'libre' }, { numero: 90, occupation: 'occupé' }] },
    [{ numero: 74, numeroAdresse: 234, rue: 'Rue du Pré' }],
    MAINTENANT,
  );
  assert.deepEqual(lot.map((o) => [o.numero, o.creer]), [[74, false], [90, true]]);
  for (const observation of lot) {
    assert.equal(observation.miseAJour.dateObservation, MAINTENANT);
    assert.equal(observation.evenement.action, 'observation');
  }
  assert.deepEqual(lot.map((o) => o.evenement.numero), [74, 90]);
  assert.match(lot[0].evenement.details, /libre/);
  assert.match(lot[1].evenement.details, /occupé/);
});

test('un lot contenant une valeur invalide est refusé en entier, en nommant le problème', () => {
  assert.throws(
    () => preparerLotObservations(
      { observations: [{ numero: 74, occupation: 'libre' }, { numero: 75, occupation: 'ocupé' }] },
      [],
      MAINTENANT,
    ),
    /occupé, libre/,
  );
  assert.throws(
    () => preparerLotObservations(
      { observations: [{ numero: 'quatorze', occupation: 'libre' }] },
      [],
      MAINTENANT,
    ),
    /numéro/i,
  );
});

test('un lot vide ou absent est refusé avec un message clair — rien à écrire n\'est pas un envoi', () => {
  assert.throws(() => preparerLotObservations({ observations: [] }, [], MAINTENANT), /vide/i);
  assert.throws(() => preparerLotObservations({}, [], MAINTENANT), /vide/i);
});

test('un numéro répété dans le lot est refusé — deux observations du même emplacement dans une passe est une erreur', () => {
  assert.throws(
    () => preparerLotObservations(
      { observations: [{ numero: 74, occupation: 'libre' }, { numero: 74, occupation: 'occupé' }] },
      [],
      MAINTENANT,
    ),
    /74/,
  );
});

test('une observation valide met à jour la cellule, date la mesure et journalise l\'événement', () => {
  const { miseAJour, evenement, creer } = preparerObservation(
    { numero: 74, occupation: 'libre' },
    [{ numero: 74, numeroAdresse: 234, rue: 'Rue du Pré' }],
    MAINTENANT,
  );
  assert.deepEqual(miseAJour, { occupationObservee: 'libre', dateObservation: MAINTENANT });
  assert.equal(creer, false);
  assert.equal(evenement.action, 'observation');
  assert.equal(evenement.numero, 74);
  assert.match(evenement.details, /libre/);
});
