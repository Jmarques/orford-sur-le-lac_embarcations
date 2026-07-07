import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { preparerNote, preparerLiberation, preparerDecision, preparerMajContact } = require('../apps-script/traitement.js');
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

// --- Décision d'une demande (0020) : accepter = attribuer, refuser, en un geste ---

const MAINTENANT = new Date('2026-07-06T15:00:00.000Z');

function dispo(numero) {
  return { numero, numeroAdresse: '', rue: '', note: '', occupationObservee: 'libre', dateObservation: '2026-06-20T12:00:00.000Z' };
}
function demande(surcharges = {}) {
  return {
    id: 'd1', date: '2026-06-20T14:30:00.000Z', rue: 'Rue du Pré', numero: 234,
    nom: 'Marie Gagnon', courriel: 'marie@exemple.ca', telephone: '819 555-2345',
    type: 'Kayak', mobiliteReduite: false, note: '', numeroAttribue: '', dateDecision: '',
    ...surcharges,
  };
}
function inventaire(surcharges = {}) {
  return {
    structures: [{ id: 'S01', type: 'horizontal', embarcations: 'Kayak', saisie: 'niveaux', emplacements: '[ [10, 11], [12, 13] ]', notes: '' }],
    emplacements: [dispo(10), dispo(11), dispo(12), dispo(13)],
    membres: [{ numeroAdresse: 234, rue: 'Rue du Pré', nom: 'Marie Gagnon', courriel: 'marie@exemple.ca', telephone: '819 555-2345' }],
    demandes: [demande()],
    ...surcharges,
  };
}

test('accepter un emplacement qui n\'est pas Disponible (ou incompatible) est refusé', () => {
  const inv = inventaire({ emplacements: [{ ...dispo(10), occupationObservee: 'occupé' }, dispo(11)] });
  assert.throws(() => preparerDecision({ decision: 'accepter', demandeId: 'd1', numero: 10 }, inv, MAINTENANT), /disponible|compatible/i);
  // Un numéro qui n'existe dans aucune structure compatible non plus.
  assert.throws(() => preparerDecision({ decision: 'accepter', demandeId: 'd1', numero: 999 }, inventaire(), MAINTENANT), /disponible|compatible/i);
});

test('accepter au-delà du quota accordé est refusé — le déblocage passe par la Sheet', () => {
  const inv = inventaire({
    emplacements: [
      dispo(10),
      { numero: 74, numeroAdresse: 234, rue: 'Rue du Pré', occupationObservee: 'occupé' },
      { numero: 75, numeroAdresse: 234, rue: 'Rue du Pré', occupationObservee: 'libre' },
    ],
  });
  assert.throws(() => preparerDecision({ decision: 'accepter', demandeId: 'd1', numero: 10 }, inv, MAINTENANT), /quota/i);
});

test('refuser sans raison est refusé — la raison est journalisée', () => {
  assert.throws(() => preparerDecision({ decision: 'refuser', demandeId: 'd1', raison: '   ' }, inventaire(), MAINTENANT), /raison/i);
  assert.throws(() => preparerDecision({ decision: 'refuser', demandeId: 'd1' }, inventaire(), MAINTENANT), /raison/i);
});

test('décider une demande déjà décidée, ou un id inconnu, est refusé', () => {
  const decidee = inventaire({ demandes: [demande({ numeroAttribue: 12, dateDecision: '2026-06-01T10:00:00.000Z' })] });
  assert.throws(() => preparerDecision({ decision: 'accepter', demandeId: 'd1', numero: 10 }, decidee, MAINTENANT), /déjà|nouvelle/i);
  assert.throws(() => preparerDecision({ decision: 'refuser', demandeId: 'inconnu', raison: 'x' }, inventaire(), MAINTENANT), /introuvable|inconnu/i);
});

test('une acceptation prépare l\'attribution, la décision de la demande et l\'événement Journal', () => {
  const prepare = preparerDecision({ decision: 'accepter', demandeId: 'd1', numero: 10 }, inventaire(), MAINTENANT);
  assert.equal(prepare.demandeId, 'd1');
  assert.equal(prepare.demande.numeroAttribue, 10);
  assert.equal(prepare.demande.dateDecision, MAINTENANT);
  assert.deepEqual(prepare.attribution, { numero: 10, numeroAdresse: 234, rue: 'Rue du Pré' });
  assert.equal(prepare.membre, null); // le contact existe déjà — accepter ne l'écrase pas
  assert.equal(prepare.evenement.action, 'attribution');
  assert.equal(prepare.evenement.numero, 10);
  assert.equal(prepare.evenement.demandeId, 'd1');
  assert.match(prepare.evenement.details, /234 Rue du Pré/);
});

test('accepter crée la ligne Membres quand l\'adresse n\'y est pas encore', () => {
  const prepare = preparerDecision({ decision: 'accepter', demandeId: 'd1', numero: 10 }, inventaire({ membres: [] }), MAINTENANT);
  assert.deepEqual(prepare.membre, {
    numeroAdresse: 234, rue: 'Rue du Pré', nom: 'Marie Gagnon', courriel: 'marie@exemple.ca', telephone: '819 555-2345',
  });
});

test('un refus prépare la date de décision et l\'événement Journal portant la raison', () => {
  const prepare = preparerDecision({ decision: 'refuser', demandeId: 'd1', raison: '  Hors quota — déjà 2 emplacements.  ' }, inventaire(), MAINTENANT);
  assert.equal(prepare.demande.numeroAttribue, undefined); // un refus n'attribue rien
  assert.equal(prepare.demande.dateDecision, MAINTENANT);
  assert.equal(prepare.attribution, null);
  assert.equal(prepare.membre, null);
  assert.equal(prepare.evenement.action, 'refus');
  assert.equal(prepare.evenement.demandeId, 'd1');
  assert.equal(prepare.evenement.details, 'Hors quota — déjà 2 emplacements.');
});

// --- Mise à jour du contact depuis une demande (0020), geste indépendant ---

test('la mise à jour du contact prépare l\'écriture Membres depuis la demande et journalise', () => {
  const prepare = preparerMajContact({ demandeId: 'd1' }, inventaire({ demandes: [demande({ nom: 'Marie Gagnon-Roy', telephone: '819 555-9999' })] }));
  assert.deepEqual(prepare.membre, {
    numeroAdresse: 234, rue: 'Rue du Pré', nom: 'Marie Gagnon-Roy', courriel: 'marie@exemple.ca', telephone: '819 555-9999',
  });
  assert.equal(prepare.evenement.action, 'contact');
  assert.equal(prepare.evenement.demandeId, 'd1');
  assert.match(prepare.evenement.adresse, /234 Rue du Pré/);
});

test('mettre à jour le contact d\'un id inconnu est refusé', () => {
  assert.throws(() => preparerMajContact({ demandeId: 'inconnu' }, inventaire()), /introuvable|inconnu/i);
});
