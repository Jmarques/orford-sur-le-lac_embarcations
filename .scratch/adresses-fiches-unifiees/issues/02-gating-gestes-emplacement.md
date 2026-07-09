# 02 — Gating resserré des gestes d'un emplacement

Status: ready-for-agent

## Parent
`.scratch/adresses-fiches-unifiees/PRD.md`

## What to build
Resserrer la dérivation des gestes d'un emplacement pour que les **remèdes ne s'affichent que face à une raison** (amende 0018). « Écrire au membre » (relancer) n'apparaît plus que lorsque l'emplacement est **Attribué, libre** ; « Libérer » n'apparaît que lorsque l'emplacement est Attribué-libre **ou** que son adresse est **[[Hors quota]]**. Fin de l'irrégularité « Écrire » / « Libérer » sur un emplacement **En ordre**. Logique pure, testée au seam des exports ; la fiche existante reflète immédiatement le changement.

## Acceptance criteria
- [ ] La dérivation des gestes renvoie « écrire » seulement pour le statut Attribué-libre (avec courriel connu).
- [ ] Elle renvoie « libérer » seulement si l'emplacement est Attribué-libre OU si son adresse dépasse son quota.
- [ ] Un emplacement En ordre / Disponible / Non observé n'offre ni « Écrire » ni « Libérer ».
- [ ] Tests unitaires au seam des exports couvrant chaque cas (En ordre, Attribué-libre, adresse hors-quota, Disponible).
- [ ] Capture de la fiche d'emplacement En ordre : plus de bouton « Écrire au membre ».

## Blocked by
None - can start immediately
