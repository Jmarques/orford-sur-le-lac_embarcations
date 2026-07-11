// Scénarios de capture d'écran (décision 0006) : déclaratifs — ajouter une page
// ou un état = ajouter une entrée ici, le runner ne change pas.

import { createRequire } from 'node:module';

// Les Modèles de courriel du mock viennent du registre serveur (une seule
// vérité des textes — ticket 07) : gabaritsEffectifs([]) = les défauts, comme
// une Sheet fraîchement semée par setup().
const require = createRequire(import.meta.url);
const { gabaritsEffectifs } = require('../apps-script/gabarits.js');

export const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 390, height: 844 },
};

// Les demandes (décision 0020) : plus de colonne `statut` — l'état se dérive de
// numeroAttribue + dateDecision (grille.js). Deux nouvelles (demo-1 plus
// ancienne que demo-2 → en tête), une acceptée (emplacement 75 attribué à
// Louise), une refusée (dateDecision seule ; sa raison vit au Journal, keyée
// par demandeId). Elles voyagent maintenant dans l'inventaire.
const DEMANDES_MOCK = [
  {
    id: 'demo-1', date: '2026-06-20T14:30:00.000Z', rue: 'Rue du Pré', numero: 234,
    nom: 'Marie Gagnon', courriel: 'marie.gagnon@exemple.ca', telephone: '819 555-2345',
    type: 'Kayak', mobiliteReduite: true,
    note: 'Mon épaule ne me permet plus de soulever le kayak au-dessus de la taille.',
    numeroAttribue: '', dateDecision: '',
  },
  {
    id: 'demo-2', date: '2026-07-02T09:10:00.000Z', rue: 'Chemin du Lac', numero: 87,
    nom: 'John Tremblay', courriel: 'john.tremblay@exemple.ca', telephone: '',
    type: 'Planche (SUP)', mobiliteReduite: false, note: '',
    numeroAttribue: '', dateDecision: '',
  },
  {
    id: 'demo-3', date: '2026-06-05T16:00:00.000Z', rue: 'Rue des Érables', numero: 12,
    nom: 'Louise Bédard', courriel: 'louise.bedard@exemple.ca', telephone: '819 555-8765',
    type: 'Canoë', mobiliteReduite: false, note: '',
    numeroAttribue: 75, dateDecision: '2026-06-06T10:00:00.000Z',
  },
  {
    id: 'demo-4', date: '2026-05-14T11:45:00.000Z', rue: 'Rue du Pré', numero: 501,
    nom: 'Robert Fortin', courriel: 'robert.fortin@exemple.ca', telephone: '',
    type: 'Kayak', mobiliteReduite: false, note: 'Deuxième kayak pour ma conjointe.',
    numeroAttribue: '', dateDecision: '2026-05-15T09:30:00.000Z',
  },
];

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
      // Cas « Hors quota » (0019) — toutes ces lignes sont « non observé » :
      // un numéro avec ligne vide rend le MÊME statut qu'un numéro sans ligne,
      // la grille des Structures ne change donc pas. Trois dossiers, le tri se
      // voit en capture (dépassement, puis nombre, puis adresse) :
      // 501 Rue du Pré (sans ligne Membres) : 4 emplacements, quota 2 → 1er.
      { numero: 82, numeroAdresse: 501, rue: 'Rue du Pré', note: '', occupationObservee: '', dateObservation: '' },
      { numero: 83, numeroAdresse: 501, rue: 'Rue du Pré', note: '', occupationObservee: '', dateObservation: '' },
      { numero: 86, numeroAdresse: 501, rue: 'Rue du Pré', note: '', occupationObservee: '', dateObservation: '' },
      { numero: 88, numeroAdresse: 501, rue: 'Rue du Pré', note: '', occupationObservee: '', dateObservation: '' },
      // 87 Chemin du Lac (John, exception à 3) : 4 emplacements → 2e (dép. 1, 4 empl.).
      { numero: 91, numeroAdresse: 87, rue: 'Chemin du Lac', note: '', occupationObservee: '', dateObservation: '' },
      { numero: 92, numeroAdresse: 87, rue: 'Chemin du Lac', note: '', occupationObservee: '', dateObservation: '' },
      { numero: 93, numeroAdresse: 87, rue: 'Chemin du Lac', note: '', occupationObservee: '', dateObservation: '' },
      // 234 Rue du Pré (Marie) : 3e emplacement → dép. 1, 3 empl. — dernier.
      { numero: 85, numeroAdresse: 234, rue: 'Rue du Pré', note: '', occupationObservee: '', dateObservation: '' },
    ],
    // Contact courant par adresse (0010) : la carte-cas d'« À traiter » y
    // trouve nom, courriel et téléphone du membre attribué. `quotaAccorde`
    // (0019) : Louise Bédard porte une exception à 3 respectée (1 seul
    // emplacement — invisible) ; John Tremblay une exception à 3 DÉPASSÉE
    // (4 emplacements — cas hors quota malgré l'exception).
    membres: [
      { numeroAdresse: 12, rue: 'Rue des Érables', nom: 'Louise Bédard', courriel: 'louise.bedard@exemple.ca', telephone: '819 555-8765', quotaAccorde: 3 },
      { numeroAdresse: 234, rue: 'Rue du Pré', nom: 'Marie Gagnon', courriel: 'marie.gagnon@exemple.ca', telephone: '819 555-2345', quotaAccorde: '' },
      { numeroAdresse: 87, rue: 'Chemin du Lac', nom: 'John Tremblay', courriel: 'john.tremblay@exemple.ca', telephone: '', quotaAccorde: 3 },
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
      // Une note d'ADRESSE (0019) : keyée par la colonne adresse, numero vide —
      // le journal du cas hors quota de Marie la raconte.
      { date: '2026-06-15T09:00:00.000Z', action: 'note', numero: '', adresse: '234 Rue du Pré', demandeId: '', details: 'Convenu au téléphone : elle libère un des trois d\'ici la fin de l\'été. — Diane' },
      // La raison du refus d'une demande (0020) : keyée par demandeId, numero et
      // adresse vides — le dépliable de la demande refusée la raconte, sans
      // polluer l'historique d'un emplacement.
      { date: '2026-05-15T09:30:00.000Z', action: 'refus', numero: '', adresse: '', demandeId: 'demo-4', details: 'Un seul emplacement par embarcation, et l\'adresse a déjà atteint son quota de 2. — Diane' },
    ],
    demandes: DEMANDES_MOCK,
    gabarits: gabaritsEffectifs([]),
  },
  // Réponses aux écritures admin (les captures n'écrivent rien de réel).
  sauverStructure: { ok: true, structure: {} },
  observerEmplacement: { ok: true, observation: {} },
  observerLot: { ok: true, lot: { compte: 1 } },
  ajouterNote: { ok: true, note: {} },
  libererEmplacement: { ok: true, liberation: {} },
  deciderDemande: { ok: true, decision: {} },
  majContactDemande: { ok: true, contact: {} },
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

