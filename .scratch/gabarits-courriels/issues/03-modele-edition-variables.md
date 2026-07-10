# 03 — Modèle d'édition des variables

Type: prototype
Status: resolved

## Question

Comment un membre du comité (public aîné) édite-t-il le texte d'un gabarit sans casser les parties dynamiques — et que deviennent les **phrases conditionnelles** ?

À trancher via `/prototype` — 2-3 approches radicalement différentes, comparées sur rendu réel (captures), par exemple :
- **Placeholders textuels** : `{nom}`, `{numeroEmplacement}`… dans une zone de texte, palette de boutons « Insérer … » propre au gabarit, aperçu en direct avec données d'exemple.
- **Blocs verrouillés** : le gabarit est découpé en paragraphes libres autour de lignes dynamiques non éditables (le comité ne voit jamais de syntaxe) — impose de restructurer les textes pour sortir les variables des phrases.
- Toute autre approche surfacée par le prototypage.

Cas durs à couvrir dans chaque approche :
- La date conditionnelle « … est libre depuis le {date} » (`site/fiche.js:247-249`) — la phrase change quand la série d'observation est vide.
- La règle de quota « quota de 2 » vs « exception accordée à N » (`site/fiche-adresse.js:289-291`).
- Les pluriels calculés (« N emplacements : 12, 14 »).
- L'erreur de l'utilisateur : placeholder supprimé ou déformé — que voit-il, comment se rattrape-t-il ?

La réponse verrouille : la syntaxe/représentation des variables, le sort des conditionnelles (simplifier les textes ? garder des fragments fixes ?), et le format stocké dans la colonne `corps`.

## Answer

**Piste C — les informations comme des puces insécables dans le texte — retenue** par Jeremy, sur un prototype comparant trois approches (`site/gabarits-prototype.html`, `?etat=jetons|blocs|puces` + états d'erreur `jetons-erreur`/`puces-manque` ; captures `screenshots/gabarits-prototype-*`), après revue critique par subagent lecture seule.

Décisions verrouillées :
- **Représentation** : chaque information dynamique est une **puce insécable** (pilule brand quiet, libellé français) dans le texte libre — se déplace ou se retire d'un bloc, jamais lettre par lettre ; se réinsère par les boutons de la palette. Aucune syntaxe visible.
- **L'objet est éditable au même mécanisme** (puces) — pas de verrou façon B : un seul mécanisme à apprendre (décidé avec Jeremy contre l'hybride suggéré par la revue).
- **Format stocké** (colonnes `sujet`/`corps` de l'onglet `Gabarits`) : texte brut à jetons `{nom}`, `{numéro}`, `{adresse}`, `{depuis quand}` — les puces ne sont que la représentation d'édition ; l'app parse (chargement) et sérialise (enregistrement). La Sheet reste lisible/éditable à la main (0002).
- **Conditionnelles** : un jeton optionnel disparaît quand la donnée est vide (libellé « (si connue) » sur le bouton), avec normalisation des espaces avant ponctuation. Principe pour les autres gabarits : toute phrase conditionnelle devient un **jeton calculé par l'app** (ex. la règle « quota de 2 » vs « exception accordée à N » de la relance hors quota) — à confirmer gabarit par gabarit au PRD.
- **Erreur et rattrapage** : puce requise retirée → callout warning **contre l'éditeur**, réinsertion par les boutons de la palette située en dessous ; jetons requis vs optionnels déclarés par le registre (ticket [07](07-registre-courriels.md)).
- **Ordre mobile** : édition → aperçu → palette → actions — l'aperçu ne passe jamais sous « Enregistrer ».
- **Aperçu** : toujours affiché, avec un exemple réel nommé (« ce que recevra Marie Gagnon »), valeurs surlignées.

Enseignements des pistes écartées : A (accolades `{ }`) — la plus intimidante, ressemble à du code ; B (blocs verrouillés) — la plus sûre mais les infos sortent des phrases (ligne robotique) et l'aperçu fait doublon.

Observation hors périmètre relevée par la revue : le contraste du sous-titre `.sous-titre-lac` sur le dégradé de la bande est faible en mobile (toutes les pages du site) — à traiter séparément.
