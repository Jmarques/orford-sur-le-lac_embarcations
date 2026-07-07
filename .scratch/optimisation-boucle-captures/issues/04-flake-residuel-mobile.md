# 04 — Flake résiduel : quelques pixels sur les captures mobiles à interaction

Status: needs-triage

## What to build

Après le durcissement de l'issue 01, il reste un faux positif occasionnel :
environ un run sur deux signale UNE capture modifiée, jamais la même —
observé sur `structures-liste-defilee--mobile` (93 px, décalage sous-pixel
des bordures pointillées « En double » dans la grille défilée),
`structures-tournee-relevee--mobile` (14 px), puis
`structures-fiche-confirmation-liberation--desktop` (15,8–17,1 k px sur
4 runs : la position de défilement du corps du drawer DERRIÈRE le dialogue
varie d'environ 25 px d'un run à l'autre — tout le contenu du drawer se
dédouble dans le diff). Les zones touchées sont les bordures pointillées,
les zones défilées et le scroll du drawer sous un dialogue ; les runs
suivants reviennent à zéro sans changement de code.

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
