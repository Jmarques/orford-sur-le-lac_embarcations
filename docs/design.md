# Design du site — les patterns décidés, appliqués

Ce document dit à quoi ressemble « Le lac au petit matin » (décision 0015) **appliqué à ce site**, pour qu'une nouvelle page imite l'existant au lieu d'inventer. Il se lit APRÈS `principles.md` et `composition.md` du skill webawesome-design (le processus général) et complète les records 0015/0016 (le pourquoi). Références vivantes : `site/theme.css` (chaque règle y est commentée avec son intention), `site/a-traiter.html` (la page la plus récente), les captures committées dans `screenshots/`.

## La direction en une phrase

Un outil de comité calme et chaleureux : Fraunces (titres) + Nunito Sans (corps) + wordmark script, verts d'eau et sable, formes « galets », une bande d'identité animée sous l'eau — jamais festif, jamais corporate, jamais générique.

## Squelette de page (identique sur toutes les pages)

```
.liseret-marque                        ← liseré brand en haut
header.bande-lac                       ← scène WebGL (canvas.eau-lac) + fallback dégradé
  .contenu : .wordmark-lac « Orford-sur-le-Lac »
             .surtitre-comite « Espace du comité » (pages comité)
             h1.titre-lac + sous-titre .sous-titre-lac (une phrase, ton rassurant)
             nav.nav-comite (pages comité : Demandes / Structures / À traiter)
  .houle > svg.vagues                  ← la page découpe la bande
main.contenu.wa-stack.wa-gap-xl        ← 65ch centré (.contenu-structures pour les grilles)
.pied                                  ← discret mais lisible
```

## Les états d'une page (tous, dès la première tranche)

Chaque état est un bloc frère dans `main`, montré/masqué par l'attribut `hidden`, pilotable par `?etat=` (décision 0006) :

- **connexion** (pages comité) : une carte, titre « Page réservée au comité », champ + bouton pleine largeur, erreur mot de passe en callout danger `role="alert"` ;
- **chargement** : `wa-skeleton` aux proportions du contenu réel (voir `.squelette-*`), `role="status" aria-busy="true"`, texte en `wa-visually-hidden` ;
- **erreur** : callout danger + bouton « Réessayer » brand size l — jamais une page morte ;
- **vide** : calme et positif (`.section-vide`, icône `circle-check` verte, « Aucun … ») — le repos n'est pas une alarme ;
- **contenu / succès** : le succès d'un geste garde la fiche ouverte (0018) ; le succès d'un envoi a son `.glyphe-etat`.

## Silence (décision 0016)

Une information = **un seul foyer**, sous sa forme la plus économe. Jamais de texte répétant ce qu'une représentation montre déjà ; un titre de corps qui répète le h1 passe en `wa-visually-hidden` ; un total vit en **pastille libellée** (« 24 emplacements » — jamais « 24 » nu) ; une consigne n'est dite qu'une fois par page. Mais le **procédural et le rassurant ne sont pas du bruit** : « rien n'est enregistré tant que… », instructions de tournée, mot d'état dans chaque cellule restent verbatim.

## Couleur

- Toute valeur visuelle vient des tokens `--wa-*` / `--osl-*` de `theme.css` (décision 0004) — **aucune couleur, taille ou espacement en dur dans une page**.
- Les sémantiques sont re-thématisées (vert sauge / ocre sable / brique douce) : un statut ou un callout reste dans la palette lac.
- **La couleur ne porte jamais seule** : légende, libellé ou `aria-label` la double toujours (statuts de grille, pastilles, cellules de tournée).
- Pas de gravité inventée : pastille neutre pour une règle de gestion, warning pour « à repérer », danger pour l'anomalie — la hiérarchie visuelle raconte la gravité réelle.

## Formes et surfaces

- **Galets** : radius ×1.5, boutons pilule, cartes sans bordure grise — liseré sable, ligne d'eau brand au sommet, fond un demi-cran plus clair que la page.
- **Registre = rangées compactes + fiche** (jamais N cartes dépliées) : une liste de dossiers se balaie en rangées-boutons pleine largeur (`.rangee-cas`), le travail vit dans la fiche.
- **Tout bouton-surface** (rangée, cellule) : `block-size: auto` + `white-space: normal` — native.css fige sinon les `<button>` à une hauteur de contrôle.
- **Fiches** (0018/0019) : dialog desktop / drawer bas mobile à hauteur de contenu ; jamais deux drawers empilés — le contenu du même drawer est remplacé, avec bouton retour ; seul le journal défile.

## Public aîné (toujours)

Typographie déjà agrandie (`--wa-font-size-scale: 1.125`) ; cibles ~44 px (padding généreux, liens de contact gonflés par marge négative — voir `.liens-contact`) ; légendes au corps normal, pas en caption ; français simple et rassurant ; tout nom d'entité vient de `CONTEXT.md` — jamais inventé.

## Mouvement

Une seule animation d'entrée (fondu + glissement, en cascade) ; l'eau respire en **opacité pure**, la houle en `scaleY` — jamais de géométrie qui crée un bord. Tout est sous `prefers-reduced-motion: no-preference`, durées en tokens `--wa-transition-*` / `--osl-duree-*`. Une animation se vérifie **en mouvement** (frames comparées, `npm run frames-eau` pour l'eau), jamais sur une capture statique.

## Sortie

Le processus reste celui du CLAUDE.md : polish checklist de `composition.md`, puis `npm run screenshots` et revue du **delta** par un subagent lecture seule sur les artefacts `screenshots/.diff/` (décision 0017). Ce document ne remplace aucune de ces étapes — il donne au modèle qui les exécute la référence de ce que « réussi » veut dire ici.
