# 04 — Surface d'édition

Type: grilling
Status: resolved
Blocked by: 03

## Question

Où l'édition vit-elle dans l'app, et comment y arrive-t-on ?

- Une page « Courriels » dédiée (liste des gabarits, un par ligne, édition en fiche) ?
- Un bouton « Modifier le modèle » depuis l'aperçu courriel existant (`site/blocs-fiche.js`), là où le besoin se manifeste ?
- Les deux ?

Ancrer dans une user story (acteur + mode d'accès) — un besoin de données ≠ un écran. Dépend de la forme retenue en [03 — Modèle d'édition des variables](03-modele-edition-variables.md) (un dialogue suffit-il, ou faut-il l'espace d'une page ?).

## Answer

**Page dédiée « Modèles de courriels » + lien contextuel depuis l'aperçu — sans entrée au menu.**

- **User story porteuse** : un membre du comité relit un courriel préparé dans l'aperçu « Courriel pré-rédigé », tique sur une formulation, et veut la corriger pour toutes les prochaines fois. Le besoin naît dans l'aperçu → un lien discret « Modifier le modèle de ce courriel » y mène à la page, pré-ouverte sur le bon modèle (`?modele=<id>`).
- **Pas d'entrée au menu comité pour l'instant** (décision Jeremy : du bruit). Corollaire assumé : l'aperçu est le seul chemin — l'histoire « je veux revoir nos courriels » délibérée passe par lui aussi. À revisiter si le comité cherche la page sans la trouver.
- **La page** : page comité standard (connexion 0008, squelette bande-lac, tous les états dès la première tranche). La liste des modèles en **rangées-boutons pleine largeur** (libellé français + début du texte) ; choisir un modèle **remplace la liste par l'éditeur en place** (pleine page, bouton retour en tête — remplacé, jamais empilé, 0018). L'éditeur est celui du prototype C : édition + aperçu côte à côte desktop, édition → aperçu → palette → actions en mobile.
- Pas d'éditeur incrusté dans le dialogue d'aperçu : l'éditeur a besoin de l'espace d'une page.
