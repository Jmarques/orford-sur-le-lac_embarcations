# 04 — Écrire au membre (mailto)

Status: done

## Parent

`.scratch/presentation-frontend/PRD.md`

## What to build

Un seul foyer pour le lien mailto « écrire au membre », avec son encodage.

Ajouter à `presentation.js` :

```js
// Le mailto préparé : sujet + corps (lignes) + signature du comité, tout encodé
// (les ?/& d'une cellule Sheet ne cassent jamais le lien) → string.
hrefEcrire({ courriel, sujet, corps }) → string
```

Migrer les 3 copies : fiche.js, fiche-adresse.js, fiche-demande.js `hrefEcrire`. L'invariant d'encodage (aujourd'hui re-commenté à chaque copie) vit désormais une fois. Le lien produit doit être identique.

Rappel (décision 0003) : c'est un mailto pré-rempli, jamais un envoi automatique — le geste reste manuel.

## Acceptance criteria

- [x] `presentation.js` : `hrefEcrire` couvert par `tests/presentation.test.mjs` (encodage des `?`/`&`/accents dans sujet et corps ; signature du comité présente).
- [x] Les 3 `hrefEcrire` inline (fiche.js, fiche-adresse.js, fiche-demande.js) sont supprimés et passent par la fonction partagée ; le mailto produit est inchangé.
- [x] `npm run verify` passe : delta captures **nul** (les captures « aide-ecrire » restent identiques).

## Réalisé — écart

La fonction partagée est nommée **`lienMailto({courriel, sujet, corps})`**, pas `hrefEcrire` : elle n'assemble/encode que le mailto (le vrai doublon), tandis que les `hrefEcrire` locaux — qui construisent le sujet et le corps propres à chaque fiche — sont conservés et délèguent l'assemblage. Nommer autrement évite la collision avec ces wrappers locaux.

## Blocked by

- `.scratch/presentation-frontend/issues/01-apparence-du-statut.md`
