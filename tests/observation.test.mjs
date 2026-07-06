import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { preparerObservation } = require('../apps-script/observation.js');

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
