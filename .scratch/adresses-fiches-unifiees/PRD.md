# PRD — Consultation par adresse : page « Adresses » + fiches unifiées

Status: ready-for-agent

Décisions de référence : `docs/decisions/0023-page-adresses-recherche.md`, `docs/decisions/0024-fiches-unifiees.md` (amende 0018/0019/0020). Glossaire : `CONTEXT.md`. Prototypes validés (jetables, à absorber puis supprimer) : `site/adresses-prototype.html` (recherche, variante autocomplétion), `site/fiche-prototype.html` (fiches unifiées, 8 états).

## Problem Statement

Un membre du comité qui reçoit un appel — « Bonjour, c'est le 234 Rue du Pré », ou « les Tremblay déménagent » — ne peut pas, dans l'app, retrouver le dossier correspondant : il faut connaître le numéro d'emplacement ou balayer la grille des Structures à l'œil. Les trois pages du comité sont organisées par tâche (À traiter) ou par carte physique (Structures), jamais par identité. Le tableur Excel, lui, permet ce « chercher par qui / où / quel numéro » — tant que ce geste n'existe que dans la Sheet, le comité rouvre la Sheet, et l'app ne devient jamais le point de contact principal.

En parallèle, les deux vues détaillées existantes ont dérivé : la [[Fiche d'emplacement]] et la [[Fiche d'adresse]] montrent toutes deux un membre, un journal et des actions, mais chacune les réimplémente, et le gating des actions est trop large — un emplacement **En ordre** propose quand même « Écrire au membre » alors qu'il n'y a rien à résoudre. La fiche d'adresse, elle, n'existe que pour les cas [[Hors quota]] : impossible d'ouvrir le dossier d'une adresse en règle.

## Solution

Un 4ᵉ onglet du comité, **« Adresses »**, offre une recherche qui mène au dossier : on tape un nom, une adresse ou un numéro d'[[Emplacement]], on choisit une suggestion (nom + adresse + pastille de santé du dossier), on atterrit sur la [[Fiche d'adresse]].

Cette fiche est **généralisée** à n'importe quelle adresse et partage désormais une **coquille unique** avec la [[Fiche d'emplacement]] — `[Sujet] · [Membre] · [Corps propre] · [Journal] · [Actions]` — dont les blocs **Membre** et **Journal** sont des composants partagés. Les actions deviennent strictement contextuelles : un **remède** (relancer, libérer) n'apparaît que face à un problème et vit **dans le callout** de ce problème ; les actions **utilitaires** (consigner « sur place », ouvrir la fiche d'adresse) vivent dans une barre à part. Une [[Demande]] en cours se **traite dans la fiche d'adresse** (attribuer une place suggérée ou refuser), sans écran séparé.

## User Stories

**Recherche — page « Adresses »**

1. Comme membre du comité, je veux chercher par le **nom** d'un membre, pour retrouver son dossier au téléphone sans connaître son numéro.
2. Comme membre du comité, je veux chercher par l'**adresse** (numéro + rue), pour retrouver un dossier quand j'ai l'adresse sous les yeux.
3. Comme membre du comité, je veux chercher par un **numéro d'emplacement**, pour savoir à qui appartient une embarcation repérée.
4. Comme membre du comité, je veux voir dans chaque suggestion le **nom + l'adresse**, pour reconnaître le bon dossier d'un coup d'œil.
5. Comme membre du comité, je veux une **pastille de santé** (En ordre / Attribué-libre / Hors quota / Non observé) sur chaque suggestion, pour savoir s'il y a quelque chose à regarder avant d'ouvrir.
6. Comme membre du comité, je veux que la **première suggestion soit présélectionnée** et qu'Entrée l'ouvre, pour atteindre un dossier en trois frappes sans souris.
7. Comme membre du comité, je veux trouver une adresse qui **n'a pas encore d'emplacement** mais un contact inscrit, pour joindre un nouveau membre.
8. Comme membre du comité, je veux un **état de repos calme** quand rien n'est tapé, pour ne pas être noyé.
9. Comme membre du comité, je veux un **message clair quand aucune adresse ne correspond**, pour vérifier l'orthographe ou constater que l'adresse n'est pas inscrite.
10. Comme membre du comité, je veux que la page soit **protégée par le mot de passe** du comité, comme les autres pages.

