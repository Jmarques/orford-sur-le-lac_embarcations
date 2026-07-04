// Scénarios de capture d'écran (décision 0006) : déclaratifs — ajouter une page
// ou un état = ajouter une entrée ici, le runner ne change pas.

export const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 390, height: 844 },
};

// Réponses simulées de l'API (interception Playwright — aucune écriture réelle).
// À faire évoluer avec le contrat de l'API (apps-script/Code.js).
export const REPONSES_MOCK = {
  config: {
    ok: true,
    config: {
      rues: ['Rue du Pré', 'Rue des Érables', 'Chemin du Lac'],
      types: ['Kayak', 'Canoë', 'Planche (SUP)'],
    },
  },
  creation: { ok: true, id: 'demo' },
};

// config.js simulé : les captures ne dépendent pas du vrai site/config.js
// (courriel de contact factice mais présent, pour rendre la .phrase-contact visible).
export const CONFIG_JS_MOCK = `window.OSL_CONFIG = {
  apiUrl: 'https://script.google.com/macros/s/MOCK/exec',
  courrielComite: 'comite@exemple.ca',
};
`;

// `etat` s'appuie sur le hook d'URL ?etat= de la page ; `attendre` est le
// sélecteur qui confirme que l'état est rendu avant la capture. `cliquer`
// (optionnel) est un sélecteur CSS cliqué après l'affichage du formulaire,
// avant d'attendre `attendre` — utile pour capturer un état ouvert/déplié.
export const CAPTURES = [
  { nom: 'accueil-formulaire', page: 'index.html', attendre: '#formulaire:not([hidden])' },
  { nom: 'accueil-mobilite-message', page: 'index.html', cliquer: '#case-mobilite', attendre: '#message-mobilite:not([hidden])' },
  { nom: 'accueil-chargement', page: 'index.html', etat: 'chargement', attendre: '#etat-chargement:not([hidden])' },
  { nom: 'accueil-indisponible', page: 'index.html', etat: 'indisponible', attendre: '#etat-indisponible:not([hidden])' },
  { nom: 'accueil-succes', page: 'index.html', etat: 'succes', attendre: '#etat-succes:not([hidden])' },
  { nom: 'accueil-erreur-envoi', page: 'index.html', etat: 'erreur-envoi', attendre: '#erreur-envoi:not([hidden])' },
];

// Motifs de bruit console tolérés (regex). Vide par défaut : tout error/warning
// fait échouer npm run screenshots — c'est voulu (leçon des size="large" dépréciés).
export const CONSOLE_IGNOREE = [];

export function estProblemeConsole(type, texte, motifsIgnores) {
  if (type !== 'error' && type !== 'warning') return false;
  return !motifsIgnores.some((motif) => motif.test(texte));
}

export function urlDeScenario(base, scenario) {
  const url = base + '/' + scenario.page;
  return scenario.etat ? url + '?etat=' + scenario.etat : url;
}
