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
  // Réponse à l'action admin `demandes` : déjà triée comme l'API (nouvelles
  // d'abord, la plus ancienne en tête ; décidées ensuite, la plus récente en tête).
  demandes: {
    ok: true,
    demandes: [
      {
        id: 'demo-1',
        date: '2026-06-20T14:30:00.000Z',
        rue: 'Rue du Pré',
        numero: 234,
        nom: 'Marie Gagnon',
        courriel: 'marie.gagnon@exemple.ca',
        telephone: '819 555-2345',
        type: 'Kayak',
        mobiliteReduite: true,
        note: 'Mon épaule ne me permet plus de soulever le kayak au-dessus de la taille.',
        statut: 'nouvelle',
      },
      {
        id: 'demo-2',
        date: '2026-07-02T09:10:00.000Z',
        rue: 'Chemin du Lac',
        numero: 87,
        nom: 'John Tremblay',
        courriel: 'john.tremblay@exemple.ca',
        telephone: '',
        type: 'Planche (SUP)',
        mobiliteReduite: false,
        note: '',
        statut: 'nouvelle',
      },
      {
        id: 'demo-3',
        date: '2026-06-05T16:00:00.000Z',
        rue: 'Rue des Érables',
        numero: 12,
        nom: 'Louise Bédard',
        courriel: 'louise.bedard@exemple.ca',
        telephone: '819 555-8765',
        type: 'Canoë',
        mobiliteReduite: false,
        note: '',
        statut: 'acceptée',
      },
      {
        id: 'demo-4',
        date: '2026-05-14T11:45:00.000Z',
        rue: 'Rue du Pré',
        numero: 501,
        nom: 'Robert Fortin',
        courriel: 'robert.fortin@exemple.ca',
        telephone: '',
        type: 'Kayak',
        mobiliteReduite: false,
        note: 'Deuxième kayak pour ma conjointe.',
        statut: 'refusée',
      },
    ],
  },
  // Réponse à l'action admin `inventaire` : lignes brutes des onglets Structures
  // et Emplacements (le client parse et valide avec grille.js). Le jeu couvre
  // les cas réels : structure saine, saisie par colonnes, verticale, doublon
  // interne (S08 : 198 deux fois), conflit entre structures (S02 chevauche S03)
  // et un numéro orphelin dans Emplacements (999).
  inventaire: {
    ok: true,
    structures: [
      { id: 'S01', type: 'horizontal', embarcations: 'Canoë, Kayak', saisie: 'niveaux', emplacements: '[ [74..81], [82..89], [90..97] ]', notes: '' },
      { id: 'S02', type: 'horizontal', embarcations: 'Canoë, Kayak', saisie: 'niveaux', emplacements: '[ [13..27], [28..42], [143..156], [43..57] ]', notes: 'Numéros à revérifier sur place.' },
      { id: 'S03', type: 'horizontal', embarcations: 'Planche (SUP)', saisie: 'colonnes', emplacements: '[ [143..149], [150..156], [157, 158, 184, 185, 186, 187, 188], [189..195] ]', notes: '' },
      // « Pédalo » hors Config : avertissement sans erreur → badge « Données à vérifier ».
      { id: 'S06', type: 'vertical', embarcations: 'Planche (SUP), Pédalo', saisie: 'niveaux', emplacements: '[ [200..212] ]', notes: '' },
      { id: 'S08', type: 'horizontal', embarcations: 'Kayak', saisie: 'niveaux', emplacements: '[ [167..160, 198], [175..168, 197], [183..176, 198] ]', notes: '' },
    ],
    // Un exemplaire de chaque statut dérivé (0011) sur S01 : 74 conforme,
    // 75 attribué+libre, 76 orphelin, 77 disponible, 90 à vérifier ; le reste
    // des numéros (sans ligne) = libre présumé. 999 = orphelin d'onglet.
    emplacements: [
      { numero: 74, numeroAdresse: 234, rue: 'Rue du Pré', note: 'Kayak rouge.', occupationObservee: 'occupé', dateObservation: '2026-06-20T12:00:00.000Z' },
      { numero: 75, numeroAdresse: 12, rue: 'Rue des Érables', note: '', occupationObservee: 'libre', dateObservation: '2026-06-20T12:00:00.000Z' },
      { numero: 76, numeroAdresse: '', rue: '', note: '', occupationObservee: 'occupé', dateObservation: '2026-06-20T12:00:00.000Z' },
      { numero: 77, numeroAdresse: '', rue: '', note: '', occupationObservee: 'libre', dateObservation: '2026-06-20T12:00:00.000Z' },
      // Second « Attribué, libre », plus récent que 75 : le tri de la page
      // « À traiter » (plus anciennement libre d'abord) se voit en capture.
      { numero: 84, numeroAdresse: 234, rue: 'Rue du Pré', note: '', occupationObservee: 'libre', dateObservation: '2026-06-28T12:00:00.000Z' },
      { numero: 90, numeroAdresse: 87, rue: 'Chemin du Lac', note: '', occupationObservee: '', dateObservation: '' },
      { numero: 999, numeroAdresse: '', rue: '', note: '', occupationObservee: 'libre', dateObservation: '2026-06-20T12:00:00.000Z' },
    ],
    // Contact courant par adresse (0010) : la carte-cas d'« À traiter » y
    // trouve nom, courriel et téléphone du membre attribué.
    membres: [
      { numeroAdresse: 12, rue: 'Rue des Érables', nom: 'Louise Bédard', courriel: 'louise.bedard@exemple.ca', telephone: '819 555-8765' },
      { numeroAdresse: 234, rue: 'Rue du Pré', nom: 'Marie Gagnon', courriel: 'marie.gagnon@exemple.ca', telephone: '819 555-2345' },
      { numeroAdresse: 87, rue: 'Chemin du Lac', nom: 'John Tremblay', courriel: 'john.tremblay@exemple.ca', telephone: '' },
    ],
    // Le Journal voyage avec l'inventaire (0011) : « libre depuis » (série de
    // 75), fenêtre d'apparition d'un « À identifier » (76 : libre le 3 mai,
    // occupé le 12 juin) et interventions passées se dérivent de ces lignes.
    journal: [
      { date: '2026-04-01T12:00:00.000Z', action: 'observation', numero: 75, demandeId: '', details: 'occupé' },
      { date: '2026-05-01T12:00:00.000Z', action: 'observation', numero: 75, demandeId: '', details: 'libre' },
      { date: '2026-06-01T12:00:00.000Z', action: 'observation', numero: 75, demandeId: '', details: 'libre' },
      { date: '2026-06-05T14:00:00.000Z', action: 'note', numero: 75, demandeId: '', details: 'Message laissé sur le répondeur, je rappelle la semaine prochaine. — Diane' },
      { date: '2026-06-20T12:00:00.000Z', action: 'observation', numero: 75, demandeId: '', details: 'libre' },
      { date: '2026-05-03T12:00:00.000Z', action: 'observation', numero: 76, demandeId: '', details: 'libre' },
      { date: '2026-06-12T12:00:00.000Z', action: 'observation', numero: 76, demandeId: '', details: 'occupé' },
      { date: '2026-06-28T12:00:00.000Z', action: 'observation', numero: 84, demandeId: '', details: 'libre' },
      { date: '2026-06-20T12:00:00.000Z', action: 'observation', numero: 74, demandeId: '', details: 'occupé' },
      { date: '2026-06-20T12:00:00.000Z', action: 'observation', numero: 77, demandeId: '', details: 'libre' },
    ],
  },
  // Réponses aux écritures admin (les captures n'écrivent rien de réel).
  sauverStructure: { ok: true, structure: {} },
  observerEmplacement: { ok: true, observation: {} },
  observerLot: { ok: true, lot: { compte: 1 } },
  ajouterNote: { ok: true, note: {} },
  libererEmplacement: { ok: true, liberation: {} },
};

