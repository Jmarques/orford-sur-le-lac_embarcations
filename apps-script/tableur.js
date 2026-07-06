// Conversion générique lignes de Sheet ↔ objets (en-têtes en première ligne).
// Logique pure, partagée entre Apps Script et les tests node.

// Convertit la sortie de getDataRange().getValues() (ligne d'en-têtes incluse)
// en objets. Les dates deviennent des chaînes ISO (sérialisables en JSON) ;
// les lignes vides (restes d'édition manuelle — décision 0002) sont ignorées.
function objetsDepuisLignes(lignes) {
  var entetes = lignes[0];
  var nonVides = lignes.slice(1).filter(function (ligne) {
    return ligne.some(function (valeur) { return String(valeur).trim() !== ''; });
  });
  return nonVides.map(function (ligne) {
    var objet = {};
    entetes.forEach(function (entete, i) {
      var valeur = ligne[i];
      // Duck-typing plutôt que `instanceof Date` : les Date issues de
      // getValues() dans Apps Script peuvent venir d'un autre contexte JS.
      var estDate = valeur && typeof valeur.toISOString === 'function';
      objet[entete] = estDate ? valeur.toISOString() : valeur;
    });
    return objet;
  });
}

// L'inverse : des objets vers des lignes prêtes pour setValues(), dans
// l'ordre des en-têtes. Un champ absent devient une cellule vide.
function lignesDepuisObjets(entetes, objets) {
  return objets.map(function (objet) {
    return entetes.map(function (entete) {
      return objet[entete] === undefined ? '' : objet[entete];
    });
  });
}

// La ligne d'en-tête à écrire pour garantir que chaque en-tête requis existe,
// sans jamais réordonner ni retirer ce que le comité a mis (décision 0012) :
// les en-têtes actuels gardent leur ordre, les requis absents sont ajoutés en
// fin. Les constantes ENTETES_ = ensemble requis + ordre par défaut à la
// création, pas une contrainte de position permanente.
function entetesGaranties(entetesActuels, entetesRequis) {
  var resultat = entetesActuels.filter(function (entete) {
    return String(entete).trim() !== '';
  });
  entetesRequis.forEach(function (requis) {
    if (resultat.indexOf(requis) === -1) resultat.push(requis);
  });
  return resultat;
}

// Fusionne un objet dans une ligne existante par NOM de colonne (décision
// 0012) : seules les colonnes présentes dans l'objet sont réécrites, le reste
// de la ligne (colonnes ajoutées à la main par le comité, colonnes que l'objet
// ne mentionne pas) est préservé tel quel. Une clé sans colonne est ignorée.
function fusionnerLigne(entetesReels, ligneExistante, objet) {
  return entetesReels.map(function (entete, i) {
    return Object.prototype.hasOwnProperty.call(objet, entete)
      ? objet[entete]
      : ligneExistante[i];
  });
}

if (typeof module !== 'undefined') {
  module.exports = { objetsDepuisLignes, lignesDepuisObjets, entetesGaranties, fusionnerLigne };
}
