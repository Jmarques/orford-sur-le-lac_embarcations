# PRD — Refonte (redesign) de la page structures

Status: ready-for-agent
Décision de référence : `docs/decisions/0022-page-structures-carte-rail-grille-encodage-compose.md` (voir aussi 0021 cellule tournée, 0011 statut dérivé, 0016 silence, 0018 fiche, 0004 tokens).
Prototype de référence : `tmp/proto-structures-7.html` (jetable — supprimé en dernière tranche).

## Problem Statement

Un membre du comité ouvre la page Structures pour **repérer d'un coup d'œil les emplacements à traiter** (à récupérer, à identifier, disponibles) sur un râtelier qu'il connaît physiquement. Aujourd'hui la grille est un **tableur plat** : le statut ne se lit que par un fond pâle qu'il faut décoder contre une légende posée loin ; la page paraît délavée et sans hiérarchie. La carte lui impose **deux gros boutons égaux** (« Faire la tournée » et « Modifier ») alors qu'il ne modifie presque jamais une structure, le type d'embarcation se réduit à une icône bateau générique, et rien ne relie visuellement cette grille à l'écran de tournée qu'il vient d'apprécier. Résultat : la vue la plus consultée du site est la moins lisible et la moins engageante.

## Solution

La carte de structure devient un **rail d'identité + volet grille**, et la grille adopte **la cellule matérielle de la tournée** (0021) avec un **encodage composé** qui rend le statut *lisible* au lieu de le coder par une teinte pâle : la forme dit l'occupation (bateau plein / anneau bordé / puits creux non observé), la teinte saturée dit la gravité (vert plein pour le cas sain à ~95 %, rouge/ambre plein pour les cas à traiter — qui ressortent d'autant plus par contraste complémentaire), et un petit repère « tag » marque la seule non-attribution (l'exception à (ré)attribuer). L'édition est démotée en action secondaire **visible** (jamais cachée), le type d'embarcation gagne une silhouette distincte, et les messages (confirmation de tournée, santé des données) trouvent des foyers clairs. **C'est un redesign : aucune fonctionnalité existante ne disparaît.**

## User Stories

1. En tant que membre du comité, je veux voir chaque structure comme un **râtelier physique** (niveaux, positions), pour retrouver un numéro comme si j'étais devant.
2. En tant que membre du comité, je veux **lire le statut d'un emplacement d'un coup d'œil** (sans aller-retour à la légende), pour repérer vite ce qui demande une action.
3. En tant que membre du comité, je veux que les **emplacements sains** (En ordre) forment un fond calme et confiant, pour que les exceptions ressortent.
4. En tant que membre du comité, je veux que les **cas à traiter** (À identifier, Attribué-libre, Disponible) **sautent aux yeux**, pour prioriser le travail de bureau.
5. En tant que membre du comité, je veux distinguer **occupé / libre / non observé** par la forme de la cellule, pour que l'information tienne même en plein soleil ou en cas de daltonisme.
6. En tant que membre du comité, je veux repérer immédiatement les **emplacements non attribués** (via le repère « tag »), parce que ce sont ceux que je peux (ré)attribuer.
7. En tant que membre du comité, je veux que la **grille de consultation ressemble à celle de la tournée**, pour ne pas réapprendre deux langages visuels.
8. En tant que membre du comité, je veux **toucher une cellule pour ouvrir la fiche d'emplacement** (0018), exactement comme aujourd'hui.
9. En tant que membre du comité, je veux voir le **type d'embarcation accepté** en silhouette distincte (canoë / kayak / planche), pour savoir quelles demandes vont sur cette structure.
10. En tant que membre du comité, je veux le **nombre total d'emplacements** libellé (jamais un nombre nu), pour dimensionner la structure d'un regard.
11. En tant que membre du comité, je veux une **seule action primaire « Faire la tournée »**, parce que c'est le geste récurrent.
12. En tant que membre du comité, je veux **« Modifier » présent mais discret** (secondaire, visible), pour corriger une structure les rares fois où c'est nécessaire — sans qu'il monopolise la carte.
13. En tant que membre du comité, je veux voir la **confirmation d'une tournée enregistrée** sur la carte concernée (bandeau), pour savoir que mon relevé est pris en compte, au retour du plein écran.
14. En tant que membre du comité, je veux voir un **badge « Données à corriger / à vérifier »** quand une structure a un problème de saisie, pour agir.
15. En tant que membre du comité, je veux le **détail d'un problème de données** (ex. numéro en double dans deux structures) en callout près de la grille, pour savoir quoi corriger.
16. En tant que membre du comité, je veux voir les **numéros en double** marqués distinctement (pointillé), pour comprendre que c'est une erreur de saisie, pas un statut de terrain.
17. En tant que membre du comité, je veux la **note du comité** d'une structure lisible sur la carte, pour garder le contexte durable.
18. En tant que membre du comité, je veux une **légende qui parle en statuts** (la combinaison calculée), pas en deux axes séparés, parce que c'est ainsi que je lis la grille.
19. En tant que membre du comité, je veux que « **En double** » n'apparaisse dans la légende **que s'il y a des doublons**, pour ne pas voir une alarme sans objet.
20. En tant que membre du comité, je veux **toucher une entrée de légende pour son explication** (popover), comme aujourd'hui.
21. En tant que membre du comité sur ordinateur, je veux que la **grille exploite la largeur** disponible (colonne élargie), pour voir un niveau entier sans défiler.
22. En tant que membre du comité sur ordinateur, je veux que les **parties de gauche de toutes les cartes soient alignées** (rail à largeur fixe), pour un balayage vertical propre.
23. En tant que membre du comité sur téléphone, je veux que le rail se **replie proprement au-dessus de la grille** en rangées organisées, pas en tas de pilules.
24. En tant que membre du comité sur téléphone, je veux les niveaux abrégés en **N1/N2/N3**, pour voir plus d'emplacements.
25. En tant que membre du comité, je veux un **indice de défilement** quand la grille dépasse la largeur, pour savoir qu'il y a d'autres emplacements.
26. En tant que membre du comité, je veux que les **structures verticales (debout)** s'affichent correctement (rangée unique, sans étiquette de niveau).
27. En tant que membre du comité, je veux qu'une **grille non lisible** (cellule éditée à la main, 0002) montre son **texte brut** plutôt que de casser.
28. En tant que membre du comité, je veux **modifier une structure** depuis la nouvelle carte (formulaire complet : type, saisie, embarcations, emplacements, note), exactement comme aujourd'hui.
29. En tant que membre du comité, je veux retrouver les **états connexion / chargement / erreur / vide** de la page, inchangés dans leur fond.
30. En tant que membre du comité, je veux que le **squelette de chargement** préfigure la nouvelle carte (rail + grille), pour éviter tout saut de mise en page.
31. En tant que membre du comité, je veux que **rien de ce que je faisais avant ne casse** (fiche, observation, libération, note, tournée, édition) — c'est un redesign, pas une refonte fonctionnelle.

