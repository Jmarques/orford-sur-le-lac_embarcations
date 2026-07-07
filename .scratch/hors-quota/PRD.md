# PRD — Section « Hors quota » : file par adresse, fiche d'adresse, notes d'adresse

Status: ready-for-agent
Décisions cadres : 0019 (hors quota — décision de cette manche), 0014 (page À traiter, amendée par 0019 sur l'ancrage des notes), 0018 (fiche d'emplacement unique), 0016 (interfaces silencieuses), 0011 (statut dérivé, Journal append-only), 0012 (couche Sheet par en-têtes, adresse « numeroAdresse rue »), 0010 (onglet Membres keyé par adresse), 0008 (mot de passe partagé), 0006 (captures mockées), 0004 (dérivations côté client), 0003 (aucun courriel sans validation humaine), 0002 (Sheet éditable à la main).
Vocabulaire : CONTEXT.md — [[Quota]], [[Hors quota]], [[Fiche d'adresse]], [[Fiche d'emplacement]], [[Note (au journal)]], [[Adresse]], [[Membre]], [[Statut d'un emplacement]], Attribution.
Dépendance : s'ajoute à la page À traiter existante (PRD `a-traiter`, livré) ; réutilise la fiche d'emplacement partagée (PRD `fiche-emplacement`, livré).

## Problème

Le quota est de 2 emplacements par adresse, mais rien ne montre au comité quelles adresses le dépassent : il faudrait compter à la main dans la Sheet, adresse par adresse. Pendant que des membres attendent une place, d'autres en occupent 3 ou 4 — et ce n'est pas seulement une question de rangement, c'est une injustice envers ceux qui attendent. Des exceptions historiques à 3–4 emplacements existent et sont acceptées : une liste brute « plus de 2 » les afficherait pour toujours, et le comité apprendrait à ignorer une section qui ne peut jamais se vider. Enfin, la mémoire du traitement d'un dossier de quota (« toléré à 3 tant que la liste d'attente est vide ») ne parle d'aucun emplacement en particulier — le Journal, keyé par numéro, ne sait pas l'accueillir aujourd'hui.

## Solution

La page « À traiter » gagne une section « **Hors quota** », en **première position** : des rangées compactes par **adresse** (adresse, membre, pastille « N emplacements »), triées par dépassement décroissant. Un cas hors quota = une adresse dont les attributions dépassent son **quota accordé** (colonne optionnelle `quotaAccorde` de l'onglet Membres, éditée à la main ; défaut 2) — entièrement dérivé, jamais stocké : la file se vide par libération, les exceptions entérinées n'y figurent pas, et une adresse re-rentre si elle dépasse son exception. Toucher un cas ouvre une **fiche d'adresse** (même patron que la fiche d'emplacement) : membre et contact, le fait qui justifie le cas, les emplacements de l'adresse avec leur statut (chacun ouvrant sa fiche d'emplacement, avec retour), le journal du cas, l'ajout d'une **note d'adresse** et un `mailto:` pré-rempli. La grille des Structures ne marque rien ; la fiche d'emplacement gagne une pastille « N emplacements à cette adresse » quand l'adresse dépasse son quota.

## User stories

1. En tant que membre du comité au bureau, je veux une section « Hors quota » en tête de la page À traiter avec une pastille de compte, pour voir d'un regard combien d'adresses dépassent — c'est le dossier prioritaire, par équité envers les membres qui attendent une place.
2. En tant que membre du comité, je veux une rangée compacte par adresse hors quota — l'adresse, le nom du membre, une pastille « N emplacements » — pour balayer la file sans ouvrir chaque dossier.
3. En tant que membre du comité, je veux les cas triés du plus gros dépassement au plus petit, pour commencer par les adresses les plus au-delà de leur quota.
4. En tant que membre du comité, je veux qu'une adresse sorte de la file toute seule dès qu'une libération la ramène à son quota, pour ne jamais avoir à « fermer » un cas à la main.
5. En tant que membre du comité, je veux entériner une exception durable en inscrivant un quota accordé (3 ou 4) sur la ligne Membres de l'adresse, directement dans la Sheet, pour que les exceptions historiques ne squattent pas la file — et qu'elle puisse enfin se vider.
6. En tant que membre du comité, je veux qu'une adresse dont l'exception est dépassée (une 5ᵉ embarcation sur une exception à 4) revienne dans la file, pour que l'exception ne devienne pas un passe-droit illimité.
7. En tant que membre du comité, je veux toucher un cas pour ouvrir sa fiche d'adresse, pour que tout le dossier — membre, emplacements, journal, gestes — vive à un seul endroit.
8. En tant que membre du comité, je veux voir en tête de fiche l'adresse, le membre avec téléphone et courriel en liens actifs, et le fait qui justifie le cas (« 3 emplacements — le quota est de 2 », ou « … — exception accordée à 3 »), pour comprendre le dossier en une seconde.
9. En tant que membre du comité, je veux la liste des emplacements de l'adresse avec le statut de chacun, pour repérer le candidat naturel à la libération — celui qui est « Attribué, libre ».
10. En tant que membre du comité, je veux toucher un emplacement de la liste pour ouvrir sa fiche d'emplacement (et revenir à la fiche d'adresse en la fermant), pour libérer ou observer sans quitter le dossier.
11. En tant que membre du comité, je veux le journal du cas — les notes d'adresse et les libérations de ses emplacements, en ordre chronologique — pour reprendre un dossier sans fouiller ma mémoire ni mes courriels.
12. En tant que membre du comité, je veux consigner une note en texte libre sur l'adresse elle-même (« toléré à 3 tant que la liste d'attente est vide — Jeremy »), pour que la mémoire du dossier ne soit pas accrochée artificiellement à un emplacement.
13. En tant que membre du comité, je veux signer mes notes dans le texte si je le souhaite, pour que « qui a fait quoi » reste traçable malgré le mot de passe partagé.
14. En tant que membre du comité, je veux un `mailto:` pré-rempli — les numéros d'emplacements de l'adresse et le rappel du quota, sur un ton factuel et rassurant — que j'édite dans mon client mail avant envoi, pour ne jamais rien envoyer sans l'avoir relu.
15. En tant que membre du comité qui ne s'attend pas à un brouillon préparé, je veux une ligne d'aide sous « Écrire au membre » m'expliquant qu'un courriel déjà rédigé va s'ouvrir dans ma messagerie, à relire et ajuster — sur la fiche d'adresse comme sur la fiche d'emplacement.
16. En tant que membre du comité qui ouvre une fiche d'emplacement depuis la grille des Structures, je veux une pastille « N emplacements à cette adresse » quand l'adresse dépasse son quota, pour découvrir le contexte du dossier même depuis le terrain.
17. En tant que membre du comité devant une structure, je veux que la grille garde ses couleurs de statut sans marquage quota, pour que la lecture du terrain reste limpide — le quota est un fait d'adresse, pas d'emplacement.
18. En tant que membre du comité, je veux qu'un emplacement « Attribué, libre » d'une adresse hors quota apparaisse dans sa section pendant que son adresse apparaît dans « Hors quota », pour que chaque file dise la vérité de sa clé — la fiche d'adresse fait le lien.
19. En tant que membre du comité, je veux un état vide calme (« Aucune adresse hors quota »), pour savoir que tout est en ordre sans douter de la page.
20. En tant que membre du comité, je veux que deux graphies de la même adresse (« rue du Lac » / « rue du lac ») comptent pour la même adresse, pour qu'un vrai cas hors quota ne devienne pas invisible à cause d'une édition manuelle.
21. En tant que membre du comité, je veux que la page s'affiche même si un `quotaAccorde` est illisible (défaut 2) ou si l'adresse n'a pas de ligne Membres (la fiche le dit calmement), pour que la robustesse survive à la Sheet éditée à la main.
22. En tant que membre du comité (public aîné), je veux des rangées et des fiches aux cibles larges, en français simple, pour traiter les dossiers sans formation.
23. En tant que membre du comité, je veux que la page reste derrière le mot de passe du comité, pour que les coordonnées des membres et les dossiers restent internes.

