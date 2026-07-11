// Logique pure des Modèles de courriel (PRD gabarits-courriels, piste C du
// ticket 03) : le texte à jetons `{…}` stocké dans l'onglet Gabarits se
// découpe en segments, se rend avec les valeurs d'un dossier, et se resérialise
// à l'identique. Porte aussi le registre UI des modèles (libellés, jetons) et
// les valeurs calculées des jetons hors quota. Aucun DOM ici — la marche
// DOM ↔ puces de l'éditeur reste dans la page.
//
// Classic script + guard dual-export node (précédent presentation.js),
// require()-able par les tests. Chargé AVANT fiche.js / fiche-adresse.js.

// Un jeton est `{clé}` sans accolade interne : une accolade orpheline ou une
// imbrication partielle reste du texte tel quel — une Sheet éditée à la main
// (0002) ne casse jamais le découpage.
var JETON_MODELE = /(\{[^{}]*\})/;

// Texte à jetons → segments [{ texte } | { jeton }]. La clé du jeton est
// gardée VERBATIM (espaces compris) : l'aller-retour parse/sérialise restitue
// le texte exact ; la tolérance aux espaces vit dans le rendu.
function decouperModele(texte) {
  return String(texte).split(JETON_MODELE)
    .filter(function (morceau) { return morceau !== ''; })
    .map(function (morceau) {
      var jeton = /^\{([^{}]*)\}$/.exec(morceau);
      return jeton ? { jeton: jeton[1] } : { texte: morceau };
    });
}

// Segments → texte à jetons (l'inverse exact de decouperModele).
function serialiserModele(segments) {
  return segments.map(function (segment) {
    return segment.jeton !== undefined ? '{' + segment.jeton + '}' : segment.texte;
  }).join('');
}

// Un espace laissé devant une ponctuation par un jeton optionnel vide
// (« est libre {depuis quand}. » → « est libre . ») se referme (piste C).
function normaliserPonctuation_(texte) {
  return texte.replace(/ +([.,])/g, '$1');
}

// Rend un texte à jetons avec les valeurs du dossier (clé → valeur, l'appelant
// les fournit au point d'usage — ticket 07). Clé connue → sa valeur ; connue
// mais vide (jeton optionnel sans donnée) → rien, ponctuation refermée ; clé
// inconnue → le jeton reste tel quel, visible dans l'aperçu, jamais un trou.
function rendreModele(texte, valeurs) {
  var rendu = decouperModele(texte).map(function (segment) {
    if (segment.jeton === undefined) return segment.texte;
    var cle = segment.jeton.trim();
    return Object.prototype.hasOwnProperty.call(valeurs, cle)
      ? String(valeurs[cle] === undefined || valeurs[cle] === null ? '' : valeurs[cle])
      : '{' + segment.jeton + '}';
  }).join('');
  return normaliserPonctuation_(rendu);
}

// Le gabarit d'un id dans la liste reçue de l'inventaire, ou null — tolérant à
// une réponse d'un backend pas encore à jour (liste absente).
function gabaritParId(gabarits, id) {
  return (gabarits || []).find(function (gabarit) { return gabarit && gabarit.id === id; }) || null;
}

// --- Registre UI des Modèles de courriel (ticket 07) --------------------------
// La vérité de l'UI, par modèle : le libellé français (liste de la page
// « Modèles de courriels ») et les informations — clé de jeton → libellé de
// puce/palette, requise ou non. `requis` marque les informations sans
// lesquelles le courriel est troué (avertissement de l'éditeur) ; une
// information calculée ou optionnelle se retire librement du texte. Les
// libellés viennent du prototype validé (piste C) et du PRD. La vérité des
// TEXTES (défauts, effectifs) reste au serveur — jamais ici.
var MODELES_COURRIEL = {
  relanceEmplacement: {
    libelle: 'Relance — emplacement libre',
    jetons: [
      { cle: 'nom', libelle: 'Nom du membre', requis: true },
      { cle: 'numéro', libelle: 'Numéro d\'emplacement', requis: true },
      { cle: 'adresse', libelle: 'Adresse du membre', requis: true },
      { cle: 'depuis quand', libelle: 'Depuis quand (si connue)', requis: false },
    ],
  },
  relanceHorsQuota: {
    libelle: 'Relance — hors quota',
    jetons: [
      { cle: 'nom', libelle: 'Nom du membre', requis: true },
      { cle: 'adresse', libelle: 'Adresse du membre', requis: true },
      // Jetons CALCULÉS par l'app (ticket 10) : toujours remplis, retirables
      // librement — jamais une syntaxe conditionnelle exposée au comité.
      { cle: 'nombre d\'emplacements', libelle: 'Nombre d\'emplacements', requis: false },
      { cle: 'numéros', libelle: 'Numéros des emplacements', requis: false },
      { cle: 'règle du quota', libelle: 'Règle du quota', requis: false },
    ],
  },
};

// Les valeurs des informations de `relanceHorsQuota`, depuis le cas hors quota
// du dossier (casAdresse — grille.js) : c'est ici que les conditionnelles du
// texte d'origine deviennent des phrases calculées. Pur (pas de DOM) pour être
// testé au seam exports ; la fiche d'adresse ne fait que l'appeler.
function valeursRelanceHorsQuota(cas) {
  return {
    nom: String((cas.membre && cas.membre.nom) || '').trim(),
    adresse: cas.adresse,
    'nombre d\'emplacements': cas.nombre + ' emplacement' + (cas.nombre > 1 ? 's' : ''),
    'numéros': cas.emplacements.map(function (ligne) { return ligne.numero; }).join(', '),
    'règle du quota': cas.quota === 2
      ? 'La règle de la communauté est de 2 emplacements par adresse.'
      : 'Votre adresse a une exception accordée à ' + cas.quota + ' emplacements.',
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    decouperModele: decouperModele,
    serialiserModele: serialiserModele,
    rendreModele: rendreModele,
    gabaritParId: gabaritParId,
    MODELES_COURRIEL: MODELES_COURRIEL,
    valeursRelanceHorsQuota: valeursRelanceHorsQuota,
  };
}
