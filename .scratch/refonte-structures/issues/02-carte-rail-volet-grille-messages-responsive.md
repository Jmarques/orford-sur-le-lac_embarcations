# 02 — La carte : rail d'identité + volet grille, foyers de messages, responsive, édition

Status: done — commit 09efa1b

## Parent

`.scratch/refonte-structures/PRD.md` (décision 0022).

## What to build

La carte de structure passe du bloc empilé « deux gros boutons » au **rail d'identité + volet grille**, avec une hiérarchie claire et des foyers de messages nets. La grille de la tranche 01 se loge dans le volet, inchangée. Tranche verticale : CSS layout → rendu → captures desktop **et** mobile de tous les états de carte.

- **Rail (`structures.html` + `theme.css`)** : `id` (titre brand), **silhouettes d'embarcation** (rendu SVG à partir de la clé de silhouette de la tranche 01), **compte en texte simple libellé** (jamais un nombre nu — 0016), **badge santé** (si problème), **« Faire la tournée » primaire** (brand plein) + **« Modifier » secondaire visible** (contour — démoté, jamais caché/disparu).
- **Layout** : desktop rail à **largeur fixe** + volet grille `1fr` côte à côte ; la colonne de la liste passe à la largeur `.contenu-structures` **capée** (déjà `12 × 5xl`, jamais bord-à-bord) → les gauches de toutes les cartes alignées, les niveaux entiers tiennent sans défilement, cellules **toujours 64px**. Mobile : carte empilée, rail en **trois rangées** (identité · méta · actions), niveaux abrégés **`N1/N2/N3`**.
- **Foyers de messages** : confirmation post-tournée = **bandeau succès pleine largeur en tête de carte** (même donnée `confirmationTournee` que 0021, remplace le callout actuel) ; santé des données = **badge dans le rail + callout `calloutProblemes` en tête du volet grille** ; l'erreur d'envoi de tournée **reste dans le recouvrement plein écran** (0021, non touchée).
- **Conservés, re-logés dans le volet** : note du comité, indice de défilement (conditionnel au dépassement).
- **Squelette de chargement** : redessiné pour préfigurer rail + volet grille (zéro saut de layout à l'arrivée des données).
- **Édition** : « Modifier » remplace le contenu de la carte par le formulaire (contrat complet type/saisie/embarcations/emplacements/note — inchangé) ; l'aperçu de grille du formulaire réutilise **la même cellule** que la tranche 01.

## Acceptance criteria

- [ ] La carte est un rail d'identité + volet grille : rail avec id, silhouettes d'embarcation, compte libellé, badge santé conditionnel, « Faire la tournée » primaire et « Modifier » **visible** en secondaire.
- [ ] Desktop : rail à largeur fixe (gauches de toutes les cartes alignées), colonne élargie à `.contenu-structures` capée, un niveau entier visible sans défilement, cellules à 64px inchangées.
- [ ] Mobile : rail replié en trois rangées organisées (identité · méta · actions), niveaux en `N1/N2/N3`.
- [ ] Confirmation de tournée = bandeau succès en tête de carte ; santé des données = badge rail + callout en tête de grille ; note du comité et indice de défilement conservés.
- [ ] Le squelette de chargement préfigure la nouvelle carte (rail + volet grille), sans saut de mise en page.
- [ ] « Modifier » ouvre le formulaire complet dans la carte et l'enregistrement fonctionne comme avant ; l'aperçu de grille du formulaire utilise la cellule de la tranche 01.
- [ ] Toute valeur visuelle en tokens `--wa-*` (0004) ; aucun bouton admin > size m ; textes d'entité depuis `CONTEXT.md`.
- [ ] `npm run verify` au vert, console propre ; delta de captures desktop **et** mobile revu (liste, carte, bandeau de confirmation, callout santé, chargement, édition).

## Blocked by

- `.scratch/refonte-structures/issues/01-langage-grille-encodage-cellule-legende.md` (la carte loge la cellule et la légende de la tranche 01).
