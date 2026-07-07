# 01 — Apparence du statut (crée presentation.js)

Status: done

## Parent

`.scratch/presentation-frontend/PRD.md`

## What to build

La tranche traceuse : créer le module de présentation frontend et lui donner sa première fonction — l'apparence Web Awesome d'un statut — puis migrer les 4 tables recopiées dessus.

`site/presentation.js` : classic script + guard dual-export node (précédent `client.js`/`grille.js`), frontend-only. Dépend de `grille.js` (chargé avant).

```js
// Le SEUL foyer code → apparence Web Awesome d'un statut.
apparenceStatut(code) → { variante, icone }
//   conforme→success/circle-check · peutEtreALiberer→warning/triangle-exclamation
//   orphelin→danger/triangle-exclamation · disponible→brand/circle-check
//   pasObserve→neutral/circle-question ; code inconnu → neutral (repli sûr)
```

Migrer les 4 tables `code → {variante, icone}` :
- fiche.js `APPARENCE_STATUTS`, fiche-adresse.js `VARIANTES_STATUTS`, fiche-demande.js `VARIANTES_STATUTS` → `apparenceStatut(statut.code)`.
- La légende de structures.html qui reconstruit chaque statut → même source.

`theme.css` `.statut-{code}` reste inchangé (CSS déclaratif, le mapping vers la classe est `'statut-' + code`). Seuls `variante`/`icone` (posés en JS) passent par le module.

Charger `<script src="presentation.js">` après `grille.js` et avant les fiches, sur `structures.html` et `a-traiter.html`.

## Acceptance criteria

- [x] `site/presentation.js` créé : `apparenceStatut`, guard dual-export node ; chargé après grille.js / avant les fiches sur les 2 pages admin.
- [x] `tests/presentation.test.mjs` couvre `apparenceStatut` : les 5 codes → la bonne `{variante, icone}` ; code inconnu → `neutral` (repli sûr — l'ancien `undefined` cassait le badge).
- [x] Les **3 tables JS** d'apparence (fiche.js, fiche-adresse.js, fiche-demande.js) sont supprimées et passent par `apparenceStatut` ; `theme.css` inchangé. _(Correction : la légende de structures.html n'était pas une 4ᵉ table JS — elle rend via le chemin CSS `'statut-' + code` que le PRD conserve ; laissée telle quelle, à raison.)_
- [x] `npm run verify` passe : delta captures **nul** (mêmes couleurs et icônes qu'avant).

## Blocked by

None - can start immediately
