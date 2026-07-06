# 02 — Page « À traiter » : cartes-cas, interventions et libération

Status: ready-for-human — implémenté (commit 9aa875e), à valider sur le vrai site

## Parent

`.scratch/a-traiter/PRD.md` — PRD « Page À traiter : files de cas problèmes, interventions et libération » (décision 0014).

## What to build

La page « bureau » complète — première tranche visible, avec son contrat de données entier (intervention + libération) dès cette tranche. Elle exige le mot de passe du comité (0008, même session que les autres pages) et liste les cas dérivés du statut en sections empilées (pas de tabs — 0014) avec badge de compte libellé par section : « Attribué, libre » (les plus anciennement libres d'abord) puis « À identifier ». Une ligne d'aide explique que les cas sortent de la file automatiquement dès qu'une tournée observe l'état qui les referme — il n'y a pas de bouton « clore ». Chaque section vide affiche un état calme et positif (« Aucun emplacement à traiter »).

La **carte-cas** est commune aux deux sections : en-tête (numéro, structure), signal temporel en faits observés (libre depuis le début de la série, nombre d'observations, dernière date — jamais de mois calendaires), membre si attribué (nom, adresse « numeroAdresse rue », téléphone et courriel en liens actifs `tel:`/`mailto:`), dernières interventions du Journal visibles directement sur la carte, champ « Ajouter une intervention » en texte libre (affichage anti-XSS : texte, jamais HTML ; signature libre dans le texte pour la traçabilité malgré le mot de passe partagé), et l'action propre au cas. Un cas dont l'excuse est acceptée reste dans la file, son intervention visible : le statut reste factuel, la note explique (0011/0014).

Deux actions structurées seulement :

- **Relance par `mailto:` pré-rempli** (numéro d'emplacement, libre depuis) que le membre du comité édite dans son propre client mail avant envoi — aucun courriel ne part de l'app (0003).
- **« Libérer l'emplacement »** derrière un dialogue de confirmation explicite. Côté serveur : nouvelle action qui vide l'adresse de la ligne par en-têtes réels (0012) et appende un événement Journal dédié ; après libération, l'emplacement devient « Disponible » (ou « À identifier » s'il est observé occupé) et la grille le reflète immédiatement.

Côté serveur, un nouveau module de traitement calqué sur le module d'observation (validation aux frontières, colle Apps Script mince) porte les deux écritures : l'intervention en texte libre appendée au Journal avec une valeur d'`action` dédiée, rattachée au `numero` ; et la libération. Auth en corps POST (0008). Les données illisibles (Sheet éditée à la main, 0002) n'empêchent jamais la page de s'afficher.

Public aîné : cartes aérées, français simple et rassurant (la page parle de membres de la communauté, pas de « fautifs »), cibles larges. Copy exacte : « À traiter », « Ajouter une intervention », « Libérer l'emplacement » — jamais « rappel », « suivi » (objet), « conflit ». Processus UX obligatoire du CLAUDE.md (brief avant tout markup, principles/composition du skill webawesome-design, tokens `theme.css` seulement, polish checklist, revue ui-critic sur captures fraîches).

## Acceptance criteria

- [x] La page exige le mot de passe du comité ; sections empilées « Attribué, libre » puis « À identifier », chacune avec un badge de compte libellé (0016 : jamais de nombre nu).
- [x] Les cas « Attribué, libre » sont affichés du plus anciennement libre au plus récent ; chaque carte montre le début de série, le nombre d'observations et la date de la dernière.
- [x] Carte-cas : numéro + structure, membre attribué avec `tel:` et `mailto:` actifs, dernières interventions visibles, champ « Ajouter une intervention », action propre au cas.
- [x] Le `mailto:` de relance est pré-rempli (numéro d'emplacement, libre depuis) et s'ouvre dans le client mail — rien n'est envoyé par l'app.
- [x] « Libérer l'emplacement » ouvre un dialogue de confirmation explicite ; aucun tap unique ne peut libérer.
- [x] Action serveur intervention : texte libre journalisé (`action` dédiée, rattachée au `numero`) ; intervention vide refusée — tests node (prior art `tests/observation.test.mjs`).
- [x] Action serveur libération : adresse vidée par en-têtes réels, événement Journal dédié ; cas couverts en tests node : libération d'un emplacement déjà libre, en-têtes réordonnés (0012), événement Journal correct.
- [x] Une intervention ajoutée apparaît sur la carte sans masquer ni changer le statut ; l'affichage est en texte brut (anti-XSS).
- [x] Ligne d'aide sur la sortie automatique des cas présente ; états vides calmes et positifs par section.
- [x] Les données illisibles (inventaire ou Journal) n'empêchent jamais l'affichage de la page.
- [x] Captures mockées via `?etat=` : files vides, files peuplées (tri visible), carte avec interventions, dialogue de confirmation de libération, succès et erreur d'écriture — desktop et mobile ; console error/warning + pageerror font échouer la boucle ; `npm run verify` vert.
- [x] Flux complet piloté au navigateur avant livraison ; revue UI sur le delta de captures (0017) passée, corrections appliquées.

## Blocked by

- `01-derivations-a-traiter-et-journal-en-lecture.md`

## Comments

- 2026-07-06 : refonte après test terrain de Jeremy (~25 cas) — les cartes-cas dépliées deviennent un registre de rangées compactes + fiche wa-dialog (voir la révision en tête du brief) ; « intervention » devient « note » au journal (glossaire mis à jour). Captures et scénarios refaits ; les critères d'acceptation restent couverts sous ces nouveaux termes et cette nouvelle forme.
