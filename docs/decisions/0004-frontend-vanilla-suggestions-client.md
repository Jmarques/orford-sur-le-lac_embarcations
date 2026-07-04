# 0004 — Frontend vanilla + Web Awesome sans étape de build, suggestions calculées côté client

Date: 2026-07-03 (raffinée le 2026-07-03 : Web Awesome imposé pour toute l'UI)
Status: Accepted

## Context
Le site doit rester maintenable des années par quiconque reprend le flambeau, se déployer par simple commit, offrir une UI soignée et facile à re-designer globalement, et les règles de suggestion d'emplacements (type d'embarcation, niveau bas pour mobilité réduite, même structure que l'adresse) vont évoluer au fil de l'usage réel.

## Decision
Le frontend est en HTML/JS vanilla sans framework ni étape de build ; toute l'UI utilise les web components Web Awesome (chargés par CDN, version épinglée) et toutes les variables visuelles vivent dans `site/theme.css` sous forme de tokens `--wa-*` plus les classes de thème sur `<html>` — jamais de couleur/espacement/taille en dur dans les pages ; la logique de suggestion d'emplacements s'exécute côté client dans la page admin (qui charge déjà tous les emplacements) — la faire évoluer ne demande qu'un commit sur Pages, sans redéployer l'Apps Script.

## Alternatives rejected
- Framework (React/Vue/Svelte) — étape de build, dépendances à entretenir, sur-outillage pour deux pages et un formulaire.
- CSS artisanal sans bibliothèque de composants — chaque page réinventerait champs/boutons/messages et changer le design exigerait de retoucher chaque page.
- Suggestions côté serveur (Apps Script) — chaque ajustement de règle exigerait un `clasp deploy` ; le serveur resterait pourtant l'endroit correct si un second consommateur en avait besoin.

## Trade-offs accepted
- Dépendance au CDN Web Awesome : site dégradé si le CDN est indisponible ; version épinglée à mettre à jour manuellement.
- L'UI requiert JavaScript activé (web components).
- Pas de composants maison ni de typage : la discipline de structure du JS repose sur la revue.
- La page admin télécharge l'inventaire complet des emplacements (trivial à ~360 lignes, à surveiller si ça grossit).
- Les règles de suggestion ne sont pas réutilisables par un autre client (script, audit) sans duplication.

## Revisit when
- Un deuxième consommateur a besoin des suggestions (ex. l'email au comité qui en proposerait, ou l'audit photo) — les déplacer côté serveur.
- Le JS vanilla dépasse ce qu'une personne peut relire d'un trait (~1000 lignes de logique).
