# 0021 — Tournée en plein écran épuré (paysage), retour à la liste, cellule par élévation

Date: 2026-07-07
Status: Accepted

## Context
La tournée de 0013 vivait comme une `<section>` de `structures.html` : elle héritait du header animé (bande-lac), d'un pavé d'instructions, puis d'un résumé et d'un enchaînement « Structure suivante → ». Sur le terrain elle est **toujours** au téléphone, tenue à bout de bras ; les structures sont de longues bandes horizontales — le **paysage** fait voir bien plus de cases, mais réduit la hauteur du viewport (~375 px) au point qu'aucun chrome ne tient. Deux défauts d'encodage de cellule sont aussi apparus : « libre relevé » (crème) et « non observé » (crème) se distinguaient à peine, et l'ajout du ✓ / de la puce « a changé » **décalait la grille sous le doigt**. Prototype `/prototype` (jetable) à l'appui pour trancher l'encodage sur du rendu, pas en paroles.

## Decision
La tournée devient un **recouvrement plein écran épuré** (`position: fixed; inset: 0` dans `structures.html`, header masqué par CSS — pas d'API Fullscreen, indisponible sur iPhone) : **barre haut fine** (`✕` · nom de structure · pastille compteur · `?` d'aide · icône rotation discret) + **grille à empreinte fixe** + **barre bas épinglée « Terminer la tournée »** (désactivée à 0 relevé) ; l'instruction se réduit à une **ancre d'une ligne** dont le « … » ouvre un **popover flottant** portant la mécanique du cycle (le 3ᵉ tap = **annulation** est conservé) ; « Terminer » **envoie le lot et referme le recouvrement, retour direct à la liste** (plus de résumé, plus de « Structure suivante »), défile+focus la carte relevée qui porte une **confirmation persistante libellée** ; la cellule suit le **schéma « Élévation »** — pas-fait = puits creux pointillé qui recule, fait = carte pleine surélevée (occupé rempli vert plein `brand-fill-loud` / libre carte claire teintée vert d'eau pâle `brand-fill-quiet` bordée `brand-border-loud`, ✓ en coin réservé), « a changé » sorti de la cellule vivante. *(Précision d'implémentation : le « libre relevé » a d'abord été posé sur `surface-raised` (crème) — la revue sur rendu l'a jugé encore trop proche du crème « non observé », le défaut même que ce record corrige ; la teinte pâle `brand-fill-quiet` creuse l'écart sans jamais peser comme le vert plein de l'occupé.)*

## Alternatives rejected
- **Tout replier l'aide derrière le `?`** — cache une interaction non-découvrable (cycle de tap) à un public aîné qui ne relève que ~2×/an ; l'ancre visible garde l'essentiel rassurant (« ce qu'on ne touche pas ne change pas »).
- **Forcer/verrouiller le paysage** — impossible sur le web iPhone (`screen.orientation.lock` exige le plein écran natif absent) ; le paysage reste un bonus récompensé, jamais exigé (bloquer serait hostile à un aîné qui tient son téléphone en portrait).
- **Page dédiée `tournee.html`** — re-bootstrap de l'auth, de la config et de la grille pour zéro gain ; le recouvrement CSS réutilise tout le câblage.
- **`requestFullscreen`** (masquer aussi la barre du navigateur) — inutilisable sur iPhone.
- **Garder le résumé + « Structure suivante → »** (0013) — l'ordre de déplacement est physique (structure voisine qu'on voit), pas un « suivant » logique ; la liste est le point de décision naturel, et la confirmation y vit mieux, dans le contexte de la carte.
- **Retirer le 3ᵉ tap** — c'est le seul moyen d'annuler un relevé ; sur grille dense à bout de bras, un tap accidentel deviendrait une fausse observation (le mal que 0013 combat) ; gratuit visuellement une fois la mécanique dans le popover.
- **Cellule schéma B (deux remplissages) / C (icône dominante)** — B : le libre gris lit « désactivé » et le fond pas-fait ne recule pas ; C : fait/pas-fait repose sur l'opacité, l'indice qui s'effondre au grand soleil. A gagne l'axe dominant fait/pas-fait par la forme (pointillé plat vs surélevé plein), robuste soleil/daltonisme.

## Trade-offs accepted
- La **barre du navigateur** reste visible (pas de plein écran natif) : on récupère tout le header animé, pas ses ~50 px.
- Deux bandes fines (haut + bas) mangent un peu de la hauteur précieuse en paysage — assumé pour garder « Terminer » à portée de pouce et la sortie conventionnelle.
- Le pointillé/ombre du schéma A peut s'affadir en plein soleil (à surveiller en revue) ; le mot d'état + le ✓ + le remplissage restent des indices non-couleur.
- La mécanique fine du cycle est en popover (un tap de plus pour la voir) — mitigé par l'ancre permanente.
- Empreinte de cellule strictement fixe : le ✓ occupe un coin réservé même invisible (léger « trou » visuel sur les cases non relevées).

## Revisit when
- Le terrain montre que l'ancre ne suffit pas (des membres bloqués sans l'instruction complète dépliée) — remonter du contenu hors du popover.
- Le schéma A s'avère illisible en conditions de plein soleil réelles — renforcer le contraste occupé/libre ou l'axe fait/pas-fait.
- Un besoin de verrouiller le paysage ou de masquer la barre du navigateur émerge — rouvrir la piste PWA installée (autre projet).
- Les modèles de vision deviennent fiables (cf. 0013) — pré-remplir le fantôme, jamais l'observation.
