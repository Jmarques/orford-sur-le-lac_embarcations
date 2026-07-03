# 0004 — Frontend vanilla sans étape de build, suggestions calculées côté client

Date: 2026-07-03
Status: Accepted

## Context
Le site doit rester maintenable des années par quiconque reprend le flambeau, se déployer par simple commit, et les règles de suggestion d'emplacements (type d'embarcation, niveau bas pour mobilité réduite, même structure que l'adresse) vont évoluer au fil de l'usage réel.

## Decision
Le frontend est en HTML/CSS/JS vanilla sans framework ni étape de build, et la logique de suggestion d'emplacements s'exécute côté client dans la page admin (qui charge déjà tous les emplacements) — la faire évoluer ne demande qu'un commit sur Pages, sans redéployer l'Apps Script.

## Alternatives rejected
- Framework (React/Vue/Svelte) — étape de build, dépendances à entretenir, sur-outillage pour deux pages et un formulaire.
- Suggestions côté serveur (Apps Script) — chaque ajustement de règle exigerait un `clasp deploy` ; le serveur resterait pourtant l'endroit correct si un second consommateur en avait besoin.

## Trade-offs accepted
- Pas de composants réutilisables ni de typage : la discipline de structure du JS repose sur la revue.
- La page admin télécharge l'inventaire complet des emplacements (trivial à ~360 lignes, à surveiller si ça grossit).
- Les règles de suggestion ne sont pas réutilisables par un autre client (script, audit) sans duplication.

## Revisit when
- Un deuxième consommateur a besoin des suggestions (ex. l'email au comité qui en proposerait, ou l'audit photo) — les déplacer côté serveur.
- Le JS vanilla dépasse ce qu'une personne peut relire d'un trait (~1000 lignes de logique).
