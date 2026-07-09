# 04 — Généralisation de casAdresse (dossier pour toute adresse)

Status: ready-for-agent

## Parent
`.scratch/adresses-fiches-unifiees/PRD.md`

## What to build
Étendre `casAdresse` pour qu'il renvoie un **dossier d'adresse pour n'importe quelle [[Adresse]]**, y compris une adresse **sans aucune attribution** mais présente dans l'onglet Membres — dossier à `nombre: 0`, `depassement: 0`, `emplacements: []` — au lieu de `null`. Logique pure, testée au seam des exports. Prépare la fiche d'adresse généralisée (05) et l'index de recherche (09).

## Acceptance criteria
- [ ] `casAdresse(cle, …)` renvoie un dossier non-null pour une adresse connue seulement via Membres (0 emplacement).
- [ ] Le dossier porte le contact (membre), le quota applicable, `nombre: 0`, `emplacements: []`.
- [ ] Comportement inchangé pour une adresse avec attributions (hors-quota comme en règle).
- [ ] Tests unitaires : adresse avec emplacements, adresse Membres-seule, adresse inconnue (toujours null).

## Blocked by
None - can start immediately
