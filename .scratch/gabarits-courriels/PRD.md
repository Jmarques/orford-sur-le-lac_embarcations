# PRD — Modèles de courriel éditables

Status: ready-for-agent

Décisions de référence : carte wayfinder `.scratch/gabarits-courriels/map.md` (tickets 01-07, chacun porte le détail de sa décision). Glossaire : `CONTEXT.md` ([[Modèle de courriel]]). Décisions du site : 0002 (Sheet éditable à la main, état frais), 0003 (jamais d'envoi automatique), 0008 (mot de passe en corps). Prototype validé (jetable, à absorber puis supprimer) : `site/gabarits-prototype.html` — piste C retenue, captures `screenshots/gabarits-prototype-*`.

## Problem Statement

Les courriels que l'app prépare (« Relance — emplacement libre », « Relance — hors quota ») ont été rédigés sur nos suppositions. Les membres du comité ont leur ton, leur façon de s'exprimer — mais aujourd'hui, changer une formulation exige de passer par le développeur et un déploiement. L'ajustement ponctuel existe déjà (le mailto s'ouvre dans la messagerie, tout y est modifiable avant envoi), mais la correction *durable* — « ce n'est pas comme ça que je parle, et je ne veux pas le retaper à chaque fois » — n'a aucun chemin.

Et le public est aîné : toute solution qui demande d'éditer une cellule de Google Sheet, ou d'écrire une syntaxe sans se tromper, échoue avant de commencer.

## Solution

Chaque courriel préparé a désormais un [[Modèle de courriel]] éditable par le comité, depuis une page dédiée « Modèles de courriels » atteinte par un lien discret dans l'aperçu « Courriel pré-rédigé » — là où on remarque qu'une formulation cloche. Le texte est libre ; les **informations** que l'app remplit (nom du membre, numéro d'emplacement…) sont des **puces insécables** dans le texte : elles se déplacent ou se retirent d'un bloc, jamais lettre par lettre, et se remettent par bouton. Un aperçu avec un exemple réel se met à jour pendant qu'on écrit. « Revenir au texte d'origine » est toujours à portée de main.

Les fiches composent désormais leurs courriels depuis le modèle enregistré (onglet `Gabarits` de la Sheet) ; une ligne absente ou abîmée retombe silencieusement sur le texte d'origine — le pire cas est le texte d'origine, jamais un courriel cassé. Rien ne change à la doctrine 0003 : l'app n'envoie jamais rien.

## User Stories

**Éditer un modèle — page « Modèles de courriels »**

1. Comme membre du comité, je veux ajuster le texte d'un courriel préparé une fois pour toutes, pour qu'il parle avec mon ton sans dépendre d'un développeur.
2. Comme membre du comité, en relisant un courriel pré-rédigé dans l'aperçu, je veux un lien « Modifier le modèle de ce courriel », pour corriger la formulation au moment où je la remarque.
3. Comme membre du comité, je veux une liste des modèles en rangées (libellé français + début du texte), pour choisir celui à ajuster d'un coup d'œil.
4. Comme membre du comité, je veux éditer le texte librement sans pouvoir casser les informations remplies par l'app, pour ne jamais envoyer un courriel troué.
5. Comme membre du comité, je veux insérer une information à l'endroit du curseur via des boutons nommés (« Nom du membre »…), pour ne retenir aucune syntaxe.
6. Comme membre du comité, je veux un aperçu avec un exemple réel nommé (« ce que recevra Marie Gagnon ») qui se met à jour pendant que j'écris, pour juger le résultat, pas le mécanisme.
7. Comme membre du comité, je veux modifier l'objet du courriel avec le même mécanisme que le message, pour n'apprendre qu'une seule façon de faire.
8. Comme membre du comité, si je retire une information requise, je veux un avertissement contre l'éditeur et des boutons pour la remettre, pour me rattraper sans aide.
9. Comme membre du comité, je veux qu'une information optionnelle (« depuis quand ») disparaisse proprement du courriel quand la donnée n'est pas connue, sans trou ni ponctuation orpheline.
10. Comme membre du comité, je veux enregistrer le modèle et voir la confirmation, pour savoir que toutes les prochaines relances l'utiliseront.
11. Comme membre du comité, je veux « Revenir au texte d'origine » sans que rien ne s'enregistre avant que j'appuie sur « Enregistrer », pour explorer sans risque.
12. Comme membre du comité, si l'enregistrement échoue, je veux une erreur claire qui conserve mon texte, pour réessayer sans tout retaper.
13. Comme membre du comité, je veux revenir de l'éditeur à la liste par un bouton retour en tête, pour ne jamais me sentir coincé.
14. Comme membre du comité, je veux que la page soit protégée par le mot de passe du comité et suive les états des autres pages (connexion, chargement, erreur), pour une expérience cohérente.
15. Comme membre du comité sur mobile, je veux l'ordre édition → aperçu → palette → actions, pour voir ce que recevra le membre avant qu'on me propose d'enregistrer.

**Utiliser les modèles — fiches**

16. Comme membre du comité, je veux que « Écrire au membre » (fiche d'emplacement) et « Demander de libérer une place » (fiche d'adresse) composent le courriel depuis le modèle enregistré, pour que mes ajustements servent partout.
17. Comme membre du comité, je veux que les informations soient remplies avec les vraies données du dossier (nom, numéro, adresse, série « libre depuis »), pour ne rien avoir à compléter à la main.
18. Comme membre du comité, je veux relire le courriel composé dans l'aperçu et l'ouvrir dans ma messagerie, comme aujourd'hui — rien n'est envoyé automatiquement.
19. Comme membre du comité, si l'onglet `Gabarits` est vide ou abîmé, je veux que le courriel utilise le texte d'origine sans erreur visible, pour que la relance fonctionne toujours.

**Administrer**

20. Comme développeur-administrateur, je veux que `setup()` crée l'onglet `Gabarits` et le sème avec les textes d'origine, pour que la Sheet soit lisible et éditable à la main dès le départ.
21. Comme développeur-administrateur, je veux pouvoir corriger une ligne de l'onglet `Gabarits` à la main (échappatoire), et que l'app tolère ce qu'elle y trouve.
22. Comme développeur-administrateur, je veux retrouver une version écrasée via l'historique de versions de Google Sheets, pour ne pas avoir à construire d'historique applicatif.
23. Comme développeur, je veux ajouter un futur courriel en déclarant une entrée serveur (id + textes d'origine) et une entrée client (libellé + informations + valeurs), pour que chaque nouvelle fonctionnalité arrive avec son modèle à coût faible.

## Implementation Decisions

- **Périmètre** : gabarits durables des courriels que l'app gère. Pas de composition libre, pas de nouveaux courriels créés par le comité (chaque fonctionnalité future apporte le sien via le registre).
- **Modèle d'édition (piste C du prototype)** : les informations sont des puces insécables (`contenteditable`, puces `contenteditable=false`) dans le texte libre, objet inclus. Palette de boutons d'insertion au curseur. Aperçu vivant avec valeurs d'exemple surlignées. Information requise manquante → callout warning contre l'éditeur, réinsertion par la palette (située sous l'aperçu en mobile). Une information optionnelle vide disparaît, avec normalisation des espaces avant ponctuation (du prototype : `texte.replace(/ +([.,])/g, '$1')`).
- **Format stocké** : texte brut à jetons `{…}` en français dans les colonnes `sujet`/`corps` — les puces ne sont que la représentation d'édition ; parse au chargement, sérialisation à l'enregistrement. La Sheet reste lisible à la main (0002).
- **Jetons par modèle** (contrat de données complet) :
  - `relanceEmplacement` — `{nom}` requis, `{numéro}` requis, `{adresse}` requis, `{depuis quand}` optionnel (valeur « depuis le 12 juin », vide si la série d'observation n'a pas de début).
  - `relanceHorsQuota` — `{nom}` requis, `{adresse}` requise, `{nombre d'emplacements}` calculé (« 3 emplacements »), `{numéros}` calculé (« 12, 14, 17 »), `{règle du quota}` calculé (phrase « quota de 2 » vs « exception accordée à N » — le principe : toute phrase conditionnelle devient un jeton calculé par l'app, jamais une syntaxe conditionnelle exposée au comité).
- **Stockage** : onglet `Gabarits` dédié (`id`, `sujet`, `corps`), créé et semé par `setup()`. Jamais dans `Config` (forme des données, mot de passe voisin, onglet écrit par l'app).
- **Défauts et réinitialisation** : textes d'origine dans le code (registre serveur) ; lecture tolérante avec repli silencieux ligne par ligne ; « Revenir au texte d'origine » re-remplit l'éditeur sans écrire ; pas d'historique applicatif (rollback = versions Google Sheets) ; un changement futur du défaut ne touche pas les modèles personnalisés.
- **Contrat backend** : les gabarits voyagent dans la réponse `inventaire` — chaque gabarit y arrive avec son texte **effectif** et son **défaut** (le client ne connaît jamais les textes). Écriture par l'action `majGabarit` `{ action, motDePasse, id, sujet, corps }`, maj par clé `id` (création si absente), état frais en retour. Validation minimale (id connu, textes non vides, taille plafonnée) ; pas de validation des jetons côté serveur. Dernier écrit gagne.
- **Registre coupé en deux** : la vérité des *textes* au serveur (id + défauts, seed + repli) ; la vérité de l'*UI* au client (libellé français du modèle, jetons avec libellés de puce et requis/optionnel, et au point d'usage la fonction qui fournit les valeurs réelles — rôle actuel des `courrielRelance(...)`).
- **Surface** : page dédiée « Modèles de courriels », **sans entrée au menu** (décision : du bruit) — atteinte par le lien contextuel de l'aperçu « Courriel pré-rédigé » (`?modele=<id>`). Liste en rangées-boutons pleine largeur ; choisir un modèle remplace la liste par l'éditeur en place (remplacé, jamais empilé — 0018). Page comité standard : connexion 0008, squelette bande-lac, tous les états dès la première tranche.
- **Vocabulaire** (CONTEXT.md) : « Modèle de courriel » (visible), « information » (mot utilisateur pour un jeton) ; « gabarit » reste interne.
- **Code facilement remplaçable** : chaque morceau est un module profond derrière une interface étroite — la logique de texte à jetons est un module pur sans DOM, la marche DOM ↔ puces reste dans la page, le registre serveur est une déclaration de données. Remplacer l'éditeur (ou revenir à la piste A) ne toucherait que la page.

## Table exigence → tranche

| Exigence (user stories) | Tranche |
|---|---|
| Logique pure : parse texte à jetons ↔ segments, rendu avec valeurs + ponctuation, manquants requis, sérialisation ; registre UI (libellés, jetons par modèle, valeurs par contexte) (US 4-5, 9, 17) | **T1 — Domaine (pur, testé au seam exports)** |
| Onglet `Gabarits` + seed `setup()`, registre serveur (défauts), gabarits effectif+défaut dans `inventaire`, action `majGabarit` + validation, repli lecture (US 19-23) | **T2 — Backend** |
| Les fiches composent leurs courriels depuis le modèle effectif (plus de texte en dur) — aucun changement visible si les textes n'ont pas été personnalisés (US 16-19) | **T3 — Fiches depuis le modèle** |
| Page « Modèles de courriels » complète : liste, éditeur à puces, aperçu vivant, palette, erreurs (manquants, écriture), « Revenir au texte d'origine », tous les états, ordre mobile ; lien contextuel dans l'aperçu ; suppression du prototype absorbé (US 1-15) | **T4 — Page + lien contextuel** |

Rien n'est « invisible parce que reporté » : chaque user story est rattachée à une tranche, et l'écran visible (la page) arrive complet à sa tranche, contrat de données inclus.

## Testing Decisions

- Un bon test vérifie le **comportement externe au seam**, jamais l'implémentation : on donne un texte à jetons et des valeurs, on lit le rendu ; on donne des lignes de Sheet (y compris illisibles), on lit les gabarits effectifs.
- **Seam 1 (nouveau)** — le module pur client (logique de texte à jetons + registre UI), testé par require direct comme `tests/presentation.test.mjs`. Cas durs : jeton inconnu conservé tel quel, optionnel vide + ponctuation, accolade orpheline, information requise absente, aller-retour parse/sérialise.
- **Seam 2 (existant)** — les modules `apps-script` testés par require direct comme `tests/admin.test.mjs` : fusion ligne/défaut (vide, illisible, absente), validation `majGabarit` (id inconnu, textes vides, plafond).
- **Seam 3 (existant)** — la boucle de captures (`tools/captures.mjs`) : scénarios de la page (connexion, chargement, liste, éditeur, manquant-requis, erreur d'écriture, retour au texte d'origine) et le lien contextuel dans l'aperçu des fiches ; console error/warning = échec.
- L'éditeur `contenteditable` (marche DOM ↔ puces) se vérifie en captures, pas en tests unitaires.

## Out of Scope

- Composition libre de nouveaux courriels par le comité (effort séparé si un cas concret le force).
- Les futurs courriels eux-mêmes (ex. confirmation d'attribution via une [[Demande]]) — ils arrivent avec leurs fonctionnalités, via le registre.
- Tout envoi automatique (0003) ; tout historique applicatif des modèles ; toute trace au journal des éditions de modèle.
- Une entrée au menu comité pour la page (à revisiter si le comité cherche la page sans la trouver).
- Le contraste du sous-titre `.sous-titre-lac` en mobile (observation de la revue du prototype — toutes les pages, issue séparée).

## Further Notes

- Le prototype `site/gabarits-prototype.html` (et ses captures `gabarits-prototype-*`) est la référence visuelle de l'éditeur ; il se supprime à la tranche T4, comme les prototypes de fiches avant lui.
- Les pistes écartées et leurs enseignements vivent dans le ticket [03 — Modèle d'édition des variables](issues/03-modele-edition-variables.md) de la carte.
