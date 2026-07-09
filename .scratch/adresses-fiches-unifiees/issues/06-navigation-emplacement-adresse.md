# 06 — Navigation fiche d'emplacement → fiche d'adresse

Status: ready-for-agent

## Parent
`.scratch/adresses-fiches-unifiees/PRD.md`

## What to build
Ajouter, dans la barre d'actions utilitaires de la [[Fiche d'emplacement]], une action **« Fiche d'adresse »** qui ouvre la [[Fiche d'adresse]] de l'adresse attribuée, avec **retour** vers l'emplacement (jamais deux drawers empilés — même mécanique que le retour existant fiche d'adresse → fiche d'emplacement, 0019). L'action n'apparaît que si l'emplacement est attribué (Revisit de 0019 : « ouvrir le dossier d'adresse depuis un emplacement »).

## Acceptance criteria
- [ ] Un emplacement attribué offre « Fiche d'adresse » ; un emplacement non attribué non.
- [ ] Cliquer ouvre la fiche d'adresse ; un bouton retour rouvre la fiche d'emplacement d'origine.
- [ ] Fermer par X ou échap suit la même règle de retour, sans empiler deux drawers.
- [ ] Capture de l'enchaînement.

## Blocked by
- 03, 05
