// Module de présentation frontend : traduit les faits dérivés par grille.js
// (statut, position, adresse…) en prêt-à-afficher — apparence Web Awesome
// d'abord, puis prose, adresse formatée, mailto au fil des tranches.
// Frontend-only : pas de contrepartie
// apps-script (donc pas concerné par copie-grille), et c'est ici — jamais dans
// le domaine partagé grille.js — que vit le vocabulaire d'UI (Web Awesome).
//
// Classic script + guard dual-export node (précédent grille.js/client.js),
// require()-able par les tests. Chargé APRÈS grille.js (dont il lit les faits)
// et AVANT les fiches (qui le consomment).

// L'apparence Web Awesome d'un statut d'emplacement, par code — le seul foyer.
// Le libellé et l'explication d'un statut viennent de statutEmplacement
// (grille.js) ; seuls la couleur (variante) et l'icône vivent ici.
var APPARENCE_STATUTS = {
  conforme: { variante: 'success', icone: 'circle-check' },
  peutEtreALiberer: { variante: 'warning', icone: 'triangle-exclamation' },
  orphelin: { variante: 'danger', icone: 'triangle-exclamation' },
  disponible: { variante: 'brand', icone: 'circle-check' },
  pasObserve: { variante: 'neutral', icone: 'circle-question' },
};

function apparenceStatut(code) {
  // Repli neutre : une donnée manuelle inattendue (0002) ne casse jamais le
  // rendu — apparence neutre plutôt qu'un undefined.
  return APPARENCE_STATUTS[code] || { variante: 'neutral', icone: 'circle-question' };
}

// L'encodage COMPOSÉ d'une cellule de grille (décision 0022), par code de
// statut — le seul foyer de la SÉMANTIQUE de forme. La FORME porte l'occupation
// (`occupe` → plein · `libre` → bordé · `nonObserve` → puits creux : c'est ici
// qu'on décide quel glyphe la vue insère), le REPÈRE (« tag ») marque la SEULE
// non-attribution OBSERVÉE (Disponible, À identifier) — jamais « Non observé »,
// dont le message est « on ne sait pas encore ». La TEINTE, elle, vit dans
// theme.css keyée par le code (0004), pas ici. Tout est dérivé du code (0011) :
// occupation et attribution y sont déjà croisées, la cellule ne relit pas la
// ligne. Ce langage est celui de l'écran de tournée (0021).
var ENCODAGE_CELLULE = {
  conforme: { occupation: 'occupe' },
  peutEtreALiberer: { occupation: 'libre' },
  orphelin: { occupation: 'occupe', repere: true },
  disponible: { occupation: 'libre', repere: true },
  pasObserve: { occupation: 'nonObserve' },
};

function apparenceCellule(code) {
  // Repli neutre non observé : un code inattendu (0002) rend un puits calme,
  // jamais un undefined.
  var base = ENCODAGE_CELLULE[code] || { occupation: 'nonObserve' };
  return { occupation: base.occupation, repere: !!base.repere };
}

// Le type d'embarcation accepté par une structure → clé de silhouette (décision
// 0022) : canoë / kayak / planche ont la leur ; tout autre type (Config étendu,
// ex. « Pédalo ») retombe sur « autre ». FA free n'a aucun de ces icônes — les
// silhouettes elles-mêmes sont dessinées en SVG dans la couche vue.
var SILHOUETTES_EMBARCATION = {
  'Canoë': 'canoe',
  'Kayak': 'kayak',
  'Planche (SUP)': 'planche',
};

function silhouetteEmbarcation(type) {
  return SILHOUETTES_EMBARCATION[String(type || '').trim()] || 'autre';
}

// Les faits viennent de grille.js : globales dans le navigateur (chargé avant),
// require() en node (tests). Ce pont est le seul endroit qui connaît les deux.
var FAITS = (typeof require === 'function')
  ? require('./grille.js')
  : {
      statutEmplacement: statutEmplacement,
      serieLibreObservee: serieLibreObservee,
      fenetreApparition: fenetreApparition,
      dateLisible: dateLisible,
      analyserStructures: analyserStructures,
    };

// L'adresse « numeroAdresse rue » (décision 0012), toujours cette forme — que
// la source soit une ligne d'emplacement (numeroAdresse) ou une demande (numero).
function formatAdresse(numeroAdresse, rue) {
  return String(numeroAdresse).trim() + ' ' + String(rue).trim();
}

