# Cycle de vie d'un emplacement — occupation, statut, membre attribué (T4/T5)

Statut : T-A et T-B livrées et approuvées ui-critic (2026-07-05) ; T-C à faire ; T-D (historique/cycle de vie) et l'éditeur de Membres = manches ultérieures nommées.
Décisions cadres : 0002 (Sheet éditable à la main, Journal append-only), 0004 (Web Awesome sans build, présentation côté client), 0008 (auth comité), 0009 (grille source de vérité), 0010 (onglet Membres, colonnes d'Emplacements), 0011 (statut dérivé + observations journalisées), 0012 (couche Sheet pilotée par les en-têtes).
Vocabulaire : CONTEXT.md — [[Statut d'un emplacement]], [[Occupation observée]], [[Membre]], Attribution.

## User stories

- **Membre du comité, sur la plage (mobile).** Je vois la grille des structures colorée par **statut** ; les deux problèmes sautent aux yeux (embarcation orpheline, place attribuée mais libre). Je touche un emplacement : un panneau montre le statut, le **membre attribué** (nom/tél/courriel) ou « non attribué », la note, et de gros boutons **Occupé / Libre / Inconnu**. Je marque l'occupation ; c'est journalisé.
- **Membre du comité, au bureau.** Je repère les places « peut-être à libérer » et « orphelines » pour agir (relancer, identifier une embarcation). *(La frise d'historique, « libre depuis », les rappels et la réattribution arrivent en T-D.)*

## Modèle de données (source de vérité : la Sheet)

- **Emplacements** — `numero, numeroAdresse, rue, note, occupationObservee, dateObservation` (décision 0010). Attribution = (numeroAdresse + rue) sur la ligne ; occupation courante sur la ligne.
- **Membres** (nouveau) — `numeroAdresse, rue, nom, courriel, telephone` ; 1 contact par adresse, clé (numeroAdresse + rue) ; saisi à la main cette manche (0010).
- **Journal** (existant, 0002) — `date, action, numero, demandeId, details`. Nouveaux `action` : `observation` (details = occupé/libre/inconnu). Attributions/rappels/notes viendront s'y ajouter en T-D.
- **Statut** — jamais stocké : `statutEmplacement(attributionPrésente, occupationObservee)` (0011).

Toutes les écritures passent par les **en-têtes réels** de l'onglet (0012) : réordonner les colonnes à la main reste sûr. Affichage d'une adresse : toujours « numeroAdresse rue ».

## Phase 1 — ETC (auto-répondu)

**Changements futurs probables :**
1. *Manche T-D* — frise d'historique par emplacement + « libre depuis » + rappels + réattribution. Touche : la lecture du Journal (déjà écrit dès T-A) et le panneau (nouvelle section). Le modèle ne bouge pas → journaliser tôt (0011) rend T-D additif, pas rétroactif.
2. *Éditeur de Membres + MAJ contact depuis une demande acceptée.* Touche : nouvelles écritures Membres (isolées) ; la jointure adresse→membre est déjà une fonction pure réutilisable → l'éditeur la relit sans copier de logique.
3. *Attribution via l'app (au lieu de saisie manuelle).* Touche : une écriture d'attribution + un événement Journal. T5 lit l'attribution depuis la ligne quel qu'en soit l'auteur → aucun couplage à « saisi à la main ».
4. *Plusieurs contacts par adresse (0010 revisit) ou plus d'états d'occupation.* Touche : la clé de la jointure / l'ensemble des états — tous deux à foyer unique.

**Connaissance créée, foyer unique :**
- `statutEmplacement` + l'ensemble des états d'occupation → `grille.js` (déjà partagé serveur/client/tests, copié vers `site/`), car le client en a besoin pour colorer la grille et le panneau, le serveur pour valider une observation.
- La jointure `membrePourAdresse(emplacement, membres)` → **client seulement** (présentation, 0004) : helper dans `structures.html`, pas de copie serveur (le serveur renvoie les Membres bruts).
- La préparation d'écriture d'observation (cellule + événement Journal, create-if-missing 0009) → `apps-script/observation.js` (serveur + tests node, non copié client).
- La construction de ligne pilotée par en-têtes (0012) → `tableur.js` (`lignesDepuisObjets` existe déjà, ordre-agnostique) ; le manque était que les *appelants* passaient la constante au lieu de l'en-tête réel → un helper `ligneSelonEntetes_(feuille, objet)`.

**Couplage :** la grille (structures.html) porte désormais 3 rôles — affichage, occupation (T4), infos membre (T5). Risque de cellule-dieu → séparer : `statutEmplacement` (pur) colore ; le panneau (un composant) porte l'action et le détail ; l'observation passe par une action API dédiée. Stable ne dépend pas de volatil : `statutEmplacement` et la jointure ne connaissent ni le DOM ni l'API.

## Phase 2 — Forks

**Résolu par le modèle (0011) :** l'interaction « un geste sur la cellule » — une cellule ne peut pas être un simple bouton bascule puisqu'elle doit porter un statut à 4 couleurs et ouvrir le membre + l'occupation + (plus tard) l'historique. **Tap → panneau d'emplacement** (bottom sheet), qui réunit statut, membre, boutons d'occupation, note. Pas de mode, pas d'appui long (aîné-compatible).

**Auto-résolus (convention/ETC) :**
- Jointure adresse→membre **côté client** (0004, précédent grille.js) — le serveur renvoie structures + emplacements + membres bruts.
- Observation : le client envoie la **valeur** choisie (occupé/libre/inconnu) ; le serveur la valide contre l'ensemble partagé (grille.js), écrit la cellule (en-têtes réels, 0012) + `dateObservation` (timestamp serveur), append un événement Journal, crée la ligne si absente (0009).
- Statut **dérivé**, jamais stocké (0011).

Aucun fork résiduel pour l'utilisateur.

## Exigence → tranche

| # | Exigence | Tranche |
| --- | --- | --- |
| 1 | Schéma correct : Emplacements (0010) + onglet Membres, `setup()` crée/aligne sans écraser l'ordre | T-A |
| 2 | Écritures pilotées par les en-têtes (réordonnancement manuel sûr, 0012) | T-A |
| 3 | Statut dérivé (fonction pure, 6 états) | T-B |
| 4 | Grille colorée par statut ; les 2 problèmes sautent aux yeux | T-B |
| 5 | Tap → panneau d'emplacement (statut + note + boutons occupation) | T-B |
| 6 | Observation en un geste : écrit occupation + dateObservation + événement Journal | T-B |
| 7 | Panneau montre le membre attribué (jointure), adresse « numeroAdresse rue », états vides | T-C |
| 8 | Frise d'historique par emplacement, « libre depuis », rappels, réattribution | T-D (ultérieure) |
| 9 | Éditeur de Membres + MAJ contact depuis une demande acceptée | manche séparée |

Rien d'« invisible car reporté » : 8 et 9 sont nommées ; la **journalisation** qui les alimente démarre dès T-B (0011).

## Tranches (tracer bullets — mode tracer, TDD /pragmatic:build)

**T-A — Couche Sheet : schéma + écritures par en-têtes. ✅ Livrée.** `ENTETES_EMPLACEMENTS` → `['numero','numeroAdresse','rue','note','occupationObservee','dateObservation']` ; `ONGLET_MEMBRES`/`ENTETES_MEMBRES = ['numeroAdresse','rue','nom','courriel','telephone']` ; `setup()` crée Membres et **garantit les en-têtes manquants sans réordonner** via `entetesGaranties` (0012). Écritures pilotées par en-têtes : helpers `entetesDe_`, `appendObjet_`, `majLigneParCle_`, `journaliser_` (colle Apps Script mince) au-dessus des fonctions pures `entetesGaranties` + `fusionnerLigne` (TDD, testées sous en-têtes réordonnés) et `lignesDepuisObjets` ; `ajouterDemande`/`sauverStructure`/Journal refactorés. `structures.js` : nouvelle ligne d'emplacement = `{numero}` seul (le reste se remplit en vide, 0012). 55 tests verts, captures console propre. Verif Apps Script (setup/write en réel) = au déploiement de Jeremy — SpreadsheetApp n'est pas exécutable en local (convention : sheets.js/Code.js non testés en node).

**T-B — Occupation journalisée + statut sur la grille + panneau. ✅ Livrée, approuvée ui-critic (3 passes).** `statutEmplacement` + `ETATS_OCCUPATION` dans `grille.js` (TDD, 6 cases + tolérance données manuelles) ; `apps-script/observation.js` (validation aux frontières, create-if-missing, événement Journal) ; action `observerEmplacement` (auth 0008, en-têtes 0012, date serveur). Client : cellules = `<td>` neutre + vrai `<button data-numero>` (sémantique table préservée), colorées par statut (problèmes en fill-normal gras ; conflit de données = pointillé, langage visuel distinct), légende 7 entrées avec problèmes en tête, tap → panneau wa-dialog (callout statut + adresse « numeroAdresse rue », état courant en texte ET coche, gros boutons 3 colonnes égales / pile mobile, erreur sous les boutons + scrollIntoView, `pleinVue` pour les captures du top layer). Rechargement frais + focus carte après observation (contournement du vol de focus du close() natif). 60 tests, 60 captures (6 panneaux de statut + erreur + succès cohérent), flux piloté au navigateur. Décision libellé : badge de carte « Données à vérifier » ≠ statut « À vérifier ». **Simplification post-livraison (Jeremy, 2026-07-05)** : « inconnu » retiré des observations (on voit une embarcation ou pas — l'absence d'observation n'est pas une observation) → 2 boutons (Occupé/Libre), 5 statuts au lieu de 6 (« Pas encore observé » couvre les deux côtés de l'attribution), libellés qui nomment les deux axes (« Attribué et occupé », « Occupé sans attribution »…) — glossaire à jour. **Légende explicable (Jeremy, 2026-07-05, approuvée ui-critic)** : chaque entrée de légende est un bouton-jeton (pastille + libellé + compte) qui ouvre un wa-popover d'explication en français simple au toucher ; explications et comptes viennent de `grille.js` (`statutEmplacement.explication`, `compterStatuts` — testés) ; ARIA complet (aria-expanded, aria-describedby, unités en visually-hidden).

**T-C — Membre attribué dans le panneau.** `lireInventaire` renvoie aussi `membres` ; action `inventaire` les inclut ; mocks `membres`. Client : jointure `membrePourAdresse` (adresse « numeroAdresse rue »), section membre du panneau (nom/tél/courriel, liens `tel:`/`mailto:`), états vides : « non attribué » et « attribué, contact non renseigné » (jointure sans plantage, 0002). Captures des trois cas. ✅ `npm run verify` + ui-critic.

**T-D (manche ultérieure) — Historique & cycle de vie.** Frise par emplacement depuis le Journal, « libre depuis X », suivi des rappels (humain-validé 0003), workflow de réattribution. Démarre une fois l'historique accumulé et après l'éditeur de Membres.

## Migration manuelle de la Sheet (avec T-A, faite par Jeremy)

1. **Emplacements** : garder `numero` et `occupationObservee` déjà saisis. Renommer/retirer les en-têtes vers `numero, numeroAdresse, rue, note, occupationObservee, dateObservation` ; supprimer `nom`, `numeroInfere`, `sourceObservation` s'ils traînent. `setup()` ajoute `dateObservation` si absent, sans toucher à l'ordre. Les colonnes peuvent être dans n'importe quel ordre (0012) tant que les en-têtes sont exacts.
2. **Membres** : `setup()` crée l'onglet avec ses en-têtes. Le comité y saisit les contacts à la main (0010) — vide au départ, T-C affiche « contact non renseigné » tant qu'une adresse n'y est pas.

## Risques assumés

- Le Journal grossit (une ligne par observation) ; « libre depuis » scanne par numéro — négligeable à ~180 places (0011).
- État courant sur la ligne + événement Journal = petite redondance assumée (0002/0011).
- Écritures pilotées par en-têtes : un en-tête mal orthographié à la main casse le mappage de sa colonne — signalé à la lecture, jamais silencieux (0012).
- Le panneau devient le point de convergence T4/T5/T-D : le garder découplé (statut pur, jointure pure, action API isolée) pour que T-D soit additif.
