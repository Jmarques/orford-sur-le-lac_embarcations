# 03 — Enchaînement « Structure suivante → »

Status: ready-for-human — implémenté, à valider sur le vrai site

## Parent

`.scratch/tournee/PRD.md` — PRD « Tournée : relevé d'occupation en série, structure par structure » (décision 0013).

## What to build

Couvrir les scénarios « toutes les structures d'une visite » (saisie initiale, début/fin de saison) sans imposer de portée à l'avance. Depuis l'écran de résumé d'une tournée envoyée, un bouton « Structure suivante → » ouvre directement la tournée de la structure suivante dans l'ordre de la liste des structures ; le retour à la liste reste possible à tout moment. Sur la dernière structure de la liste, le résumé ne propose que la fermeture. Le cas « une seule structure à relever » ne change pas : on ferme simplement après le résumé.

## Acceptance criteria

- [x] Le résumé propose « Structure suivante → » qui ouvre la tournée de la structure suivante (ordre de la liste des structures), fantômes frais chargés (inventaire rechargé avant l'ouverture).
- [x] La dernière structure de la liste ne propose pas de suivante — seulement le retour à la liste, promu action primaire.
- [x] Le retour à la liste est possible depuis le résumé sans enchaîner ; les statuts affichés reflètent les tournées déjà envoyées (rechargement depuis la Sheet, sans message succès redondant — 0016).
- [x] La détermination de « la suivante » est une logique pure testée en node (`structureSuivante` : liste d'une seule structure, dernière structure, ordre préservé, structure disparue).
- [x] Captures mockées : résumé avec « Structure suivante », résumé de dernière structure ; console propre ; `npm run verify` vert.
- [x] Revue UI sur captures fraîches passée.

## Blocked by

- `02-progression-et-changements.md` — l'écran de résumé est le point d'ancrage de l'enchaînement.
