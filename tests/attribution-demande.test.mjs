import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

// Les fonctions de domaine du traitement d'une demande (décision 0020) :
// suggestions d'emplacements, différence de contact, autres demandes ouvertes,
// situation de quota. Elles alimentent désormais le bloc « Demande en cours » de
// la fiche d'adresse (décision 0024, amende 0020) — l'écran de demande autonome
// a été retiré, mais ces règles restent le cœur de l'attribution.
const require = createRequire(import.meta.url);
const {
  suggestionsEmplacements,
  diffContact,
  autresDemandesOuvertes,
  situationAttribution,
} = require('../apps-script/grille.js');

// Une demande (onglet Demandes, schéma 0020) : `numero` = numéro civique de
// l'adresse, `rue` = la rue ; `type` = le type d'embarcation demandé.
function demande(surcharges = {}) {
  return {
    id: 'd1', date: '2026-06-20T14:30:00.000Z', rue: 'Rue du Pré', numero: 234,
    nom: 'Marie Gagnon', courriel: 'marie@exemple.ca', telephone: '819 555-2345',
    type: 'Kayak', mobiliteReduite: false, note: '',
    numeroAttribue: '', dateDecision: '',
    ...surcharges,
  };
}

// Une ligne d'Emplacements observée libre et non attribuée = « Disponible ».
function dispo(numero) {
  return { numero, numeroAdresse: '', rue: '', note: '', occupationObservee: 'libre', dateObservation: '2026-06-20T12:00:00.000Z' };
}
// Observée occupée sans attribution = « À identifier » (jamais suggérée).
function occupe(numero) {
  return { numero, numeroAdresse: '', rue: '', note: '', occupationObservee: 'occupé', dateObservation: '2026-06-20T12:00:00.000Z' };
}

// --- Suggestions d'emplacements (décision 0020) ---

test('ne suggère que les Disponibles des structures compatibles avec le type demandé', () => {
  const structures = [
    { id: 'S01', type: 'horizontal', embarcations: 'Kayak, Canoë', saisie: 'niveaux', emplacements: '[ [10, 11], [12, 13] ]', notes: '' },
    { id: 'S03', type: 'horizontal', embarcations: 'Planche (SUP)', saisie: 'niveaux', emplacements: '[ [20, 21] ]', notes: '' },
  ];
  // 10 dispo, 11 occupé (à identifier), 12 dispo ; S03 (20 dispo) est incompatible Kayak.
  const emplacements = [dispo(10), occupe(11), dispo(12), dispo(20)];
  const groupes = suggestionsEmplacements(demande({ type: 'Kayak' }), structures, emplacements);
  assert.deepEqual(groupes.map((g) => g.structure), ['S01']);
  assert.deepEqual(groupes[0].emplacements.map((e) => e.numero), [10, 12]); // niveau décroissant (10 au niveau 2, 12 au niveau 1)
});

test('une structure sans embarcations renseignées accepte tout, signalée par accepteTout', () => {
  const structures = [
    { id: 'S05', type: 'horizontal', embarcations: '', saisie: 'niveaux', emplacements: '[ [30], [31] ]', notes: '' },
  ];
  const groupes = suggestionsEmplacements(demande({ type: 'Kayak' }), structures, [dispo(30), dispo(31)]);
  assert.equal(groupes.length, 1);
  assert.equal(groupes[0].accepteTout, true);
  assert.deepEqual(groupes[0].emplacements.map((e) => e.numero), [30, 31]); // 30 au niveau 2, 31 au niveau 1
});

test('tri normal : niveau décroissant (garder les bas pour les PMR), numéro croissant à égalité', () => {
  const structures = [
    { id: 'S01', type: 'horizontal', embarcations: 'Kayak', saisie: 'niveaux', emplacements: '[ [10, 11], [12, 13] ]', notes: '' },
  ];
  // niveaux : [10,11] = niveau 2, [12,13] = niveau 1. Tous dispo.
  const groupes = suggestionsEmplacements(demande({ type: 'Kayak' }), structures, [dispo(10), dispo(11), dispo(12), dispo(13)]);
  assert.deepEqual(groupes[0].emplacements.map((e) => e.numero), [10, 11, 12, 13]);
  assert.deepEqual(groupes[0].emplacements.map((e) => e.niveau), [2, 2, 1, 1]);
});

test('mobilité réduite : tri inversé, niveau croissant (les bas d\'abord)', () => {
  const structures = [
    { id: 'S01', type: 'horizontal', embarcations: 'Kayak', saisie: 'niveaux', emplacements: '[ [10, 11], [12, 13] ]', notes: '' },
  ];
  const groupes = suggestionsEmplacements(demande({ type: 'Kayak', mobiliteReduite: true }), structures, [dispo(10), dispo(11), dispo(12), dispo(13)]);
  assert.deepEqual(groupes[0].emplacements.map((e) => e.numero), [12, 13, 10, 11]);
});

