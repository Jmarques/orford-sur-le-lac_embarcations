import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { demandeEnCoursAdresse } = require('../apps-script/grille.js');

// Une demande (onglet Demandes, schéma 0020) : `numero`/`rue` = son adresse,
// l'état se dérive de numeroAttribue + dateDecision (jamais stocké).
function demande(surcharges = {}) {
  return {
    id: 'd1', date: '2026-06-20T14:30:00.000Z', rue: 'Rue du Pré', numero: 234,
    nom: 'Marie Gagnon', courriel: 'marie@exemple.ca', telephone: '819 555-2345',
    type: 'Kayak', mobiliteReduite: false, note: '',
    numeroAttribue: '', dateDecision: '',
    ...surcharges,
  };
}

// --- Demande en cours d'une adresse (décision 0024) ---

test('renvoie la demande NOUVELLE d\'une adresse, par sa clé normalisée (casse indifférente)', () => {
  const demandes = [demande({ id: 'd1', numero: 234, rue: 'RUE DU PRÉ' })];
  const trouvee = demandeEnCoursAdresse('234 rue du pré', demandes);
  assert.equal(trouvee && trouvee.id, 'd1');
});

test('ignore les demandes déjà décidées (acceptée ou refusée) — seules les nouvelles sont en cours', () => {
  const demandes = [
    demande({ id: 'acc', numeroAttribue: 75, dateDecision: '2026-06-25T10:00:00.000Z' }),
    demande({ id: 'ref', dateDecision: '2026-06-25T10:00:00.000Z' }),
  ];
  assert.equal(demandeEnCoursAdresse('234 rue du pré', demandes), undefined);
});

test('ignore les demandes d\'une autre adresse', () => {
  const demandes = [demande({ id: 'autre', numero: 99, rue: 'Rue du Pré' })];
  assert.equal(demandeEnCoursAdresse('234 rue du pré', demandes), undefined);
});

test('quand plusieurs demandes du foyer attendent, renvoie la plus ancienne (premier arrivé)', () => {
  const demandes = [
    demande({ id: 'recente', date: '2026-07-02T09:00:00.000Z' }),
    demande({ id: 'ancienne', date: '2026-06-01T09:00:00.000Z' }),
  ];
  const trouvee = demandeEnCoursAdresse('234 rue du pré', demandes);
  assert.equal(trouvee && trouvee.id, 'ancienne');
});

test('une clé vide ou une liste absente ne rapatrie rien, sans planter', () => {
  assert.equal(demandeEnCoursAdresse('', [demande()]), undefined);
  assert.equal(demandeEnCoursAdresse('234 rue du pré', undefined), undefined);
});
