import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { cleAdresse, casAdresse, fileHorsQuota, journalDeCas, depassementQuota } = require('../apps-script/grille.js');

// Une ligne de l'onglet Emplacements, telle que renvoyée par l'API.
function ligneEmplacement(surcharges = {}) {
  return {
    numero: 75,
    numeroAdresse: 12,
    rue: 'Rue des Érables',
    note: '',
    occupationObservee: 'libre',
    dateObservation: '2026-06-20T12:00:00.000Z',
    ...surcharges,
  };
}

// Trois attributions pour la même adresse : un cas hors quota au défaut de 2.
function troisAttributions(surcharges = {}) {
  return [
    ligneEmplacement({ numero: 74, ...surcharges }),
    ligneEmplacement({ numero: 75, ...surcharges }),
    ligneEmplacement({ numero: 76, ...surcharges }),
  ];
}

function membre(surcharges = {}) {
  return {
    numeroAdresse: 12,
    rue: 'Rue des Érables',
    nom: 'Louise Bédard',
    courriel: 'louise.bedard@exemple.ca',
    telephone: '819 555-8765',
    ...surcharges,
  };
}

// --- La clé d'adresse normalisée (0019) : l'appariement survit à l'édition manuelle ---

test('la clé d\'adresse normalise casse et espaces, l\'affichage garde le texte de la ligne', () => {
  assert.equal(cleAdresse({ numeroAdresse: 12, rue: '  Rue des   Érables ' }), '12 rue des érables');
  assert.equal(cleAdresse({ numeroAdresse: ' 12 ', rue: 'RUE DES ÉRABLES' }), '12 rue des érables');
});

test('une adresse incomplète (cellule à moitié effacée — 0002) n\'a pas de clé', () => {
  assert.equal(cleAdresse({ numeroAdresse: 12, rue: '' }), '');
  assert.equal(cleAdresse({ numeroAdresse: '', rue: 'Rue des Érables' }), '');
  assert.equal(cleAdresse(null), '');
});

// --- La file « Hors quota » (0019) : attributions > quota accordé, jamais l'occupation ---

test('trois attributions sans quota accordé font un cas hors quota (défaut 2), peu importe l\'occupation observée', () => {
  const cas = fileHorsQuota([
    ligneEmplacement({ numero: 74, occupationObservee: 'occupé' }),
    ligneEmplacement({ numero: 75, occupationObservee: 'libre' }),
    ligneEmplacement({ numero: 76, occupationObservee: '' }), // non observé : compte quand même
  ], [membre()]);
  assert.equal(cas.length, 1);
  assert.equal(cas[0].adresse, '12 Rue des Érables');
  assert.equal(cas[0].nombre, 3);
  assert.equal(cas[0].quota, 2);
  assert.equal(cas[0].depassement, 1);
  assert.deepEqual(cas[0].emplacements.map((l) => l.numero), [74, 75, 76]);
  assert.equal(cas[0].membre.nom, 'Louise Bédard');
});

test('deux attributions restent dans le quota : aucune adresse en file', () => {
  const cas = fileHorsQuota([ligneEmplacement({ numero: 74 }), ligneEmplacement({ numero: 75 })], [membre()]);
  assert.deepEqual(cas, []);
});

test('une exception accordée à 3 sort le cas de la file, mais une 4e attribution l\'y fait rentrer', () => {
  const membres = [membre({ quotaAccorde: 3 })];
  assert.deepEqual(fileHorsQuota(troisAttributions(), membres), []);
  const cas = fileHorsQuota(troisAttributions().concat([ligneEmplacement({ numero: 77 })]), membres);
  assert.equal(cas.length, 1);
  assert.equal(cas[0].quota, 3);
  assert.equal(cas[0].depassement, 1);
});

test('un quota accordé illisible (Sheet éditée à la main — 0002) retombe au défaut de 2, sans planter', () => {
  for (const valeur of ['beaucoup', '0', '-1', '2.5', null]) {
    const cas = fileHorsQuota(troisAttributions(), [membre({ quotaAccorde: valeur })]);
    assert.equal(cas.length, 1, `quotaAccorde=${JSON.stringify(valeur)}`);
    assert.equal(cas[0].quota, 2);
  }
});

test('une adresse éclatée par la casse ou les espaces (édition manuelle) est regroupée en un seul cas', () => {
  const cas = fileHorsQuota([
    ligneEmplacement({ numero: 74, rue: 'Rue des Érables' }),
    ligneEmplacement({ numero: 75, rue: 'rue des érables' }),
    ligneEmplacement({ numero: 76, rue: ' Rue  des   Érables ' }),
  ], []);
  assert.equal(cas.length, 1);
  assert.equal(cas[0].nombre, 3);
  // L'affichage garde le texte de la première ligne rencontrée.
  assert.equal(cas[0].adresse, '12 Rue des Érables');
});

