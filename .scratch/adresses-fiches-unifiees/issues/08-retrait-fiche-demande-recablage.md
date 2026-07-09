# 08 — Retrait de la fiche de demande autonome + recâblage d'À traiter

Status: ready-for-agent

## Parent
`.scratch/adresses-fiches-unifiees/PRD.md`

## What to build
Retirer l'écran de demande autonome (`fiche-demande.js`) — désormais superflu depuis que le traitement vit dans la fiche d'adresse (07) — et **recâbler la section « Demandes » d'À traiter** pour qu'une [[Demande]] ouvre la **[[Fiche d'adresse]]** concernée (là où se fait le traitement). Nettoyer le markup, les scripts et le câblage associés de la page À traiter.

## Acceptance criteria
- [ ] `fiche-demande.js` et son câblage (chargement du script, ouverture, gestion du focus) sont retirés d'À traiter.
- [ ] Toucher une demande dans la section « Demandes » d'À traiter ouvre la fiche d'adresse de l'adresse de la demande.
- [ ] Le traitement (attribuer / refuser / mettre à jour le contact) fonctionne depuis À traiter via la fiche d'adresse.
- [ ] Les tests propres à l'ancienne fiche de demande sont retirés ou réorientés vers le traitement en fiche d'adresse ; la suite reste verte.
- [ ] Captures d'À traiter → fiche d'adresse ; delta revu.

## Blocked by
- 07
