# 0017 — Revue visuelle incrémentale : diff pixel contre la baseline de captures committée

Date: 2026-07-06
Status: Accepted <!-- amende la boucle visuelle de 0006 -->

## Context
La boucle visuelle de 0006 produit déjà 68 captures (34 scénarios × 2 viewports) alors que le projet débute — le volume croît avec chaque page et chaque état. Générer reste bon marché et linéaire ; c'est l'**analyse** qui snowball : un reviewer (humain ou subagent) devant 68 images n'en regarde vraiment aucune, et le coût en tokens croît avec la taille du site, pas avec la taille du changement. Une carte statique « fichier modifié → scénarios » ne tient pas ici : `theme.css` et les tokens `--wa-*` sont partagés par toutes les pages, toute approximation sur- ou sous-couvre en silence.

## Decision
Les captures `screenshots/` sont committées dans git (la baseline = HEAD) ; `npm run screenshots` génère toujours tout, compare chaque capture fraîche à la baseline (pixelmatch, seuil antialiasing) et ne signale que le delta — modifiées, nouvelles, obsolètes — avec artefacts de revue dans `screenshots/.diff/` (gitignoré, lisible par un subagent sans shell) ; la revue visuelle ne porte que sur ce delta, et un changement intentionnel se committe avec ses PNG.

Les artefacts de revue sont **découpés pour l'API vision** (qui réduit toute image à ~1568 px de grand côté — une pleine page mobile y est illisible) : crops avant/après/différence centrés sur les zones changées (marge de contexte, pleine page si la refonte couvre presque tout), tuiles d'au plus ~1500 px pour une capture sans baseline comparable. Le rapport de fin de run liste les chemins des artefacts par capture.

## Détails qui font tenir le mécanisme
- **Déterminisme d'abord** : `reducedMotion: 'reduce'` (toutes les animations du thème sont sous `prefers-reduced-motion`) + attente `document.fonts.ready`. Sans cela le bruit tue la confiance dans le delta.
- **Souris garée, animations finies, fontes chargées** (leçon des premiers faux positifs) : après un clic d'ouverture, Chromium applique `:hover` de façon non déterministe à l'élément apparu sous le curseur (le lien courriel de la fiche basculait pointillé/plein d'un run à l'autre) — le curseur est garé en (0,0) avant la capture ; la capture attend la fin de toute animation finie (queue de transition d'ouverture) ; et elle attend `document.fonts.status === 'loaded'` — `fonts.ready` peut être déjà résolue quand une graisse vue pour la première fois dans le drawer commence seulement à charger (gras synthétique capturé au lieu de la vraie face).
- **Génération parallèle** : la file scénario × viewport est épuisée par quelques pages concurrentes sur le même navigateur — le temps de run croît avec le site mais reste sous la minute ; le gate console, attribué par page, n'y perd rien.
- **Git reste propre** : une capture visuellement identique mais aux octets différents (frame de spinner sous le seuil) est ramenée aux octets de la baseline.
- **Port éphémère + surveillance de mort du serveur** : le port fixe 8907 se faisait voler par des `http-server` orphelins d'autres sessions (`kill` du wrapper npx ≠ kill du serveur) — on capturait alors le site d'un AUTRE checkout sans s'en apercevoir. Port attribué par l'OS, échec bruyant si le serveur meurt.
- **`--page <nom>` pour la boucle interne** (fichier ou préfixe de scénario) ; `verify` et la revue restent sur la génération complète — le gate console error/pageerror ne vaut que s'il couvre tout.

## Alternatives rejected
- Carte de dépendances fichier → scénarios — sur- ou sous-approxime dès qu'un fichier est partagé (theme.css), et c'est un artefact de plus qui ment quand on oublie de le maintenir.
- Générer moins de captures — c'est l'analyse qui coûte, pas la génération ; réduire la couverture affaiblit le gate console pour rien.
- Service externe (Percy, Chromatic) — coût et compte externes pour un besoin couvert par git + pixelmatch en local.
- Baseline hors git (dossier de référence non versionné) — perd la synchronisation baseline ↔ code, et le diff de PR cesse d'être la surface de revue.

## Trade-offs accepted
- ~70 PNG versionnés (quelques Mo) et de l'historique binaire à chaque changement visuel intentionnel.
- Un changement visuel global (token de couleur) modifie toutes les captures : la revue redevient large ce jour-là — c'est fidèle à la réalité du changement.
- Le seuil pixelmatch (0.1) est un compromis : trop bas, bruit ; trop haut, régressions d'un pixel invisibles.

## Revisit when
- Le dépôt devient lourd au point de gêner le clone — envisager Git LFS pour `screenshots/`.
- Le delta signale régulièrement des faux positifs (bruit de rendu) — durcir le déterminisme (polices locales, gel d'horloge) avant de monter le seuil.
- Un changement global de thème devient fréquent — ajouter un mode « accepter tout le delta » outillé.
