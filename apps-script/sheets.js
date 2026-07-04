// Seul module connaissant le schéma des onglets de la Sheet (voir docs/decisions/0002).
// La Sheet reste éditable à la main : toujours relire l'état frais, valider à la lecture.

var ONGLET_DEMANDES = 'Demandes';
var ENTETES_DEMANDES = ['id', 'date', 'rue', 'numero', 'nom', 'courriel', 'telephone', 'type', 'mobiliteReduite', 'note', 'statut'];
var STATUT_NOUVELLE = 'nouvelle';

var ONGLET_CONFIG = 'Config';
var ENTETES_CONFIG = ['clé', 'valeur'];
// Clés répétables de l'onglet Config : une ligne par valeur.
var CLE_RUE = 'rue';
var CLE_TYPE = 'type';

function ongletRequis_(nom) {
  var feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nom);
  if (!feuille) {
    throw new Error('Onglet "' + nom + '" introuvable — exécuter setup() une fois depuis l\'éditeur Apps Script.');
  }
  return feuille;
}

// Lit l'onglet Config (colonnes clé/valeur, clés répétées = listes).
function lireConfig() {
  var lignes = ongletRequis_(ONGLET_CONFIG).getDataRange().getValues();
  var config = { rues: [], types: [] };
  for (var i = 1; i < lignes.length; i++) {
    var cle = String(lignes[i][0]).trim();
    var valeur = String(lignes[i][1]).trim();
    if (!valeur) continue;
    if (cle === CLE_RUE) config.rues.push(valeur);
    if (cle === CLE_TYPE) config.types.push(valeur);
  }
  if (config.rues.length === 0 || config.types.length === 0) {
    throw new Error('Onglet "' + ONGLET_CONFIG + '" incomplet : il faut au moins une ligne "rue" et une ligne "type".');
  }
  return config;
}

function ajouterDemande(demande) {
  var id = Utilities.getUuid();
  ongletRequis_(ONGLET_DEMANDES).appendRow([
    id,
    new Date(),
    demande.rue,
    demande.numero,
    demande.nom,
    demande.courriel,
    demande.telephone,
    demande.type,
    demande.mobiliteReduite,
    demande.note,
    STATUT_NOUVELLE,
  ]);
  return id;
}

// À exécuter une fois depuis l'éditeur Apps Script : crée/aligne les onglets
// et déclenche l'autorisation des permissions du script.
function setup() {
  var classeur = SpreadsheetApp.getActiveSpreadsheet();

  var demandes = classeur.getSheetByName(ONGLET_DEMANDES) || classeur.insertSheet(ONGLET_DEMANDES);
  demandes.getRange(1, 1, 1, ENTETES_DEMANDES.length).setValues([ENTETES_DEMANDES]);
  demandes.setFrozenRows(1);

  var config = classeur.getSheetByName(ONGLET_CONFIG);
  if (!config) {
    config = classeur.insertSheet(ONGLET_CONFIG);
    config.getRange(1, 1, 7, 2).setValues([
      ENTETES_CONFIG,
      [CLE_TYPE, 'Kayak'],
      [CLE_TYPE, 'Canoë'],
      [CLE_TYPE, 'Planche (SUP)'],
      [CLE_RUE, 'À REMPLACER — vraie rue 1'],
      [CLE_RUE, 'À REMPLACER — vraie rue 2'],
      [CLE_RUE, 'À REMPLACER — vraie rue 3'],
    ]);
    config.setFrozenRows(1);
  }
}
