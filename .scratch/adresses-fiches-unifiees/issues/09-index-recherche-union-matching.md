# 09 — Index de recherche : union Emplacements ∪ Membres + matching tri-clé

Status: ready-for-agent

## Parent
`.scratch/adresses-fiches-unifiees/PRD.md`

## What to build
Construire la logique de recherche (pure, testée au seam des exports) : `toutesLesAdresses_(emplacements, membres)` = **union** des adresses ayant des attributions et des lignes de l'onglet Membres (dédup par clé d'adresse normalisée, 0019) ; et le **matching tri-clé** — nom de [[Membre]] · [[Adresse]] · numéro d'[[Emplacement]] (préfixe pour les numéros) — avec **classement** (nom d'abord) et la **raison** du match exposée (pour la légende « · Emplacement N »).

## Acceptance criteria
- [ ] `toutesLesAdresses_` renvoie une entrée par adresse, incluant les adresses Membres-seules (0 emplacement), sans doublon.
- [ ] Le matching trouve par nom de membre, par adresse, et par numéro d'emplacement (préfixe).
- [ ] Un match par numéro expose le numéro correspondant (pour la légende).
- [ ] Classement stable, correspondances de nom d'abord.
- [ ] Tests couvrant chaque clé, la dédup, l'adresse Membres-seule, et l'ambiguïté civique/numéro d'emplacement.

## Blocked by
- 04