**Fiche d'adresse (généralisée)**

11. Comme membre du comité, je veux ouvrir la fiche de **n'importe quelle adresse** (pas seulement hors-quota), pour consulter le dossier complet.
12. Comme membre du comité, je veux voir le **membre** avec téléphone et courriel **tappables**, pour le joindre.
13. Comme membre du comité, je veux voir **ses emplacements avec leur statut**, chacun ouvrant sa fiche d'emplacement, pour naviguer dans le dossier.
14. Comme membre du comité, je veux voir le **journal** de l'adresse (notes + libérations), pour connaître l'historique.
15. Comme membre du comité, je veux **ajouter une note** d'adresse, pour consigner un échange.
16. Comme membre du comité, je veux qu'**aucun callout n'apparaisse quand l'adresse est en règle**, pour que le calme signale lui-même l'absence de problème.
17. Comme membre du comité, je veux, sur une adresse **hors quota**, un callout qui porte l'action de résolution (« Demander de libérer une place »), pour traiter le dépassement là où je le lis.

**Fiche d'emplacement (unifiée)**

18. Comme membre du comité, je veux voir le **statut, la position et le membre** dans la même coquille que la fiche d'adresse, pour une lecture cohérente partout.
19. Comme membre du comité, je veux consigner l'occupation **« sur place » via une action** (pas une section permanente), pour garder la fiche épurée.
20. Comme membre du comité, je veux **ouvrir la fiche d'adresse depuis un emplacement**, pour passer du numéro au dossier de l'adresse.
21. Comme membre du comité, je veux que **« Écrire au membre » n'apparaisse que face à une raison** (Attribué, libre), pour ne pas proposer une relance quand tout est en ordre.
22. Comme membre du comité, je veux **« Libérer »** proposé quand l'emplacement est Attribué-libre **ou** quand l'adresse est hors quota, rattaché au problème qu'il résout.
23. Comme membre du comité, je veux un **aperçu du courriel pré-rédigé** (objet + corps + « rien n'est envoyé automatiquement ») avant d'ouvrir ma messagerie, pour savoir ce que je m'apprête à envoyer.
24. Comme membre du comité, je veux que les **remèdes soient rattachés au problème** (dans le callout) et les **utilitaires à part**, pour comprendre ce que chaque action résout.

**Demande traitée dans la fiche d'adresse**

25. Comme membre du comité, je veux voir **« Demande en cours »** sur la fiche d'adresse quand une demande attend, pour la traiter là où je lis le dossier.
26. Comme membre du comité, je veux voir le **contact de la demande de façon compacte** et **« Mettre à jour le contact » en un geste** s'il diffère de l'enregistré, sans arbitrer champ par champ.
27. Comme membre du comité, je veux **attribuer une place suggérée** (emplacements Disponibles compatibles), le **niveau montré avec le numéro** puis **confirmation**, pour attribuer sans erreur.
28. Comme membre du comité, je veux **refuser la demande avec une raison**, pour journaliser la décision.
29. Comme membre du comité, je veux traiter une demande d'une **adresse nouvelle** (ni membre ni emplacement) : le contact vient de la demande, **enregistré à l'acceptation**, et **pas de journal** tant que l'adresse n'existe pas.
30. Comme membre du comité, je veux que la **[[Mobilité réduite]]** oriente les suggestions vers les niveaux bas, pour respecter la priorité.

## Implementation Decisions

**Modules de logique (seam de test unique — exports `grille.js` / `presentation.js`)**

- `toutesLesAdresses_(emplacements, membres)` : l'index de recherche = **union** des adresses ayant des attributions (`groupesParAdresse_`) et des lignes de l'onglet Membres ; chaque entrée porte `{ cle, adresse, membre, emplacements }`.
- Généralisation de `casAdresse` : renvoie un dossier même sans attribution, fabriqué depuis la ligne Membres (`nombre: 0`, `depassement: 0`, `emplacements: []`) au lieu de `null`.
- **Gating resserré** de `gestesEmplacement` : `ecrire` ne dépend plus de « attribué » mais d'une **raison** (statut `peutEtreALiberer`) ; `liberer` = attribué **et** (Attribué-libre **ou** adresse hors quota). Fin de l'« Écrire » sur En ordre.
- Recherche : matching tri-clé (nom · adresse · numéro d'emplacement, préfixe pour les numéros) + classement (nom d'abord), avec la **raison** du match par numéro exposée (légende « · Emplacement N »).
- Pastille de santé d'un dossier : dérivée (jamais stockée, 0011), « pire d'abord » sur les statuts des emplacements de l'adresse, hors-quota prioritaire.
- Construction du bloc demande : suggestions = Disponibles compatibles triés par niveau (réutilise `suggestionsEmplacements`, 0020) ; contact compact réutilise `diffContact` (`aDifference` → un seul « Mettre à jour le contact »).

**Composants de vue**

- Nouveau module de **blocs partagés** (Membre = contact ; Journal = événements + ajout de note), consommé par `fiche.js` **et** `fiche-adresse.js` — retire la duplication actuelle.
- `fiche.js` (emplacement) : coquille unifiée à plat (retrait des onglets Observer/Traiter, 0018) ; « Sur place » en **action** révélant le relevé ; **barre utilitaire** (Sur place, Fiche d'adresse) ; remèdes **dans le callout** du statut ; **aperçu du courriel** en panneau (remplace les légendes).
- `fiche-adresse.js` : **généralisée** (toute adresse) ; callout **seulement** pour problème/exception (Hors quota, Demande) ; **bloc Demande** = traitement inline (attribuer avec niveau + confirmation, refuser avec raison, contact compact, cas demande-seule sans membre/emplacement/journal).
- Nouvelle page `adresses.html` : squelette du site (0015), 4ᵉ lien `nav-comite` ajouté aussi à `structures.html`, `a-traiter.html` (et la page Demandes) ; états `connexion / chargement / repos / résultats / aucun-résultat / erreur` pilotables par `?etat=` (0006).
- **Fiche de demande autonome remplacée** (tranché avec Jeremy) : `fiche-demande.js` disparaît ; le traitement de la demande vit entièrement dans la fiche d'adresse (0024, amende 0020), et la **section « Demandes » d'À traiter est rebranchée** pour ouvrir la fiche d'adresse concernée. Une seule surface de traitement.

**Contrat de données**

- Aucune **nouvelle colonne Sheet** : la recherche, les fiches et le traitement de demande consomment l'inventaire existant (`emplacements`, `membres`, `journal`, `demandes`). Les gestes réutilisent les actions backend existantes de 0020 (attribuer, refuser, mise à jour du contact) et 0018/0019 (observer, libérer, note) — vérifier qu'elles couvrent le cas « adresse nouvelle » (attribution qui crée à la fois l'attribution et le membre depuis la demande).
- Chaque écran visible **embarque son contrat complet dès sa première tranche** : la page Adresses arrive avec sa recherche tri-clé complète ; la fiche d'adresse arrive généralisée avec Membre/Emplacements/Journal/Actions ; le bloc Demande arrive avec attribuer + refuser + contact.

## Table exigence → tranche

| Exigence (user stories) | Tranche |
|---|---|
| Logique : union index, `casAdresse` généralisé, gating `gestesEmplacement`, matching/classement recherche, pastille santé (US 1-7, 21-22, 27) | **T1 — Domaine (pur, testé au seam exports)** |
| Blocs partagés Membre/Journal extraits ; `fiche.js`/`fiche-adresse.js` les consomment sans changer le comportement (US 12-14, 18) | **T2 — Coquille partagée (refactor sans régression)** |
| Fiche d'emplacement redessinée : coquille à plat, Sur place en action, barre utilitaire + navigation adresse, remèdes dans le callout, gating resserré, aperçu courriel (US 18-24) | **T3 — Fiche d'emplacement unifiée** |
| Fiche d'adresse généralisée : callout problème-seulement, journal/note ; **bloc Demande** inline (attribuer niveau+confirmation, refuser, contact compact, cas demande-seule) (US 11, 15-17, 25-30) | **T4 — Fiche d'adresse + traitement demande** |
| Page Adresses : 4ᵉ onglet, recherche autocomplétion, pastille santé, union Membres, tous les états (US 1-10) | **T5 — Page Adresses** |

Rien n'est « invisible parce que reporté » : chaque user story est rattachée à une tranche, et chaque écran visible arrive complet à sa tranche.

## Testing Decisions

Un bon test vérifie le **comportement externe** (une entrée → une sortie observable), jamais un détail d'implémentation.

- **Seam logique (unique, existant)** : les exports de `grille.js` / `presentation.js`, exécutés en `node --test` (dual-export déjà en place). À couvrir : `toutesLesAdresses_` (union, dédup par clé, adresse Membres-seule présente) ; `casAdresse` généralisé (cas non-null sans attribution) ; `gestesEmplacement` (écrire seulement si Attribué-libre ; libérer si Attribué-libre ou hors quota ; rien sur En ordre/Disponible) ; matching + classement de recherche (nom/adresse/numéro, raison du match) ; pastille de santé (pire d'abord) ; suggestions et contact compact du bloc demande. **Prior art** : `tests/grille.test.mjs`, `tests/hors-quota.test.mjs`, `tests/fiche.test.mjs`, `tests/demandes-section.test.mjs`, `tests/fiche-demande.test.mjs`, `tests/presentation.test.mjs`.
- **Seam visuel (existant)** : `tools/screenshots.mjs` + hook `?etat=` (0006/0017). Nouveaux scénarios de capture : page Adresses (repos, résultats, aucun-résultat) ; fiche d'emplacement (En ordre, Attribué-libre, adresse hors quota, Disponible) ; fiche d'adresse (dans le quota, hors quota, demande en cours, demande seule) ; aperçu du courriel. **Prior art** : les scénarios de `tools/captures.mjs`, baseline committée dans `screenshots/`.

Aucun nouveau seam : toute la logique passe par les exports de module (le seam le plus haut, déjà testé), la vue par les captures mockées.

## Out of Scope

- **Annuaire / tableau triable** des ~180 adresses (parcours, tri, export) — gardé en réserve (0023), à ressortir si un besoin de parcours émerge.
- **Édition des modèles de courriels** (sujet/corps en Config) — l'aperçu reste basé sur un `mailto:` généré (Revisit de 0019).
- **Accorder / retirer un quota depuis l'app** (`quotaAccorde`) — geste in-app journalisé, déjà nommé en 0019/0020.
- **Recherche côté serveur / pagination** — inutile au volume actuel (communauté fermée).
- **État « en attente » / liste d'attente** d'une demande sans place compatible (Revisit de 0020).
- **Loupe universelle** dans l'en-tête (au lieu de l'onglet) — reconsidérée seulement si le changement d'onglet devient un irritant.

## Further Notes

- **Raffinements connus à ne pas perdre** (repérés au prototypage, à finir à l'implémentation) : (a) l'attribution d'une demande montre le **niveau avec le numéro** puis **confirmation** — jamais en un tap ; (b) une **adresse inexistante** (demande seule, sans emplacement ni membre) **n'accepte pas de note au journal** — rien où l'attacher tant que l'adresse n'existe pas.
- **Fiche de demande autonome remplacée** (tranché) : `fiche-demande.js` est retiré, la section « Demandes » d'À traiter ouvre la fiche d'adresse. Le retrait de `fiche-demande.js` et de son câblage (dans `a-traiter.html`) fait partie de la tranche T4.
- **Prototypes à absorber puis supprimer** : `site/adresses-prototype.html`, `site/fiche-prototype.html`, et les scripts jetables `tmp/shot-*.mjs`. Le code des prototypes a été écrit sous contrainte « jetable » (pas de tests, gestion d'erreurs minimale) — le vrai code est réécrit proprement, pas promu tel quel.
- Le terme **« Fiche »** est conservé (glossaire `CONTEXT.md`, entrées mises à jour pour Fiche d'emplacement / d'adresse / de demande).
