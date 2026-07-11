import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  decouperModele, serialiserModele, rendreModele, gabaritParId,
  MODELES_COURRIEL, valeursRelanceHorsQuota,
  valeursReponseAcceptation, valeursReponseRefus, courrielReponseDemande,
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

test('chaque gabarit du registre serveur a son entrée au registre UI, et ses jetons y sont tous déclarés', () => {
  // Filet : un jeton ajouté à un défaut sans entrée au registre UI resterait
  // visible « {…} » dans le courriel (pas de valeur) et sans bouton de palette
  // — les deux registres doivent bouger ensemble (ticket 07).
  for (const gabarit of GABARITS_DEFAUT) {
    const modele = MODELES_COURRIEL[gabarit.id];
    assert.ok(modele, `${gabarit.id} absent de MODELES_COURRIEL`);
    assert.ok(String(modele.libelle || '').trim(), `${gabarit.id} sans libellé français`);
    const cles = modele.jetons.map((j) => j.cle);
    for (const segment of [...decouperModele(gabarit.sujet), ...decouperModele(gabarit.corps)]) {
      if (segment.jeton !== undefined) {
        assert.ok(cles.includes(segment.jeton.trim()), `${gabarit.id} : jeton non déclaré {${segment.jeton}}`);
      }
    }
    for (const jeton of modele.jetons) {
      assert.ok(String(jeton.libelle || '').trim(), `${gabarit.id} : jeton {${jeton.cle}} sans libellé`);
      assert.equal(typeof jeton.requis, 'boolean', `${gabarit.id} : jeton {${jeton.cle}} sans requis`);
      // L'aperçu vivant de la page « Modèles de courriels » rend l'exemple :
      // un jeton sans valeur d'exemple s'y montrerait en {…} inconnu.
      assert.ok(
        Object.prototype.hasOwnProperty.call(modele.exemple.valeurs, jeton.cle),
        `${gabarit.id} : jeton {${jeton.cle}} sans valeur d'exemple`,
      );
      assert.ok(
        String(modele.exemple.valeurs[jeton.cle]).trim(),
        `${gabarit.id} : valeur d'exemple vide pour {${jeton.cle}} — l'aperçu doit montrer le résultat`,
      );
    }
    assert.ok(String(modele.exemple.nom || '').trim(), `${gabarit.id} : exemple sans nom (« ce que recevra … »)`);
  }
});

// --- Jetons calculés de la relance hors quota (ticket 10) ---------------------
// Toute phrase conditionnelle devient un jeton calculé par l'app — jamais une
// syntaxe conditionnelle exposée au comité. Les valeurs viennent du cas hors
// quota du dossier (casAdresse).

function casHorsQuota(surcharges = {}) {
  return {
    adresse: '87 Chemin du Lac',
    nombre: 4,
    quota: 3,
    depassement: 1,
    emplacements: [{ numero: 90 }, { numero: 91 }, { numero: 92 }, { numero: 93 }],
    membre: { nom: 'John Tremblay', courriel: 'john.tremblay@exemple.ca' },
    ...surcharges,
  };
}

test('la règle du quota se calcule : quota par défaut → la règle de la communauté', () => {
  const valeurs = valeursRelanceHorsQuota(casHorsQuota({ quota: 2 }));
  assert.equal(valeurs['règle du quota'], 'La règle de la communauté est de 2 emplacements par adresse.');
});

test('la règle du quota se calcule : exception accordée → la phrase la nomme', () => {
  const valeurs = valeursRelanceHorsQuota(casHorsQuota({ quota: 3 }));
  assert.equal(valeurs['règle du quota'], 'Votre adresse a une exception accordée à 3 emplacements.');
});

test('le nombre d\'emplacements porte son pluriel calculé', () => {
  assert.equal(valeursRelanceHorsQuota(casHorsQuota())['nombre d\'emplacements'], '4 emplacements');
  assert.equal(
    valeursRelanceHorsQuota(casHorsQuota({ nombre: 1, emplacements: [{ numero: 90 }] }))['nombre d\'emplacements'],
    '1 emplacement',
  );
});

test('les numéros sont la liste jointe des emplacements du dossier', () => {
  assert.equal(valeursRelanceHorsQuota(casHorsQuota())['numéros'], '90, 91, 92, 93');
});

test('un dossier sans ligne Membres ne fait pas planter les valeurs (nom vide)', () => {
  const valeurs = valeursRelanceHorsQuota(casHorsQuota({ membre: undefined }));
  assert.equal(valeurs.nom, '');
});

// --- Réponses à une demande (ticket 13, décision 0025) -------------------------
// Les valeurs sont FIGÉES de la demande (on répond à qui a écrit, jamais à la
// ligne Membres) ; la ponctuation finale de la raison est calculée DANS la
// valeur — jamais une syntaxe dans le modèle.

function demandeDecidee(surcharges = {}) {
  return {
    id: 'demo-4', nom: 'Robert Fortin', courriel: 'robert.fortin@exemple.ca',
    type: 'Kayak', numero: 501, rue: 'Rue du Pré',
    ...surcharges,
  };
}

