import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { apparenceStatut, proseSignal } = require('../site/presentation.js');

// Même formateur que le module : l'attendu suit le fuseau de la machine, donc
// l'assertion tient partout (pas de date en dur).
const fmt = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'long' });

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

// --- proseSignal : une phrase par audience, mêmes faits, sortie identique ---

const DEBUT_LIBRE = '2026-05-03T12:00:00.000Z';
const journalLibre = [
  { date: DEBUT_LIBRE, action: 'observation', numero: 74, details: 'libre' },
  { date: '2026-05-20T12:00:00.000Z', action: 'observation', numero: 74, details: 'libre' },
  { date: '2026-06-01T12:00:00.000Z', action: 'observation', numero: 74, details: 'libre' },
];
const ligneAttribueLibre = { numero: 74, numeroAdresse: '234', rue: 'Rue du Pré', occupationObservee: 'libre', dateObservation: DEBUT_LIBRE };

const LIBRE_AVANT = '2026-05-01T12:00:00.000Z';
const APPARU = '2026-06-12T12:00:00.000Z';
const journalApparition = [
  { date: LIBRE_AVANT, action: 'observation', numero: 90, details: 'libre' },
  { date: APPARU, action: 'observation', numero: 90, details: 'occupé' },
];
const ligneOrphelin = { numero: 90, occupationObservee: 'occupé', dateObservation: APPARU };

test('« Attribué, libre » : la fiche préfixe et ponctue, le registre est nu — mêmes faits', () => {
  const debut = fmt.format(new Date(DEBUT_LIBRE));
  assert.equal(proseSignal(ligneAttribueLibre, journalLibre, 'fiche'),
    'Attribué, mais observé libre depuis le ' + debut + ' · 3 observations.');
  assert.equal(proseSignal(ligneAttribueLibre, journalLibre, 'file'),
    'Libre depuis le ' + debut + ' · 3 observations');
});

test('« À identifier » : la fenêtre d\'apparition, préfixée en fiche, nue au registre', () => {
  const entre = 'entre le ' + fmt.format(new Date(LIBRE_AVANT)) + ' et le ' + fmt.format(new Date(APPARU));
  assert.equal(proseSignal(ligneOrphelin, journalApparition, 'fiche'),
    'Non attribué — embarcation apparue ' + entre + '.');
  assert.equal(proseSignal(ligneOrphelin, journalApparition, 'file'),
    'Embarcation apparue ' + entre);
});

test('un statut sans dimension temporelle (En ordre) n\'a pas de signal → null', () => {
  const ligneConforme = { numero: 74, numeroAdresse: '234', rue: 'Rue du Pré', occupationObservee: 'occupé' };
  assert.equal(proseSignal(ligneConforme, [], 'fiche'), null);
  assert.equal(proseSignal(ligneConforme, [], 'file'), null);
});
