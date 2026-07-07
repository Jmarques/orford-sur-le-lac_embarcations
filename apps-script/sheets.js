// Seul module connaissant le schéma des onglets de la Sheet (voir docs/decisions/0002).
// La Sheet reste éditable à la main : toujours relire l'état frais, valider à la lecture.

// L'état d'une demande est DÉRIVÉ, jamais stocké (décision 0020) : plus de
// colonne `statut` — deux faits de décision portés par la ligne. numeroAttribue
// rempli → acceptée ; dateDecision seule → refusée ; ni l'un ni l'autre →
// nouvelle. Une demande naît donc sans ces deux colonnes remplies.
var ONGLET_DEMANDES = 'Demandes';
var ENTETES_DEMANDES = ['id', 'date', 'rue', 'numero', 'nom', 'courriel', 'telephone', 'type', 'mobiliteReduite', 'note', 'numeroAttribue', 'dateDecision'];

var ONGLET_CONFIG = 'Config';
var ENTETES_CONFIG = ['clé', 'valeur'];
// Clés répétables de l'onglet Config : une ligne par valeur.
var CLE_RUE = 'rue';
var CLE_TYPE = 'type';
// Clé unique : mot de passe partagé du comité (décision 0008). Jamais renvoyée
// par lireConfig() — l'action publique `config` exposerait tout son résultat.
var CLE_MOT_DE_PASSE = 'motDePasseComite';
var MOT_DE_PASSE_PLACEHOLDER = 'À REMPLACER — mot de passe du comité';

// Inventaire (décisions 0009, 0010) : la colonne `emplacements` de Structures
// est la source de vérité de la géographie (grille parsée par grille.js).
// Emplacements ne porte que l'attribution (numeroAdresse + rue), la note et
// l'occupation observée courante ; le contact vit dans l'onglet Membres.
var ONGLET_STRUCTURES = 'Structures';
var ENTETES_STRUCTURES = ['id', 'type', 'embarcations', 'saisie', 'emplacements', 'notes'];

var ONGLET_EMPLACEMENTS = 'Emplacements';
var ENTETES_EMPLACEMENTS = ['numero', 'numeroAdresse', 'rue', 'note', 'occupationObservee', 'dateObservation'];

// Contact courant d'une adresse (décision 0010) : 1 ligne par adresse, clé
// (numeroAdresse + rue), saisi à la main par le comité. Source de vérité du
// contact, distincte du contact figé dans le journal Demandes. `quotaAccorde`
// (décision 0019) : exception durable au quota de 2, entier saisi à la main —
// vide = quota par défaut, valeur illisible tolérée côté client (0002).
var ONGLET_MEMBRES = 'Membres';
var ENTETES_MEMBRES = ['numeroAdresse', 'rue', 'nom', 'courriel', 'telephone', 'quotaAccorde'];

// Historique append-only des actions faites via l'app (décision 0002) ; porte
// aussi les observations et l'historique par emplacement (décision 0011).
// `adresse` (décision 0019) : les notes d'un cas hors quota parlent d'une
// adresse (« numeroAdresse rue »), pas d'un emplacement — numero reste vide.
var ONGLET_JOURNAL = 'Journal';
var ENTETES_JOURNAL = ['date', 'action', 'numero', 'adresse', 'demandeId', 'details'];

function ongletRequis_(nom) {
  var feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nom);
  if (!feuille) {
    throw new Error('Onglet "' + nom + '" introuvable — exécuter setup() une fois depuis l\'éditeur Apps Script.');
  }
  return feuille;
}

// La ligne d'en-tête réelle d'un onglet (ordre physique courant, décision 0012).
function entetesDe_(feuille) {
  var largeur = Math.max(feuille.getLastColumn(), 1);
  return feuille.getRange(1, 1, 1, largeur).getValues()[0];
}

// Ajoute une ligne en plaçant chaque champ sous SA colonne par nom (0012) :
// robuste au réordonnancement manuel des colonnes.
function appendObjet_(feuille, objet) {
  feuille.appendRow(lignesDepuisObjets(entetesDe_(feuille), [objet])[0]);
}

