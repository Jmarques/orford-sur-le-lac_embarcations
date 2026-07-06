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

if (typeof module !== 'undefined') {
  module.exports = { preparerObservation };
}
