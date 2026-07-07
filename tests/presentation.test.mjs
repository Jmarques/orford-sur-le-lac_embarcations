import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { apparenceStatut, proseSignal, formatAdresse, cartePositions, positionParNumero, lienMailto } = require('../site/presentation.js');
const { chercherMembreParCle, cleAdresse } = require('../site/grille.js');

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

// --- formatAdresse : « numeroAdresse rue », depuis une ligne ou une demande ---

test('formatAdresse joint numéro et rue, épurés — même forme des deux sources', () => {
  assert.equal(formatAdresse('234', 'Rue du Pré'), '234 Rue du Pré');
  // Cellules éditées à la main (0002) : espaces superflus rabotés.
  assert.equal(formatAdresse('  12 ', '  Rue du Lac  '), '12 Rue du Lac');
});

// --- chercherMembreParCle (grille) : appariement par clé normalisée ---

// --- positionParNumero / cartePositions : la position d'un numéro ---

const structuresTest = [
  { id: 'A', type: 'horizontal', embarcations: 'Kayak', saisie: 'niveaux', emplacements: '[[74, 75]]' },
  { id: 'B', type: 'horizontal', embarcations: 'Kayak', saisie: 'niveaux', emplacements: '[[74, 80]]' },
];

test('positionParNumero situe un numéro ; la PREMIÈRE position gagne pour un doublon ; absent → null', () => {
  assert.equal(positionParNumero(75, structuresTest).structure, 'A');
  // 74 est en double (A et B) : la première structure analysée l'emporte.
  assert.equal(positionParNumero(74, structuresTest).structure, 'A');
  assert.equal(positionParNumero(999, structuresTest), null);
});

test('cartePositions construit la carte numero → { structure, niveau } en une passe', () => {
  const carte = cartePositions(structuresTest);
  assert.equal(carte.get(75).structure, 'A');
  assert.equal(carte.get(80).structure, 'B');
  assert.ok(!carte.has(999));
});

test('chercherMembreParCle apparie malgré la casse ; clé vide ou absente → undefined', () => {
  const membres = [
    { numeroAdresse: '10', rue: 'Rue du Lac', nom: 'Diane' },
    { numeroAdresse: '234', rue: 'RUE DU PRÉ', nom: 'Marc' },
  ];
  const cle = cleAdresse({ numeroAdresse: '234', rue: 'rue du pré' });
  assert.equal(chercherMembreParCle(membres, cle).nom, 'Marc');
  assert.equal(chercherMembreParCle(membres, ''), undefined);
  assert.equal(chercherMembreParCle(membres, cleAdresse({ numeroAdresse: '99', rue: 'Absente' })), undefined);
});

// --- lienMailto : assemblage encodé (l'invariant XSS/encodage, une fois) ---

test('lienMailto encode destinataire, sujet et corps — les ?/& ne cassent rien', () => {
  const href = lienMailto({ courriel: '  a@b.ca ', sujet: 'Emplacement 12 & suite', corps: 'Bonjour ?\nMerci' });
  assert.equal(href, 'mailto:' + encodeURIComponent('a@b.ca')
    + '?subject=' + encodeURIComponent('Emplacement 12 & suite')
    + '&body=' + encodeURIComponent('Bonjour ?\nMerci'));
});

test('lienMailto tolère un courriel absent (destinataire vide)', () => {
  assert.equal(lienMailto({ courriel: undefined, sujet: 'S', corps: 'C' }), 'mailto:?subject=S&body=C');
});
