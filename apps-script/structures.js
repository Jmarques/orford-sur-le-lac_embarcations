// Sauvegarde d'une structure (décision 0009) : logique pure, partagée entre
// Apps Script et les tests node. La grille est normalisée si elle se parse,
// gardée telle quelle sinon (la sauvegarde est toujours permise — les
// problèmes restent signalés à la lecture, jamais bloqués à l'écriture).

/* global parserGrille, normaliserGrille */
if (typeof module !== 'undefined') {
  var grille_ = require('./grille.js');
  var parserGrille = grille_.parserGrille;
  var normaliserGrille = grille_.normaliserGrille;
}

function preparerSauvegardeStructure(corps, lignesStructures, lignesEmplacements) {
  var connue = lignesStructures.some(function (l) { return l.id === corps.id; });
  if (!connue) {
    throw new Error('Structure "' + corps.id + '" introuvable dans l\'onglet Structures — une nouvelle structure se crée à la main dans la Sheet.');
  }

  var texte = String(corps.emplacements === undefined ? '' : corps.emplacements);
  var numeros = [];
  try {
    var arrays = parserGrille(texte);
    texte = normaliserGrille(arrays);
    arrays.forEach(function (a) { numeros.push.apply(numeros, a); });
  } catch (erreur) {
    // Non parsable : enregistré brut sans créer de lignes — l'éditeur et
    // l'API signalent le problème à la lecture.
  }

  // Lignes Emplacements à créer pour les numéros nouveaux ; on ne supprime
  // jamais les existantes (un numéro retiré devient orphelin signalé — 0009).
  // Seul `numero` est renseigné : l'écriture pilotée par en-têtes (0012) laisse
  // les autres colonnes vides, à remplir par le comité.
  var connus = {};
  lignesEmplacements.forEach(function (l) { connus[Number(l.numero)] = true; });
  var nouveauxEmplacements = numeros
    .filter(function (numero) { return !connus[numero]; })
    .sort(function (a, b) { return a - b; })
    .map(function (numero) { return { numero: numero }; });
  var ligne = {
    id: corps.id,
    type: String(corps.type === undefined ? '' : corps.type),
    embarcations: String(corps.embarcations === undefined ? '' : corps.embarcations),
    saisie: String(corps.saisie === undefined ? '' : corps.saisie),
    emplacements: texte,
    notes: String(corps.notes === undefined ? '' : corps.notes),
  };
  return { ligne: ligne, nouveauxEmplacements: nouveauxEmplacements };
}

if (typeof module !== 'undefined') {
  module.exports = { preparerSauvegardeStructure };
}