// Met à jour la ligne dont la colonne `colonneCle` vaut `valeurCle` : n'écrit
// que les colonnes présentes dans `objet` (0012), préserve le reste. Renvoie
// true si une ligne a été trouvée et mise à jour.
function majLigneParCle_(feuille, colonneCle, valeurCle, objet) {
  var donnees = feuille.getDataRange().getValues();
  var entetes = donnees[0];
  var indexCle = entetes.indexOf(colonneCle);
  for (var i = 1; i < donnees.length; i++) {
    if (String(donnees[i][indexCle]).trim() !== String(valeurCle)) continue;
    feuille.getRange(i + 1, 1, 1, entetes.length)
      .setValues([fusionnerLigne(entetes, donnees[i], objet)]);
    return true;
  }
  return false;
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

// Le mot de passe du comité, ou '' s'il est absent ou laissé au placeholder —
// verifierAcces (admin.js) crashe alors en nommant la clé à renseigner.
function lireMotDePasseComite() {
  var lignes = ongletRequis_(ONGLET_CONFIG).getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++) {
    if (String(lignes[i][0]).trim() === CLE_MOT_DE_PASSE) {
      var valeur = String(lignes[i][1]).trim();
      return valeur === MOT_DE_PASSE_PLACEHOLDER ? '' : valeur;
    }
  }
  return '';
}

// Toutes les demandes, l'état frais de la Sheet (édition manuelle possible — 0002).
function lireDemandes() {
  return objetsDepuisLignes(ongletRequis_(ONGLET_DEMANDES).getDataRange().getValues());
}

// L'inventaire complet, l'état frais de la Sheet (édition manuelle possible — 0002).
// Le Journal voyage avec l'inventaire (0011, volume négligeable à ~180 places) et
// les Membres aussi (0010) : les dérivations « À traiter » (files, « libre
// depuis », historique) et le contact des cartes-cas se font côté client (0004).
// Les Demandes voyagent avec l'inventaire (décision 0020) : la section
// « Demandes » de la page À traiter dérive leur état côté client (0004), comme
// les files et le hors quota — plus d'action `demandes` séparée.
function lireInventaire() {
  return {
    structures: objetsDepuisLignes(ongletRequis_(ONGLET_STRUCTURES).getDataRange().getValues()),
    emplacements: objetsDepuisLignes(ongletRequis_(ONGLET_EMPLACEMENTS).getDataRange().getValues()),
    membres: objetsDepuisLignes(ongletRequis_(ONGLET_MEMBRES).getDataRange().getValues()),
    journal: objetsDepuisLignes(ongletRequis_(ONGLET_JOURNAL).getDataRange().getValues()),
    demandes: lireDemandes(),
  };
}

// Écrit la ligne d'une structure (retrouvée par id) et crée les lignes
// Emplacements des numéros nouveaux — jamais de suppression (décision 0009).
// Action consignée au Journal (décision 0002).
function sauverStructure(corps) {
  var inventaire = lireInventaire();
  var prepare = preparerSauvegardeStructure(corps, inventaire.structures, inventaire.emplacements);

  majLigneParCle_(ongletRequis_(ONGLET_STRUCTURES), 'id', corps.id, prepare.ligne);

  var emplacements = ongletRequis_(ONGLET_EMPLACEMENTS);
  prepare.nouveauxEmplacements.forEach(function (nouveau) {
    appendObjet_(emplacements, nouveau);
  });

  journaliser_({
    action: 'structure',
    details: corps.id + ' → ' + prepare.ligne.emplacements +
      (prepare.nouveauxEmplacements.length > 0
        ? ' (+' + prepare.nouveauxEmplacements.length + ' ligne(s) Emplacements)'
        : ''),
  });

  return prepare.ligne;
}

// Marque l'occupation observée d'un emplacement (décision 0011) : met à jour
// l'état courant sur la ligne (create-if-missing — 0009), date au serveur,
// et journalise l'événement — le même geste écrit les deux.
function observerEmplacement(corps) {
  var emplacements = ongletRequis_(ONGLET_EMPLACEMENTS);
  var lignes = objetsDepuisLignes(emplacements.getDataRange().getValues());
  var prepare = preparerObservation(corps, lignes, new Date());
  appliquerObservation_(emplacements, Number(corps.numero), prepare);
  return prepare.miseAJour;
}

// Écrit le lot d'une fin de tournée (décision 0013) : tout le lot est validé
// avant la première écriture (preparerLotObservations lance sinon), puis
// chaque observation écrit sa cellule et son événement Journal (0011).
function observerLot(corps) {
  var emplacements = ongletRequis_(ONGLET_EMPLACEMENTS);
  var lignes = objetsDepuisLignes(emplacements.getDataRange().getValues());
  var lot = preparerLotObservations(corps, lignes, new Date());
  lot.forEach(function (prepare) {
    appliquerObservation_(emplacements, prepare.numero, prepare);
  });
  return { compte: lot.length };
}

