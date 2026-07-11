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

**Demande** — Une requête d'un membre pour obtenir **un** emplacement (une embarcation = une demande), soumise via le formulaire public (ou saisie par un admin). Son état est **dérivé, jamais stocké** (même doctrine que le [[Statut d'un emplacement]]), depuis deux faits portés par la demande : l'emplacement attribué et la date de décision. Emplacement attribué → **acceptée** ; date de décision seule → **refusée** (la raison, en texte libre, est journalisée — « hors quota », « désistement », « doublon » sont des raisons, pas des statuts) ; ni l'un ni l'autre → **nouvelle**. Conserve sa trace même après décision, y compris si l'emplacement est libéré plus tard (l'attribution de la demande est un fait historique).
  _Avoid_: requête, application ; statut (comme colonne stockée) ; en attente (il n'y a pas d'état intermédiaire entre nouvelle et décidée)

**Attribution** — Le lien entre un emplacement et une adresse, résultat de l'acceptation d'une demande par le comité. Permanente jusqu'à libération (pas de saison, pas de renouvellement annuel).
  _Avoid_: réservation, location

**Occupation observée** — Ce qu'on voit sur place à une date donnée (`dateObservation`) : **occupé** ou **libre** — rien d'autre, car sur le terrain on voit une embarcation ou pas. Une valeur absente (ou illisible, Sheet éditée à la main) = **pas encore observé** ; « inconnu » n'est pas une observation, c'est l'absence d'observation (l'ancien état saisissable « inconnu » a été retiré). Renseignée par le comité sur le terrain, toujours par un **geste explicite** du relevé-eur — l'inaction ne confirme jamais une observation (pas de « diff mode » où terminer une [[Tournée]] validerait les emplacements non regardés). Distincte de l'attribution (une embarcation peut occuper un emplacement sans attribution connue, et inversement). Chaque observation est aussi journalisée (voir [[Statut d'un emplacement]]).
  _Avoid_: relevé, état réel, inconnu (comme valeur), statut (ambigu avec le statut d'une demande)

**Tournée** — Une passe de relevé sur le terrain où un membre du comité enregistre l'[[Occupation observée]] d'une série d'emplacements, en se tenant devant la structure. Portée flexible : une, plusieurs ou toutes les structures. Scénarios : saisie initiale, relevés de début et fin de saison, confirmation qu'un emplacement « Attribué, libre » l'est toujours (une embarcation peut n'être absente que temporairement).
  _Avoid_: inspection, ronde, inventaire (ambigu avec les données d'inventaire)

**Statut d'un emplacement** — L'état métier **dérivé** en croisant l'attribution (présente / absente) et l'[[Occupation observée]] — jamais stocké, toujours calculé. Cinq cases, libellés courts (l'explication complète vit dans l'aide au tap) : `attribué + occupé` = **En ordre** ; `attribué + libre` = **Attribué, libre** (problème : peut-être à libérer, démarre « libre depuis ») ; `non attribué + occupé` = **À identifier** (problème : embarcation inconnue, bloque l'attribution) ; `non attribué + libre` = **Disponible** ; pas encore observé (quelle que soit l'attribution) = **Non observé**. L'historique d'un emplacement (observations, notes, libérations) et « libre depuis » se dérivent du Journal append-only (décision 0002).
  _Avoid_: statut stocké, état (trop vague), Conforme / À vérifier / Libre présumé / Attribué et occupé / Occupé sans attribution / Pas encore observé (anciens libellés)

**Fiche d'emplacement** — La vue détaillée d'un emplacement, la même partout où on l'ouvre (grille des Structures, registre À traiter, [[Fiche d'adresse]]). Elle partage la **coquille unique** de la [[Fiche d'adresse]] (décision 0024) : son [[Statut d'un emplacement]] et sa position en tête, son [[Membre]], son journal ([[Note (au journal)]]) et ses actions. Les actions dépendent du statut, jamais de la page : un **remède** (relancer le membre, libérer) ne s'offre que face à un problème — Attribué-libre, ou adresse [[Hors quota]] — et il est rattaché à lui ; les actions **utilitaires** (consigner l'[[Occupation observée]] « sur place », ouvrir la [[Fiche d'adresse]]) vivent à part. Un geste laisse la fiche ouverte : le statut et le journal changent sous les yeux.
  _Avoid_: panneau d'emplacement, fiche d'un cas (anciens termes — la fiche est celle de l'emplacement, pas du cas), popup

**Note (au journal)** — Une information consignée par le comité au journal d'un emplacement **ou d'une adresse** (cas [[Hors quota]] : la note parle de l'adresse, pas d'un emplacement en particulier), en texte libre et datée : communication avec le membre (« courriel envoyé », « coup de téléphone »), tolérance accordée (« toléré jusqu'en juin »), contexte. Pas d'états structurés ni de workflow imposé — le journal est la mémoire du comité, et la structure émergera de l'usage réel. La libération d'un emplacement est aussi journalisée, mais c'est un geste à part (elle modifie l'attribution). Ne pas confondre avec la « Note du comité » d'une ligne d'Emplacements ou de Structures (annotation durable, non datée, éditée dans la Sheet).
  _Avoid_: intervention (trop clinique/agressif — ancien terme), rappel, suivi (comme objet structuré), communication (trop vague)

**En double** — Un numéro d'emplacement inscrit dans deux structures à la fois, ou deux fois dans la même : une **erreur de saisie** dans la grille d'emplacements (les numéros sont uniques dans toute la communauté), à corriger en modifiant la structure. Ce n'est pas un statut de terrain — dans l'UI il a son propre marquage (bordure pointillée), distinct des couleurs de statut.
  _Avoid_: conflit, numéro en conflit (jargon technique)

**Mobilité réduite** — Indicateur optionnel sur une demande : le membre a besoin d'un emplacement facile d'accès, ce qui oriente l'attribution vers les niveaux bas des structures horizontales. Terme retenu car standard (« personne à mobilité réduite », PMR).
  _Avoid_: handicap, accessibilité (trop large), problème de mobilité

**Quota** — Le nombre d'emplacements permis à une [[Adresse]] : 2 par défaut, ou son **quota accordé** quand le comité a entériné une exception durable (les exceptions historiques à 3–4 emplacements existent ; le quota accordé est un fait par adresse, pas un état de traitement). Le formulaire ne bloque jamais la **soumission** d'une demande au-delà du quota ; l'**attribution** via l'app, elle, est bloquée au-delà du quota accordé — la porte de sortie est d'augmenter le quota accordé dans Membres (geste du comité), puis d'accepter.
  _Avoid_: limite, plafond

**Hors quota** — L'état **dérivé** d'une adresse dont les attributions dépassent son [[Quota]] — jamais stocké, toujours calculé. Une adresse en sort quand une libération la ramène à son quota, et y re-rentre si elle le dépasse à nouveau. C'est un dossier de gestion (à traiter au bureau), pas un fait de terrain : ses emplacements gardent leur statut propre et la grille ne le marque pas.
  _Avoid_: en infraction, fautif, dépassement (comme nom d'état)

**Fiche de demande** — Le **traitement d'une [[Demande]]**, désormais mené **dans la [[Fiche d'adresse]]** de l'adresse concernée (décision 0024, amende 0020) plutôt que dans une vue séparée : le contact de la demande face au [[Membre]] enregistré (compact — mise à jour en un geste s'il diffère, ou enregistré à l'acceptation si l'adresse est nouvelle), les emplacements déjà attribués à l'adresse et son [[Quota]], puis attribuer une place suggérée (emplacements **Disponibles** des structures compatibles avec le type d'embarcation, triés par niveau — hauts d'abord, bas d'abord si [[Mobilité réduite]], une structure verticale comptant comme au sol ; le niveau montré avec le numéro, puis confirmation) ou refuser en donnant une raison. Écrire au membre reste un mailto préparé, jamais un envoi automatique.
  _Avoid_: fiche d'une demande traitée (les traitées se consultent en ligne compacte dépliable), panneau de demande ; « fiche de demande » comme écran séparé (le traitement vit dans la [[Fiche d'adresse]])

