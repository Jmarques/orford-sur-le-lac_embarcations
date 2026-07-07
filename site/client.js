// Le seul module qui sait parler au backend Apps Script (décisions 0001, 0008) :
// « comment poster une action et lire un refus » est un invariant du système,
// porté ici une fois plutôt que recopié dans chaque page et chaque fiche.
//
// Chargé en <script> global comme grille.js ; le guard dual-export le rend
// require()-able par les tests node (fetch injecté = seul seam). Frontend-only
// (pas de contrepartie apps-script, donc pas concerné par copie-grille).

// Erreur « métier » renvoyée par l'API (message français montrable tel quel),
// par opposition aux erreurs techniques (réseau, JSON) qu'on ne montre jamais.
class ErreurApi extends Error {}

// Normalise l'enveloppe du backend ({ ok, erreur, code }). PUR — testable sans
// fetch. Le comité et le public traversent le même seam :
//   ok           → renvoie le payload tel quel (l'appelant lit ses champs)
//   accesRefuse  → renvoie la sentinelle { accesRefuse: true } (session morte ;
//                  la RÉACTION reste à la page — fermer la fiche, ou réafficher
//                  la connexion)
//   autre refus  → lève ErreurApi(message) ; repli si le message manque
function interpreterReponse(resultat) {
  if (resultat && resultat.ok) return resultat;
  if (resultat && resultat.code === 'accesRefuse') return { accesRefuse: true };
  var message = (resultat && resultat.erreur) || 'Réponse inattendue du serveur.';
  throw new ErreurApi(message);
}

// Capture les dépendances une fois :
//   fetch      : window.fetch en prod, faux en test
//   apiUrl     : window.OSL_CONFIG.apiUrl
//   motDePasse : getter () => sessionStorage… (lu FRAIS à chaque appel) ;
//                omis pour le formulaire public (aucun mot de passe au corps)
function creerClient(options) {
  var fetch = options.fetch;
  var apiUrl = options.apiUrl;
  var motDePasse = options.motDePasse;

  // POST : corps en text/plain (défaut de fetch pour une chaîne) = pas de
  // preflight CORS (0001). Le mot de passe voyage dans le corps, jamais en URL
  // (0008), et seulement si un getter est fourni.
  async function poster(corps) {
    var charge = motDePasse ? Object.assign({}, corps, { motDePasse: motDePasse() }) : corps;
    var reponse = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify(charge),
    });
    return interpreterReponse(await reponse.json());
  }

  // GET public : action en query, jamais de mot de passe.
  async function obtenir(action) {
    var reponse = await fetch(apiUrl + '?action=' + encodeURIComponent(action));
    return interpreterReponse(await reponse.json());
  }

  return { poster: poster, obtenir: obtenir };
}

if (typeof module !== 'undefined') {
  module.exports = { creerClient: creerClient, interpreterReponse: interpreterReponse, ErreurApi: ErreurApi };
}