// Inventaire APRÈS une note d'ADRESSE sur le cas de Marie (0019) : le journal
// de la fiche d'adresse passe à 2 lignes, fiche toujours ouverte.
export const INVENTAIRE_APRES_NOTE_ADRESSE = structuredClone(REPONSES_MOCK.inventaire);
INVENTAIRE_APRES_NOTE_ADRESSE.journal.push({
  date: '2026-07-06T10:00:00.000Z',
  action: 'note',
  numero: '',
  adresse: '234 Rue du Pré',
  demandeId: '',
  details: 'Courriel envoyé pour demander lequel des trois libérer. — Jeremy',
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

// Section « Demandes » isolée (décision 0020) : registre vidé de tout le reste
// (emplacements, membres, journal) pour capturer un seul état de la section.
// Nouvelles seulement : la sous-section « Déjà décidées » reste masquée.
export const INVENTAIRE_DEMANDES_NOUVELLES = {
  ok: true, structures: [], emplacements: [], membres: [], journal: [],
  demandes: DEMANDES_MOCK.filter((d) => d.id === 'demo-1' || d.id === 'demo-2'),
};
// Décidées seulement : la file des nouvelles montre son état vide positif, les
// traitées s'empilent en dessous (une acceptée, une refusée).
export const INVENTAIRE_DEMANDES_DECIDEES = {
  ok: true, structures: [], emplacements: [], membres: [],
  journal: REPONSES_MOCK.inventaire.journal.filter((e) => e.action === 'refus'),
  demandes: DEMANDES_MOCK.filter((d) => d.id === 'demo-3' || d.id === 'demo-4'),
};

// Inventaire dédié à la fiche de demande (décision 0020), isolé du jeu par
// défaut pour ne pas perturber les autres captures. Trois structures nettes par
// type (Kayak → S01, Planche → S06, Canoë → S07 tout occupé donc sans place),
// et des demandes qui couvrent chaque état de la fiche.
function dispoFiche(numero) {
  return { numero, numeroAdresse: '', rue: '', note: '', occupationObservee: 'libre', dateObservation: '2026-06-20T12:00:00.000Z' };
}
function occupeFiche(numero) {
  return { numero, numeroAdresse: '', rue: '', note: '', occupationObservee: 'occupé', dateObservation: '2026-06-20T12:00:00.000Z' };
}
function attribFiche(numero, numeroAdresse, rue) {
  return { numero, numeroAdresse, rue, note: '', occupationObservee: 'occupé', dateObservation: '2026-06-20T12:00:00.000Z' };
}
function demandeFiche(surcharges) {
  return {
    date: '2026-07-01T10:00:00.000Z', telephone: '', mobiliteReduite: false, note: '',
    numeroAttribue: '', dateDecision: '', ...surcharges,
  };
}

export const INVENTAIRE_FICHE_DEMANDE = {
  ok: true,
  structures: [
    { id: 'S01', type: 'horizontal', embarcations: 'Kayak', saisie: 'niveaux', emplacements: '[ [10, 11], [12, 13] ]', notes: '' },
    { id: 'S06', type: 'vertical', embarcations: 'Planche (SUP)', saisie: 'colonnes', emplacements: '[ [40, 41] ]', notes: '' },
    { id: 'S07', type: 'horizontal', embarcations: 'Canoë', saisie: 'niveaux', emplacements: '[ [50, 51] ]', notes: '' },
  ],
  emplacements: [
    // S01 (Kayak) : tout Disponible — les suggestions d'une demande Kayak.
    dispoFiche(10), dispoFiche(11), dispoFiche(12), dispoFiche(13),
    // S06 (Planche) : Disponible aussi.
    dispoFiche(40), dispoFiche(41),
    // S07 (Canoë) : tout occupé sans attribution → aucune place à proposer.
    occupeFiche(50), occupeFiche(51),
    // 80 Rue du Pré : 2 attributions (hors grille) → au quota de 2.
    attribFiche(90, 80, 'Rue du Pré'), attribFiche(91, 80, 'Rue du Pré'),
  ],
  membres: [
    // 45 Rue du Pré : contact identique à la demande.
    { numeroAdresse: 45, rue: 'Rue du Pré', nom: 'Claire Dubois', courriel: 'claire.dubois@exemple.ca', telephone: '819 555-3210' },
    // 60 Rue du Pré : contact différent de la demande (nom et téléphone).
    { numeroAdresse: 60, rue: 'Rue du Pré', nom: 'Paul Roy', courriel: 'paul.roy@exemple.ca', telephone: '' },
    // 80 Rue du Pré : au quota, contact présent.
    { numeroAdresse: 80, rue: 'Rue du Pré', nom: 'Hélène Caron', courriel: 'helene.caron@exemple.ca', telephone: '819 555-7788' },
  ],
  journal: [],
  demandes: [
    // Suggestions Kayak, contact identique, sous quota, avec une autre demande
    // ouverte de la même adresse (fd-pmr) — plusieurs états d'un coup.
    demandeFiche({ id: 'fd-suggestions', numero: 45, rue: 'Rue du Pré', nom: 'Claire Dubois', courriel: 'claire.dubois@exemple.ca', telephone: '819 555-3210', type: 'Kayak' }),
    // Même adresse, mobilité réduite → tri des suggestions inversé.
    demandeFiche({ id: 'fd-pmr', numero: 45, rue: 'Rue du Pré', nom: 'Claire Dubois', courriel: 'claire.dubois@exemple.ca', telephone: '819 555-3210', type: 'Kayak', mobiliteReduite: true }),
    // Contact différent du membre courant → le diff et le bouton de mise à jour.
    demandeFiche({ id: 'fd-contact-diff', numero: 60, rue: 'Rue du Pré', nom: 'Paul Roy-Tremblay', courriel: 'paul.roy@exemple.ca', telephone: '819 555-0001', type: 'Kayak', note: 'Je viens de changer de numéro.' }),
    // Adresse inconnue de Membres → contact absent.
    demandeFiche({ id: 'fd-contact-absent', numero: 70, rue: 'Rue du Pré', nom: 'Sophie Nadeau', courriel: 'sophie.nadeau@exemple.ca', telephone: '819 555-4455', type: 'Kayak' }),
    // Adresse au quota → l'acceptation est bloquée.
    demandeFiche({ id: 'fd-quota', numero: 80, rue: 'Rue du Pré', nom: 'Hélène Caron', courriel: 'helene.caron@exemple.ca', telephone: '819 555-7788', type: 'Kayak' }),
    // Type Canoë : S07 est la seule structure compatible et n'a aucune place → vide.
    demandeFiche({ id: 'fd-vide', numero: 71, rue: 'Rue du Pré', nom: 'Marc Bélanger', courriel: 'marc.belanger@exemple.ca', telephone: '', type: 'Canoë' }),
  ],
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
  { nom: 'structures-connexion', page: 'structures.html', attendre: '#etat-connexion:not([hidden])' },
  { nom: 'structures-mdp-refuse', page: 'structures.html', etat: 'mdp-refuse', attendre: '#erreur-connexion:not([hidden])' },
  { nom: 'structures-chargement', page: 'structures.html', etat: 'chargement', attendre: '#etat-chargement:not([hidden])' },
  { nom: 'structures-liste', page: 'structures.html', etat: 'liste', attendre: '.carte-structure' },
  { nom: 'structures-liste-defilee', page: 'structures.html', etat: 'liste', attendre: '.carte-structure', defiler: '.grille-structure' },
  { nom: 'structures-liste-vide', page: 'structures.html', etat: 'liste-vide', attendre: '#etat-vide:not([hidden])' },
  // Fiche d'emplacement unifiée (décision 0024) : coquille à plat, un scénario
  // par statut. Un état SAIN se lit en ligne calme (statut-calme, teintée de la
  // gravité) ; un état à PROBLÈME porte un callout avec ses remèdes. `pleinVue` :
  // un drawer/dialog du top layer se rend mal en capture pleine page — viewport
  // seul.
  // À identifier : une anomalie (danger) — callout de sa gravité réelle, sans
  // remède (rien à faire d'ici que d'aller l'observer). Jamais moins saillant
  // que le warning « Attribué, libre » (design.md).
  { nom: 'structures-fiche-orphelin', page: 'structures.html', etat: 'liste',
    cliquer: '.cellule-structure[data-numero="76"]',
    attendre: '#fiche-statut[variant="danger"]', pleinVue: true },
  { nom: 'structures-fiche-conforme', page: 'structures.html', etat: 'liste',
    cliquer: '.cellule-structure[data-numero="74"]',
    attendre: '#fiche-statut-calme[data-variant="success"]', pleinVue: true },
  // Attribué, libre : le seul état où « Relancer » et « Libérer » ont une raison
  // — les remèdes vivent dans le callout warning du statut (0024).
  { nom: 'structures-fiche-attribue-libre', page: 'structures.html', etat: 'liste',
    cliquer: '.cellule-structure[data-numero="75"]',
    attendre: '#fiche-liberer:not([hidden])', pleinVue: true },
  { nom: 'structures-fiche-disponible', page: 'structures.html', etat: 'liste',
    cliquer: '.cellule-structure[data-numero="77"]',
    attendre: '#fiche-statut-calme[data-variant="brand"]', pleinVue: true },
  { nom: 'structures-fiche-pas-observe', page: 'structures.html', etat: 'liste',
    cliquer: '.cellule-structure[data-numero="90"]',
    attendre: '#fiche-statut-calme[data-variant="neutral"]', pleinVue: true },
  // Emplacement sain mais dont l'ADRESSE dépasse son quota (82 → 501 Rue du Pré,
  // 4 emplacements pour 2) : callout neutral « Adresse hors quota » portant
  // « Libérer », le statut propre de l'emplacement dit calmement dessous (0024).
  { nom: 'structures-fiche-hors-quota', page: 'structures.html', etat: 'liste',
    cliquer: '.cellule-structure[data-numero="82"]',
    attendre: '#fiche-statut[variant="neutral"]', pleinVue: true },
  // « Sur place » est une action : elle révèle le relevé Occupé/Libre replié.
  { nom: 'structures-fiche-sur-place', page: 'structures.html', etat: 'liste',
    cliquer: ['.cellule-structure[data-numero="74"]', '#fiche-sur-place'],
    attendre: '.bouton-occupation', pleinVue: true },
  // La légende explique ses termes au toucher (wa-popover ancré au jeton).
  // `presenceSeule` : c'est l'attribut [open] qui prouve l'ouverture — le host
  // wa-popover est « invisible » pour Playwright même ouvert.
  { nom: 'structures-legende-explication', page: 'structures.html', etat: 'liste',
    cliquer: '#legende-conflit', attendre: 'wa-popover[for="legende-conflit"][open]',
    presenceSeule: true, pleinVue: true },
  // Échec d'observation : « Sur place » révèle le relevé, puis « libre » échoue —
  // l'erreur vit dans le panneau du relevé.
  { nom: 'structures-fiche-erreur', page: 'structures.html', etat: 'liste',
    cliquer: ['.cellule-structure[data-numero="76"]', '#fiche-sur-place',
      '.bouton-occupation[data-occupation="libre"]'],
    attendre: '#fiche-erreur-observer:not([hidden])', pleinVue: true,
    reponses: { observerEmplacement: { ok: false, erreur: 'Échec simulé pour les captures.' } } },
  // Observation réussie : la fiche RESTE ouverte (0018) — le statut de 76
  // bascule d'« À identifier » (danger) à « Disponible » (brand, ligne calme)
  // sous les yeux, la grille derrière se recolore. `reponsesApres` : l'inventaire
  // rechargé après le geste, pas celui du premier chargement.
  { nom: 'structures-observation-succes', page: 'structures.html', etat: 'liste',
    cliquer: ['.cellule-structure[data-numero="76"]', '#fiche-sur-place',
      '.bouton-occupation[data-occupation="libre"]'],
    attendre: '#fiche-statut-calme[data-variant="brand"]', pleinVue: true,
    reponsesApres: { inventaire: INVENTAIRE_APRES_OBSERVATION } },
  // Note ajoutée depuis la grille : coquille à plat (journal toujours visible),
  // fiche ouverte, journal enrichi (6e ligne pour 75), champ vidé.
  { nom: 'structures-fiche-note-succes', page: 'structures.html', etat: 'liste',
    ouvrir: '.cellule-structure[data-numero="75"]',
    remplir: { selecteur: '#fiche-champ-note textarea', valeur: 'Parlé au membre : il vide l\'emplacement d\'ici la fin du mois. — Jeremy' },
    cliquer: '#fiche-ajouter-note',
    attendre: '#fiche-journal .ligne-journal:nth-of-type(6)', pleinVue: true,
    reponsesApres: { inventaire: INVENTAIRE_APRES_NOTE } },
  // La confirmation avant de libérer : aucun tap accidentel ne retire une
  // adresse. `presenceSeule` : host wa-dialog « invisible » pour Playwright.
  { nom: 'structures-fiche-confirmation-liberation', page: 'structures.html', etat: 'liste',
    cliquer: ['.cellule-structure[data-numero="75"]', '#fiche-liberer'],
    attendre: '#fiche-dialogue-liberer[open]', presenceSeule: true, pleinVue: true },
  // Libération depuis la grille : confirmation, puis fiche TOUJOURS ouverte —
  // le statut bascule à « Disponible » (ligne calme) et la libération se lit au
  // journal.
  { nom: 'structures-fiche-liberation-succes', page: 'structures.html', etat: 'liste',
    cliquer: ['.cellule-structure[data-numero="75"]', '#fiche-liberer',
      '#fiche-dialogue-liberer-confirmer'],
    attendre: '#fiche-statut-calme[data-variant="brand"]', pleinVue: true,
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
  // Tournée (décisions 0013, 0021) : le hook ?etat=tournee ouvre le recouvrement
  // plein écran de S01. Écran vierge : cases pas-faites (puits pointillés,
  // fantômes estompés / cases sans fantôme), « Terminer » inactif, compteur à
  // zéro. `pleinVue` : le recouvrement est fixed inset:0 — capture au viewport.
  { nom: 'structures-tournee', page: 'structures.html', etat: 'tournee',
    attendre: '.bouton-cellule-tournee', pleinVue: true },
  // Relevés mixtes au nouvel encodage « Élévation » : 74 basculé occupé → libre
  // (carte claire surélevée), 75 basculé libre → occupé (carte pleine), 76
  // confirmé occupé (1 tap), 90 jamais observé → occupé, 91 sans fantôme →
  // libre — à côté des cases pas-faites encore creuses (empreinte identique).
  { nom: 'structures-tournee-relevee', page: 'structures.html', etat: 'tournee',
    cliquer: ['.bouton-cellule-tournee[data-numero="74"]', '.bouton-cellule-tournee[data-numero="74"]',
      '.bouton-cellule-tournee[data-numero="75"]', '.bouton-cellule-tournee[data-numero="75"]',
      '.bouton-cellule-tournee[data-numero="76"]',
      '.bouton-cellule-tournee[data-numero="90"]',
      '.bouton-cellule-tournee[data-numero="91"]', '.bouton-cellule-tournee[data-numero="91"]'],
    attendre: '.bouton-cellule-tournee.releve-libre[data-numero="91"]', pleinVue: true },
  // L'aide en popover flottant (décision 0021) : le « ? » ouvre la mécanique du
  // cycle de tap (confirmer → basculer → 3ᵉ annule) par-dessus la grille.
  { nom: 'structures-tournee-aide', page: 'structures.html', etat: 'tournee',
    cliquer: '#aide-tournee', attendre: 'wa-popover[for="aide-tournee"][open]',
    presenceSeule: true, pleinVue: true },
  // Garde-fou de sortie (décision 0021) : le ✕ avec des relevés non envoyés
  // demande confirmation — un effleurement ne détruit pas une demi-tournée.
  { nom: 'structures-tournee-garde-fou', page: 'structures.html', etat: 'tournee',
    cliquer: ['.bouton-cellule-tournee[data-numero="74"]', '#quitter-tournee'],
    attendre: '#dialogue-quitter-tournee[open]', presenceSeule: true, pleinVue: true },
  // Fin partielle : l'avertissement chiffre les non-relevés et laisse
  // terminer quand même ou continuer (portée flexible, 0013).
  { nom: 'structures-tournee-avertissement', page: 'structures.html', etat: 'tournee',
    cliquer: ['.bouton-cellule-tournee[data-numero="74"]', '#terminer-tournee'],
    attendre: '#dialogue-terminer-confirmer', pleinVue: true },
  { nom: 'structures-tournee-erreur', page: 'structures.html', etat: 'tournee',
    cliquer: ['.bouton-cellule-tournee[data-numero="74"]', '#terminer-tournee',
      '#dialogue-terminer-confirmer'],
    attendre: '#tournee-erreur:not([hidden])', pleinVue: true,
    reponses: { observerLot: { ok: false, erreur: 'Échec simulé pour les captures.' } } },
  // Fin repensée (décision 0021) : « Terminer » envoie le lot, referme le
  // recouvrement et revient à la liste, calée sur la carte de S01 qui porte la
  // confirmation persistante libellée (« Tournée enregistrée · N relevés,
  // M changements »). L'inventaire mocké est déjà « après » (76 libre) : un tap
  // confirme le fantôme de 76, la grille de la carte se lit recalculée.
  { nom: 'structures-tournee-succes', page: 'structures.html', etat: 'tournee',
    cliquer: ['.bouton-cellule-tournee[data-numero="76"]', '#terminer-tournee',
      '#dialogue-terminer-confirmer'],
    attendre: '.confirmation-tournee:not([hidden])',
    reponses: { inventaire: INVENTAIRE_APRES_OBSERVATION } },
  { nom: 'structures-erreur', page: 'structures.html', etat: 'erreur', attendre: '#etat-erreur:not([hidden])' },
  // Page « À traiter » (décision 0014) : registre scannable + fiche
  // d'emplacement partagée (0018), ouverte sur l'onglet Traiter.
  { nom: 'a-traiter-connexion', page: 'a-traiter.html', attendre: '#etat-connexion:not([hidden])' },
  { nom: 'a-traiter-mdp-refuse', page: 'a-traiter.html', etat: 'mdp-refuse', attendre: '#erreur-connexion:not([hidden])' },
  { nom: 'a-traiter-chargement', page: 'a-traiter.html', etat: 'chargement', attendre: '#etat-chargement:not([hidden])' },
  // Registre peuplé : 75 avant 84 (plus anciennement libre d'abord — tri visible).
  { nom: 'a-traiter-liste', page: 'a-traiter.html', etat: 'liste', attendre: '.rangee-cas' },
  { nom: 'a-traiter-liste-vide', page: 'a-traiter.html', etat: 'liste-vide', attendre: '#etat-liste:not([hidden])' },
  // Section « Demandes » (décision 0020) : nouvelles seules (« Déjà décidées »
  // masquée), décidées seules (nouvelles vides + traitées empilées), et une
  // décidée dépliée (acceptée = emplacement attribué ; refusée = raison au
  // Journal). L'état « mélange » est couvert par a-traiter-liste.
  { nom: 'a-traiter-demandes-nouvelles', page: 'a-traiter.html', etat: 'liste',
    attendre: '.rangee-demande', reponses: { inventaire: INVENTAIRE_DEMANDES_NOUVELLES } },
  { nom: 'a-traiter-demandes-decidees', page: 'a-traiter.html', etat: 'liste',
    attendre: '.demande-decidee', reponses: { inventaire: INVENTAIRE_DEMANDES_DECIDEES } },
  { nom: 'a-traiter-demande-acceptee-depliee', page: 'a-traiter.html', etat: 'liste',
    cliquer: '.demande-decidee[data-id="demo-3"] .demande-resume',
    attendre: '.demande-decidee[data-id="demo-3"][open]', presenceSeule: true, pleinVue: true,
    reponses: { inventaire: INVENTAIRE_DEMANDES_DECIDEES } },
  { nom: 'a-traiter-demande-refusee-depliee', page: 'a-traiter.html', etat: 'liste',
    cliquer: '.demande-decidee[data-id="demo-4"] .demande-resume',
    attendre: '.demande-decidee[data-id="demo-4"][open]', presenceSeule: true, pleinVue: true,
    reponses: { inventaire: INVENTAIRE_DEMANDES_DECIDEES } },
  // Toucher une demande ouvre la fiche d'ADRESSE de son adresse, où se fait le
  // traitement (décision 0024, amende 0020 — l'écran de demande autonome a été
  // retiré). demo-1 (234 Rue du Pré) est aussi hors quota : la fiche montre le
  // callout « Hors quota » ET le bloc « Demande en cours » qui traite la demande
  // inline (suggestions, contact, refus).
  { nom: 'a-traiter-demande-vers-fiche-adresse', page: 'a-traiter.html', etat: 'liste',
    cliquer: '.rangee-demande[data-id="demo-1"]',
    attendre: '#fiche-adresse-demande:not([hidden])', pleinVue: true },
  // Section « Hors quota » (0019) : la fiche d'ADRESSE — fait, membre,
  // emplacements avec statut, journal du cas, note. Cas standard (Marie,
  // 3 emplacements, quota 2, une note d'adresse au journal).
  { nom: 'a-traiter-fiche-adresse', page: 'a-traiter.html', etat: 'liste',
    cliquer: '.rangee-cas[data-cle="234 rue du pré"]',
    attendre: '.rangee-emplacement', pleinVue: true },
  // Exception accordée DÉPASSÉE (John, 4 emplacements, exception à 3).
  { nom: 'a-traiter-fiche-adresse-exception', page: 'a-traiter.html', etat: 'liste',
    cliquer: '.rangee-cas[data-cle="87 chemin du lac"]',
    attendre: '.rangee-emplacement', pleinVue: true },
  // Adresse sans ligne Membres : la fiche le dit calmement (0002).
  { nom: 'a-traiter-fiche-adresse-sans-membre', page: 'a-traiter.html', etat: 'liste',
    cliquer: '.rangee-cas[data-cle="501 rue du pré"]',
    attendre: '#fiche-adresse-membre-absent:not([hidden])', pleinVue: true },
  // Note d'adresse ajoutée : fiche TOUJOURS ouverte, journal du cas enrichi
  // (2e ligne), champ vidé.
  { nom: 'a-traiter-note-adresse-succes', page: 'a-traiter.html', etat: 'liste',
    ouvrir: '.rangee-cas[data-cle="234 rue du pré"]',
    remplir: { selecteur: '#fiche-adresse-champ-note textarea',
      valeur: 'Courriel envoyé pour demander lequel des trois libérer. — Jeremy' },
    cliquer: '#fiche-adresse-ajouter-note',
    attendre: '#fiche-adresse-journal .ligne-journal:nth-of-type(2)', pleinVue: true,
    reponsesApres: { inventaire: INVENTAIRE_APRES_NOTE_ADRESSE } },
  // Échec d'écriture : le texte saisi est conservé, l'erreur vit dans la fiche.
  { nom: 'a-traiter-note-adresse-erreur', page: 'a-traiter.html', etat: 'liste',
    ouvrir: '.rangee-cas[data-cle="234 rue du pré"]',
    remplir: { selecteur: '#fiche-adresse-champ-note textarea', valeur: 'Message laissé au membre. — Diane' },
    cliquer: '#fiche-adresse-ajouter-note',
    attendre: '#fiche-adresse-erreur:not([hidden])', pleinVue: true,
    reponses: { ajouterNote: { ok: false, erreur: 'Échec simulé pour les captures.' } } },
  // Navigation fiche d'adresse → fiche d'emplacement : JAMAIS deux drawers —
  // la fiche d'emplacement porte le bouton retour vers le dossier (0019).
  { nom: 'a-traiter-fiche-adresse-vers-emplacement', page: 'a-traiter.html', etat: 'liste',
    cliquer: ['.rangee-cas[data-cle="234 rue du pré"]', '.rangee-emplacement[data-numero="84"]'],
    attendre: '#fiche-retour-zone:not([hidden])', pleinVue: true },
  // … et retour : la fiche d'adresse se rouvre, re-rendue (Marie est hors quota
  // → le callout « Hors quota » reparaît).
  { nom: 'a-traiter-retour-fiche-adresse', page: 'a-traiter.html', etat: 'liste',
    cliquer: ['.rangee-cas[data-cle="234 rue du pré"]', '.rangee-emplacement[data-numero="84"]',
      '#fiche-retour'],
    attendre: '#fiche-adresse-statut:not([hidden])', pleinVue: true },
  // Fiche d'adresse GÉNÉRALISÉE « dans le quota » (0024) : ouverte directement
  // via le hook ?adresse= (la fiche s'ouvre pour n'importe quelle adresse, pas
  // seulement hors quota). Louise, 12 Rue des Érables : 1 emplacement pour une
  // exception à 3 → AUCUN callout, le calme signale l'absence de problème.
  { nom: 'a-traiter-fiche-adresse-dans-quota', page: 'a-traiter.html', etat: 'liste',
    adresse: '12 rue des érables',
    attendre: '.rangee-emplacement', pleinVue: true },
  // Fiche d'adresse avec une DEMANDE en cours (0024) : le bloc « Demande en
  // cours » traite la demande INLINE. Inventaire dédié (INVENTAIRE_FICHE_DEMANDE) :
  // 60 Rue du Pré a un membre (Paul Roy) et une demande au contact DIFFÉRENT
  // (Paul Roy-Tremblay, nouveau téléphone) → un seul « Mettre à jour le contact »,
  // les suggestions Kayak, le niveau montré avec le numéro.
  { nom: 'a-traiter-fiche-adresse-demande-diff', page: 'a-traiter.html', etat: 'liste',
    adresse: '60 rue du pré',
    attendre: '#fiche-adresse-demande-maj-zone:not([hidden])', pleinVue: true,
    reponses: { inventaire: INVENTAIRE_FICHE_DEMANDE } },
  // Adresse DEMANDE-SEULE (0024) : 70 Rue du Pré n'a ni membre ni emplacement —
  // le contact vient de la demande (« nouveau contact — enregistré à
  // l'acceptation »), pas de bloc Membre, pas de liste d'emplacements, pas de
  // journal (rien où attacher une note tant que l'adresse n'existe pas).
  { nom: 'a-traiter-fiche-adresse-demande-seule', page: 'a-traiter.html', etat: 'liste',
    adresse: '70 rue du pré',
    attendre: '#fiche-adresse-demande-contact-nouveau:not([hidden])', pleinVue: true,
    reponses: { inventaire: INVENTAIRE_FICHE_DEMANDE } },
  // La fiche unifiée d'un cas attribué-libre : callout warning portant les
  // remèdes (Relancer, Libérer), membre, relevé replié, journal (0024). La barre
  // utilitaire montre « Fiche d'adresse » (l'emplacement est attribué) — MIROIR
  // de 0019, issue 06.
  { nom: 'a-traiter-fiche', page: 'a-traiter.html', etat: 'liste',
    cliquer: '.rangee-cas[data-numero="75"]',
    attendre: '#fiche-liberer:not([hidden])', pleinVue: true },
  // Navigation fiche d'emplacement → fiche d'adresse (MIROIR de 0019, issue 06) :
  // « Fiche d'adresse » REMPLACE le drawer par le dossier de l'adresse attribuée
  // (jamais deux empilés), qui porte le bouton retour « Retour à Emplacement 75 ».
  // 75 = 12 Rue des Érables (Louise, exception à 3, 1 seul emplacement) : dossier
  // « dans le quota » ouvert depuis un emplacement — aucun callout.
  { nom: 'a-traiter-fiche-vers-adresse', page: 'a-traiter.html', etat: 'liste',
    cliquer: ['.rangee-cas[data-numero="75"]', '#fiche-vers-adresse'],
    attendre: '#fiche-adresse-retour-zone:not([hidden])', pleinVue: true },
  // … et retour : la fiche d'emplacement se rouvre (75 attribué-libre → le
  // callout warning et ses remèdes reparaissent), re-rendue depuis l'état frais.
  { nom: 'a-traiter-retour-fiche-emplacement', page: 'a-traiter.html', etat: 'liste',
    cliquer: ['.rangee-cas[data-numero="75"]', '#fiche-vers-adresse', '#fiche-adresse-retour'],
    attendre: '#fiche-liberer:not([hidden])', pleinVue: true },
  // « Relancer le membre » ouvre l'aperçu du courriel pré-rédigé (objet + corps
  // + « rien n'est envoyé automatiquement ») — jamais d'envoi auto (0003/0024).
  // `presenceSeule` : host wa-dialog « invisible » pour Playwright même ouvert.
  { nom: 'a-traiter-apercu-courriel', page: 'a-traiter.html', etat: 'liste',
    cliquer: ['.rangee-cas[data-numero="75"]', '#fiche-ecrire'],
    attendre: '#apercu-courriel[open]', presenceSeule: true, pleinVue: true },
  // La fiche d'un « À identifier » : statut calme (danger), pas de membre,
  // journal + note seulement.
  { nom: 'a-traiter-fiche-a-identifier', page: 'a-traiter.html', etat: 'liste',
    cliquer: '.rangee-cas[data-numero="76"]',
    attendre: '#fiche-journal .ligne-journal', pleinVue: true },
  // « Sur place » (action de la barre utilitaire) révèle le relevé Occupé/Libre
  // pour vérifier un cas sur le terrain, page À traiter ouverte (0024).
  { nom: 'a-traiter-fiche-sur-place', page: 'a-traiter.html', etat: 'liste',
    cliquer: ['.rangee-cas[data-numero="75"]', '#fiche-sur-place'],
    attendre: '.bouton-occupation', pleinVue: true },
  // Note ajoutée : fiche TOUJOURS ouverte (0018), journal enrichi (6e ligne
  // pour 75), champ vidé — le registre derrière comptera 2 notes.
  { nom: 'a-traiter-note-succes', page: 'a-traiter.html', etat: 'liste',
    ouvrir: '.rangee-cas[data-numero="75"]',
    remplir: { selecteur: '#fiche-champ-note textarea',
      valeur: 'Parlé au membre : il vide l’emplacement d’ici la fin du mois. — Jeremy' },
    cliquer: '#fiche-ajouter-note',
    attendre: '#fiche-journal .ligne-journal:nth-of-type(6)', pleinVue: true,
    reponsesApres: { inventaire: INVENTAIRE_APRES_NOTE } },
  // Échec d'écriture : le texte saisi est conservé, l'erreur vit dans la fiche.
  { nom: 'a-traiter-note-erreur', page: 'a-traiter.html', etat: 'liste',
    ouvrir: '.rangee-cas[data-numero="75"]',
    remplir: { selecteur: '#fiche-champ-note textarea', valeur: 'Message laissé au membre. — Diane' },
    cliquer: '#fiche-ajouter-note',
    attendre: '#fiche-erreur-traiter:not([hidden])', pleinVue: true,
    reponses: { ajouterNote: { ok: false, erreur: 'Échec simulé pour les captures.' } } },
  // Le dialogue de confirmation : aucun tap accidentel ne retire une adresse.
  { nom: 'a-traiter-confirmation-liberation', page: 'a-traiter.html', etat: 'liste',
    cliquer: ['.rangee-cas[data-numero="75"]', '#fiche-liberer'],
    attendre: '#fiche-dialogue-liberer[open]', presenceSeule: true, pleinVue: true },
  // Libération : fiche TOUJOURS ouverte, statut basculé à « Disponible » (ligne
  // calme) — au rechargement (reponsesApres), 75 a quitté le registre derrière.
  { nom: 'a-traiter-liberation-succes', page: 'a-traiter.html', etat: 'liste',
    cliquer: ['.rangee-cas[data-numero="75"]', '#fiche-liberer', '#fiche-dialogue-liberer-confirmer'],
    attendre: '#fiche-statut-calme[data-variant="brand"]', pleinVue: true,
    reponsesApres: { inventaire: INVENTAIRE_APRES_LIBERATION } },
  // Observation qui referme le cas : « Sur place » révèle le relevé, « libre »
  // fait basculer le statut ET sortir la rangée derrière.
  { nom: 'a-traiter-observation-succes', page: 'a-traiter.html', etat: 'liste',
    cliquer: ['.rangee-cas[data-numero="76"]', '#fiche-sur-place',
      '.bouton-occupation[data-occupation="libre"]'],
    attendre: '#fiche-statut-calme[data-variant="brand"]', pleinVue: true,
    reponsesApres: { inventaire: INVENTAIRE_APRES_OBSERVATION } },
  { nom: 'a-traiter-erreur', page: 'a-traiter.html', etat: 'erreur', attendre: '#etat-erreur:not([hidden])' },
  // Page « Adresses » (décision 0023) : recherche à autocomplétion menant à la
  // fiche d'adresse. Tous les états pilotables par ?etat= ; `recherche` passe
  // par un vrai fetch (mocké), `q` préremplit le champ (résultats / aucun).
  { nom: 'adresses-connexion', page: 'adresses.html', attendre: '#etat-connexion:not([hidden])' },
  { nom: 'adresses-mdp-refuse', page: 'adresses.html', etat: 'mdp-refuse', attendre: '#erreur-connexion:not([hidden])' },
  { nom: 'adresses-chargement', page: 'adresses.html', etat: 'chargement', attendre: '#etat-chargement:not([hidden])' },
  // Repos : rien n'est tapé — l'invitation calme et centrée à chercher.
  { nom: 'adresses-repos', page: 'adresses.html', etat: 'recherche', attendre: '#etat-repos:not([hidden])' },
  // Résultats : « pré » retrouve les adresses de la Rue du Pré — une avec membre
  // (Marie Gagnon, présélectionnée), une sans (501, « Contact non inscrit »).
  { nom: 'adresses-resultats', page: 'adresses.html', etat: 'recherche', q: 'pré', attendre: '.suggestion' },
  // Aucun résultat : le message dit ce qui a été cherché et quoi faire ensuite.
  { nom: 'adresses-aucun', page: 'adresses.html', etat: 'recherche', q: 'zzz', attendre: '#etat-aucun:not([hidden])' },
  { nom: 'adresses-erreur', page: 'adresses.html', etat: 'erreur', attendre: '#etat-erreur:not([hidden])' },
  // PROTOTYPE jetable (ticket 03, carte gabarits-courriels) : trois pistes
  // d'édition du modèle de courriel, pilotées par ?etat= — à retirer avec la page.
  { nom: 'gabarits-prototype-jetons', page: 'gabarits-prototype.html', etat: 'jetons', attendre: '#variante-jetons:not([hidden]) .val-exemple' },
  { nom: 'gabarits-prototype-jetons-erreur', page: 'gabarits-prototype.html', etat: 'jetons-erreur', attendre: '#erreur-jetons:not([hidden])' },
  { nom: 'gabarits-prototype-blocs', page: 'gabarits-prototype.html', etat: 'blocs', attendre: '#variante-blocs:not([hidden]) .bloc-verrouille' },
  { nom: 'gabarits-prototype-puces', page: 'gabarits-prototype.html', etat: 'puces', attendre: '#variante-puces:not([hidden]) .puce' },
  { nom: 'gabarits-prototype-puces-manque', page: 'gabarits-prototype.html', etat: 'puces-manque', attendre: '#manque-puces:not([hidden])' },
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
  const params = [];
  if (scenario.etat) params.push('etat=' + scenario.etat);
  // `adresse` : ouvre directement la fiche d'adresse généralisée (0024) — la
  // page Adresses (à venir) sera le vrai point d'entrée ; ici, un hook de
  // capture (0006) pour montrer un dossier « dans le quota » avant elle.
  if (scenario.adresse) params.push('adresse=' + encodeURIComponent(scenario.adresse));
  // `q` : préremplit le champ de recherche de la page Adresses (0023) — les
  // états « résultats » et « aucun-résultat » se capturent sans frappe simulée.
  if (scenario.q) params.push('q=' + encodeURIComponent(scenario.q));
  return params.length ? url + '?' + params.join('&') : url;
}