## Décisions d'implémentation

- **Dérivation** (0019) : cas hors quota = attributions de l'adresse > `quotaAccorde` (défaut 2 si absent ou illisible). Compte sur les **attributions** (lignes d'Emplacements portant l'adresse), jamais sur l'occupation observée. Rien n'est stocké ; sortie et rentrée de file sont automatiques.
- **Clé d'adresse normalisée partagée** : trim + minuscules + espaces multiples réduits — utilisée par le regroupement quota **et** par la recherche du membre (alignée au passage : aujourd'hui la casse fait rater un membre). L'affichage garde toujours le texte de la ligne. Pas de rapprochement plus flou (une fusion à tort serait pire qu'un éclatement).
- **Lecture** : l'onglet Membres voyage déjà avec l'inventaire ; il transporte en plus `quotaAccorde`. Le setup des en-têtes (0012) ajoute `quotaAccorde` à Membres et `adresse` au Journal.
- **Notes d'adresse** : même Journal, colonne optionnelle `adresse` (« numeroAdresse rue », 0012). L'action serveur `note` accepte `numero` **ou** `adresse` — exactement l'un des deux, texte requis, validation aux frontières. Amende le trade-off de 0014. Affichage anti-XSS (texte, jamais HTML).
- **Journal du cas** : notes d'adresse + libérations des emplacements de l'adresse, chronologique. Le journal d'un emplacement ne change pas.
- **Registre** : section « Hors quota » en première position ; rangée = adresse + membre + pastille libellée « N emplacements » (jamais de nombre nu, 0016) ; pastille de section **neutre** (règle de gestion, ni urgence ni anomalie — la hiérarchie visuelle des trois sections raconte la gravité réelle) ; tri par dépassement décroissant, puis nombre d'emplacements, puis adresse.
- **Fiche d'adresse** : même patron que la fiche d'emplacement (dialog desktop / drawer bas mobile). En-tête : adresse, membre, contact en liens actifs, fait justifiant le cas. Corps : emplacements de l'adresse avec statut, journal du cas, ajout de note, « Écrire au membre ». **Pas de geste « Libérer » au niveau adresse** — libérer appartient à l'emplacement (0018).
- **Navigation** : toucher un emplacement dans la fiche d'adresse **remplace le contenu du même drawer** par sa fiche d'emplacement, avec bouton retour vers la fiche d'adresse (mise à jour au retour). Jamais deux drawers empilés.
- **`mailto:` quota** : objet neutre, corps listant les numéros attribués à l'adresse et rappelant la règle — ton factuel et rassurant, jamais « fautif » ; le membre du comité édite avant envoi (0003 par construction).
- **Copy du bouton « Écrire au membre »** (les deux fiches) : libellé court inchangé + ligne d'aide « Un courriel déjà rédigé s'ouvrira dans votre messagerie — relisez-le et ajustez-le avant de l'envoyer. » (procédural rassurant, pas du bruit — 0016).
- **Fiche d'emplacement** : pastille « N emplacements à cette adresse » sur la ligne membre, affichée **seulement** quand l'adresse dépasse son quota — partout où la fiche s'ouvre. Aucune navigation vers la fiche d'adresse en v1.
- **Grille des Structures** : aucun marquage quota (mauvaise clé ; le pointillé appartient à « En double »).
- **Double présence assumée** : aucun dédoublonnage entre sections.
- **Auth** : mot de passe partagé en corps POST (0008), même session que le reste de la page.
- **Copy** : « Hors quota » (titre de section) avec description « Des adresses qui ont plus d'emplacements que le quota n'en permet. » ; « exception accordée » ; jamais « en infraction », « fautif », « dépassement » comme nom d'état (glossaire).