## Implementation Decisions

**Seam logique (unique, testé) — `site/presentation.js` :**
- Une (ou des) **fonction(s) pure(s)** traduisent une ligne d'emplacement en **modèle de vue de cellule** : la teinte de gravité (réutilise la `variante` de `apparenceStatut`), l'**occupation** (`occupe` | `libre` | `nonObserve`, dérivée du statut) donc le rendu plein vs bordé vs puits, et l'**attribution** (booléen, dérivé de la ligne — présence d'une adresse attribuée — *pas* du seul code, car `pasObserve` peut être attribué ou non) donc l'affichage ou non du repère. Repli neutre pour une donnée inattendue (comme `apparenceStatut`).
- Une fonction pure **type d'embarcation → clé de silhouette** (`canoe` | `kayak` | `planche` | `autre`), pour choisir l'icône ; le markup SVG lui-même reste dans la couche vue.
- `apparenceStatut` **reste inchangé** (consommé par la fiche 0018 et le badge) : on **compose** par-dessus, on ne casse pas le contrat existant.

**Cellule partagée (tournée ↔ consultation) :**
- La géométrie de cellule de la tournée (`--wa-space-4xl`, espacement `2xs`, puits `surface-lowered`, numéro en coin, glyphe centré, niveaux sticky, bordure `border-width-m`) devient **une classe de base commune** dans `theme.css`, paramétrable si besoin par la taille ; la tournée et la consultation appliquent leurs **modificateurs d'état** dessus. `tableauDeGrille(analyse, fabriqueCellule)` (déjà partagé) reste le moteur de tableau ; la fabrique de cellule de consultation est réécrite pour produire cette cellule à partir du modèle de vue.
- **Occupation → forme** : bateau plein (réutiliser le glyphe `sailboat` de la tournée) = occupé ; anneau bordé (réutiliser l'anneau CSS `.glyphe-anneau`) = libre ; puits creux pointillé + tiret = non observé.
- **Gravité → teinte saturée** via tokens : En ordre `brand-fill-loud`, À identifier `danger-fill-loud`, Attribué-libre `warning-fill-loud`, Disponible `brand-fill-quiet` bordé `brand-border-loud`, Non observé puits `surface-lowered` pointillé. (Toute valeur en tokens `--wa-*` — 0004.)
- **Attribution → repère** : un petit « tag » dans le coin réservé, affiché **uniquement** sur la non-attribution. Glyphe à confirmer au rendu (icône `tag` du kit si elle charge proprement, sinon forme CSS — la barrière console des captures tranche).
- **En double** : pointillé rouge par-dessus l'état (marquage d'erreur de saisie, pas un statut) — comportement conservé.

