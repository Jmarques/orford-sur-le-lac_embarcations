# 01 — Cellule « Élévation » (empreinte fixe)

Status: done — commit 2be7fbd

## Parent

`.scratch/tournee-epure/PRD.md` — PRD « Tournée en plein écran épuré » (décision 0021). Prototype de référence : `tmp/prototype-cellule-tournee.html` (schéma « Élévation » retenu).

## What to build

Ré-encoder la cellule de l'écran de tournée selon le schéma « Élévation » de 0021, sur l'écran de tournée **actuel** (encore en page — le plein écran vient en 02). Chaque case a une **empreinte strictement fixe** : le ✓ occupe un coin réservé même invisible, aucun élément ajouté ne pousse jamais la case ni sa rangée.

L'axe visuel dominant devient **fait / pas-fait** : pas-fait (non observé + fantôme) = case **creuse/recessée** à bordure **pointillée**, fantôme estompé (icône faible) ; fait = **carte pleine surélevée** avec ✓ et mot en gras — occupé = remplissage `brand-fill-loud`, libre = carte claire à bordure `brand-border-loud`, nettement distincte du pas-fait. Le glyphe « libre » est un **cercle contour** (place vide), occupé une embarcation. Le mot d'état et l'icône restent toujours présents (couleur jamais seule, 0016). La puce **« a changé » est retirée de la cellule vivante** (source de reflow) ; la fonction pure `aChangeTournee` est conservée (elle servira au bilan de la carte, slice 04).

Suivre le processus UX obligatoire (brief + principles/composition + `docs/design.md` avant markup ; polish checklist + revue ui-critic après). Variables visuelles en tokens `--wa-*` dans `theme.css` (0004).

## Acceptance criteria

- [ ] Les 5 états (non observé, fantôme libre, fantôme occupé, relevé libre, relevé occupé) se rendent avec une **empreinte identique** ; taper une case à travers tout le cycle ne change **ni sa largeur ni sa hauteur** ni celle de sa rangée (zéro reflow).
- [ ] « libre relevé » est **nettement distinct** de « non observé » (fini les deux crèmes quasi identiques) — vérifié à l'œil sur capture, y compris réduite.
- [ ] Pas-fait = creux pointillé qui recule ; fait = carte surélevée + ✓ ; occupé rempli / libre carte claire bordée ; mot + icône toujours visibles.
- [ ] Glyphe « libre » = cercle **contour** (pas un disque plein) ; occupé = embarcation.
- [ ] Puce « a changé » **absente** de la cellule ; `aChangeTournee` toujours présent et testé.
- [ ] Captures mockées mises à jour pour le nouvel encodage (desktop + mobile) ; console propre ; `npm run verify` vert.
- [ ] Revue UI sur le **delta** de captures (artefacts `screenshots/.diff/`, décision 0017) : « fait/pas-fait lisible d'un coup d'œil », non-générique. PNG committés avec le code.

## Blocked by

None - can start immediately.
