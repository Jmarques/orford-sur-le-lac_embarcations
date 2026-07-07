# PRD — Traitement des demandes d'emplacement

Status: ready-for-agent
Décisions cadres : 0020 (traitement des demandes), 0019 (Hors quota, fiche d'adresse), 0018 (fiche d'emplacement unique), 0016 (interfaces silencieuses), 0014 (À traiter), 0012 (en-têtes), 0011 (états dérivés, Journal), 0008 (auth comité), 0004 (présentation côté client), 0003 (jamais d'email membre sans validation humaine), 0002 (Sheet éditable à la main).
Vocabulaire : CONTEXT.md — [[Demande]], [[Fiche de demande]], [[Quota]], [[Membre]], [[Adresse]], [[Attribution]], [[Statut d'un emplacement]], [[Mobilité réduite]].

## Problem Statement

Le comité reçoit les demandes d'emplacement dans une page qui ne fait que les lister. Pour en traiter une, un membre du comité doit : chercher à la main quelles structures acceptent le type d'embarcation, parcourir la grille pour trouver une place observée libre, se rappeler de garder les niveaux bas pour les personnes à mobilité réduite, vérifier dans la Sheet si l'adresse a déjà des emplacements et si elle est au quota, comparer les coordonnées de la demande avec l'onglet Membres, puis écrire l'attribution et le changement de statut à la main dans deux onglets. Chaque étape est une occasion d'erreur (place déjà prise, quota dépassé sans le voir, contact périmé) et rien ne relie la demande à ce qu'elle a produit.

## Solution

Le traitement des demandes rejoint la page « À traiter », sous forme d'une section « Demandes » : des rangées compactes, et une fiche de demande qui réunit tout ce qu'il faut pour décider — le contact demandé face au Membre courant (différences visibles, mise à jour en un clic), les emplacements déjà attribués à l'adresse et son quota accordé, et la liste des emplacements Disponibles dans les structures compatibles avec le type d'embarcation, triés pour préserver les niveaux bas. Accepter = choisir une place et l'attribuer en un seul geste ; refuser = donner une raison, journalisée. Au quota accordé, accepter est impossible : la fiche explique la porte de sortie (augmenter le quota accordé dans Membres). Les demandes traitées restent consultables en lignes compactes dépliables. L'ancienne page admin disparaît. En dernière phase, le comité est notifié par courriel interne à chaque nouvelle demande.

## User Stories

1. As a membre du comité, I want voir les demandes nouvelles en tête de la section « Demandes » d'À traiter (plus ancienne d'abord), so that je traite dans l'ordre d'arrivée sans page ni login supplémentaires.
2. As a membre du comité, I want une pastille libellée sur la section indiquant le nombre de demandes à traiter, so that je sais d'un coup d'œil s'il y a du travail.
3. As a membre du comité, I want des rangées compactes (adresse, type d'embarcation, mobilité réduite, date de réception), so that je balaie la liste sans déplier N cartes.
4. As a membre du comité, I want toucher une rangée pour ouvrir la fiche de demande, so that tout le contexte de décision est réuni à un seul endroit.
5. As a membre du comité, I want voir dans la fiche le contact de la demande face au Membre courant de l'adresse avec les différences mises en évidence, so that je repère un contact périmé sans ouvrir la Sheet.
6. As a membre du comité, I want mettre à jour le Membre avec les coordonnées de la demande en un clic, so that la validation du comité soit un geste et non une saisie manuelle.
7. As a membre du comité, I want que ce clic de mise à jour reste indépendant d'accepter/refuser, so that je puisse corriger un contact même sur une demande que je refuse.
8. As a membre du comité, I want voir les emplacements déjà attribués à l'adresse et son quota accordé, so that je décide en connaissant la situation complète de l'adresse.
9. As a membre du comité, I want être averti si une autre demande ouverte existe pour la même adresse, so that je ne traite pas deux demandes du même foyer en aveugle.
10. As a membre du comité, I want une liste d'emplacements suggérés limitée aux « Disponible » (observés libres, non attribués) des structures dont les embarcations acceptées incluent le type demandé, so that je ne promette jamais une place incertaine ou incompatible.
11. As a membre du comité, I want les suggestions triées par niveau décroissant (structures verticales comptées au sol, en fin de liste), so that les niveaux bas restent disponibles pour les personnes à mobilité réduite.
12. As a membre du comité, I want le tri inversé (niveaux bas et verticales d'abord) quand la demande porte « mobilité réduite », so that la personne reçoive une place facile d'accès.
13. As a membre du comité, I want voir pour chaque suggestion le numéro, le niveau et la structure, groupés par structure, so that je sache où est la place sans consulter la grille.
14. As a membre du comité, I want qu'une structure dont les embarcations acceptées ne sont pas renseignées apparaisse quand même (avec mention), so that une saisie incomplète ne cache pas des places réelles.
15. As a membre du comité, I want un état vide qui dit « aucune place observée libre dans les structures compatibles — faire une tournée », so that je sache quoi faire au lieu de contempler une liste vide.
16. As a membre du comité, I want toucher une suggestion puis confirmer « Attribuer le n°X et accepter », so that accepter et attribuer soient un seul geste sans navigation.
17. As a membre du comité, I want que l'acceptation écrive l'attribution sur l'emplacement, les faits de décision sur la demande, et un événement au Journal, so that la Sheet, l'historique et la grille racontent la même histoire.
18. As a membre du comité, I want que l'acceptation crée la ligne Membres avec les coordonnées de la demande si l'adresse n'y est pas, so that toute attribution ait un contact joignable.
19. As a membre du comité, I want que l'app m'empêche d'accepter quand l'adresse est à son quota accordé, avec l'explication de la porte de sortie (augmenter le quota accordé dans Membres), so that un dépassement soit toujours une décision durable du comité, pas un contournement.
20. As a membre du comité, I want refuser une demande en donnant une raison en texte libre, journalisée, so that la demande sorte de la liste et que le pourquoi reste retrouvable.
21. As a membre du comité, I want un bouton « écrire au membre » en courriel pré-rédigé (mailto), jamais envoyé automatiquement, so that le membre soit informé avec mes mots et ma relecture.
22. As a membre du comité, I want les demandes traitées sous les nouvelles, une ligne compacte par demande (issue, date), dépliable pour voir l'historique (emplacement attribué ou raison du refus), so that je consulte le passé sans qu'il encombre le présent.
23. As a membre du comité, I want qu'une demande redevienne « nouvelle » si je vide ses cellules de décision dans la Sheet, so that une erreur se corrige à la main comme partout ailleurs.
24. As a membre du comité, I want qu'une demande acceptée garde son emplacement attribué même si la place est libérée plus tard, so that l'historique dise ce qui a été accordé, pas l'état courant.
25. As a membre du comité, I want recevoir un courriel interne à chaque nouvelle demande (adresse comité en Config), so that je n'aie pas à ouvrir la page pour savoir qu'une demande attend. *(dernière phase)*
26. As a membre de la communauté, I want que le formulaire de demande reste inchangé dans son contenu, so that rien ne change dans mes habitudes.
27. As a membre de la communauté, I want un formulaire un peu plus compact (numéro et rue sur une ligne si l'écran le permet), so that la demande se fasse plus vite sur mobile.
28. As a membre à mobilité réduite, I want que ma case cochée oriente réellement l'attribution vers les niveaux bas, so that la promesse du formulaire soit tenue.
29. As a membre du comité, I want que l'ancienne page admin disparaisse, so that il n'y ait qu'un seul endroit pour le travail de bureau.

## Implementation Decisions

- **Modèle de données de la décision** (0020) : l'onglet Demandes perd la colonne `statut` et gagne `numeroAttribue` et `dateDecision`. L'état est dérivé, jamais stocké : `numeroAttribue` rempli → acceptée ; `dateDecision` seule → refusée ; rien → nouvelle. Dérivation tolérante aux données manuelles (0002).
- **Dérivations pures dans le module partagé de grille** (même foyer que le statut d'emplacement et la file hors quota) : état d'une demande, suggestions ordonnées (filtre compatibilité par la colonne `embarcations` des structures — vide = accepte tout avec mention ; pool = statut « Disponible » seulement ; tri par niveau décroissant, croissant si mobilité réduite, verticale = niveau 0/sol), diff de contact demande vs Membre, autres demandes ouvertes de la même adresse. Le quota réutilise les dérivations hors quota existantes (quota accordé, clé d'adresse normalisée).
- **Préparation des écritures dans le module de traitement serveur** (même patron que la préparation de note et de libération) : `preparerDecision` valide aux frontières — demande existante et encore nouvelle ; pour accepter : emplacement suggéré valide (Disponible + structure compatible) et adresse sous son quota accordé ; pour refuser : raison non vide — et retourne les écritures préparées (ligne Demandes, ligne Emplacements, ligne Membres à créer si absente, événement Journal avec `demandeId`). La colle Apps Script reste mince, pilotée par les en-têtes (0012).
- **API** : nouvelles actions POST authentifiées (0008) pour accepter, refuser, et mettre à jour le Membre depuis une demande. La réponse d'inventaire (déjà utilisée par À traiter) inclut désormais les demandes — un seul aller-retour, l'action `demandes` séparée disparaît avec l'ancienne page admin.
- **Journal** : événements `attribution` (numero + demandeId) et `refus` (demandeId, raison en details) ; la mise à jour ou création de Membre depuis une demande est aussi journalisée. La colonne `demandeId` existe déjà.
- **UI** : section « Demandes » de la page À traiter, au-dessus des files de terrain, sous Hors quota (à confirmer visuellement) ; registre en rangées compactes + fiche de demande dans le même drawer/patron que les fiches existantes (0018/0019) ; la fiche reste ouverte après un geste, le contenu se rafraîchit sous les yeux. Toute règle dite une fois, pastilles libellées, pas de nombre nu (0016).
- **Quota bloquant** : le bouton d'acceptation est désactivé avec explication visible quand attributions ≥ quota accordé ; le déblocage passe par la Sheet (augmenter `quotaAccorde`), jamais par l'app.
- **Retrait de l'ancienne page admin** : la page est supprimée du site ; les liens de navigation pointent vers À traiter.
- **Formulaire membre** : seul changement, la mise en page de l'adresse sur une ligne (champ numéro dimensionné pour 3 caractères) si le rendu mobile reste bon.
- **Notification interne** (dernière phase) : à la réception d'une demande, envoi d'un courriel sobre à l'adresse comité lue dans Config (nouvelle clé) ; clé absente → aucun envoi, aucun échec. Autorisée par 0003 (notification interne).
- **Migration manuelle de la Sheet** (par Jeremy, avec la tranche schéma) : reporter les demandes déjà décidées dans `numeroAttribue`/`dateDecision`, retirer la colonne `statut` ; `setup()` garantit les nouveaux en-têtes sans réordonner (0012).

## Testing Decisions

- Tester le comportement externe, jamais l'implémentation : les dérivations se testent par leurs entrées/sorties (des lignes de Sheet brutes → un état, une liste ordonnée, un diff), les préparations d'écritures par le contrat retourné (écritures + événement Journal) et leurs refus (erreurs de validation aux frontières).
- Dérivations pures : tests node sur le module de grille — prior art : les tests du statut d'emplacement, des comptes par statut et de la file hors quota. Cas à couvrir : les trois états et leurs combinaisons manuelles bizarres (numeroAttribue sans dateDecision), tri PMR/normal, verticales, structure sans embarcations renseignées, adresse au quota, adresse absente de Membres, deux demandes ouvertes même adresse (clé normalisée).
- Préparations d'écritures : tests node sur le module de traitement — prior art : les tests de préparation de note et de libération. Cas à couvrir : accepter une place non disponible, accepter au quota, refuser sans raison, demande déjà décidée, création de Membre à l'acceptation.
- La colle Apps Script (lecture/écriture Sheet, envoi de courriel) n'est pas testée en node (convention du projet) — vérifiée au déploiement.
- UI : boucle de captures mockées multi-états (rangées, fiche aux états contact identique/différent/absent, quota ok/bloqué, suggestions pleines/vides, refus, traitées dépliées) + écoute console error/warning et pageerror ; revue ui-critic sur le delta de captures. Prior art : les tests de captures et de console existants.

## Out of Scope

- Tout envoi de courriel à un membre (le `mailto:` pré-rempli reste la seule voie — 0003).
- Modifier le quota accordé depuis l'app (geste Sheet, nommé dans les revisit de 0019/0020).
- Liste d'attente ou état « en attente » pour les demandes sans place compatible.
- Attribuer une place hors suggestions (saisie libre, place « Non observé ») — revisit 0020.
- Choisir l'emplacement depuis la grille des Structures (navigation avec état transporté) — revisit 0020.
- Éditeur complet de l'onglet Membres (la MAJ depuis une demande est le seul geste d'écriture Membres de cette feature).
- Statistiques ou motifs structurés de refus.

## Further Notes

- La section Demandes est la troisième consommatrice du patron registre + fiche : toute divergence visuelle avec Hors quota et les files de terrain est un bug de cohérence, pas un choix.
- Public aîné : gros gestes, une décision par écran de fiche, langage rassurant ; le blocage quota s'explique en français simple, pas en jargon (« cette adresse a déjà ses 2 emplacements »).
- L'ordre exact des sections d'À traiter (Hors quota vs Demandes en tête) se tranche visuellement en revue — 0019 a mis Hors quota en premier « par équité envers les membres qui attendent une place » ; les demandes sont précisément ces membres.