## Décisions de test

- **Tester le comportement externe seulement** : dérivations = entrée (emplacements + membres + journal) → sortie, sans DOM ; action serveur = requête → lignes + Journal produits, sans tester la colle (`sheets.js`/`Code.js` hors node, convention).
- **Dérivations pures** (prior art `tests/grille.test.mjs`, `tests/a-traiter.test.mjs`) : adresse à 3 attributions sans quota accordé ; exception à 3 respectée (hors file) puis dépassée (en file) ; `quotaAccorde` illisible → défaut 2 ; adresse éclatée par la casse ou les espaces → regroupée ; adresse sans ligne Membres ; tri par dépassement stable ; journal du cas (notes d'adresse + libérations, événements illisibles tolérés — 0002) ; pastille quota de la fiche d'emplacement (affichée seulement en dépassement).
- **Action serveur note étendue** (prior art `tests/traitement.test.mjs`) : note d'adresse acceptée, note avec numéro et adresse à la fois refusée, note sans clé refusée, texte vide refusé, en-têtes réordonnés (0012), événement Journal correct.
- **Page** : captures mockées multi-états via `?etat=` (0006/0017) — section vide, section peuplée (tri visible), fiche d'adresse ouverte, navigation vers fiche d'emplacement et retour, note d'adresse en succès/erreur, pastille quota dans la fiche d'emplacement. Console error/warning + pageerror font échouer la boucle. Flux complet piloté au navigateur avant livraison.

## Exigence → tranche

| # | Exigence | Tranche |
| --- | --- | --- |
| 1 | Dérivations pures : clé d'adresse normalisée, file hors quota (regroupement, quota accordé, dépassement, tri), journal du cas, quota de l'adresse pour la pastille de fiche | T1 |
| 2 | Lecture : `quotaAccorde` voyage avec Membres ; setup en-têtes (`quotaAccorde`, `adresse` au Journal) | T1 |
| 3 | Section « Hors quota » (rangées, pastille, état vide, première position) + **fiche d'adresse complète** (en-tête, emplacements + statuts, journal du cas, note d'adresse, `mailto:`, navigation aller-retour) — **contrat de données complet dès cette tranche** | T2 |
| 4 | Action serveur `note` étendue (numero ou adresse), journalisée | T2 |
| 5 | Pastille « N emplacements à cette adresse » dans la fiche d'emplacement + copy du bouton « Écrire au membre » (les deux fiches) | T2 |
| 6 | Modèles de courriel (sujet/corps) dans l'onglet Config | Reportée nommée (0019) — le `mailto:` reste |
| 7 | Geste in-app « accorder une exception » (journalisé) | Reportée nommée (0019) — v1 = à la main dans la Sheet |
| 8 | Navigation fiche d'emplacement → fiche d'adresse depuis Structures | Reportée nommée (0019) |

