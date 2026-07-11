# 10 — La relance hors quota se compose depuis le modèle

**What to build:** « Demander de libérer une place » (fiche d'adresse, cas [[Hors quota]]) compose son courriel depuis le modèle `relanceHorsQuota`. C'est le cas dur du principe « toute phrase conditionnelle devient un jeton calculé » : `{règle du quota}` (« La règle de la communauté est de 2 emplacements par adresse. » vs « Votre adresse a une exception accordée à N emplacements. »), `{nombre d'emplacements}` (avec pluriel), `{numéros}` (liste jointe) — calculés par l'app, jamais une syntaxe conditionnelle exposée au comité. Seed, repli et registre comme au ticket 09.

Démo : identique au 09, sur la fiche d'adresse — Sheet éditée à la main → courriel changé ; ligne abîmée → texte d'origine.

**Blocked by:** 09 — La relance d'emplacement se compose depuis le modèle.

**Status:** ready-for-agent

- [ ] `relanceHorsQuota` déclaré au registre serveur (défauts = texte actuel) et semé par `setup()`
- [ ] Jetons calculés déclarés au registre UI avec leurs libellés français ; leurs valeurs viennent du cas hors quota du dossier
- [ ] Rendu des jetons calculés testé au seam du module pur (quota 2 vs exception, pluriels, liste de numéros)
- [ ] La fiche d'adresse compose l'aperçu et le mailto depuis le modèle effectif ; les textes en dur disparaissent
- [ ] `npm run verify` passe ; aucun delta de capture