// Inventaire tel qu'il serait APRÈS l'observation « 76 libre » : la capture du
// succès montre la cellule passée à « Disponible », cohérente avec le message.
export const INVENTAIRE_APRES_OBSERVATION = structuredClone(REPONSES_MOCK.inventaire);
INVENTAIRE_APRES_OBSERVATION.emplacements = INVENTAIRE_APRES_OBSERVATION.emplacements.map(
  (ligne) => (ligne.numero === 76
    ? { ...ligne, occupationObservee: 'libre', dateObservation: '2026-07-05T15:00:00.000Z' }
    : ligne),
);

// Inventaire APRÈS une note sur 75 : la rangée du succès compte « 2 notes ».
export const INVENTAIRE_APRES_NOTE = structuredClone(REPONSES_MOCK.inventaire);
INVENTAIRE_APRES_NOTE.journal.push({
  date: '2026-07-06T10:00:00.000Z',
  action: 'note',
  numero: 75,
  demandeId: '',
  details: 'Parlé au membre : il vide l’emplacement d’ici la fin du mois. — Jeremy',
});

// Inventaire APRÈS la libération de 75 : adresse retirée, événement Journal —
// le cas sort de la file (servi via `reponsesApres`, après le premier chargement).
export const INVENTAIRE_APRES_LIBERATION = structuredClone(REPONSES_MOCK.inventaire);
INVENTAIRE_APRES_LIBERATION.emplacements = INVENTAIRE_APRES_LIBERATION.emplacements.map(
  (ligne) => (ligne.numero === 75 ? { ...ligne, numeroAdresse: '', rue: '' } : ligne),
);
INVENTAIRE_APRES_LIBERATION.journal.push({
  date: '2026-07-06T10:00:00.000Z',
  action: 'libération',
  numero: 75,
  demandeId: '',
  details: 'Adresse retirée : 12 Rue des Érables.',
});

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
// `defiler` (optionnel) : zones défilables poussées en fin de course avant la
// capture — vérifie les comportements de défilement (étiquettes sticky…) en
// mouvement, pas seulement au repos.
export const CAPTURES = [
  { nom: 'accueil-formulaire', page: 'index.html', attendre: '#formulaire:not([hidden])' },
  { nom: 'accueil-mobilite-message', page: 'index.html', cliquer: '#case-mobilite', attendre: '#message-mobilite:not([hidden])' },
  { nom: 'accueil-chargement', page: 'index.html', etat: 'chargement', attendre: '#etat-chargement:not([hidden])' },
  { nom: 'accueil-indisponible', page: 'index.html', etat: 'indisponible', attendre: '#etat-indisponible:not([hidden])' },
  { nom: 'accueil-succes', page: 'index.html', etat: 'succes', attendre: '#etat-succes:not([hidden])' },
  { nom: 'accueil-erreur-envoi', page: 'index.html', etat: 'erreur-envoi', attendre: '#erreur-envoi:not([hidden])' },
  { nom: 'admin-connexion', page: 'admin.html', attendre: '#etat-connexion:not([hidden])' },
  { nom: 'admin-mdp-refuse', page: 'admin.html', etat: 'mdp-refuse', attendre: '#erreur-connexion:not([hidden])' },
  { nom: 'admin-chargement', page: 'admin.html', etat: 'chargement', attendre: '#etat-chargement:not([hidden])' },
  { nom: 'admin-liste', page: 'admin.html', etat: 'liste', attendre: '.carte-demande' },
  { nom: 'admin-liste-vide', page: 'admin.html', etat: 'liste-vide', attendre: '#etat-vide:not([hidden])' },
  { nom: 'admin-erreur', page: 'admin.html', etat: 'erreur', attendre: '#etat-erreur:not([hidden])' },
  { nom: 'structures-connexion', page: 'structures.html', attendre: '#etat-connexion:not([hidden])' },
  { nom: 'structures-mdp-refuse', page: 'structures.html', etat: 'mdp-refuse', attendre: '#erreur-connexion:not([hidden])' },
  { nom: 'structures-chargement', page: 'structures.html', etat: 'chargement', attendre: '#etat-chargement:not([hidden])' },
  { nom: 'structures-liste', page: 'structures.html', etat: 'liste', attendre: '.carte-structure' },
  { nom: 'structures-liste-defilee', page: 'structures.html', etat: 'liste', attendre: '.carte-structure', defiler: '.grille-structure' },
  { nom: 'structures-liste-vide', page: 'structures.html', etat: 'liste-vide', attendre: '#etat-vide:not([hidden])' },
  // Fiche d'emplacement (décision 0018) : le drawer partagé, un scénario par
  // statut sur l'onglet Observer (l'onglet de cette page). `pleinVue` : un
  // <dialog> du top layer se rend mal en capture pleine page — viewport seul.
  { nom: 'structures-fiche-orphelin', page: 'structures.html', etat: 'liste',
    cliquer: '.bouton-cellule[data-numero="76"]', attendre: '.bouton-occupation', pleinVue: true },
  { nom: 'structures-fiche-conforme', page: 'structures.html', etat: 'liste',
    cliquer: '.bouton-cellule[data-numero="74"]', attendre: '.bouton-occupation', pleinVue: true },
  { nom: 'structures-fiche-attribue-libre', page: 'structures.html', etat: 'liste',
    cliquer: '.bouton-cellule[data-numero="75"]', attendre: '.bouton-occupation', pleinVue: true },
  { nom: 'structures-fiche-disponible', page: 'structures.html', etat: 'liste',
    cliquer: '.bouton-cellule[data-numero="77"]', attendre: '.bouton-occupation', pleinVue: true },
  { nom: 'structures-fiche-pas-observe', page: 'structures.html', etat: 'liste',
    cliquer: '.bouton-cellule[data-numero="90"]', attendre: '.bouton-occupation', pleinVue: true },
  // L'onglet Traiter, accessible depuis la grille (0018) : journal, note et
  // gestes selon le statut — avec membre (75, attribué) et sans (76, orphelin).
  { nom: 'structures-fiche-traiter', page: 'structures.html', etat: 'liste',
    cliquer: ['.bouton-cellule[data-numero="75"]', '#fiche-onglets wa-tab[panel="traiter"]'],
    attendre: '#fiche-liberer:not([hidden])', pleinVue: true },
  { nom: 'structures-fiche-traiter-a-identifier', page: 'structures.html', etat: 'liste',
    cliquer: ['.bouton-cellule[data-numero="76"]', '#fiche-onglets wa-tab[panel="traiter"]'],
    attendre: '#fiche-journal .ligne-journal', pleinVue: true },
  // La légende explique ses termes au toucher (wa-popover ancré au jeton).
  // `presenceSeule` : c'est l'attribut [open] qui prouve l'ouverture — le host
  // wa-popover est « invisible » pour Playwright même ouvert.
  { nom: 'structures-legende-explication', page: 'structures.html', etat: 'liste',
    cliquer: '#legende-conflit', attendre: 'wa-popover[for="legende-conflit"][open]',
    presenceSeule: true, pleinVue: true },
  { nom: 'structures-fiche-erreur', page: 'structures.html', etat: 'liste',
    cliquer: ['.bouton-cellule[data-numero="76"]', '.bouton-occupation[data-occupation="libre"]'],
    attendre: '#fiche-erreur-observer:not([hidden])', pleinVue: true,
    reponses: { observerEmplacement: { ok: false, erreur: 'Échec simulé pour les captures.' } } },
  // Observation réussie : la fiche RESTE ouverte (0018) — le statut de 76
  // bascule d'« À identifier » (danger) à « Disponible » (brand) sous les
  // yeux, la grille derrière se recolore. `reponsesApres` : l'inventaire
  // rechargé après le geste, pas celui du premier chargement.
  { nom: 'structures-observation-succes', page: 'structures.html', etat: 'liste',
    cliquer: ['.bouton-cellule[data-numero="76"]', '.bouton-occupation[data-occupation="libre"]'],
    attendre: '#fiche-statut[variant="brand"]', pleinVue: true,
    reponsesApres: { inventaire: INVENTAIRE_APRES_OBSERVATION } },
  // Note ajoutée depuis la grille : fiche ouverte, journal enrichi (6e ligne
  // pour 75), champ vidé.
  { nom: 'structures-fiche-note-succes', page: 'structures.html', etat: 'liste',
    ouvrir: ['.bouton-cellule[data-numero="75"]', '#fiche-onglets wa-tab[panel="traiter"]'],
    remplir: { selecteur: '#fiche-champ-note textarea', valeur: 'Parlé au membre : il vide l\'emplacement d\'ici la fin du mois. — Jeremy' },
    cliquer: '#fiche-ajouter-note',
    attendre: '#fiche-journal .ligne-journal:nth-of-type(6)', pleinVue: true,
    reponsesApres: { inventaire: INVENTAIRE_APRES_NOTE } },
  // La confirmation avant de libérer : aucun tap accidentel ne retire une
  // adresse. `presenceSeule` : host wa-dialog « invisible » pour Playwright.
  { nom: 'structures-fiche-confirmation-liberation', page: 'structures.html', etat: 'liste',
    cliquer: ['.bouton-cellule[data-numero="75"]', '#fiche-onglets wa-tab[panel="traiter"]',
      '#fiche-liberer'],
    attendre: '#fiche-dialogue-liberer[open]', presenceSeule: true, pleinVue: true },
  // Libération depuis la grille : confirmation, puis fiche TOUJOURS ouverte —
  // le statut bascule à « Disponible » et la libération se lit au journal.
  { nom: 'structures-fiche-liberation-succes', page: 'structures.html', etat: 'liste',
    cliquer: ['.bouton-cellule[data-numero="75"]', '#fiche-onglets wa-tab[panel="traiter"]',
      '#fiche-liberer', '#fiche-dialogue-liberer-confirmer'],
    attendre: '#fiche-statut[variant="brand"]', pleinVue: true,
    reponsesApres: { inventaire: INVENTAIRE_APRES_LIBERATION } },
  { nom: 'structures-edition', page: 'structures.html', etat: 'liste', cliquer: '[data-structure="S02"] .bouton-modifier', attendre: '.mode-edition:not([hidden]) .apercu-grille .grille-emplacements' },
  // `:not([disabled])` : le bouton n'est cliquable qu'une fois le formulaire initialisé.
  { nom: 'structures-edition-erreur', page: 'structures.html', etat: 'liste',
    cliquer: ['[data-structure="S02"] .bouton-modifier', '.bouton-enregistrer:not([disabled])'],
    attendre: '.erreur-sauvegarde:not([hidden])',
    reponses: { sauverStructure: { ok: false, erreur: 'Échec simulé pour les captures.' } } },
  { nom: 'structures-succes', page: 'structures.html', etat: 'liste',
    cliquer: ['[data-structure="S02"] .bouton-modifier', '.bouton-enregistrer:not([disabled])'],
    attendre: '#message-succes:not([hidden])' },
  // Tournée (décision 0013) : le hook ?etat=tournee ouvre la tournée de S01.
  // Écran vierge : fantômes estompés (74 occupé, 75 libre…), cellules sans
  // fantôme (numéros sans ligne Emplacements) et compteur à zéro.
  { nom: 'structures-tournee', page: 'structures.html', etat: 'tournee',
    attendre: '.bouton-cellule-tournee' },
  // Relevés mixtes + compteur en cours : 74 basculé occupé → libre (marqueur
  // « a changé » sur cellule CLAIRE), 75 basculé libre → occupé (marqueur sur
  // cellule remplie), 76 confirmé identique (1 tap), 90 jamais observé →
  // occupé et 91 sans fantôme → libre (pas de marqueur : rien n'a « changé »).
  { nom: 'structures-tournee-relevee', page: 'structures.html', etat: 'tournee',
    cliquer: ['.bouton-cellule-tournee[data-numero="74"]', '.bouton-cellule-tournee[data-numero="74"]',
      '.bouton-cellule-tournee[data-numero="75"]', '.bouton-cellule-tournee[data-numero="75"]',
      '.bouton-cellule-tournee[data-numero="76"]',
      '.bouton-cellule-tournee[data-numero="90"]',
      '.bouton-cellule-tournee[data-numero="91"]', '.bouton-cellule-tournee[data-numero="91"]'],
    attendre: '.bouton-cellule-tournee.releve-libre[data-numero="91"]' },
  // Fin partielle : l'avertissement chiffre les non-relevés et laisse
  // terminer quand même ou continuer (portée flexible, 0013).
  { nom: 'structures-tournee-avertissement', page: 'structures.html', etat: 'tournee',
    cliquer: ['.bouton-cellule-tournee[data-numero="74"]', '#terminer-tournee'],
    attendre: '#dialogue-terminer-confirmer', pleinVue: true },
  { nom: 'structures-tournee-erreur', page: 'structures.html', etat: 'tournee',
    cliquer: ['.bouton-cellule-tournee[data-numero="74"]', '#terminer-tournee',
      '#dialogue-terminer-confirmer'],
    attendre: '#tournee-erreur:not([hidden])',
    reponses: { observerLot: { ok: false, erreur: 'Échec simulé pour les captures.' } } },
  // Résumé avec changements : 74 basculé (occupé → libre), 75 confirmé
  // identique, 77 basculé (libre → occupé), 90 relevé sans fantôme — bilan
  // « 4 emplacements relevés, 2 changements » et « Structure suivante ».
  { nom: 'structures-tournee-resume', page: 'structures.html', etat: 'tournee',
    cliquer: ['.bouton-cellule-tournee[data-numero="74"]', '.bouton-cellule-tournee[data-numero="74"]',
      '.bouton-cellule-tournee[data-numero="75"]',
      '.bouton-cellule-tournee[data-numero="77"]', '.bouton-cellule-tournee[data-numero="77"]',
      '.bouton-cellule-tournee[data-numero="90"]',
      '#terminer-tournee', '#dialogue-terminer-confirmer'],
    attendre: '#etat-resume:not([hidden])' },
  // Résumé de la dernière structure (S08) : aucun changement (cellules sans
  // fantôme), pas de « Structure suivante » — le retour devient l'action primaire.
  { nom: 'structures-tournee-resume-derniere', page: 'structures.html', etat: 'tournee-derniere',
    cliquer: ['.bouton-cellule-tournee[data-numero="176"]',
      '#terminer-tournee', '#dialogue-terminer-confirmer'],
    attendre: '#etat-resume:not([hidden])' },
  // Enchaînement : « Structure suivante » recharge l'inventaire (fantômes
  // frais) puis ouvre la tournée de S02 — la structure qui suit S01 dans
  // l'ordre de la liste (le numéro 13 n'existe que dans S02).
  { nom: 'structures-tournee-enchainement', page: 'structures.html', etat: 'tournee',
    cliquer: ['.bouton-cellule-tournee[data-numero="76"]', '#terminer-tournee',
      '#dialogue-terminer-confirmer', '#structure-suivante'],
    attendre: '.bouton-cellule-tournee[data-numero="13"]' },
  // Retour à la liste depuis le résumé : l'inventaire mocké est déjà
  // « après » (76 libre), donc un seul tap confirme le fantôme de 76 ; la
  // liste revient avec la cellule recalculée « Disponible » — cohérente avec
  // l'observation envoyée — sans message succès (le résumé a déjà tout dit).
  { nom: 'structures-tournee-succes', page: 'structures.html', etat: 'tournee',
    cliquer: ['.bouton-cellule-tournee[data-numero="76"]', '#terminer-tournee',
      '#dialogue-terminer-confirmer', '#resume-retour-liste'],
    attendre: '.carte-structure',
    reponses: { inventaire: INVENTAIRE_APRES_OBSERVATION } },
  { nom: 'structures-erreur', page: 'structures.html', etat: 'erreur', attendre: '#etat-erreur:not([hidden])' },
  // Page « À traiter » (décision 0014) : registre scannable + fiche (dialog).
  { nom: 'a-traiter-connexion', page: 'a-traiter.html', attendre: '#etat-connexion:not([hidden])' },
  { nom: 'a-traiter-mdp-refuse', page: 'a-traiter.html', etat: 'mdp-refuse', attendre: '#erreur-connexion:not([hidden])' },
  { nom: 'a-traiter-chargement', page: 'a-traiter.html', etat: 'chargement', attendre: '#etat-chargement:not([hidden])' },
  // Registre peuplé : 75 avant 84 (plus anciennement libre d'abord — tri visible).
  { nom: 'a-traiter-liste', page: 'a-traiter.html', etat: 'liste', attendre: '.rangee-cas' },
  { nom: 'a-traiter-liste-vide', page: 'a-traiter.html', etat: 'liste-vide', attendre: '#etat-liste:not([hidden])' },
  // La fiche d'un cas attribué : membre, journal complet (icônes), gestes.
  { nom: 'a-traiter-fiche', page: 'a-traiter.html', etat: 'liste',
    cliquer: '.rangee-cas[data-numero="75"]',
    attendre: '#fiche-cas[open]', presenceSeule: true, pleinVue: true },
  // La fiche d'un « À identifier » : pas de membre, journal + note seulement.
  { nom: 'a-traiter-fiche-a-identifier', page: 'a-traiter.html', etat: 'liste',
    cliquer: '.rangee-cas[data-numero="76"]',
    attendre: '#fiche-cas[open]', presenceSeule: true, pleinVue: true },
  // Note ajoutée : la fiche se referme, la rangée du dossier compte 2 notes.
  { nom: 'a-traiter-note-succes', page: 'a-traiter.html', etat: 'liste',
    ouvrir: '.rangee-cas[data-numero="75"]',
    remplir: [{ selecteur: '#champ-note textarea',
      valeur: 'Parlé au membre : il vide l’emplacement d’ici la fin du mois. — Jeremy' }],
    cliquer: '#ajouter-note',
    attendre: '#message-succes:not([hidden])',
    reponses: { inventaire: INVENTAIRE_APRES_NOTE } },
  // Échec d'écriture : le texte saisi est conservé, l'erreur vit dans la fiche.
  { nom: 'a-traiter-note-erreur', page: 'a-traiter.html', etat: 'liste',
    ouvrir: '.rangee-cas[data-numero="75"]',
    remplir: [{ selecteur: '#champ-note textarea', valeur: 'Message laissé au membre. — Diane' }],
    cliquer: '#ajouter-note',
    attendre: '#fiche-erreur:not([hidden])', pleinVue: true,
    reponses: { ajouterNote: { ok: false, erreur: 'Échec simulé pour les captures.' } } },
  // Le dialogue de confirmation : aucun tap accidentel ne retire une adresse.
  { nom: 'a-traiter-confirmation-liberation', page: 'a-traiter.html', etat: 'liste',
    cliquer: ['.rangee-cas[data-numero="75"]', '#fiche-liberer'],
    attendre: '#dialogue-liberer[open]', presenceSeule: true, pleinVue: true },
  // Succès de libération : au rechargement (reponsesApres), 75 a quitté la file.
  { nom: 'a-traiter-liberation-succes', page: 'a-traiter.html', etat: 'liste',
    cliquer: ['.rangee-cas[data-numero="75"]', '#fiche-liberer', '#dialogue-liberer-confirmer'],
    attendre: '#message-succes:not([hidden])',
    reponsesApres: { inventaire: INVENTAIRE_APRES_LIBERATION } },
  { nom: 'a-traiter-erreur', page: 'a-traiter.html', etat: 'erreur', attendre: '#etat-erreur:not([hidden])' },
];

// Motifs de bruit console tolérés (regex). Liste minimale : tout autre
// error/warning fait échouer npm run screenshots — c'est voulu (leçon des
// size="large" dépréciés).
export const CONSOLE_IGNOREE = [
  // Avertissement de performance Chromium émis par la LECTURE des pixels que
  // fait la capture Playwright elle-même sur le canvas WebGL de la bande
  // d'identité (site/eau.js, décision 0015) — bruit de la mesure, pas de la
  // page ; n'apparaît jamais en usage réel.
  /GPU stall due to ReadPixels/,
];

export function estProblemeConsole(type, texte, motifsIgnores) {
  if (type !== 'error' && type !== 'warning') return false;
  return !motifsIgnores.some((motif) => motif.test(texte));
}

export function urlDeScenario(base, scenario) {
  const url = base + '/' + scenario.page;
  return scenario.etat ? url + '?etat=' + scenario.etat : url;
}
