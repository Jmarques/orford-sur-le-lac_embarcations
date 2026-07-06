// Observation d'un emplacement sur le terrain (décision 0011) : logique pure,
// partagée entre Apps Script et les tests node. Prépare la mise à jour de la
// ligne (état courant) ET l'événement Journal (historique) — les deux partent
// du même geste, sinon l'historique serait troué.

/* global ETATS_OCCUPATION */
if (typeof module !== 'undefined') {
  var ETATS_OCCUPATION = require('./grille.js').ETATS_OCCUPATION;
}

function preparerObservation(corps, lignesEmplacements, maintenant) {
  if (ETATS_OCCUPATION.indexOf(corps.occupation) === -1) {
    throw new Error('Occupation invalide : « ' + corps.occupation + ' » (attendu : ' + ETATS_OCCUPATION.join(', ') + ').');
  }
  if (!Number.isInteger(Number(corps.numero)) || Number(corps.numero) <= 0) {
    throw new Error('Numéro d\'emplacement invalide : ' + JSON.stringify(corps.numero) + ' (entier positif attendu).');
  }

  var existe = lignesEmplacements.some(function (l) {
    return Number(l.numero) === Number(corps.numero);
  });
  return {
    miseAJour: { occupationObservee: corps.occupation, dateObservation: maintenant },
    creer: !existe,
    evenement: {
      action: 'observation',
      numero: corps.numero,
      details: corps.occupation,
    },
  };
}

// Le lot d'observations d'une fin de tournée (décision 0013) : tout est validé
// avant la moindre écriture — une valeur invalide refuse le lot en entier, la
// Sheet et le Journal ne voient jamais un lot à moitié appliqué.
function preparerLotObservations(corps, lignesEmplacements, maintenant) {
  var observations = corps.observations;
  if (!Array.isArray(observations) || observations.length === 0) {
    throw new Error('Le lot d\'observations est vide — terminer une tournée sans relevé n\'envoie rien.');
  }
  var vus = {};
  return observations.map(function (observation) {
    // Chaque valeur est validée AVANT le dédoublonnage : un numéro illisible
    // est nommé par son vrai message, jamais par un « NaN en double ».
    var prepare = preparerObservation(observation, lignesEmplacements, maintenant);
    prepare.numero = Number(observation.numero);
    if (vus[prepare.numero]) {
      throw new Error('Le numéro ' + prepare.numero + ' apparaît deux fois dans le lot — une seule observation par emplacement et par tournée.');
    }
    vus[prepare.numero] = true;
    return prepare;
  });
}

if (typeof module !== 'undefined') {
  module.exports = { preparerObservation, preparerLotObservations };
}