test('une structure verticale est comptée au sol : après les niveaux hauts en normal, en tête en PMR', () => {
  const structures = [
    { id: 'S01', type: 'horizontal', embarcations: 'Planche (SUP)', saisie: 'niveaux', emplacements: '[ [10], [11] ]', notes: '' },
    { id: 'S06', type: 'vertical', embarcations: 'Planche (SUP)', saisie: 'colonnes', emplacements: '[ [40, 41] ]', notes: '' },
  ];
  const emplacements = [dispo(10), dispo(11), dispo(40), dispo(41)];
  // Les groupes gardent l'ordre des structures ; le sol (niveau '') est le plus bas des rangs.
  const normal = suggestionsEmplacements(demande({ type: 'Planche (SUP)' }), structures, emplacements);
  assert.deepEqual(normal.find((g) => g.structure === 'S06').emplacements.map((e) => e.niveau), ['', '']);
  // Dans S01 (horizontale), niveau 1 (11) vient après niveau 2 (10) en normal.
  assert.deepEqual(normal.find((g) => g.structure === 'S01').emplacements.map((e) => e.numero), [10, 11]);
});

test('aucune place disponible dans une structure compatible : le groupe n\'apparaît pas', () => {
  const structures = [
    { id: 'S01', type: 'horizontal', embarcations: 'Kayak', saisie: 'niveaux', emplacements: '[ [10, 11] ]', notes: '' },
  ];
  assert.deepEqual(suggestionsEmplacements(demande({ type: 'Kayak' }), structures, [occupe(10), occupe(11)]), []);
});

// --- Différences de contact (décision 0020) ---

test('un contact identique ne signale aucune différence', () => {
  const membre = { numeroAdresse: 234, rue: 'Rue du Pré', nom: 'Marie Gagnon', courriel: 'marie@exemple.ca', telephone: '819 555-2345' };
  const diff = diffContact(demande(), membre);
  assert.equal(diff.membreAbsent, false);
  assert.equal(diff.aDifference, false);
  assert.equal(diff.champs.nom.differe, false);
});

test('un contact différent nomme les champs qui changent, en gardant les deux valeurs', () => {
  const membre = { numeroAdresse: 234, rue: 'Rue du Pré', nom: 'Marie G.', courriel: 'marie@exemple.ca', telephone: '' };
  const diff = diffContact(demande({ nom: 'Marie Gagnon', telephone: '819 555-2345' }), membre);
  assert.equal(diff.aDifference, true);
  assert.equal(diff.champs.nom.differe, true);
  assert.equal(diff.champs.nom.demande, 'Marie Gagnon');
  assert.equal(diff.champs.nom.membre, 'Marie G.');
  assert.equal(diff.champs.telephone.differe, true);
  assert.equal(diff.champs.courriel.differe, false);
});

test('une adresse sans ligne Membres est signalée absente, sans différence à réconcilier', () => {
  const diff = diffContact(demande(), undefined);
  assert.equal(diff.membreAbsent, true);
  assert.equal(diff.aDifference, false);
  assert.equal(diff.champs.courriel.demande, 'marie@exemple.ca');
});

// --- Autres demandes ouvertes de la même adresse (décision 0020) ---

test('signale les autres demandes NOUVELLES de la même adresse, jamais la demande courante ni les décidées', () => {
  const courante = demande({ id: 'd1', numero: 234, rue: 'Rue du Pré' });
  const autres = autresDemandesOuvertes(courante, [
    courante,
    demande({ id: 'd2', numero: 234, rue: 'RUE DU PRÉ' }), // même adresse (casse), nouvelle → signalée
    demande({ id: 'd3', numero: 234, rue: 'Rue du Pré', dateDecision: '2026-06-01T10:00:00.000Z' }), // décidée → ignorée
    demande({ id: 'd4', numero: 99, rue: 'Rue du Pré' }), // autre adresse → ignorée
  ]);
  assert.deepEqual(autres.map((d) => d.id), ['d2']);
});

// --- Situation quota pour une attribution (décision 0020) ---

test('la situation quota compte les attributions de l\'adresse et bloque quand une de plus dépasserait', () => {
  const cle = '234 rue du pré';
  const membres = [{ numeroAdresse: 234, rue: 'Rue du Pré', nom: 'Marie', courriel: 'm@x.ca', telephone: '' }];
  const uneAttribution = [{ numero: 74, numeroAdresse: 234, rue: 'Rue du Pré', occupationObservee: 'occupé' }];
  const s1 = situationAttribution(cle, uneAttribution, membres);
  assert.deepEqual(s1, { nombre: 1, quota: 2, bloque: false });
  const deux = uneAttribution.concat([{ numero: 75, numeroAdresse: 234, rue: 'Rue du Pré', occupationObservee: 'libre' }]);
  const s2 = situationAttribution(cle, deux, membres);
  assert.deepEqual(s2, { nombre: 2, quota: 2, bloque: true });
});

test('la situation quota respecte une exception accordée et tolère une adresse sans attribution', () => {
  const cle = '234 rue du pré';
  const membres = [{ numeroAdresse: 234, rue: 'Rue du Pré', nom: 'Marie', courriel: 'm@x.ca', telephone: '', quotaAccorde: 3 }];
  assert.deepEqual(situationAttribution(cle, [], membres), { nombre: 0, quota: 3, bloque: false });
  const troisAttrib = [74, 75, 76].map((n) => ({ numero: n, numeroAdresse: 234, rue: 'Rue du Pré', occupationObservee: 'libre' }));
  assert.deepEqual(situationAttribution(cle, troisAttrib, membres), { nombre: 3, quota: 3, bloque: true });
});
