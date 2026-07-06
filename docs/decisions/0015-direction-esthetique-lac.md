# 0015 — Direction esthétique « Le lac au petit matin » (eau animée WebGL)

Date: 2026-07-05
Status: Accepted

## Context
Le site avait le look Web Awesome stock (palette default, brand cyan, aucune typographie propre) — « conforme mais générique ». Un kitchen-sink jetable (`site/prototype-cachet.html`, skill /prototype) a comparé trois directions complètes sur le contenu réel : « Le lac au petit matin », « Le club nautique, 1927 » et « Les toits d'Orford » (couleurs du logo). Jeremy a retenu le lac, enrichi des enseignements des deux autres et de deux revues critiques par subagent.

## Decision
La direction visuelle du site est « Le lac au petit matin » : Fraunces (titres) + Nunito Sans (corps) + le wordmark script doré du logo ; palette verts d'eau/sable définie par des tokens `--wa-*` concrets dans `theme.css` (brand, surfaces, texte, neutres et sémantiques succès/avertissement/danger re-thématisés) ; formes « galets » (radius ×1.5, boutons pilule, cartes sans bordure grise avec ligne d'eau au sommet, liseré sable, fond un demi-cran plus clair que la page) ; et une bande d'identité animée « sous l'eau » — un fragment shader WebGL (`site/eau.js`) : colonne d'eau, rayons de soleil, caustiques, remous au pointeur — avec dégradé CSS en fallback sans WebGL et image fixe en `prefers-reduced-motion`. Les couleurs et réglages de la scène sont des tokens `--osl-eau-*` lus depuis `theme.css` (décision 0004 respectée).

## Alternatives rejected
- « Le club nautique, 1927 » (marine/crème/laiton, Cormorant + Jost) — la plus forte identité en capture statique, mais esthétique fondée sur le pâle et le fin, à contre-courant du public aîné ; et moins « Orford ».
- « Les toits d'Orford » (brun/sauge/orange du logo) — chaleureuse et légitime (le logo), mais tendance « mignonne/kitsch » pour un outil de comité ; son meilleur atout (le wordmark script du logo) est repris par le lac.
- Rester sur Web Awesome stock mieux combiné — aucun cachet ; c'est le problème de départ.

## Trade-offs accepted
- Un module JS graphique (`site/eau.js`) à maintenir en plus du CSS ; les navigateurs sans WebGL voient un simple dégradé.
- La capture d'écran d'un canvas WebGL déclenche l'avertissement Chromium « GPU stall due to ReadPixels » : motif toléré explicitement dans `CONSOLE_IGNOREE` (bruit de la mesure, pas de la page).
- Polices Google Fonts (Fraunces, Nunito Sans, Yellowtail) : dépendance CDN supplémentaire, même profil de risque que le CDN Web Awesome (0004).
- L'animation consomme un peu de GPU (résolution plafonnée à 1.5× DPR, contexte low-power).

## Revisit when
- Le comité ou des membres trouvent l'animation distrayante ou coûteuse sur leurs appareils — la scène fixe (frame unique) devient alors le défaut.
- Google Fonts devient un problème (vie privée, disponibilité) — auto-héberger les fontes.
- Une identité graphique officielle de la communauté (au-delà du logo) émerge et contredit la palette.
