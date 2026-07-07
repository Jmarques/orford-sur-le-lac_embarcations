# 03 — Adresse · position · membre

Status: ready-for-agent

## Parent

`.scratch/presentation-frontend/PRD.md`

## What to build

Les helpers de formatage et de lookup, aujourd'hui recopiés au-dessus du seam.

- Exposer `chercherMembre(membres, ligne) → membre | undefined` depuis `grille.js` (aujourd'hui `chercherMembreParCle_(membres, cle)`, privé ; la version publique calcule `cleAdresse(ligne)` pour coller aux sites d'appel). Ajouter aux `module.exports` ; `site/grille.js` régénéré.
- Ajouter à `presentation.js` :

```js
formatAdresse(ligne) → string
//   « numeroAdresse rue » (décision 0012), toujours cette forme.
positionParNumero(numero, structures) → { structure, niveau } | null
//   via analyserStructures ; la PREMIÈRE position gagne pour un numéro en
//   double (l'erreur de données se marque ailleurs, pas ici).
```

Migrer les copies :
- `formatAdresse` : fiche.js `adresseLisible`, fiche-adresse.js/fiche-demande.js `adresseDemande`, a-traiter.html (4 au total).
- `positionParNumero` : fiche.js, fiche-adresse.js, fiche-demande.js `cartePositions`, a-traiter.html, structures.html (5 au total).
- `chercherMembre` : fiche.js `chercherMembre`, fiche-demande.js `membreDe`, a-traiter.html (3 au total).

## Acceptance criteria

- [ ] `grille.js` exporte `chercherMembre` ; testé (appariement par clé insensible à la casse ; absent → undefined) ; `site/grille.js` régénéré.
- [ ] `presentation.js` : `formatAdresse` et `positionParNumero` couverts par `tests/presentation.test.mjs` (adresse « 234 Rue du Pré » ; position d'un numéro, numéro en double → 1ʳᵉ position, absent → null).
- [ ] Les copies de `formatAdresse` (4), `positionParNumero` (5) et de la recherche de membre (3) sont supprimées et passent par les fonctions partagées.
- [ ] `npm run verify` passe : delta captures **nul**.

## Blocked by

- `.scratch/presentation-frontend/issues/01-apparence-du-statut.md`
