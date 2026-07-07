# 04 — Flake résiduel : quelques pixels sur les captures mobiles à interaction

Status: needs-triage

## What to build

Après le durcissement de l'issue 01, il reste un faux positif occasionnel :
environ un run sur deux signale UNE capture mobile modifiée (14–93 px), jamais
la même — observé sur `structures-liste-defilee--mobile` (93 px, décalage
sous-pixel des bordures pointillées « En double » dans la grille défilée) puis
`structures-tournee-relevee--mobile` (14 px). Les zones touchées sont les
bordures pointillées et les zones défilées ; les runs suivants reviennent à
zéro sans changement de code.

Diagnostiquer la position de défilement/le rendu sous-pixel au moment de la
capture (probablement la fin de course de `defiler` et le phasage des dashed
borders), et durcir — même doctrine que l'issue 01 : le seuil pixelmatch reste
à 0 sauf justification écrite dans la décision 0017.

Observé le 2026-07-06 pendant la manche hors-quota (runs complets et
`-- --page structures` consécutifs, arbre propre côté visuel).

## Acceptance criteria

- [ ] Cinq exécutions consécutives (complètes ou `--page structures`) à delta zéro sur un arbre propre
- [ ] La cause est identifiée et notée, pas seulement masquée

## Blocked by

None - can start immediately.
