# osl_embarcations

Gestion des emplacements d'embarcation — Orford sur le Lac. Site statique (`site/`) + Google Apps Script (`apps-script/`).

## Outillage (obligatoire — zéro prompt de permission)
- **Commandes nues, jamais composées** : `npm run verify` / `npm test` / `npm run screenshots` s'exécutent tels quels — sans `| grep`, sans `&&`, sans `2>&1`. Leur sortie est déjà conçue pour être lue directement (`verify` = copie-grille + tests en reporter dot + captures). Une commande composée ne matche plus l'allowlist et interrompt Jeremy.
- Tout besoin récurrent devient un npm script (décision 0006) + une entrée dans `.claude/settings.json` **dans le même commit**.
- Scripts jetables (vérification pilotée au navigateur…) : dans `tmp/` du projet, lancés `node tmp/x.mjs`, nettoyés `rm -f tmp/x.mjs` — ces patterns sont pré-approuvés. Jamais depuis un autre répertoire.
- Fichiers : outils Write/Edit uniquement — jamais `cat`/`echo`/heredoc.
- **Les subagents n'ont pas de shell quand ils n'en ont pas besoin** : un subagent de revue UI reçoit Read/Glob/Grep seulement (les consignes ne suffisent pas — seul le retrait de l'outil garantit zéro prompt). Toujours lancer `npm run screenshots` (ou `verify`) AVANT de l'invoquer, et lui dire que les captures sont fraîches.
- **Revue visuelle = le delta seulement** (décision 0017) : `screenshots/` est committé — c'est la baseline. `npm run screenshots` compare à HEAD et liste les captures modifiées/nouvelles (avant/différence dans `screenshots/.diff/`, gitignoré). Ne faire revoir QUE ces captures-là ; « aucune différence » = pas de revue visuelle. Changement intentionnel → committer les PNG avec le code. Boucle interne sur une page : `npm run screenshots -- --page structures` (verify reste complet).
- Pour zoomer une capture soi-même : `sips` nu (allowlisté), jamais précédé de `cd` ni suivi de `&&`.

## UX/UI (obligatoire pour toute page ou section)
1. **Avant tout markup** : écrire un design brief (audience, ton, hiérarchie, états vide/chargement/erreur/succès) et lire `principles.md` + `composition.md` du skill webawesome-design.
2. Web Awesome partout ; variables visuelles uniquement dans `site/theme.css` (tokens `--wa-*`) — décision 0004.
3. **Après** : passer la polish checklist de composition.md, puis revue critique par un subagent en lecture seule sur un rendu (`npm run screenshots` produit tous les états dans `screenshots/` et liste le delta vs baseline — donner au subagent ces captures-là, avec les avant/différence de `screenshots/.diff/`), pas seulement sur le code. Une page « conforme mais générique » est un échec.
4. Public : majoritairement aîné — typographie généreuse, cibles larges, langage simple et rassurant.
5. **Textes visibles par l'utilisateur** : tout nom d'entité (comité, structures, rôles…) vient de CONTEXT.md. Terme absent du glossaire → demander à Jeremy ou passer par `/domain-modeling` ; ne jamais inventer un nom d'organisation ou de concept dans l'UI.

## Couverture des exigences
- Chaque PRD/plan (`/to-prd`, `/to-issues`) inclut une table exigence → tranche (rien ne doit être « invisible parce que reporté »).
- Un écran visible par l'utilisateur embarque le contrat de données complet de son formulaire dès sa première tranche.
- Un besoin de données ≠ un écran : ancrer toute proposition d'écran dans une user story (acteur + mode d'accès).

## Workflows (skills mattpocock)
- Intention floue → `/grill-me` (ou `/grill-with-docs` pour mettre à jour les docs de domaine en même temps).
- Planifier → `/to-prd` puis `/to-issues` ; construire → `/implement` ou `/tdd` (test-first) ; gate → `/code-review`.
- Bug ou régression → `/diagnosing-bugs` ; question de design ouverte → `/prototype` ou `/design-an-interface`.
- Vocabulaire et décisions → `/domain-modeling` : CONTEXT.md est le glossaire canonique ; les décisions vivent dans `docs/decisions/` — lire INDEX.md avant de proposer un design, vérifier le « Revisit when » d'un record avant de re-décider ce qu'il couvre.
- Code marqué PROTOTYPE : jetable — jamais l'étendre ni le promouvoir sans tests.

## Agent skills

### Issue tracker

Issues et PRD en markdown local sous `.scratch/<feature>/` (pas de PR comme surface de demande). See `docs/agents/issue-tracker.md`.

### Triage labels

Les cinq labels canoniques par défaut (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Mono-contexte : `CONTEXT.md` à la racine, décisions dans `docs/decisions/` (INDEX.md d'abord). See `docs/agents/domain.md`.
