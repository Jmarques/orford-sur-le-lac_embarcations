# 0016 — Interfaces silencieuses : enlever les redondances, jamais l'information utile

Date: 2026-07-06
Status: Accepted

## Context
Après la direction esthétique 0015, les pages restaient « bruyantes » : la page Structures répétait son titre (h1 du header + h2 du corps), et chaque carte redisait en texte ce que sa grille montrait déjà (« Horizontale — 3 niveaux », « 8 par niveau · 24 au total »). Jeremy a demandé d'enlever ces redondances et a posé le principe comme direction durable, confirmée par une délibération d'expert UX (public aîné : moins d'éléments = moins de charge, mais chaque fait utile doit garder exactement un foyer).

## Decision
Toute interface du site est « silencieuse » : une information n'est montrée qu'à un seul endroit, sous sa forme la plus économe — jamais répétée en texte quand une représentation la porte déjà (le type et la géométrie d'une structure se lisent dans sa grille ; un total survit en pastille libellée « 24 emplacements », jamais en nombre nu) ; un titre de corps qui répète le header devient invisible (`wa-visually-hidden`, conservé pour focus et lecteurs d'écran) ; une consigne d'action n'est dite qu'une fois par page.

## Alternatives rejected
- Garder les métadonnées textuelles « au cas où » — c'est le bruit de départ ; la grille porte déjà type et niveaux.
- Nombre nu en pastille (« 24 ») — ambigu pour un public aîné (identifiant ? alertes ?) ; le libellé fait partie de la pastille.
- Déplacer le compte de structures dans le header — un chiffre ni actionnable ni surprenant sur ~5 structures ; supprimé.

## Trade-offs accepted
- Pour les structures verticales, « debout » n'est plus visible nulle part dans la grille (pas d'étiquettes de niveau) : la pastille le porte (« 13 emplacements debout ») — un fait déplacé, pas supprimé.
- L'aperçu d'édition garde volontairement le format détaillé « 8 par niveau · 24 au total » (il valide la saisie par crochets) : deux formulations coexistent, affichage vs édition.
- Ce qui est procédural ou rassurant n'est PAS du bruit : instructions de tournée, « rien n'est enregistré tant que… », indices de défilement conditionnels, mot d'état dans chaque cellule (la couleur ne porte jamais seule) restent verbatim.

## Revisit when
- Le nombre de structures dépasse ce qu'un écran montre (un compte redevient une information de navigation).
- Un membre du comité cherche une information supprimée (signe qu'un fait n'avait pas de foyer de repli).
- Une nouvelle page accumule trois familles de pastilles ou plus — le vocabulaire visuel des pastilles devra alors être re-décidé.