Rien d'invisible : T2 est la première tranche visible et embarque l'écriture de note d'adresse ; les reports sont nommés ici et dans 0019.

## Hors périmètre

- **Modèles de courriel dans Config** — le comité éditera sujet et corps du brouillon ; le `mailto:` reste (distinct de l'envoi in-app rejeté par 0014).
- **Geste in-app sur `quotaAccorde`** (accorder/retirer une exception) — v1 : édition manuelle de la Sheet, cohérent avec l'attribution manuelle.
- **Navigation fiche d'emplacement → fiche d'adresse** — la pastille informe, le traitement vit dans À traiter.
- **Rapprochement flou des adresses** (fautes de frappe, abréviations de rues) — la normalisation reste casse + espaces.
- **Blocage du formulaire de demande au-delà du quota** — le quota reste non bloquant (glossaire), la décision reste humaine.
- **Snooze / états de suivi structurés** — inchangé (0014).

## Notes

- **Coutures** : une seule nouvelle — les dérivations hors quota dans le module de dérivation client existant (fonctions pures partagées node/navigateur). L'écriture est une extension de l'action `note` existante du module de traitement ; la page réutilise le registre et le patron de fiche déjà en place.
- **Redéploiement backend requis** (leçon du PRD a-traiter, commentaire du 2026-07-06) : la lecture de `quotaAccorde` et la colonne `adresse` du Journal n'existent qu'après `npm run deploy` — la page doit signaler en console un contrat de lecture incomplet, comme elle le fait déjà pour `journal`/`membres`.
- **UX/UI** : processus obligatoire du CLAUDE.md (brief avant markup, principles + composition, polish checklist, revue ui-critic sur les captures fraîches du delta — 0017). Ton : la section parle de membres de la communauté, jamais de « fautifs » ; l'équité envers ceux qui attendent est la motivation, le ton reste factuel et respectueux.
- La qualité du signal « quel emplacement libérer » dépend des tournées : sans observations, les statuts des emplacements de la fiche d'adresse afficheront « Non observé » — c'est voulu, le comité voit ce qu'il sait.

## Comments

- 2026-07-06 (implémentation T1–T3, revue de code) — trois écarts au spec entérinés ici :
  (1) **La libération écrit aussi la colonne `adresse` au Journal** (non demandé) : sans elle, le journal du cas perdrait la libération dès que l'emplacement quitte l'adresse — extension nécessaire au « journal du cas », testée.
  (2) **La fiche d'adresse sait raconter une adresse revenue dans les règles** (« Dans le quota », dérivation `casAdresse`) : exigé de fait par « fiche mise à jour au retour » après une libération qui referme le cas (0018 : la fiche reste ouverte).
  (3) **La rangée du registre dit « N emplacements — le quota est de 2 » en texte-signal, pas en wa-badge** : dans une rangée-carte existante, une pastille ferait un second foyer (0016) ; le compte reste en toutes lettres, jamais nu — déviation de forme documentée au brief.
- 2026-07-06 (revue de code, corrigé) : la recherche du membre des fiches et du registre passe désormais par la clé d'adresse normalisée (l'AC de l'issue 02 était cochée alors que seules les dérivations l'utilisaient) ; la page signale en console l'absence de la colonne `quotaAccorde` (backend déployé mais `setup()` non exécuté), en plus du signal `journal`/`membres` existant.
