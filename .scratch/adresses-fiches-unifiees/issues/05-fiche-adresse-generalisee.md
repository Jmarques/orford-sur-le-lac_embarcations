# 05 — Fiche d'adresse généralisée

Status: ready-for-agent

## Parent
`.scratch/adresses-fiches-unifiees/PRD.md`

## What to build
Rendre la [[Fiche d'adresse]] ouvrable pour **n'importe quelle [[Adresse]]** (plus seulement les cas [[Hors quota]], amende 0019), sur la coquille unifiée avec les blocs partagés (01) et `casAdresse` généralisé (04). Un **callout n'apparaît que pour un problème/exception** (Hors quota) — **rien** quand l'adresse est en règle. La fiche montre le [[Membre]], ses emplacements avec leur [[Statut d'un emplacement]] (chacun ouvrant sa fiche d'emplacement), le journal, et « ajouter une note ». Sur hors-quota, le callout porte l'action de résolution (« Demander de libérer une place », avec aperçu du courriel).

## Acceptance criteria
- [ ] La fiche d'adresse s'ouvre pour une adresse en règle, une adresse hors-quota, et une adresse sans emplacement.
- [ ] Aucun callout pour une adresse « dans le quota » ; callout « Hors quota » + remède rattaché pour une adresse qui dépasse.
- [ ] Membre et Journal rendus via les blocs partagés (01) ; chaque emplacement ouvre sa fiche d'emplacement.
- [ ] « Ajouter une note » d'adresse fonctionne, la fiche restant ouverte (0016/0019).
- [ ] Captures des états « dans le quota » et « hors quota » ; delta revu.
- [ ] Tests verts.

## Blocked by
- 01, 04
