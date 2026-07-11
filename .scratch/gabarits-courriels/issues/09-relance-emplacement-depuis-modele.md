# 09 — La relance d'emplacement se compose depuis le modèle

**What to build:** « Écrire au membre » (fiche d'emplacement, état Attribué-libre) compose son courriel depuis le [[Modèle de courriel]] `relanceEmplacement` enregistré dans l'onglet `Gabarits`, au lieu du texte en dur. Bout en bout : l'onglet est créé et semé par `setup()` avec le texte d'origine (déclaré au registre serveur) ; l'inventaire renvoie chaque gabarit avec son texte **effectif** (ligne de la Sheet, ou défaut en repli si absente/vide/illisible) et son **défaut** ; un module pur côté client découpe le texte à jetons, rend les valeurs du dossier (nom, numéro, adresse, « depuis quand » optionnel qui disparaît proprement, ponctuation normalisée) ; la fiche s'en sert pour l'aperçu et le mailto — rien ne change à la doctrine 0003.

Démo : modifier la cellule `corps` de la Sheet à la main → le courriel préparé change ; vider ou supprimer la ligne → le texte d'origine revient, sans erreur visible. Le rendu par défaut est identique au texte actuel (aucun delta de capture attendu).

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `setup()` crée l'onglet `Gabarits` (`id`, `sujet`, `corps`) et le sème avec le texte d'origine de `relanceEmplacement`
- [ ] L'inventaire renvoie les gabarits `{ id, sujet, corps, defaut: { sujet, corps } }` ; ligne absente/vide/illisible → repli silencieux sur le défaut
- [ ] Module pur client : parse texte à jetons ↔ segments, rendu avec valeurs, jeton optionnel vide disparaît avec ponctuation normalisée, jeton inconnu conservé tel quel — testé au seam exports (cas durs : accolade orpheline, optionnel vide, inconnu)
- [ ] Fusion ligne/défaut et lecture tolérante testées au seam apps-script
- [ ] La fiche d'emplacement compose l'aperçu et le mailto depuis le modèle effectif ; les textes en dur de la relance disparaissent
- [ ] `npm run verify` passe ; aucun delta de capture (textes par défaut identiques aux textes actuels)
