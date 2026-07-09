import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { apparenceStatut, apparenceCellule, silhouetteEmbarcation, proseSignal, formatAdresse, cartePositions, positionParNumero, lienMailto, santeDossier } = require('../site/presentation.js');
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

// --- apparenceCellule : l'encodage COMPOSÉ de la grille (décision 0022) ---
// La FORME porte l'occupation (le seul foyer JS : quel glyphe insérer), le
// REPÈRE la seule non-attribution observée. La TEINTE, elle, vit dans theme.css
// keyée par le code (0004) — pas ici. Tout est dérivé du code de statut (0011).

test('chaque statut a son encodage de cellule (occupation · repère)', () => {
  // En ordre : attribué + occupé → plein, pas de repère.
  assert.deepEqual(apparenceCellule('conforme'), { occupation: 'occupe', repere: false });
  // Attribué, libre : bordé (libre), attribué donc pas de repère.
  assert.deepEqual(apparenceCellule('peutEtreALiberer'), { occupation: 'libre', repere: false });
  // À identifier : occupé, non attribué → repère.
  assert.deepEqual(apparenceCellule('orphelin'), { occupation: 'occupe', repere: true });
  // Disponible : libre, non attribué → repère.
  assert.deepEqual(apparenceCellule('disponible'), { occupation: 'libre', repere: true });
  // Non observé : puits ; jamais de repère (message = « on ne sait pas encore »).
  assert.deepEqual(apparenceCellule('pasObserve'), { occupation: 'nonObserve', repere: false });
});

test('le repère ne marque QUE la non-attribution observée (Disponible, À identifier)', () => {
  assert.equal(apparenceCellule('disponible').repere, true);
  assert.equal(apparenceCellule('orphelin').repere, true);
  assert.equal(apparenceCellule('conforme').repere, false);
  assert.equal(apparenceCellule('peutEtreALiberer').repere, false);
  assert.equal(apparenceCellule('pasObserve').repere, false);
});

test('un code inconnu retombe sur une cellule neutre non observée — jamais undefined', () => {
  assert.deepEqual(apparenceCellule('statutInventé'), { occupation: 'nonObserve', repere: false });
});

// --- silhouetteEmbarcation : type d'embarcation → clé de silhouette ---

test('chaque type d\'embarcation a sa silhouette ; tout autre type retombe sur « autre »', () => {
  assert.equal(silhouetteEmbarcation('Canoë'), 'canoe');
  assert.equal(silhouetteEmbarcation('Kayak'), 'kayak');
  assert.equal(silhouetteEmbarcation('Planche (SUP)'), 'planche');
  assert.equal(silhouetteEmbarcation('Pédalo'), 'autre');
  assert.equal(silhouetteEmbarcation(''), 'autre');
  assert.equal(silhouetteEmbarcation(undefined), 'autre');
});

test('silhouetteEmbarcation tolère les espaces autour du type (cellule éditée à la main)', () => {
  assert.equal(silhouetteEmbarcation('  Kayak  '), 'kayak');
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

// --- santeDossier : la pastille de santé d'un dossier d'adresse (0023) ---
// Dérivée (jamais stockée) : pire d'abord parmi les statuts des emplacements de
// l'adresse, le dépassement de quota prioritaire sur tout. Libellé + variante,
// la couleur ne portant jamais seule (0016).

// Une ligne d'Emplacements attribuée à « 12 Rue des Érables ».
function ligneSante(surcharges = {}) {
  return {
    numero: 75, numeroAdresse: 12, rue: 'Rue des Érables',
    occupationObservee: 'occupé', dateObservation: '2026-06-20T12:00:00.000Z',
    ...surcharges,
  };
}
const membreSante = (surcharges = {}) => ({ numeroAdresse: 12, rue: 'Rue des Érables', nom: 'Louise Bédard', ...surcharges });
const CLE_SANTE = '12 rue des érables';

test('un dossier tout en ordre → pastille « En ordre » verte (success)', () => {
  const sante = santeDossier(CLE_SANTE, [
    ligneSante({ numero: 74, occupationObservee: 'occupé' }),
    ligneSante({ numero: 75, occupationObservee: 'occupé' }),
  ], [membreSante()]);
  assert.equal(sante.libelle, 'En ordre');
  assert.equal(sante.variante, 'success');
});

test('pire d\'abord : un seul « Attribué, libre » parmi des « En ordre » domine → warning', () => {
  const sante = santeDossier(CLE_SANTE, [
    ligneSante({ numero: 74, occupationObservee: 'occupé' }),
    ligneSante({ numero: 75, occupationObservee: 'libre' }),
  ], [membreSante()]);
  assert.equal(sante.libelle, 'Attribué, libre');
  assert.equal(sante.variante, 'warning');
});

test('« Non observé » l\'emporte sur « En ordre », mais cède à « Attribué, libre »', () => {
  // Non observé (75) domine En ordre (74) — sans dépasser le quota (2).
  const nonObserve = santeDossier(CLE_SANTE, [
    ligneSante({ numero: 74, occupationObservee: 'occupé' }),
    ligneSante({ numero: 75, occupationObservee: '' }),
  ], [membreSante()]);
  assert.equal(nonObserve.libelle, 'Non observé');
  assert.equal(nonObserve.variante, 'neutral');

  // Attribué-libre (75) domine Non observé (76) — quota 3 pour ne pas dépasser.
  const attribueLibre = santeDossier(CLE_SANTE, [
    ligneSante({ numero: 74, occupationObservee: 'occupé' }),
    ligneSante({ numero: 75, occupationObservee: 'libre' }),
    ligneSante({ numero: 76, occupationObservee: '' }),
  ], [membreSante({ quotaAccorde: 3 })]);
  assert.equal(attribueLibre.libelle, 'Attribué, libre');
});

test('« Hors quota » prime sur tout — même quand un emplacement est « Attribué, libre »', () => {
  // 3 attributions, quota 2 : hors quota. Un emplacement est libre (problème
  // terrain) mais le dépassement passe devant — pastille NEUTRE (règle de gestion).
  const sante = santeDossier(CLE_SANTE, [
    ligneSante({ numero: 74, occupationObservee: 'occupé' }),
    ligneSante({ numero: 75, occupationObservee: 'libre' }),
    ligneSante({ numero: 76, occupationObservee: 'occupé' }),
  ], [membreSante()]);
  assert.equal(sante.libelle, 'Hors quota');
  assert.equal(sante.variante, 'neutral');
});

test('une adresse sans emplacement (connue seulement via Membres) → « Aucun emplacement » neutre', () => {
  const sante = santeDossier(CLE_SANTE, [], [membreSante()]);
  assert.equal(sante.libelle, 'Aucun emplacement');
  assert.equal(sante.variante, 'neutral');
});

test('une clé sans dossier (ni attribuée ni connue de Membres) reste neutre, sans planter', () => {
  const sante = santeDossier('99 chemin inconnu', [ligneSante()], [membreSante()]);
  assert.equal(sante.libelle, 'Aucun emplacement');
  assert.equal(sante.variante, 'neutral');
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