test('le membre est trouvé malgré une casse différente entre Emplacements et Membres', () => {
  const cas = fileHorsQuota(troisAttributions({ rue: 'RUE DES ÉRABLES' }), [membre({ quotaAccorde: 3 })]);
  assert.deepEqual(cas, []); // l'exception accordée est bien vue malgré la casse
});

test('une adresse sans ligne Membres reste un cas complet, sans membre', () => {
  const cas = fileHorsQuota(troisAttributions(), []);
  assert.equal(cas.length, 1);
  assert.equal(cas[0].membre, undefined);
  assert.equal(cas[0].quota, 2);
});

test('les lignes illisibles ou non attribuées sont ignorées sans planter', () => {
  const cas = fileHorsQuota([
    null,
    { numero: '', numeroAdresse: 12, rue: 'Rue des Érables' },
    ligneEmplacement({ numero: 77, numeroAdresse: '', rue: '' }), // non attribué
    ...troisAttributions(),
  ], null);
  assert.equal(cas.length, 1);
  assert.equal(cas[0].nombre, 3);
});

test('tri : dépassement décroissant, puis nombre d\'emplacements, puis adresse — stable', () => {
  const lignes = [
    // 34 Chemin du Lac : 4 attributions, quota 2 → dépassement 2.
    ligneEmplacement({ numero: 80, numeroAdresse: 34, rue: 'Chemin du Lac' }),
    ligneEmplacement({ numero: 81, numeroAdresse: 34, rue: 'Chemin du Lac' }),
    ligneEmplacement({ numero: 82, numeroAdresse: 34, rue: 'Chemin du Lac' }),
    ligneEmplacement({ numero: 83, numeroAdresse: 34, rue: 'Chemin du Lac' }),
    // 12 Rue des Érables : 3 attributions → dépassement 1.
    ...troisAttributions(),
    // 9 Chemin du Lac : 4 attributions, exception à 3 → dépassement 1 mais 4 emplacements.
    ligneEmplacement({ numero: 90, numeroAdresse: 9, rue: 'Chemin du Lac' }),
    ligneEmplacement({ numero: 91, numeroAdresse: 9, rue: 'Chemin du Lac' }),
    ligneEmplacement({ numero: 92, numeroAdresse: 9, rue: 'Chemin du Lac' }),
    ligneEmplacement({ numero: 93, numeroAdresse: 9, rue: 'Chemin du Lac' }),
  ];
  const cas = fileHorsQuota(lignes, [membre({ numeroAdresse: 9, rue: 'Chemin du Lac', quotaAccorde: 3 })]);
  assert.deepEqual(cas.map((c) => c.adresse), ['34 Chemin du Lac', '9 Chemin du Lac', '12 Rue des Érables']);
});

// --- Le dossier d'une adresse (0019) : racontable même dans les règles ---

test('le dossier d\'une adresse existe aussi dans les règles — la fiche reste racontable après une libération', () => {
  const cas = casAdresse('12 rue des érables', [ligneEmplacement({ numero: 74 }), ligneEmplacement({ numero: 75 })], [membre()]);
  assert.equal(cas.nombre, 2);
  assert.equal(cas.quota, 2);
  assert.equal(cas.depassement, 0);
  assert.equal(cas.membre.nom, 'Louise Bédard');
  assert.deepEqual(cas.emplacements.map((l) => l.numero), [74, 75]);
});

test('une adresse connue seulement via Membres (aucune attribution) a un dossier à nombre 0 (0023/0024)', () => {
  const cas = casAdresse('12 rue des érables', [], [membre()]);
  assert.equal(cas.cle, '12 rue des érables');
  assert.equal(cas.adresse, '12 Rue des Érables'); // le texte vient de la ligne Membres
  assert.equal(cas.membre.nom, 'Louise Bédard');
  assert.equal(cas.nombre, 0);
  assert.equal(cas.quota, 2);
  assert.equal(cas.depassement, 0);
  assert.deepEqual(cas.emplacements, []);
});

test('le dossier Membres-seul porte le quota accordé applicable (dépassement reste 0 sans attribution)', () => {
  const cas = casAdresse('12 rue des érables', [], [membre({ quotaAccorde: 3 })]);
  assert.equal(cas.nombre, 0);
  assert.equal(cas.quota, 3);
  assert.equal(cas.depassement, 0);
});

