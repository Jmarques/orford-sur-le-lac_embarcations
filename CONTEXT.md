# Orford sur le Lac — gestion des emplacements d'embarcation

## Language

**Emplacement** — Une place numérotée pour une embarcation sur une structure. Le numéro est unique dans toute la communauté (jamais deux fois le même numéro, toutes structures confondues) ; séquentiel par niveau mais pas forcément par structure.
  _Avoid_: place, slot, spot, case

**Structure** — Un rack en bois près de la plage qui regroupe des emplacements. Le **type** décrit comment les embarcations y sont physiquement rangées : **horizontale** (couchées, 1 à 4 niveaux superposés) ou **verticale** (debout, sans niveaux). Chaque structure porte sa **grille d'emplacements** (colonne `emplacements` de l'onglet Structures) — la source de vérité pour savoir dans quelle structure et à quel niveau se trouve un numéro.
  _Avoid_: rack, râtelier, support

**Grille d'emplacements** — Les numéros d'une structure écrits en arrays imbriqués dans une cellule, ex. `[[74..81], [82..89]]` (`a..b` = plage séquentielle). La **saisie** dit comment lire les arrays : `niveaux` (chaque array = un niveau, du plus haut au plus bas) ou `colonnes` (chaque array = une colonne verticale de la grille — commodité quand les numéros se suivent verticalement). Contraintes : numéros uniques dans toute la communauté, arrays de même longueur (c'est une grille).
  _Avoid_: liste d'emplacements, tableau ruby

**Niveau** — La hauteur d'un emplacement sur une structure horizontale (1 = le plus bas). Pertinent pour les membres à mobilité réduite, qui préfèrent les niveaux bas. Les structures verticales n'ont pas de niveaux.
  _Avoid_: étage, rangée

**Embarcation** — Ce qui se range dans un emplacement : kayak, canoë ou planche (paddle/SUP).
  _Avoid_: bateau

**Adresse** — L'identité d'un membre dans le système. Les emplacements appartiennent à l'adresse (rue parmi la liste fermée des rues de la communauté + numéro < 1000), pas à la personne. Deux demandes de personnes différentes pour la même adresse comptent pour la même adresse. ~180 adresses.
  _Avoid_: compte, utilisateur, membre (comme identifiant — l'identité est l'adresse, le [[Membre]] est la personne)

**Membre** — La personne-contact enregistrée pour une adresse : nom, courriel, téléphone. Vit dans l'onglet `Membres`, keyé par l'adresse (numeroAdresse + rue) : une seule ligne (un contact) par adresse, même si plusieurs personnes du foyer ont fait des demandes. C'est la **source de vérité du contact courant**, distincte du contact figé au moment d'une demande (qui reste dans le journal Demandes ; une demande acceptée peut servir à mettre le Membre à jour, avec validation du comité). Ne pas confondre avec un **membre du comité**.
  _Avoid_: contact, propriétaire (comme terme UI) ; « membre » pour désigner l'adresse-identité (le Membre est la personne, pas la clé)

**Demande** — Une requête d'un membre pour obtenir un emplacement, soumise via le formulaire public (ou saisie par un admin). Conserve sa trace même après décision.
  _Avoid_: requête, application

**Attribution** — Le lien entre un emplacement et une adresse, résultat de l'acceptation d'une demande par le comité. Permanente jusqu'à libération (pas de saison, pas de renouvellement annuel).
  _Avoid_: réservation, location

**Occupation observée** — Ce qu'on voit sur place à une date donnée (`dateObservation`) : **occupé** ou **libre** — rien d'autre, car sur le terrain on voit une embarcation ou pas. Une valeur absente (ou illisible, Sheet éditée à la main) = **pas encore observé** ; « inconnu » n'est pas une observation, c'est l'absence d'observation (l'ancien état saisissable « inconnu » a été retiré). Renseignée par le comité sur le terrain, toujours par un **geste explicite** du relevé-eur — l'inaction ne confirme jamais une observation (pas de « diff mode » où terminer une [[Tournée]] validerait les emplacements non regardés). Distincte de l'attribution (une embarcation peut occuper un emplacement sans attribution connue, et inversement). Chaque observation est aussi journalisée (voir [[Statut d'un emplacement]]).
  _Avoid_: relevé, état réel, inconnu (comme valeur), statut (ambigu avec le statut d'une demande)

**Tournée** — Une passe de relevé sur le terrain où un membre du comité enregistre l'[[Occupation observée]] d'une série d'emplacements, en se tenant devant la structure. Portée flexible : une, plusieurs ou toutes les structures. Scénarios : saisie initiale, relevés de début et fin de saison, confirmation qu'un emplacement « Attribué, libre » l'est toujours (une embarcation peut n'être absente que temporairement).
  _Avoid_: inspection, ronde, inventaire (ambigu avec les données d'inventaire)

**Statut d'un emplacement** — L'état métier **dérivé** en croisant l'attribution (présente / absente) et l'[[Occupation observée]] — jamais stocké, toujours calculé. Cinq cases, libellés courts (l'explication complète vit dans l'aide au tap) : `attribué + occupé` = **En ordre** ; `attribué + libre` = **Attribué, libre** (problème : peut-être à libérer, démarre « libre depuis ») ; `non attribué + occupé` = **À identifier** (problème : embarcation inconnue, bloque l'attribution) ; `non attribué + libre` = **Disponible** ; pas encore observé (quelle que soit l'attribution) = **Non observé**. L'historique d'un emplacement (attributions, observations, rappels, notes) et « libre depuis » se dérivent du Journal append-only (décision 0002).
  _Avoid_: statut stocké, état (trop vague), Conforme / À vérifier / Libre présumé / Attribué et occupé / Occupé sans attribution / Pas encore observé (anciens libellés)

**Intervention** — Une action du comité au sujet d'un emplacement, saisie en texte libre et journalisée : communication avec le membre (téléphone, courriel), tolérance accordée (« toléré jusqu'en juin »), note de contexte. Pas d'états structurés ni de workflow imposé — l'historique des interventions est la mémoire du comité, et la structure émergera de l'usage réel. La libération d'un emplacement est aussi journalisée, mais c'est un geste à part (elle modifie l'attribution).
  _Avoid_: rappel, suivi (comme objet structuré), communication (trop vague)

