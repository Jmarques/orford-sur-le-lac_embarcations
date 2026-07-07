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

if (typeof module !== 'undefined') {
  module.exports = { apparenceStatut: apparenceStatut };
}
