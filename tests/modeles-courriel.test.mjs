import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  decouperModele, serialiserModele, rendreModele, gabaritParId,
} = require('../site/modeles-courriel.js');
const { GABARITS_DEFAUT, gabaritsEffectifs } = require('../apps-script/gabarits.js');

// --- Parse texte à jetons ↔ segments -----------------------------------------

test('un texte à jetons se découpe en segments texte / jeton', () => {
  assert.deepEqual(decouperModele('Bonjour {nom}, emplacement {numéro}.'), [
    { texte: 'Bonjour ' },
    { jeton: 'nom' },
    { texte: ', emplacement ' },
    { jeton: 'numéro' },
    { texte: '.' },
  ]);
});

test('l\'aller-retour parse/sérialise restitue le texte exact, accolades orphelines comprises', () => {
  for (const texte of [
    'Bonjour {nom},',
    'accolade { orpheline sans fermeture',
    'fermeture } seule',
    '{a{b} imbrication partielle',
    '',
    '{depuis quand} en tête',
  ]) {
    assert.equal(serialiserModele(decouperModele(texte)), texte, JSON.stringify(texte));
  }
});

test('une accolade orpheline reste du texte, jamais un jeton', () => {
  assert.deepEqual(decouperModele('libre { depuis'), [{ texte: 'libre { depuis' }]);
});

// --- Rendu avec valeurs -------------------------------------------------------

test('les jetons connus sont remplacés par leurs valeurs', () => {
  assert.equal(
    rendreModele('Bonjour {nom}, votre emplacement {numéro}.', { nom: 'Marie Gagnon', 'numéro': 75 }),
    'Bonjour Marie Gagnon, votre emplacement 75.',
  );
});

test('un jeton optionnel vide disparaît et la ponctuation se referme proprement', () => {
  const valeurs = { 'depuis quand': '' };
  assert.equal(rendreModele('est libre {depuis quand}.', valeurs), 'est libre.');
  assert.equal(rendreModele('est libre {depuis quand}, selon la tournée.', valeurs), 'est libre, selon la tournée.');
});

test('le même jeton optionnel rempli garde son espace normal', () => {
  assert.equal(
    rendreModele('est libre {depuis quand}.', { 'depuis quand': 'depuis le 1 mai 2026' }),
    'est libre depuis le 1 mai 2026.',
  );
});

test('un jeton inconnu est conservé tel quel — la Sheet éditée à la main ne casse jamais le courriel (0002)', () => {
  assert.equal(
    rendreModele('Bonjour {non}, emplacement {numéro}.', { nom: 'Marie', 'numéro': 75 }),
    'Bonjour {non}, emplacement 75.',
  );
});

test('un jeton aux espaces internes (édition manuelle) retrouve quand même sa valeur', () => {
  assert.equal(rendreModele('Bonjour { nom },', { nom: 'Marie' }), 'Bonjour Marie,');
});

test('gabaritParId retrouve un gabarit, ou null sans jamais lancer', () => {
  const gabarits = [{ id: 'relanceEmplacement', sujet: 's', corps: 'c' }];
  assert.equal(gabaritParId(gabarits, 'relanceEmplacement'), gabarits[0]);
  assert.equal(gabaritParId(gabarits, 'inconnu'), null);
  assert.equal(gabaritParId(undefined, 'relanceEmplacement'), null);
});

// --- Le rendu du défaut EST le texte actuel (aucun delta attendu) -------------
// Pin du ticket 09 : composer depuis le modèle par défaut produit exactement le
// courriel que fiche.js écrivait en dur — mêmes octets, capture inchangée.

test('le défaut de relanceEmplacement rendu avec un dossier complet = le texte en dur d\'avant', () => {
  const [gabarit] = gabaritsEffectifs([]);
  const valeurs = {
    nom: 'Louise Bédard',
    'numéro': 75,
    adresse: '12 Rue des Érables',
    'depuis quand': 'depuis le 1 mai 2026',
  };
  assert.equal(rendreModele(gabarit.sujet, valeurs), 'Votre emplacement 75 — Orford sur le Lac');
  assert.equal(rendreModele(gabarit.corps, valeurs), [
    'Bonjour Louise Bédard,',
    '',
    'En passant près des structures, le comité a remarqué que l\'emplacement 75'
      + ' (attribué au 12 Rue des Érables) est libre depuis le 1 mai 2026.',
    '',
    'Utilisez-vous encore cet emplacement cette saison ? Si vous n\'en avez plus besoin, '
      + 'dites-le-nous : un autre membre de la communauté pourra en profiter.',
    '',
    'Merci,',
    'Le comité administratif — Orford sur le Lac',
  ].join('\n'));
});

test('sans début de série, « depuis quand » disparaît sans trou ni point orphelin', () => {
  const [gabarit] = gabaritsEffectifs([]);
  const corps = rendreModele(gabarit.corps, {
    nom: 'Louise Bédard', 'numéro': 75, adresse: '12 Rue des Érables', 'depuis quand': '',
  });
  assert.match(corps, /est libre\.\n/);
  assert.ok(!corps.includes(' .'), 'espace orphelin avant le point');
});

test('GABARITS_DEFAUT ne contient aucun jeton inconnu des valeurs de la relance', () => {
  // Filet : un jeton ajouté au défaut sans valeur au point d'usage resterait
  // visible « {…} » dans le courriel — le registre et fiche.js doivent bouger
  // ensemble.
  const relance = GABARITS_DEFAUT.find((g) => g.id === 'relanceEmplacement');
  const connus = ['nom', 'numéro', 'adresse', 'depuis quand'];
  for (const segment of [...decouperModele(relance.sujet), ...decouperModele(relance.corps)]) {
    if (segment.jeton !== undefined) {
      assert.ok(connus.includes(segment.jeton.trim()), `jeton sans valeur : {${segment.jeton}}`);
    }
  }
});
