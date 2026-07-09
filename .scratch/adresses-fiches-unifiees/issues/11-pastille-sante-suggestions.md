# 11 — Pastille de santé sur les suggestions

Status: ready-for-agent

## Parent
`.scratch/adresses-fiches-unifiees/PRD.md`

## What to build
Ajouter à chaque suggestion de la page Adresses une **pastille de santé du dossier** dérivée (jamais stockée, 0011) : **pire d'abord** parmi les [[Statut d'un emplacement]] des emplacements de l'adresse, avec **[[Hors quota]]** prioritaire — libellée (En ordre / Attribué-libre / Hors quota / Non observé), la couleur ne portant jamais seule (0016). La dérivation est testée au seam des exports.

## Acceptance criteria
- [ ] Chaque suggestion porte une pastille libellée reflétant l'état le plus « à voir » du dossier.
- [ ] Priorité : Hors quota, puis problème de terrain (Attribué-libre), puis Non observé, puis En ordre.
- [ ] Couleur **et** libellé (jamais la couleur seule).
- [ ] Tests de la dérivation : adresse en ordre, avec un Attribué-libre, hors-quota, sans emplacement.
- [ ] Capture des suggestions avec pastilles ; delta revu.

## Blocked by
- 10