**Fiche d'adresse** — La vue détaillée de **n'importe quelle** [[Adresse]] (décision 0024 ; plus seulement un cas [[Hors quota]]), même coquille que la [[Fiche d'emplacement]] : l'adresse, son [[Membre]], ses emplacements avec leur statut (chacun ouvrant sa [[Fiche d'emplacement]]), le journal (notes d'adresse et libérations de ses emplacements) et une [[Note (au journal)]]. Un callout n'apparaît que pour un problème ou une exception (**Hors quota**, **[[Demande]] en cours**) — rien quand l'adresse est en règle. Une [[Demande]] en cours **s'y traite** (attribuer une place suggérée ou refuser avec une raison). Les gestes d'emplacement (observer, libérer) restent dans la fiche d'emplacement.
  _Avoid_: fiche de membre, fiche du cas, dossier (comme terme UI)

**Comité administratif** — Le groupe de bénévoles qui décide des attributions (forme courte acceptée : « le comité »). Une personne du groupe est un **membre du comité** — à distinguer du [[Membre]] de la communauté (la personne-contact d'une adresse). Accès admin protégé par un mot de passe partagé stocké dans la Sheet.

**Modèle de courriel** — Le texte réutilisable d'un courriel que l'app prépare (objet + message), éditable par le comité depuis la page « Modèles de courriels ». Les **informations** (nom du [[Membre]], numéro d'[[Emplacement]]…) y sont des jetons `{…}` remplis par l'app au moment de préparer le courriel — représentés à l'édition comme des puces insécables dans le texte ; une information optionnelle (« depuis quand ») disparaît quand la donnée n'est pas connue. Le texte d'origine vit dans le code (le registre des courriels), la version du comité dans l'onglet `Gabarits`. Ne change rien à la décision 0003 : rien n'est jamais envoyé automatiquement — le courriel préparé se relit dans l'aperçu puis s'ouvre dans la messagerie du membre du comité.
  _Avoid_: admins, administrateurs (pour désigner le groupe) ; « membre » seul quand le comité est visé (préciser « membre du comité »)