// Applique une observation préparée : ligne créée si absente (0009) ou mise à
// jour par en-têtes réels (0012), puis événement Journal — les deux toujours.
function appliquerObservation_(emplacements, numero, prepare) {
  if (prepare.creer) {
    var nouvelle = { numero: numero };
    Object.keys(prepare.miseAJour).forEach(function (cle) { nouvelle[cle] = prepare.miseAJour[cle]; });
    appendObjet_(emplacements, nouvelle);
  } else {
    majLigneParCle_(emplacements, 'numero', numero, prepare.miseAJour);
  }
  journaliser_(prepare.evenement);
}

// Ajoute une note au journal d'un emplacement (décision 0014) : texte libre
// appendé au Journal, rattaché au numéro. La ligne d'Emplacements n'est pas
// touchée — le statut reste factuel, la mémoire du comité vit dans le Journal.
function ajouterNote(corps) {
  var prepare = preparerNote(corps);
  journaliser_(prepare.evenement);
  return prepare.evenement;
}

// Libère un emplacement (décision 0014) : vide l'adresse de la ligne par
// en-têtes réels (0012) et journalise l'adresse retirée — le même geste écrit
// les deux (0011). Le statut recalculé fait le reste (Disponible, ou
// À identifier si l'emplacement est observé occupé).
function libererEmplacement(corps) {
  var emplacements = ongletRequis_(ONGLET_EMPLACEMENTS);
  var lignes = objetsDepuisLignes(emplacements.getDataRange().getValues());
  var prepare = preparerLiberation(corps, lignes);
  majLigneParCle_(emplacements, 'numero', Number(corps.numero), prepare.miseAJour);
  journaliser_(prepare.evenement);
  return prepare.miseAJour;
}

// Un événement dans le Journal append-only (décisions 0002, 0011). `date` par
// défaut = maintenant ; les champs absents restent vides.
function journaliser_(evenement) {
  var objet = { date: new Date(), action: '', numero: '', adresse: '', demandeId: '', details: '' };
  Object.keys(evenement).forEach(function (cle) { objet[cle] = evenement[cle]; });
  appendObjet_(ongletRequis_(ONGLET_JOURNAL), objet);
}

// Une demande naît « nouvelle » : ni numeroAttribue ni dateDecision (colonnes
// laissées vides par l'append piloté par en-têtes — décision 0012), donc l'état
// dérivé (0020) est « nouvelle » jusqu'à une décision du comité.
function ajouterDemande(demande) {
  var id = Utilities.getUuid();
  appendObjet_(ongletRequis_(ONGLET_DEMANDES), {
    id: id,
    date: new Date(),
    rue: demande.rue,
    numero: demande.numero,
    nom: demande.nom,
    courriel: demande.courriel,
    telephone: demande.telephone,
    type: demande.type,
    mobiliteReduite: demande.mobiliteReduite,
    note: demande.note,
  });
  return id;
}

// Crée l'onglet s'il manque et garantit chaque en-tête requis sans réordonner
// ni retirer les colonnes du comité (décision 0012).
function ongletAvecEntetes_(classeur, nom, entetesRequis) {
  var feuille = classeur.getSheetByName(nom) || classeur.insertSheet(nom);
  var garantis = entetesGaranties(entetesDe_(feuille), entetesRequis);
  feuille.getRange(1, 1, 1, garantis.length).setValues([garantis]);
  feuille.setFrozenRows(1);
  return feuille;
}

// À exécuter une fois depuis l'éditeur Apps Script : crée/aligne les onglets
// et déclenche l'autorisation des permissions du script.
function setup() {
  var classeur = SpreadsheetApp.getActiveSpreadsheet();

  ongletAvecEntetes_(classeur, ONGLET_DEMANDES, ENTETES_DEMANDES);
  ongletAvecEntetes_(classeur, ONGLET_STRUCTURES, ENTETES_STRUCTURES);
  ongletAvecEntetes_(classeur, ONGLET_EMPLACEMENTS, ENTETES_EMPLACEMENTS);
  ongletAvecEntetes_(classeur, ONGLET_MEMBRES, ENTETES_MEMBRES);
  ongletAvecEntetes_(classeur, ONGLET_JOURNAL, ENTETES_JOURNAL);

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

  // Ajoute la clé du mot de passe comité aux Sheets créées avant la décision 0008.
  var cles = config.getDataRange().getValues().map(function (ligne) {
    return String(ligne[0]).trim();
  });
  if (cles.indexOf(CLE_MOT_DE_PASSE) === -1) {
    config.appendRow([CLE_MOT_DE_PASSE, MOT_DE_PASSE_PLACEHOLDER]);
  }
}
