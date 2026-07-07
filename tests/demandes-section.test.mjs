import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { etatDemande, sectionDemandes, journalDemande } = require('../apps-script/grille.js');

// Une ligne de l'onglet Demandes, telle que renvoyée par l'API (décision 0020) :
// plus de colonne `statut`, deux faits de décision — numeroAttribue, dateDecision.
function demande(surcharges = {}) {
  return {
    id: 'd1',
    date: '2026-06-20T14:30:00.000Z',
    rue: 'Rue du Pré',
    numero: 234,
    nom: 'Marie Gagnon',
    courriel: 'marie@exemple.ca',
    telephone: '',
    type: 'Kayak',
    mobiliteReduite: false,
    note: '',
    numeroAttribue: '',
    dateDecision: '',
    ...surcharges,
  };
}

// --- L'état d'une demande (décision 0020) : dérivé, jamais stocké ---

test('sans emplacement attribué ni date de décision, une demande est nouvelle', () => {
  const etat = etatDemande(demande());
  assert.equal(etat.code, 'nouvelle');
  assert.equal(etat.libelle, 'Nouvelle');
});

test('un emplacement attribué rend la demande acceptée, en portant le numéro', () => {
  const etat = etatDemande(demande({ numeroAttribue: 75, dateDecision: '2026-07-06T10:00:00.000Z' }));
  assert.equal(etat.code, 'acceptee');
  assert.equal(etat.libelle, 'Acceptée');
  assert.equal(etat.numero, 75);
});

test('une date de décision seule (sans emplacement) rend la demande refusée', () => {
  const etat = etatDemande(demande({ dateDecision: '2026-07-06T10:00:00.000Z' }));
  assert.equal(etat.code, 'refusee');
  assert.equal(etat.libelle, 'Refusée');
});

test('l\'emplacement attribué prime : acceptée même sans date de décision lisible (0002)', () => {
  const etat = etatDemande(demande({ numeroAttribue: 75, dateDecision: 'pas une date' }));
  assert.equal(etat.code, 'acceptee');
  assert.equal(etat.numero, 75);
  assert.equal(etat.date, null);
});

test('un numeroAttribue parasite (Sheet éditée à la main — 0002) ne vaut pas une attribution', () => {
  for (const parasite of ['', '  ', 'abc', '0', '-3', '12.5', null]) {
    const etat = etatDemande(demande({ numeroAttribue: parasite }));
    assert.equal(etat.code, 'nouvelle', `numeroAttribue=${JSON.stringify(parasite)} ne devrait pas attribuer`);
  }
});

test('etatDemande ne plante pas sur une demande absente', () => {
  assert.equal(etatDemande(null).code, 'nouvelle');
  assert.equal(etatDemande(undefined).code, 'nouvelle');
});

// --- La section « Demandes » (décision 0020) : partition + tri dérivés ---

test('les nouvelles passent d\'abord (la plus ancienne en tête), les traitées suivent (décision la plus récente en tête)', () => {
  const demandes = [
    demande({ id: 'refusee-recente', date: '2026-06-01T10:00:00.000Z', dateDecision: '2026-07-03T10:00:00.000Z' }),
    demande({ id: 'nouvelle-recente', date: '2026-07-02T10:00:00.000Z' }),
    demande({ id: 'acceptee-vieille', date: '2026-05-20T10:00:00.000Z', numeroAttribue: 40, dateDecision: '2026-06-01T10:00:00.000Z' }),
    demande({ id: 'nouvelle-vieille', date: '2026-06-15T10:00:00.000Z' }),
  ];
  const section = sectionDemandes(demandes);
  assert.deepEqual(section.nouvelles.map((e) => e.demande.id), ['nouvelle-vieille', 'nouvelle-recente']);
  assert.deepEqual(section.traitees.map((e) => e.demande.id), ['refusee-recente', 'acceptee-vieille']);
  assert.equal(section.nouvelles[0].etat.code, 'nouvelle');
  assert.equal(section.traitees[0].etat.code, 'refusee');
});

test('le tri des nouvelles survit à une date de réception illisible (0002) : traitée comme la plus ancienne', () => {
  const section = sectionDemandes([
    demande({ id: 'datee', date: '2026-07-02T10:00:00.000Z' }),
    demande({ id: 'illisible', date: 'jamais convertie' }),
  ]);
  assert.deepEqual(section.nouvelles.map((e) => e.demande.id), ['illisible', 'datee']);
});

test('sectionDemandes ignore les lignes absentes et tolère une liste vide ou nulle', () => {
  const section = sectionDemandes([null, demande({ id: 'ok' }), undefined]);
  assert.deepEqual(section.nouvelles.map((e) => e.demande.id), ['ok']);
  assert.deepEqual(sectionDemandes([]), { nouvelles: [], traitees: [] });
  assert.deepEqual(sectionDemandes(null), { nouvelles: [], traitees: [] });
});

// --- L'historique d'une demande (décision 0020) : les événements de son demandeId ---

test('journalDemande ne garde que les événements du demandeId, en ordre chronologique', () => {
  const evenements = [
    { date: '2026-07-06T10:00:00.000Z', action: 'refus', numero: '', demandeId: 'd4', details: 'Hors quota.' },
    { date: '2026-06-01T10:00:00.000Z', action: 'attribution', numero: 75, demandeId: 'd4', details: 'Emplacement 75 attribué.' },
    { date: '2026-06-15T10:00:00.000Z', action: 'note', numero: 75, demandeId: 'autre', details: 'pas cette demande' },
  ];
  const journal = journalDemande(evenements, 'd4');
  assert.deepEqual(journal.map((e) => e.action), ['attribution', 'refus']);
  assert.equal(journal[1].details, 'Hors quota.');
});

test('journalDemande ignore les événements illisibles, un id vide et tolère un Journal absent (0002)', () => {
  const evenements = [
    { date: 'pas une date', action: 'refus', demandeId: 'd4', details: 'ignoré' },
    { date: '2026-07-06T10:00:00.000Z', action: '', demandeId: 'd4', details: 'sans action : ignoré' },
    null,
  ];
  assert.deepEqual(journalDemande(evenements, 'd4'), []);
  assert.deepEqual(journalDemande([], ''), []);
  assert.deepEqual(journalDemande(null, 'd4'), []);
});
