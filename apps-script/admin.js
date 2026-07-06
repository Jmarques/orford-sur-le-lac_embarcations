// Logique pure des actions admin — partagée entre Apps Script et les tests node.
// L'auth (mot de passe partagé en corps POST) suit docs/decisions/0008.

// Refus d'accès nommé : le client ré-affiche l'écran de connexion sur ce cas
// précis (code `accesRefuse` dans la réponse), sans coupler sur le texte.
function ErreurAcces(message) {
  var erreur = new Error(message);
  erreur.name = 'ErreurAcces';
  return erreur;
}

function verifierAcces(corps, motDePasseAttendu) {
  if (!String(motDePasseAttendu || '').trim()) {
    throw new Error('Clé "motDePasseComite" absente de l\'onglet Config — la renseigner avant d\'ouvrir l\'accès admin.');
  }
  if (String(corps.motDePasse || '') !== motDePasseAttendu) {
    // Message unique quel que soit le champ fautif : ne renseigne pas un curieux.
    throw ErreurAcces('Mot de passe du comité manquant ou incorrect.');
  }
}

// Ordre de traitement du comité : les nouvelles d'abord (la plus ancienne en
// tête — premier arrivé, premier servi), puis les décidées (la plus récente en tête).
function trierDemandes(demandes) {
  // Ne présume pas du type de `date` (chaîne ISO attendue, mais la Sheet est
  // éditée à la main — 0002) : tri par timestamp ; une date illisible est
  // traitée comme la plus ancienne.
  function cleDate(demande) {
    var temps = new Date(demande.date).getTime();
    return isNaN(temps) ? 0 : temps;
  }
  return demandes.slice().sort(function (a, b) {
    var aNouvelle = a.statut === 'nouvelle';
    var bNouvelle = b.statut === 'nouvelle';
    if (aNouvelle !== bNouvelle) return aNouvelle ? -1 : 1;
    return aNouvelle ? cleDate(a) - cleDate(b) : cleDate(b) - cleDate(a);
  });
}

if (typeof module !== 'undefined') {
  module.exports = { verifierAcces, trierDemandes };
}
