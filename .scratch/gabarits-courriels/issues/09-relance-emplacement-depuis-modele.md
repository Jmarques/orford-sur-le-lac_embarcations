# 09 — La relance d'emplacement se compose depuis le modèle

**What to build:** « Écrire au membre » (fiche d'emplacement, état Attribué-libre) compose son courriel depuis le [[Modèle de courriel]] `relanceEmplacement` enregistré dans l'onglet `Gabarits`, au lieu du texte en dur. Bout en bout : l'onglet est créé et semé par `setup()` avec le texte d'origine (déclaré au registre serveur) ; l'inventaire renvoie chaque gabarit avec son texte **effectif** (ligne de la Sheet, ou défaut en repli si absente/vide/illisible) et son **défaut** ; un module pur côté client découpe le texte à jetons, rend les valeurs du dossier (nom, numéro, adresse, « depuis quand » optionnel qui disparaît proprement, ponctuation normalisée) ; la fiche s'en sert pour l'aperçu et le mailto — rien ne change à la doctrine 0003.

Démo : modifier la cellule `corps` de la Sheet à la main → le courriel préparé change ; vider ou supprimer la ligne → le texte d'origine revient, sans erreur visible. Le rendu par défaut est identique au texte actuel (aucun delta de capture attendu).

**Blocked by:** None — can start immediately.

**Status:** ready-for-human — implémenté, à valider sur le vrai site (relancer `setup()` puis `npm run deploy`)

- [x] `setup()` crée l'onglet `Gabarits` (`id`, `sujet`, `corps`) et le sème avec le texte d'origine de `relanceEmplacement` (seed par id absent seulement — relancer `setup()` n'écrase jamais un modèle personnalisé)
- [x] L'inventaire renvoie les gabarits `{ id, sujet, corps, defaut: { sujet, corps } }` ; ligne absente/vide/illisible → repli silencieux sur le défaut (champ par champ ; onglet absent toléré aussi)
- [x] Module pur client (`site/modeles-courriel.js`) : parse texte à jetons ↔ segments, rendu avec valeurs, jeton optionnel vide disparaît avec ponctuation normalisée, jeton inconnu conservé tel quel — testé au seam exports (`tests/modeles-courriel.test.mjs` : accolade orpheline, optionnel vide, inconnu, aller-retour, pin octet-à-octet du texte d'origine)
- [x] Fusion ligne/défaut et lecture tolérante testées au seam apps-script (`tests/gabarits.test.mjs`)
- [x] La fiche d'emplacement compose l'aperçu et le mailto depuis le modèle effectif ; les textes en dur de la relance disparaissent
- [x] `npm run verify` passe ; aucun delta de capture (les 4 diffs mobiles rapportés se reproduisent depuis HEAD propre — flakes d'animation préexistants, baselines non touchées)

## Comments

- Revue /code-review (Standards + Spec) : aucune violation dure, checklist couverte, pas de dérive vers les tickets 10-12. Deux retouches appliquées : `texteOuVide_` (nom qui dit le contrat de retour) et un `console.info` quand l'inventaire ne porte pas de gabarits (backend pas redéployé) au lieu d'un bouton mort silencieux.