**En double** — Un numéro d'emplacement inscrit dans deux structures à la fois, ou deux fois dans la même : une **erreur de saisie** dans la grille d'emplacements (les numéros sont uniques dans toute la communauté), à corriger en modifiant la structure. Ce n'est pas un statut de terrain — dans l'UI il a son propre marquage (bordure pointillée), distinct des couleurs de statut.
  _Avoid_: conflit, numéro en conflit (jargon technique)

**Mobilité réduite** — Indicateur optionnel sur une demande : le membre a besoin d'un emplacement facile d'accès, ce qui oriente l'attribution vers les niveaux bas des structures horizontales. Terme retenu car standard (« personne à mobilité réduite », PMR).
  _Avoid_: handicap, accessibilité (trop large), problème de mobilité

**Quota** — La règle « 2 emplacements par adresse ». Non bloquante : une demande hors quota est acceptée par le formulaire mais signalée à l'admin ; la décision reste humaine (des exceptions historiques à 3–4 emplacements existent).

**Comité administratif** — Le groupe de bénévoles qui décide des attributions (forme courte acceptée : « le comité »). Une personne du groupe est un **membre du comité** — à distinguer du [[Membre]] de la communauté (la personne-contact d'une adresse). Accès admin protégé par un mot de passe partagé stocké dans la Sheet.
  _Avoid_: admins, administrateurs (pour désigner le groupe) ; « membre » seul quand le comité est visé (préciser « membre du comité »)
