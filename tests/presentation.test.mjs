import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { apparenceStatut } = require('../site/presentation.js');

// --- apparenceStatut : le seul foyer code → apparence Web Awesome ---

test('chaque statut a son apparence Web Awesome (variante + icône)', () => {
  assert.deepEqual(apparenceStatut('conforme'), { variante: 'success', icone: 'circle-check' });
  assert.deepEqual(apparenceStatut('peutEtreALiberer'), { variante: 'warning', icone: 'triangle-exclamation' });
  assert.deepEqual(apparenceStatut('orphelin'), { variante: 'danger', icone: 'triangle-exclamation' });
  assert.deepEqual(apparenceStatut('disponible'), { variante: 'brand', icone: 'circle-check' });
  assert.deepEqual(apparenceStatut('pasObserve'), { variante: 'neutral', icone: 'circle-question' });
});

test('un code inconnu (donnée inattendue) retombe sur une apparence neutre — jamais undefined', () => {
  const apparence = apparenceStatut('statutInventé');
  assert.equal(apparence.variante, 'neutral');
  assert.ok(apparence.icone, 'une icône de repli, jamais undefined');
});
