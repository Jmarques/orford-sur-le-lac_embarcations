import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { toutesLesAdresses_, chercherAdresses } = require('../apps-script/grille.js');

// Une ligne de l'onglet Emplacements, telle que renvoyée par l'API.
function ligneEmplacement(surcharges = {}) {
  return {
    numero: 75,
    numeroAdresse: 12,
    rue: 'Rue des Érables',
    occupationObservee: 'libre',
    dateObservation: '2026-06-20T12:00:00.000Z',
    ...surcharges,
  };
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

// --- L'index de recherche : union Emplacements ∪ Membres (0023) ---

test('l\'union porte une entrée par adresse : celles avec attributions ET les Membres-seules', () => {
  const emplacements = [
    ligneEmplacement({ numero: 74 }),
    ligneEmplacement({ numero: 75 }),
  ];
  const membres = [
    membre(), // 12 Rue des Érables — a des attributions
    membre({ numeroAdresse: 34, rue: 'Chemin du Lac', nom: 'Jean Tremblay' }), // Membres-seule
  ];
  const index = toutesLesAdresses_(emplacements, membres);
  assert.equal(index.length, 2);

  const erables = index.find((e) => e.cle === '12 rue des érables');
  assert.equal(erables.adresse, '12 Rue des Érables');
  assert.equal(erables.membre.nom, 'Louise Bédard');
  assert.deepEqual(erables.emplacements.map((l) => l.numero), [74, 75]);

  const lac = index.find((e) => e.cle === '34 chemin du lac');
  assert.equal(lac.adresse, '34 Chemin du Lac');
  assert.equal(lac.membre.nom, 'Jean Tremblay');
  assert.deepEqual(lac.emplacements, []); // 0 emplacement : Membres-seule
});

test('une adresse présente dans Emplacements ET Membres n\'apparaît qu\'une fois (dédup par clé)', () => {
  const emplacements = [
    ligneEmplacement({ numero: 74, rue: 'RUE DES ÉRABLES' }), // casse différente
    ligneEmplacement({ numero: 75, rue: 'rue des  érables' }),
  ];
  const index = toutesLesAdresses_(emplacements, [membre()]);
  assert.equal(index.length, 1);
  assert.equal(index[0].membre.nom, 'Louise Bédard');
  assert.equal(index[0].emplacements.length, 2);
});

test('une adresse attribuée sans ligne Membres figure dans l\'union (membre absent)', () => {
  const index = toutesLesAdresses_([ligneEmplacement({ numero: 74 })], []);
  assert.equal(index.length, 1);
  assert.equal(index[0].membre, undefined);
  assert.equal(index[0].emplacements.length, 1);
});

test('l\'union tolère des entrées vides/illisibles sans planter (0002)', () => {
  assert.deepEqual(toutesLesAdresses_([], []), []);
  assert.deepEqual(toutesLesAdresses_(null, null), []);
  const index = toutesLesAdresses_(
    [null, { numero: 77, numeroAdresse: '', rue: '' }],
    [null, { numeroAdresse: '', rue: 'Rue sans numéro', nom: 'X' }],
  );
  assert.deepEqual(index, []); // rien d'appariable
});

// --- Le matching tri-clé : nom · adresse · numéro d'emplacement (0023) ---

function indexTest() {
  return toutesLesAdresses_(
    [
      ligneEmplacement({ numero: 74, numeroAdresse: 12, rue: 'Rue des Érables' }),
      ligneEmplacement({ numero: 75, numeroAdresse: 12, rue: 'Rue des Érables' }),
      ligneEmplacement({ numero: 234, numeroAdresse: 5, rue: 'Chemin du Lac' }),
      ligneEmplacement({ numero: 235, numeroAdresse: 5, rue: 'Chemin du Lac' }),
    ],
    [
      membre({ numeroAdresse: 12, rue: 'Rue des Érables', nom: 'Louise Bédard' }),
      membre({ numeroAdresse: 5, rue: 'Chemin du Lac', nom: 'André Prévost' }),
      membre({ numeroAdresse: 234, rue: 'Rue du Pré', nom: 'Jean Tremblay' }),
    ],
  );
}

test('une requête vide ne trouve rien', () => {
  assert.deepEqual(chercherAdresses('', indexTest()), []);
  assert.deepEqual(chercherAdresses('   ', indexTest()), []);
});

test('match par nom de membre', () => {
  const res = chercherAdresses('bédard', indexTest());
  assert.equal(res.length, 1);
  assert.equal(res[0].cle, '12 rue des érables');
  assert.equal(res[0].raison.cle, 'nom');
});

test('match par adresse (numéro + rue)', () => {
  const res = chercherAdresses('érables', indexTest());
  assert.equal(res.length, 1);
  assert.equal(res[0].adresse, '12 Rue des Érables');
  assert.equal(res[0].raison.cle, 'adresse');
});

test('les accents sont repliés : « erables » retrouve « Érables » (confort de l\'aîné)', () => {
  const res = chercherAdresses('erables', indexTest());
  assert.equal(res.length, 1);
  assert.equal(res[0].raison.cle, 'adresse');
});

test('match par numéro d\'emplacement en préfixe, avec la raison (quel numéro) exposée', () => {
  const res = chercherAdresses('7', indexTest());
  assert.equal(res.length, 1);
  assert.equal(res[0].cle, '12 rue des érables');
  assert.equal(res[0].raison.cle, 'numero');
  assert.equal(res[0].raison.numero, 74); // le plus petit numéro qui correspond au préfixe
});

test('un préfixe ne matche que le début du numéro, jamais le milieu', () => {
  // « 5 » ne doit pas matcher l'emplacement 235 par son « 5 » final.
  const res = chercherAdresses('5', indexTest());
  const parNumero = res.filter((r) => r.raison.cle === 'numero');
  assert.deepEqual(parNumero.map((r) => r.raison.numero), []); // aucun emplacement ne commence par 5
});

test('classement : les correspondances de nom passent avant celles d\'adresse', () => {
  // « pre » matche le nom « André Prévost » (nom) et l'adresse « 234 Rue du Pré » (adresse).
  const res = chercherAdresses('pre', indexTest());
  assert.equal(res.length, 2);
  assert.equal(res[0].raison.cle, 'nom'); // nom d'abord
  assert.equal(res[0].membre.nom, 'André Prévost');
  assert.equal(res[1].raison.cle, 'adresse');
  assert.equal(res[1].adresse, '234 Rue du Pré');
});

test('ambiguïté civique vs numéro d\'emplacement : les deux sont montrés, chacun dit pourquoi', () => {
  const res = chercherAdresses('234', indexTest());
  assert.equal(res.length, 2);

  const civique = res.find((r) => r.cle === '234 rue du pré');
  assert.equal(civique.raison.cle, 'adresse'); // « 234 » est son numéro civique

  const emplacement = res.find((r) => r.cle === '5 chemin du lac');
  assert.equal(emplacement.raison.cle, 'numero'); // « 234 » est un de ses emplacements
  assert.equal(emplacement.raison.numero, 234);

  // classement : l'adresse (civique) avant le numéro d'emplacement.
  assert.equal(res[0].raison.cle, 'adresse');
  assert.equal(res[1].raison.cle, 'numero');
});

test('chaque résultat porte l\'entrée complète de l\'union (adresse, membre, emplacements)', () => {
  const res = chercherAdresses('bédard', indexTest());
  assert.equal(res[0].adresse, '12 Rue des Érables');
  assert.equal(res[0].membre.nom, 'Louise Bédard');
  assert.deepEqual(res[0].emplacements.map((l) => l.numero), [74, 75]);
});
