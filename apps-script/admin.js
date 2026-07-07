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

// Le tri des demandes vit désormais dans grille.js (sectionDemandes) : l'état
// est dérivé, jamais stocké, et partagé par la section « Demandes » de la page
// À traiter (décision 0020).

if (typeof module !== 'undefined') {
  module.exports = { verifierAcces };
}