**Carte = rail + volet grille — `structures.html` (module inline) + `theme.css` :**
- Rail : `id` (titre brand), silhouettes d'embarcation, compte en **texte simple libellé**, badge santé (si problème), **« Faire la tournée » primaire** (brand plein) + **« Modifier » secondaire visible** (contour). Desktop : `grid-template-columns` rail fixe + `1fr` ; la colonne de la liste passe à la largeur `.contenu-structures` **capée** (déjà `12 × 5xl`) ; rails alignés. Mobile : empilé, rail en trois rangées (identité · méta · actions), niveaux `N1/N2/N3`.
- **Foyers de messages** : confirmation post-tournée = **bandeau succès pleine largeur en tête de carte** (remplace le callout `confirmation-tournee` actuel, même donnée `confirmationTournee`) ; santé des données = **badge dans le rail + callout en tête du volet grille** (les `calloutProblemes` actuels s'y logent) ; erreur d'envoi de tournée **reste dans le recouvrement plein écran** (0021, inchangé).
- **Note du comité**, **indice de défilement** (conditionnel au dépassement), **tap cellule → fiche** (0018), **structures verticales**, **grille non parsable = texte brut** : tous conservés, re-logés dans le volet grille.
- **Édition** : « Modifier » remplace le contenu de la carte par le formulaire (contrat complet type/saisie/embarcations/emplacements/note), comme aujourd'hui ; l'aperçu de grille du formulaire réutilise la **même cellule** (cohérence).
- **Squelette de chargement** : redessiné pour préfigurer rail + volet grille (pas de saut de layout).

**Légende — `structures.html` (`remplirLegende`) :**
- **Une entrée par statut** (la combinaison calculée, 0011), mini-cellule à l'**apparence exacte de la grille** (même modèle de vue), **normaux d'abord puis problèmes**, compte réel, zéros masqués ; **« En double » seulement si `comptes.enConflit > 0`** ; le repère expliqué en **simple pied de légende** (pas un second axe). Chaque entrée reste un bouton ouvrant son explication en popover (conservé).

**États inchangés dans le fond :** connexion, chargement (skeleton mis à jour), erreur, vide — capés à 65ch comme les pages sœurs (`.contenu-structures > :not(#etat-liste)`).

## Testing Decisions

- **Ce qui fait un bon test ici** : on teste le **comportement externe** des fonctions pures de présentation (entrée = ligne/statut/type, sortie = modèle de vue), jamais le DOM ni les classes CSS. Le rendu visuel se vérifie par **captures**, pas par assertions DOM.
- **Unitaire (`node:test`) sur `site/presentation.js`**, dans `tests/presentation.test.mjs` : la (les) fonction(s) d'encodage composé (par code de statut + attribution : occupation, gravité/variante, repère attendu) et le mapping type → silhouette (par type connu + repli `autre` pour un type inconnu). **Prior art** : les tests `apparenceStatut` (`deepEqual` par code + repli neutre) déjà dans ce fichier.
- **Visuel — pipeline de captures** (`tools/captures.mjs` + `npm run screenshots`) : re-baseliner les scénarios `structures-*` existants (liste, liste-defilee, fiche-*, legende-explication, edition, chargement, succès/observation) et ajouter au besoin des scénarios pour le nouveau langage (grille saturée, carte rail desktop+mobile, bandeau de confirmation sur la carte, callout santé, légende par statut). **Barrière console propre** obligatoire (un glyphe/`tag` manquant échoue le run — c'est voulu). **Prior art** : scénarios `structures-*` et `structures-tournee-*` actuels ; revue du **delta** par sous-agent lecture seule (0017).
- **Non concerné** : `grille.js` (logique de domaine) inchangé → `copie-grille` et `grille.test.mjs` intacts ; `presentation.js` est frontend-only (pas de contrepartie apps-script).

## Out of Scope

- La **fiche d'emplacement** (0018) et ses gestes (observer, libérer, note, mailto) — inchangés ; `apparenceStatut` reste tel quel.
- Le **recouvrement de tournée** (0021) — inchangé, hormis le **partage** de la classe de cellule (refactor sans changement de comportement).
- Le **backend / apps-script / `grille.js`** et la logique de statut (0011) — inchangés.
- La page **« À traiter »**, la **fiche d'adresse**, la **fiche de demande** — hors sujet.
- De **nouveaux types d'embarcation** au-delà de canoë/kayak/planche — repli générique nommé, pas de nouvelle silhouette.
- Le **dial `conforme` → `brand-fill-normal`** (si le mur de vert plein pèse) — documenté comme « revisit » dans 0022, pas maintenant.
- Verrouillage paysage / plein écran natif — déjà tranché hors scope en 0021.

## Further Notes

- **Redesign, pas refonte** : la table exigence → tranche ci-dessous liste explicitement chaque feature conservée pour qu'aucune ne soit « invisible car reportée ».
- Toute valeur visuelle en tokens `--wa-*` / `--osl-*` de `theme.css` (0004) ; noms d'entités depuis `CONTEXT.md` (les libellés de statut viennent de `statutEmplacement`).
- Public aîné : contrastes renforcés (plein/encre) = un gain d'accessibilité, pas seulement esthétique.
- Le prototype `tmp/proto-structures-7.html` sert de référence visuelle et est **supprimé** en dernière tranche (règle du jetable).

## Table exigence → tranche

| # | Exigence | Tranche | Vérif |
|---|----------|---------|-------|
| R1 | Cellule = géométrie tournée verbatim, classe de base partagée | T01 | captures + revue |
| R2 | Occupation → plein / bordé / puits (bateau · anneau · tiret) | T01 | unit + captures |
| R3 | Gravité → teinte saturée (loud brand/danger/warning, disponible clair, non observé puits) | T01 | unit + captures |
| R4 | Attribution → repère « tag » sur la seule non-attribution | T01 | unit + captures |
| R5 | Contours renforcés (cellules `border-width-m`) | T01 | captures |
| R6 | Encodage composé exposé en fonction(s) pure(s) testée(s) | T01 | unit |
| R7 | Type embarcation → silhouette (fonction pure) | T01 | unit |
| R8 | Légende une entrée par statut, normaux puis problèmes, En double conditionnel, repère en pied, popover conservé | T01 | captures |
| R9 | Tap cellule → fiche (0018) conservé | T01 | captures |
| R10 | Conflit « en double » marqué (pointillé) conservé | T01 | captures |
| R11 | Carte = rail d'identité + volet grille | T02 | captures + revue |
| R12 | Rail : id, silhouettes, compte libellé, badge santé, Faire la tournée primaire, Modifier secondaire **visible** | T02 | captures |
| R13 | Desktop côte à côte, rail fixe (gauches alignées), colonne capée `.contenu-structures` | T02 | captures |
| R14 | Mobile empilé (3 rangées), niveaux `N1/N2/N3` | T02 | captures |
| R15 | Foyer confirmation post-tournée = bandeau succès en tête (donnée `confirmationTournee`) | T02 | captures |
| R16 | Foyer santé données = pastille rail + callout en tête de grille | T02 | captures |
| R17 | Note du comité conservée, re-logée | T02 | captures |
| R18 | Indice de défilement conditionnel conservé | T02 | captures |
| R19 | Squelette de chargement fidèle à la nouvelle carte | T02 | captures |
| R20 | Édition (Modifier) fonctionne dans la nouvelle carte, aperçu même cellule | T02 | captures |
| R21 | Structures verticales (debout) correctes | T03 | captures |
| R22 | Grille non parsable = texte brut | T03 | captures |
| R23 | États connexion / chargement / erreur / vide re-cadrés (capés 65ch, fond inchangé) | T03 | captures |
| R24 | Aucune régression fiche/observation/tournée/édition | T01–T03 | verify complet |
| R25 | Revue ui-critic sur le delta (0017) + baseline captures committée | T03 | revue |
| R26 | Suppression des prototypes `tmp/proto-structures*` | T03 | — |

### Tranches (résumé)

- **T01 — Le langage de la grille** : seam `presentation.js` (encodage composé + silhouette) + tests ; classe de cellule partagée + teintes saturées + repère d'attribution dans `theme.css` ; grille et **légende par statut** rendues avec le modèle de vue ; features de grille conservées (tap → fiche, conflit pointillé). *Contrat de données complet de la grille dès cette tranche.*
- **T02 — La carte** : rail + volet grille, silhouettes, Modifier secondaire visible, foyers de messages (bandeau succès, badge + callout santé), note, indice de défilement, responsive (desktop capé/rail fixe ; mobile empilé N1/N2/N3), squelette de chargement, édition dans la nouvelle carte.
- **T03 — Bords, vérif & nettoyage** : structures verticales, grille non parsable, états re-cadrés ; verify complet + revue ui-critic sur le delta + baseline captures committée ; suppression des prototypes.
