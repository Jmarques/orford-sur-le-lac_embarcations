# 01 — Le langage de la grille : encodage composé, cellule partagée, légende par statut

Status: done — commit 9a5c98a

## Parent

`.scratch/refonte-structures/PRD.md` (décision 0022 ; voir 0021 cellule tournée, 0011 statut, 0016 silence, 0018 fiche, 0004 tokens).

## What to build

La grille de consultation adopte **la cellule matérielle de la tournée** avec un **encodage composé** qui rend le statut dérivé *lisible* : la forme dit l'occupation, la teinte saturée dit la gravité, un repère « tag » marque la seule non-attribution. La légende repasse à **une entrée par statut**. Tranche verticale : logique pure testée → CSS tokenisé → rendu → captures. La carte garde son cadre actuel (deux boutons) — c'est la tranche 02 qui la refait ; ici seule la **grille + sa légende** changent, et tout ce qui vit dans la grille continue de marcher.

- **Seam logique (`site/presentation.js`, testé)** : fonction(s) pure(s) traduisant une ligne d'emplacement en modèle de vue de cellule — `variante` de gravité (réutilise `apparenceStatut`), `occupation` (`occupe` | `libre` | `nonObserve`, dérivée du statut) et `attribue` (booléen dérivé de la **ligne**, pas du seul code : `pasObserve` peut être attribué ou non). Repli neutre pour donnée inattendue. Plus une fonction pure **type d'embarcation → clé de silhouette** (`canoe` | `kayak` | `planche` | `autre`). `apparenceStatut` **reste inchangé** (la fiche 0018 et le badge le consomment) — on compose par-dessus.
- **Cellule partagée (`theme.css`)** : extraire la géométrie de la cellule de tournée (`--wa-space-4xl`, espacement `2xs`, puits `surface-lowered`, numéro coin, glyphe centré, niveaux sticky, **bordure `border-width-m`**) en classe de base commune ; la consultation applique ses modificateurs. Occupation → forme : `sailboat` plein (occupé) · anneau CSS `.glyphe-anneau` bordé (libre) · puits creux pointillé + tiret (non observé). Gravité → teinte saturée en tokens : En ordre `brand-fill-loud`, À identifier `danger-fill-loud`, Attribué-libre `warning-fill-loud`, Disponible `brand-fill-quiet`/`brand-border-loud`, Non observé puits `surface-lowered`. Attribution → **repère « tag » dans le coin réservé, seulement sur la non-attribution** (glyphe tranché au rendu : icône `tag` si elle charge proprement, sinon forme CSS).
- **Rendu grille (`structures.html`)** : la fabrique de cellule de consultation produit cette cellule à partir du modèle de vue, via `tableauDeGrille` (moteur de tableau déjà partagé). Conservés : tap cellule → fiche (0018), marquage « en double » en pointillé.
- **Légende (`structures.html`, `remplirLegende`)** : **une entrée par statut** (la combinaison calculée, 0011), mini-cellule à l'apparence **exacte** de la grille (même modèle de vue), **normaux d'abord puis problèmes**, compte réel, zéros masqués ; **« En double » seulement si `comptes.enConflit > 0`** ; repère expliqué en **simple pied** (pas un second axe) ; chaque entrée reste un bouton ouvrant son explication en popover.

*Contrat de données complet de la grille dès cette tranche* : les 5 statuts + occupation + attribution + en double sont tous rendus.

## Acceptance criteria

- [ ] `presentation.js` expose la (les) fonction(s) d'encodage composé et le mapping type → silhouette ; tests unitaires dans `presentation.test.mjs` (par code de statut + attribution : occupation/variante/repère attendus ; par type + repli `autre` pour un type inconnu ; repli neutre pour un code inconnu), sur le modèle des tests `apparenceStatut`.
- [ ] `apparenceStatut` et son test restent inchangés ; la fiche (0018) n'est pas modifiée.
- [ ] La cellule de grille est visuellement celle de la tournée (même taille/espacement/contours) via une classe de base partagée ; occupation lue par la forme (bateau plein / anneau bordé / puits), gravité par la teinte saturée, non-attribution par le repère.
- [ ] Toute valeur visuelle en tokens `--wa-*` / `--osl-*` (0004) — aucune couleur/taille brute.
- [ ] Tap sur une cellule ouvre la fiche d'emplacement (0018) ; « en double » reste marqué en pointillé.
- [ ] La légende a une entrée par statut (normaux puis problèmes), « En double » n'apparaît que s'il y a des doublons, le repère est expliqué en pied, les popovers d'explication fonctionnent.
- [ ] `npm run verify` : tests au vert, `copie-grille` inchangé (`grille.js` non touché), console des captures propre (un glyphe/`tag` manquant fait échouer — c'est voulu) ; le delta de captures de la liste/légende est cohérent avec l'encodage.

## Blocked by

None - can start immediately.
