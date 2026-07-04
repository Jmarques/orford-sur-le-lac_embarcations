# Orford sur le Lac — gestion des emplacements d'embarcation

## Language

**Emplacement** — Une place numérotée pour une embarcation sur une structure. Le numéro est unique dans toute la communauté (jamais deux fois le même numéro, toutes structures confondues) ; séquentiel par niveau mais pas forcément par structure.
  _Avoid_: place, slot, spot, case

**Structure** — Un rack en bois près de la plage qui regroupe des emplacements. Deux formes : **horizontale** (1 à 4 niveaux superposés) ou **verticale** (rangement debout des planches, sans niveaux).
  _Avoid_: rack, râtelier, support

**Niveau** — La hauteur d'un emplacement sur une structure horizontale (1 = le plus bas). Pertinent pour les membres à mobilité réduite, qui préfèrent les niveaux bas. Les structures verticales n'ont pas de niveaux.
  _Avoid_: étage, rangée

**Embarcation** — Ce qui se range dans un emplacement : kayak, canoë ou planche (paddle/SUP).
  _Avoid_: bateau

**Adresse** — L'identité d'un membre dans le système. Les emplacements appartiennent à l'adresse (rue parmi la liste fermée des rues de la communauté + numéro < 1000), pas à la personne. Deux demandes de personnes différentes pour la même adresse comptent pour la même adresse. ~180 adresses.
  _Avoid_: compte, utilisateur, membre (comme identifiant)

**Demande** — Une requête d'un membre pour obtenir un emplacement, soumise via le formulaire public (ou saisie par un admin). Conserve sa trace même après décision.
  _Avoid_: requête, application

**Attribution** — Le lien entre un emplacement et une adresse, résultat de l'acceptation d'une demande par le comité. Permanente jusqu'à libération (pas de saison, pas de renouvellement annuel).
  _Avoid_: réservation, location

**Mobilité réduite** — Indicateur optionnel sur une demande : le membre a besoin d'un emplacement facile d'accès, ce qui oriente l'attribution vers les niveaux bas des structures horizontales. Terme retenu car standard (« personne à mobilité réduite », PMR).
  _Avoid_: handicap, accessibilité (trop large), problème de mobilité

**Quota** — La règle « 2 emplacements par adresse ». Non bloquante : une demande hors quota est acceptée par le formulaire mais signalée à l'admin ; la décision reste humaine (des exceptions historiques à 3–4 emplacements existent).

**Comité administratif** — Le groupe de bénévoles qui décide des attributions (forme courte acceptée : « le comité »). Une personne du groupe est un **membre du comité**. Accès admin protégé par un mot de passe partagé stocké dans la Sheet.
  _Avoid_: admins, administrateurs (pour désigner le groupe) ; « membre » seul (ambigu avec les membres de la communauté)
