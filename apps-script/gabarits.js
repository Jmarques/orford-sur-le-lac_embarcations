// Registre serveur des gabarits de courriels (PRD gabarits-courriels, carte
// tickets 05/07) : la vérité des TEXTES. Chaque courriel que l'app prépare
// déclare ici son id et ses textes d'origine — texte brut à jetons `{…}` en
// français, la forme stockée dans l'onglet Gabarits (lisible à la main, 0002).
// setup() (sheets.js) sème l'onglet avec ces défauts ; l'inventaire renvoie par
// gabarit le texte EFFECTIF (ligne de la Sheet, ou défaut en repli) et le
// défaut — le client ne connaît jamais les textes, seulement leur rendu.
//
// La vérité de l'UI (libellé français du modèle, jetons avec libellés de puce,
// valeurs réelles au point d'usage) vit côté client — jamais ici.
// Logique pure, partagée entre Apps Script et les tests node.

var GABARITS_DEFAUT = [
  {
    // « Écrire au membre » d'une fiche d'emplacement Attribué-libre (0024).
    // `{depuis quand}` est optionnel : vide quand la série d'observation n'a
    // pas de début — il disparaît au rendu, ponctuation refermée (piste C).
    id: 'relanceEmplacement',
    sujet: 'Votre emplacement {numéro} — Orford sur le Lac',
    corps: [
      'Bonjour {nom},',
      '',
      'En passant près des structures, le comité a remarqué que l\'emplacement {numéro} '
        + '(attribué au {adresse}) est libre {depuis quand}.',
      '',
      'Utilisez-vous encore cet emplacement cette saison ? Si vous n\'en avez plus besoin, '
        + 'dites-le-nous : un autre membre de la communauté pourra en profiter.',
      '',
      'Merci,',
      'Le comité administratif — Orford sur le Lac',
    ].join('\n'),
  },
  {
    // « Demander de libérer une place » d'une fiche d'adresse hors quota
    // (0019/0024). Les phrases conditionnelles sont des jetons CALCULÉS par
    // l'app (ticket 10) : `{règle du quota}` (quota de 2 vs exception
    // accordée), `{nombre d'emplacements}` (pluriel), `{numéros}` (liste) —
    // jamais une syntaxe conditionnelle exposée au comité.
    id: 'relanceHorsQuota',
    sujet: 'Vos emplacements d\'embarcation — Orford sur le Lac',
    corps: [
      'Bonjour {nom},',
      '',
      'Votre adresse ({adresse}) a actuellement {nombre d\'emplacements} d\'embarcation : '
        + '{numéros}. {règle du quota}',
      '',
      'Utilisez-vous encore chacun d\'eux ? Si vous pouvez en libérer un, '
        + 'dites-le-nous : d\'autres membres de la communauté attendent une place.',
      '',
      'Merci,',
      'Le comité administratif — Orford sur le Lac',
    ].join('\n'),
  },
];

// Le texte d'une cellule, ou '' si elle est inutilisable — vidée, ou un nombre
// ou une date laissés par une édition manuelle (0002) valent « illisible ».
function texteOuVide_(valeur) {
  return typeof valeur === 'string' && valeur.trim() !== '' ? valeur : '';
}

// Les gabarits effectifs depuis les lignes de l'onglet Gabarits : un par entrée
// du registre (une ligne au id inconnu est ignorée — jamais de gabarit
// fantôme), texte effectif champ par champ (sujet ajusté + corps vidé → corps
// d'origine), repli TOUJOURS silencieux — le pire cas d'une Sheet abîmée est le
// texte d'origine, jamais un courriel cassé (ticket 05).
function gabaritsEffectifs(lignes) {
  var parId = {};
  (lignes || []).forEach(function (ligne) {
    if (ligne && ligne.id !== undefined) parId[String(ligne.id).trim()] = ligne;
  });
  return GABARITS_DEFAUT.map(function (defaut) {
    var ligne = parId[defaut.id] || {};
    return {
      id: defaut.id,
      sujet: texteOuVide_(ligne.sujet) || defaut.sujet,
      corps: texteOuVide_(ligne.corps) || defaut.corps,
      defaut: { sujet: defaut.sujet, corps: defaut.corps },
    };
  });
}

if (typeof module !== 'undefined') {
  module.exports = { GABARITS_DEFAUT: GABARITS_DEFAUT, gabaritsEffectifs: gabaritsEffectifs };
}
