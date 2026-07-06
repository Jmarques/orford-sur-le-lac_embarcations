// Traitement des cas de la page « À traiter » (décision 0014) : logique pure,
// partagée entre Apps Script et les tests node, calquée sur observation.js.
// Deux gestes seulement : l'intervention en texte libre (mémoire du comité,
// appendée au Journal) et la libération (retrait de l'adresse, journalisée) —
// aucun état de suivi stocké, les files restent entièrement dérivées.

function numeroValide_(numero) {
  if (!Number.isInteger(Number(numero)) || Number(numero) <= 0) {
    throw new Error('Numéro d\'emplacement invalide : ' + JSON.stringify(numero) + ' (entier positif attendu).');
  }
  return Number(numero);
}

// Une intervention n'écrit QUE dans le Journal : le statut reste factuel
// (0011/0014), aucune ligne d'Emplacements n'est touchée.
function preparerIntervention(corps) {
  var numero = numeroValide_(corps.numero);
  var texte = String(corps.texte === undefined || corps.texte === null ? '' : corps.texte).trim();
  if (texte === '') {
    throw new Error('L\'intervention est vide — écrire ce qui a été fait ou convenu avant d\'ajouter.');
  }
  return {
    evenement: { action: 'intervention', numero: numero, details: texte },
  };
}

// La libération retire l'attribution : seules les deux colonnes d'adresse sont
// réécrites (fusion par en-têtes réels — 0012), et l'événement Journal garde
// la trace de l'adresse retirée (l'historique raconte qui avait la place).
function preparerLiberation(corps, lignesEmplacements) {
  var numero = numeroValide_(corps.numero);
  var ligne = lignesEmplacements.filter(function (l) {
    return l && Number(l.numero) === numero;
  })[0];
  if (!ligne) {
    throw new Error('L\'emplacement ' + numero + ' n\'a pas de ligne dans Emplacements — rien à libérer.');
  }
  var numeroAdresse = String(ligne.numeroAdresse === undefined || ligne.numeroAdresse === null ? '' : ligne.numeroAdresse).trim();
  var rue = String(ligne.rue === undefined || ligne.rue === null ? '' : ligne.rue).trim();
  if (!numeroAdresse || !rue) {
    throw new Error('L\'emplacement ' + numero + ' n\'est attribué à personne — il n\'y a pas d\'adresse à retirer.');
  }
  return {
    miseAJour: { numeroAdresse: '', rue: '' },
    evenement: {
      action: 'libération',
      numero: numero,
      details: 'Adresse retirée : ' + numeroAdresse + ' ' + rue + '.',
    },
  };
}

if (typeof module !== 'undefined') {
  module.exports = { preparerIntervention, preparerLiberation };
}
