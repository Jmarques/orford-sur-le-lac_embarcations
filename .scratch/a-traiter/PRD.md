# PRD — Page « À traiter » : files de cas problèmes, interventions et libération

Status: ready-for-agent
Décisions cadres : 0014 (page À traiter), 0011 (statut dérivé, Journal), 0003 (aucun courriel sans validation humaine), 0008 (auth, pas d'identité individuelle), 0012 (en-têtes), 0006 (captures mockées), 0004 (présentation côté client), 0002 (Sheet éditable à la main).
Vocabulaire : CONTEXT.md — [[Intervention]], [[Statut d'un emplacement]], [[Occupation observée]], [[Tournée]], [[Membre]], Attribution, Quota.
Dépendance : consomme les observations accumulées par les tournées (PRD `tournee`) — livrable après ou en parallèle, utile seulement quand des observations existent.

## Problème

Quand la communauté commence à manquer de place, le comité doit savoir quels emplacements attribués ne sont pas utilisés (« Attribué, libre ») pour éviter que des membres gardent des places pendant que d'autres attendent — et il doit gérer les embarcations apparues sans attribution (« À identifier »). Aujourd'hui rien ne rassemble ces cas : il faut scruter la grille couleur par couleur, la mémoire des communications avec les membres n'existe que dans des têtes ou des courriels privés, et rien n'indique depuis combien de temps une place est libre. Le workflow réel du comité est encore inconnu (personne ne l'a pratiqué) : tout système rigide serait une machine hypothétique.

## Solution

Une page « bureau » unique — « **À traiter** » — qui liste les cas dérivés du statut, en sections empilées avec badges de compte : « Attribué, libre » (les plus anciennement libres d'abord) et « À identifier ». Chaque carte-cas montre le signal temporel, le membre (si attribué), l'historique du Journal et un champ « **Ajouter une intervention** » en texte libre journalisé. Deux actions structurées seulement : « **Libérer l'emplacement** » (avec confirmation) et une relance par **`mailto:` pré-rempli**. Les cas sortent de la file automatiquement dès qu'une observation les referme — la page l'explique.

## User stories

1. En tant que membre du comité au bureau, je veux une page unique listant tous les cas à traiter avec un compte par section, pour mesurer l'ampleur du travail d'un seul regard.
2. En tant que membre du comité, je veux les « Attribué, libre » triés du plus anciennement libre au plus récent, pour commencer par les cas les plus probablement abandonnés.
3. En tant que membre du comité, je veux voir sur chaque cas depuis quand il est observé libre et combien d'observations le confirment, pour juger de la solidité du signal avant de déranger un membre.
4. En tant que membre du comité, je veux voir le nom, le téléphone et le courriel du membre attribué en liens actifs (`tel:`, `mailto:`), pour le contacter par le canal de mon choix.
5. En tant que membre du comité, je veux un `mailto:` pré-rempli (numéro d'emplacement, libre depuis) que je peux éditer dans mon propre client mail avant envoi, pour ne jamais rien envoyer sans avoir vu et ajusté le texte exact.
6. En tant que membre du comité, je veux consigner une intervention en texte libre (« communiqué par téléphone », « toléré jusqu'en juin — Jeremy »), pour que la mémoire du comité vive dans l'outil et non dans des têtes.
7. En tant que membre du comité, je veux voir les dernières interventions directement sur la carte-cas, pour reprendre un dossier sans fouiller.
8. En tant que membre du comité, je veux l'historique complet d'un emplacement (attributions, observations, interventions, libérations) en ordre chronologique, pour donner un maximum de contexte — surtout sur un « À identifier » (« l'embarcation est apparue entre le 3 mai et le 12 juin »).
9. En tant que membre du comité, je veux qu'un cas « Attribué, libre » dont l'excuse est acceptée reste dans la file avec son intervention visible, pour que le statut continue de dire la vérité du terrain pendant que la note explique.
10. En tant que membre du comité, je veux « Libérer l'emplacement » derrière un dialogue de confirmation explicite, pour qu'aucun tap accidentel ne retire l'adresse d'un membre.
11. En tant que membre du comité, je veux que la libération soit journalisée et que l'emplacement devienne « Disponible » (ou « À identifier » s'il est observé occupé), pour que la grille reflète la décision immédiatement.
12. En tant que membre du comité, je veux qu'un cas disparaisse de la file tout seul quand une tournée observe l'état qui le referme, et qu'une ligne d'aide sur la page me l'explique, pour ne pas chercher un bouton « clore » qui n'existe pas.
13. En tant que membre du comité, je veux un état vide calme et positif par section (« Aucun emplacement à traiter »), pour savoir que tout est en ordre sans douter de la page.
14. En tant que membre du comité, je veux que la page exige le mot de passe du comité, pour que les coordonnées des membres et l'historique restent internes.
15. En tant que membre du comité (public aîné), je veux des cartes aérées, des libellés en français simple et des actions aux cibles larges, pour traiter les dossiers sans formation.
16. En tant que membre du comité, je veux signer mes interventions dans le texte si je le souhaite, pour que « qui a fait quoi » reste traçable malgré le mot de passe partagé.
17. En tant que membre du comité, je veux que les données illisibles (Sheet éditée à la main) n'empêchent jamais la page de s'afficher, pour que la robustesse de l'app survive à l'édition manuelle.

## Décisions d'implémentation

- **Le statut reste factuel** (0011/0014) : aucune excuse, tolérance ou état de traitement ne modifie ni ne masque un statut. Le traitement vit dans les interventions journalisées.
- **Aucun workflow figé** : pas d'états de suivi stockés (rejeté 0014 — workflow jamais observé). Les files sont **entièrement dérivées** : « Attribué, libre » = attribution présente + observé libre ; « À identifier » = attribution absente + observé occupé.
- **Sections empilées, pas de tabs** (0014) : volumes attendus en unités/dizaines ; badges de compte par section ; « Quota » sera une section future de la même page (clé adresse — reporté nommé).
- **Carte-cas commune** aux sections : en-tête (numéro, structure), signal temporel, membre si attribué (adresse « numeroAdresse rue »), dernières interventions, champ d'ajout, action propre au cas.
- **« Libre depuis » = faits observés, jamais des mois calendaires** (0014, saisonnalité) : v1 affiche le début de la série ininterrompue d'observations « libre », le nombre d'observations et la date de la dernière — sans étiquette « toute une saison » (les bornes de saison ne sont pas définies ; voir Notes).
- **Interventions** : texte libre, appendé au Journal avec une nouvelle valeur d'`action` dédiée, rattaché au `numero` de l'emplacement ; affichage anti-XSS (texte, jamais HTML).
- **Libération** : nouvelle action serveur — vide l'adresse de la ligne par en-têtes réels (0012), appende un événement Journal dédié ; confirmation côté client obligatoire.
- **Contrat API de lecture** : l'inventaire renvoie en plus les événements du Journal (volume négligeable à ~180 places, 0011) ; toutes les dérivations (files, tri, « libre depuis », historique) se font côté client (0004) par des fonctions pures partagées.
- **Écritures serveur** dans un nouveau module de traitement calqué sur le module d'observation (validation aux frontières, colle Apps Script mince).
- **Auth** : mot de passe partagé en corps POST (0008), même session que les autres pages du comité.
- **Copy** : « À traiter », « Ajouter une intervention », « Libérer l'emplacement » ; jamais « rappel », « suivi » (objet), « conflit » (glossaire).

## Décisions de test

- **Tester le comportement externe seulement** : files/tri/« libre depuis »/historique = entrée (emplacements + journal) → sortie, sans DOM ; actions serveur = requête → lignes + Journal produits, sans tester la colle (`sheets.js`/`Code.js` hors node, convention).
- **Dérivations pures** : tests node — prior art `tests/grille.test.mjs`. Cas : aucune observation, série « libre » ininterrompue, série cassée par un « occupé » (le compteur repart), emplacement jamais attribué, Journal vide, événements illisibles (0002 : tolérance sans plantage), tri stable.
- **Actions serveur (intervention, libération)** : tests node — prior art `tests/observation.test.mjs`. Cas : intervention vide refusée, libération d'un emplacement déjà libre, en-têtes réordonnés (0012), événement Journal correct.
- **Page** : captures mockées multi-états via `?etat=` (0006) — files vides, files peuplées (tri visible), carte avec interventions, dialogue de confirmation de libération, succès/erreur d'écriture. Console error/warning + pageerror font échouer la boucle. Flux complet piloté au navigateur avant livraison.

## Exigence → tranche

| # | Exigence | Tranche |
| --- | --- | --- |
| 1 | Dérivations pures : files des deux sections, tri, « libre depuis » (faits), historique par numéro | T1 |
| 2 | Lecture : le Journal voyage avec l'inventaire | T1 |
| 3 | Page « À traiter » : sections + badges, cartes-cas complètes, ajout d'intervention, libérer avec confirmation, `mailto:` pré-rempli, ligne d'aide sur la sortie automatique, états vides — **contrat de données complet dès cette tranche** (intervention + libération) | T2 |
| 4 | Actions serveur intervention + libération, journalisées | T2 |
| 5 | Section « Quota » (clé adresse) | Reportée nommée (0014) — future section de cette page |

Rien d'invisible : la section Quota est nommée ici et dans 0014 ; T2 est la première tranche visible et embarque les deux écritures.

## Hors périmètre

- Vue et traitement du **quota** (>2 emplacements par adresse) — reporté nommé, même mécanique, clé adresse.
- **Snooze / états de suivi structurés** (« toléré jusqu'à date » qui masque un cas) — attendre que les interventions réelles montrent le motif (Revisit 0014).
- **Envoi de courriel in-app** avec modèle et trace exacte du texte — v1 = `mailto:` (Revisit 0014).
- **Identité individuelle** des membres du comité (rouvre 0008).
- **Attribution via l'app** (résolution d'un « À identifier » par attribution = saisie manuelle dans la Sheet pour l'instant).
- Notifications automatiques de tout genre (0003 : seules les notifications internes au comité sont automatiques — aucune n'est requise ici en v1).

## Notes

- **Bornes de saison** : si le comité veut un marqueur « libre toute une saison » ou un seuil suggéré de relance, il faudra définir les dates de saison (probablement dans l'onglet Config) — décision à prendre avec le comité, volontairement absente de la v1.
- La qualité de « libre depuis » dépend directement de la discipline des tournées (PRD `tournee`) : sans observations répétées, la file affiche des signaux faibles — c'est voulu, le comité voit le nombre d'observations.
- UX/UI : suivre le processus obligatoire du CLAUDE.md (brief, principles/composition, polish checklist, revue sur captures fraîches). Ton de la page : factuel et rassurant — elle parle de membres de la communauté, pas de « fautifs ».