test('la raison sans ponctuation finale reçoit son point — dans la valeur', () => {
  const valeurs = valeursReponseRefus(demandeDecidee(), '501 Rue du Pré',
    'aucune place compatible libre cette saison');
  assert.equal(valeurs.raison, 'aucune place compatible libre cette saison.');
});

test('la raison déjà ponctuée reste telle quelle (point, exclamation, interrogation)', () => {
  for (const raison of ['quota atteint.', 'quota atteint !', 'vraiment ?']) {
    assert.equal(valeursReponseRefus(demandeDecidee(), '501 Rue du Pré', raison).raison, raison);
  }
});

test('les valeurs du refus sont figées de la demande : nom, type, adresse', () => {
  const valeurs = valeursReponseRefus(demandeDecidee(), '501 Rue du Pré', 'quota atteint');
  assert.equal(valeurs.nom, 'Robert Fortin');
  assert.equal(valeurs['type d\'embarcation'], 'Kayak');
  assert.equal(valeurs.adresse, '501 Rue du Pré');
});

test('les valeurs de l\'acceptation portent le numéro attribué et les valeurs figées', () => {
  const valeurs = valeursReponseAcceptation(demandeDecidee({ nom: 'Louise Bédard', type: 'Canoë' }),
    '12 Rue des Érables', 75);
  assert.equal(valeurs['numéro'], '75');
  assert.equal(valeurs.nom, 'Louise Bédard');
  assert.equal(valeurs['type d\'embarcation'], 'Canoë');
  assert.equal(valeurs.adresse, '12 Rue des Érables');
});

test('le défaut de reponseRefus rendu = l\'ancien texte de fiche-demande verbatim (régression 0024)', () => {
  const courriel = courrielReponseDemande(gabaritsEffectifs([]), demandeDecidee(), '501 Rue du Pré',
    { code: 'refusee', raison: 'aucune place compatible libre cette saison' });
  assert.equal(courriel.modele, 'reponseRefus');
  assert.equal(courriel.courriel, 'robert.fortin@exemple.ca');
  assert.equal(courriel.sujet, 'Votre demande d\'emplacement — Orford sur le Lac');
  assert.equal(courriel.corps, [
    'Bonjour Robert Fortin,',
    '',
    'Nous avons bien reçu votre demande d\'emplacement pour un(e) Kayak à l\'adresse 501 Rue du Pré.',
    '',
    'Nous ne pouvons malheureusement pas y donner suite pour l\'instant : '
      + 'aucune place compatible libre cette saison.',
    '',
    'N\'hésitez pas à nous écrire si vous avez des questions.',
    '',
    'Le comité administratif — Orford sur le Lac',
  ].join('\n'));
});

test('le défaut de reponseAcceptation rendu = le texte rédigé au grilling (0025)', () => {
  const courriel = courrielReponseDemande(gabaritsEffectifs([]),
    demandeDecidee({ nom: 'Louise Bédard', courriel: 'louise.bedard@exemple.ca', type: 'Canoë' }),
    '12 Rue des Érables', { code: 'acceptee', numero: 75 });
  assert.equal(courriel.modele, 'reponseAcceptation');
  assert.equal(courriel.courriel, 'louise.bedard@exemple.ca');
  assert.equal(courriel.sujet, 'Votre emplacement 75 — Orford sur le Lac');
  assert.equal(courriel.corps, [
    'Bonjour Louise Bédard,',
    '',
    'Bonne nouvelle : votre demande d\'emplacement est acceptée. L\'emplacement 75 '
      + 'est attribué à votre adresse (12 Rue des Érables) pour votre Canoë.',
    '',
    'Vous pouvez l\'utiliser dès maintenant. Si quelque chose ne convient pas, dites-le-nous.',
    '',
    'Merci,',
    'Le comité administratif — Orford sur le Lac',
  ].join('\n'));
});

test('sans gabarit dans l\'inventaire (backend pas à jour), la réponse est null — jamais un courriel troué', () => {
  assert.equal(courrielReponseDemande([], demandeDecidee(), '501 Rue du Pré',
    { code: 'refusee', raison: 'x' }), null);
  assert.equal(courrielReponseDemande(undefined, demandeDecidee(), '501 Rue du Pré',
    { code: 'acceptee', numero: 75 }), null);
});

test('le défaut de relanceHorsQuota rendu avec un cas complet = le texte en dur d\'avant', () => {
  const gabarit = gabaritsEffectifs([]).find((g) => g.id === 'relanceHorsQuota');
  const valeurs = valeursRelanceHorsQuota(casHorsQuota());
  assert.equal(rendreModele(gabarit.sujet, valeurs), 'Vos emplacements d\'embarcation — Orford sur le Lac');
  assert.equal(rendreModele(gabarit.corps, valeurs), [
    'Bonjour John Tremblay,',
    '',
    'Votre adresse (87 Chemin du Lac) a actuellement 4 emplacements d\'embarcation : '
      + '90, 91, 92, 93. Votre adresse a une exception accordée à 3 emplacements.',
    '',
    'Utilisez-vous encore chacun d\'eux ? Si vous pouvez en libérer un, '
      + 'dites-le-nous : d\'autres membres de la communauté attendent une place.',
    '',
    'Merci,',
    'Le comité administratif — Orford sur le Lac',
  ].join('\n'));
});
