# 02 — Prose des signaux

Status: done

## Parent

`.scratch/presentation-frontend/PRD.md`

## What to build

Un seul foyer pour mettre en phrase un signal de statut, à partir des faits déjà dérivés par grille.js.

- Exposer `dateLisible(valeur) → Date | null` depuis `grille.js` (aujourd'hui `dateLisible_`, privé) : ajouter aux `module.exports` (copie-grille régénère `site/grille.js`, `copie-grille.test.mjs` garde la copie).
- Ajouter à `presentation.js` :

```js
// La phrase d'un signal, dérivée des faits grille (serieLibreObservee,
// fenetreApparition) → string | null. Ex. « Attribué, mais observé libre
// depuis le 3 mai · 4 observations », « embarcation apparue entre le… et le… ».
proseSignal(ligne, evenements) → string | null
```

Migrer les 2 blocs qui écrivent ces phrases à la main :
- fiche.js `detailStatut` (la ligne de détail sous le libellé).
- a-traiter.html `signalLibre` / `signalAIdentifier`.

La sortie texte doit être identique caractère pour caractère.

## Acceptance criteria

- [x] `grille.js` exporte `dateLisible` ; `dateLisible` est testée (valide/invalide/vide → Date|null) ; `site/grille.js` régénéré.
- [x] `presentation.js` : `proseSignal` couvert par `tests/presentation.test.mjs` (série « libre » → phrase « libre depuis… · N observations » ; fenêtre → « apparue entre… » ; aucun signal → `null`).
- [x] fiche.js `detailStatut` et a-traiter.html `signalLibre`/`signalAIdentifier` passent par `proseSignal` ; les phrases inline sont supprimées.
- [x] `npm run verify` passe : delta captures **nul**.

## Réalisé — écart

Découverte à l'implémentation : les deux phrases ne sont **pas** identiques (la fiche préfixe « Attribué, mais observé libre… » et ponctue ; le registre dit « Libre depuis… » nu). `proseSignal(ligne, evenements, contexte)` prend donc un paramètre `contexte` (`'fiche'` / `'file'`) et centralise les **deux** formulations, qui partagent date/compte/fenêtre — texte inchangé au caractère (choix validé avec Jeremy, pas d'unification).

## Blocked by

- `.scratch/presentation-frontend/issues/01-apparence-du-statut.md`
