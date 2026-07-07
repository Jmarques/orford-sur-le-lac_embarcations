# 03 — Formulaire membre : l'adresse sur une ligne

Status: done

## Parent

.scratch/traitement-demandes/PRD.md

## What to build

Ajustement purement visuel du formulaire public de demande : le numéro civique (3 caractères max en pratique, < 1000) et la rue passent côte à côte sur une seule ligne, y compris sur mobile si le rendu reste bon — le champ numéro dimensionné court, le sélecteur de rue prenant le reste. Aucun changement de contenu, de champs ni de validation. Si la ligne ne tient pas proprement sur les petits écrans, on garde l'empilement actuel (le critère est le rendu, pas l'entêtement).

## Acceptance criteria

- [x] Numéro + rue sur une ligne (desktop), numéro court sans icône (label « Numéro »), rue fluide via `grid` minmax(0,1fr)
- [x] Rendu mobile vérifié : la ligne tronquait la rue sur téléphone → les deux champs s'empilent pleine largeur sous 40rem (condition de Jeremy « si ça passe sur mobile, sinon empilé »), aucune troncature, cibles larges
- [x] Aucun changement de champ, de validation ni de soumission ; console propre
- [x] Revue ui-critic sur le delta (troncature mobile signalée → corrigée par l'empilement)

## Blocked by

None - can start immediately