test('le dossier Membres-seul apparie la clé malgré la casse et rend le texte de la ligne Membres', () => {
  const cas = casAdresse('12 rue des érables', [], [membre({ rue: 'RUE DES ÉRABLES' })]);
  assert.equal(cas.adresse, '12 RUE DES ÉRABLES');
  assert.deepEqual(cas.emplacements, []);
  assert.equal(cas.nombre, 0);
});

test('le dossier d\'une adresse ni attribuée ni connue de Membres est null', () => {
  assert.equal(casAdresse('9 chemin inconnu', troisAttributions(), [membre()]), null);
  assert.equal(casAdresse('', troisAttributions(), [membre()]), null);
});

// --- Le journal d'un cas (0019) : notes d'adresse + libérations de ses emplacements ---

test('le journal du cas fusionne notes d\'adresse et libérations des emplacements, en ordre chronologique', () => {
  const evenements = [
    { date: '2026-06-10T12:00:00.000Z', action: 'note', numero: '', adresse: '12 Rue des Érables', demandeId: '', details: 'Toléré à 3 tant que la liste d\'attente est vide. — Jeremy' },
    { date: '2026-05-01T12:00:00.000Z', action: 'libération', numero: 74, adresse: '12 Rue des Érables', demandeId: '', details: 'Adresse retirée : 12 Rue des Érables.' },
    { date: '2026-06-01T12:00:00.000Z', action: 'observation', numero: 75, demandeId: '', details: 'libre' }, // pas une libération : hors journal du cas
    { date: '2026-06-20T12:00:00.000Z', action: 'note', numero: 75, demandeId: '', details: 'Note d\'emplacement : hors journal du cas' },
  ];
  const journal = journalDeCas(evenements, cleAdresse({ numeroAdresse: 12, rue: 'Rue des Érables' }), [75, 76]);
  assert.deepEqual(journal.map((e) => e.action), ['libération', 'note']);
  assert.equal(journal[0].numero, 74); // la libération raconte son emplacement
  assert.equal(journal[1].numero, null); // la note d'adresse ne parle d'aucun emplacement
});

test('une libération keyée par numéro seulement (sans colonne adresse) est racontée si l\'emplacement est encore à l\'adresse', () => {
  const evenements = [
    { date: '2026-06-01T12:00:00.000Z', action: 'libération', numero: 75, demandeId: '', details: 'Adresse retirée : 12 Rue des Érables.' },
  ];
  const journal = journalDeCas(evenements, '12 rue des érables', [75, 76]);
  assert.equal(journal.length, 1);
});

test('les notes d\'adresse s\'apparient malgré la casse ; événements illisibles ignorés (0002) ; Journal vide toléré', () => {
  const evenements = [
    { date: '2026-06-10T12:00:00.000Z', action: 'note', numero: '', adresse: 'RUE... pas une adresse', demandeId: '', details: 'autre adresse' },
    { date: '2026-06-11T12:00:00.000Z', action: 'note', numero: '', adresse: ' 12 RUE DES  ÉRABLES ', demandeId: '', details: 'Bonne adresse malgré la casse' },
    { date: 'pas une date', action: 'note', numero: '', adresse: '12 Rue des Érables', demandeId: '', details: 'date illisible : ignorée' },
    null,
  ];
  const journal = journalDeCas(evenements, '12 rue des érables', []);
  assert.equal(journal.length, 1);
  assert.equal(journal[0].details, 'Bonne adresse malgré la casse');
  assert.deepEqual(journalDeCas([], '12 rue des érables', []), []);
  assert.deepEqual(journalDeCas(null, '', []), []);
});

// --- La pastille quota de la fiche d'emplacement (0019) : silence dans les règles (0016) ---

test('le quota d\'une adresse ne signale rien quand elle respecte son quota (défaut ou exception accordée)', () => {
  assert.equal(depassementQuota(ligneEmplacement(), [ligneEmplacement({ numero: 74 }), ligneEmplacement({ numero: 75 })], [membre()]), null);
  assert.equal(depassementQuota(ligneEmplacement(), troisAttributions(), [membre({ quotaAccorde: 3 })]), null);
  assert.equal(depassementQuota(ligneEmplacement({ numeroAdresse: '', rue: '' }), troisAttributions(), []), null);
});

test('le quota d\'une adresse en dépassement donne le nombre d\'emplacements et le quota applicable', () => {
  const quota = depassementQuota(ligneEmplacement(), troisAttributions(), [membre()]);
  assert.deepEqual(quota, { nombre: 3, quota: 2 });
  const avecException = depassementQuota(
    ligneEmplacement(),
    troisAttributions().concat([ligneEmplacement({ numero: 77 })]),
    [membre({ quotaAccorde: 3 })],
  );
  assert.deepEqual(avecException, { nombre: 4, quota: 3 });
});
