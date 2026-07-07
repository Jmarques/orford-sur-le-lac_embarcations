# 03 — Formulaire membre : l'adresse sur une ligne

Status: ready-for-agent

## Parent

.scratch/traitement-demandes/PRD.md

## What to build

Ajustement purement visuel du formulaire public de demande : le numéro civique (3 caractères max en pratique, < 1000) et la rue passent côte à côte sur une seule ligne, y compris sur mobile si le rendu reste bon — le champ numéro dimensionné court, le sélecteur de rue prenant le reste. Aucun changement de contenu, de champs ni de validation. Si la ligne ne tient pas proprement sur les petits écrans, on garde l'empilement actuel (le critère est le rendu, pas l'entêtement).

## Acceptance criteria

- [ ] Numéro + rue sur une ligne, numéro dimensionné pour 3 caractères, rue fluide
- [ ] Rendu mobile vérifié en captures : la ligne tient sans troncature ni cibles rétrécies (public aîné — cibles larges)
- [ ] Aucun changement de champ, de validation ni de soumission ; console propre
- [ ] Revue ui-critic sur le delta de captures

## Blocked by

None - can start immediately