// La position (structure · niveau) de chaque numéro, dérivée des grilles (0009).
// Map numero → { structure, niveau } ; analyserStructures parcourt toutes les
// structures, donc à calculer UNE fois par rendu, pas par rangée. Un numéro « en
// double » (erreur de données) garde sa PREMIÈRE position — le marquage de
// l'erreur appartient aux pages, pas ici.
function cartePositions(structures) {
  var analyse = FAITS.analyserStructures(structures || [], []);
  var positions = new Map();
  analyse.structures.forEach(function (s) {
    s.emplacements.forEach(function (e) {
      var numero = Number(e.numero);
      if (!positions.has(numero)) positions.set(numero, { structure: e.structure, niveau: e.niveau });
    });
  });
  return positions;
}

// La position d'un seul numéro → { structure, niveau } | null.
function positionParNumero(numero, structures) {
  return cartePositions(structures).get(Number(numero)) || null;
}

// Le lien mailto préparé (jamais un envoi — décision 0003) : destinataire,
// sujet et corps, TOUS encodés. Un « ? » ou « & » dans une cellule éditée à la
// main (0002) ne casse jamais les paramètres. Le sujet et le corps, propres à
// chaque fiche, sont construits par l'appelant.
function lienMailto(options) {
  return 'mailto:' + encodeURIComponent(String(options.courriel || '').trim())
    + '?subject=' + encodeURIComponent(options.sujet)
    + '&body=' + encodeURIComponent(options.corps);
}

// Toutes les dates de signal : format long fr-CA (« 3 mai 2026 »), partout pareil.
var FORMAT_DATE_SIGNAL = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'long' });
function compteObservations_(nombre) {
  return nombre === 1 ? '1 observation' : nombre + ' observations';
}

// La phrase d'un signal temporel, dérivée des faits grille (série « libre »,
// fenêtre d'apparition), pour l'audience qui la demande :
//   'fiche' — la ligne de détail sous le libellé (préfixée, ponctuée d'un point)
//   'file'  — la rangée du registre À traiter (nue)
// → string, ou null quand le statut n'a pas de dimension temporelle (l'appelant
// retombe alors sur l'explication du statut). Les deux formulations vivent ici
// côte à côte : elles partagent la date, le compte et la fenêtre, et ne peuvent
// plus diverger sur ces parties.
function proseSignal(ligne, evenements, contexte) {
  var fin = contexte === 'fiche' ? '.' : '';
  var code = FAITS.statutEmplacement(ligne).code;

  if (code === 'peutEtreALiberer') {
    var serie = FAITS.serieLibreObservee(ligne, evenements);
    var depuis = serie.debut
      ? 'depuis le ' + FORMAT_DATE_SIGNAL.format(serie.debut)
      : 'depuis une date inconnue';
    var prefixeLibre = contexte === 'fiche' ? 'Attribué, mais observé libre ' : 'Libre ';
    return prefixeLibre + depuis + ' · ' + compteObservations_(serie.nombre) + fin;
  }

  if (code === 'orphelin') {
    var prefixe = contexte === 'fiche' ? 'Non attribué — embarcation ' : 'Embarcation ';
    var fenetre = FAITS.fenetreApparition(ligne, evenements);
    if (!fenetre) {
      var date = FAITS.dateLisible(ligne.dateObservation);
      if (date) return prefixe + 'observée le ' + FORMAT_DATE_SIGNAL.format(date) + fin;
      // Fiche : « … observée à une date inconnue. » ; file : « … observée, à une date inconnue »
      var sansDate = contexte === 'fiche' ? ' à une date inconnue' : ', à une date inconnue';
      return prefixe + 'observée' + sansDate + fin;
    }
    var coeur = fenetre.libreAvant
      ? 'apparue entre le ' + FORMAT_DATE_SIGNAL.format(fenetre.libreAvant)
        + ' et le ' + FORMAT_DATE_SIGNAL.format(fenetre.debut)
      : 'observée depuis le ' + FORMAT_DATE_SIGNAL.format(fenetre.debut);
    if (fenetre.nombre > 1) coeur += ' · vue ' + fenetre.nombre + ' fois';
    return prefixe + coeur + fin;
  }

  return null;
}

if (typeof module !== 'undefined') {
  module.exports = {
    apparenceStatut: apparenceStatut,
    apparenceCellule: apparenceCellule,
    silhouetteEmbarcation: silhouetteEmbarcation,
    proseSignal: proseSignal,
    formatAdresse: formatAdresse,
    cartePositions: cartePositions,
    positionParNumero: positionParNumero,
    lienMailto: lienMailto,
  };
}
