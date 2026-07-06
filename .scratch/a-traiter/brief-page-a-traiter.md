# Brief — page « À traiter »

> Révision 2026-07-06, après test terrain de Jeremy (~25 cas réels) et débat
> avec un expert UX : la page sépare le **scan** (registre de rangées
> compactes : numéro + structure, « Libre depuis… · N observations », membre,
> « N notes ») du **travail** (fiche en wa-dialog : membre + liens, journal
> complet avec icônes — l'observation reprend l'icône de la tournée —, ajout
> de note en pied de journal, Écrire au membre, Libérer). Vocabulaire décidé
> par Jeremy et entériné au glossaire : « **note** » et « **journal de
> l'emplacement** » remplacent « intervention » (trop clinique). Le reste du
> brief vaut sous cette révision.

## Audience et contexte
Membres du comité (public aîné), au bureau — desktop d'abord, mobile fonctionnel.
Tâche : mesurer l'ampleur du travail d'un regard, reprendre un dossier sans fouiller,
contacter un membre, consigner la mémoire du comité, libérer une place. La page parle
de membres de la communauté, jamais de « fautifs ».

## Ton
Factuel et rassurant. Français simple, phrases complètes. Les faits observés
(dates, nombres d'observations) parlent ; aucune urgence artificielle, aucun rouge
criard hors du code couleur de statut déjà établi (warning = Attribué libre,
danger = À identifier — mêmes familles que la grille des structures).

## Hiérarchie (du plus fort au plus faible)
1. L'ampleur : deux sections empilées, chacune avec sa pastille de compte libellée
   (« 2 cas ») — jamais de nombre nu (0016). « Attribué, libre » d'abord (les plus
   anciennement libres en tête), « À identifier » ensuite.
2. Chaque cas : une carte-dossier — numéro + structure en tête, signal temporel en
   faits observés, membre avec liens actifs, dernières interventions.
3. Les gestes : « Ajouter une intervention » (geste fréquent, champ visible —
   pas caché derrière un bouton, public aîné), « Écrire au membre » (mailto
   pré-rempli), « Libérer l'emplacement » (rare, protégé par confirmation).
   Aucune action primaire pleine (brand loud) répétée par carte : outlined partout,
   la confirmation danger vit dans le dialogue seulement.

## Une info = un seul foyer (0016)
- La ligne d'aide « les cas se referment tout seuls » est dite UNE fois, en tête de liste.
- Le signal temporel n'apparaît que sur la carte (pas répété dans l'historique déplié).
- La consigne de signature vit dans le hint du champ, nulle part ailleurs.
- Le statut n'est pas répété en badge sur la carte : la section EST le statut.

## États
- Connexion / mot de passe refusé (mêmes gabarits que les pages sœurs).
- Chargement : squelettes aux proportions des sections + cartes.
- Erreur de chargement + « Réessayer ».
- Files peuplées (tri visible) ; section vide : « Aucun emplacement à traiter » —
  calme et positif, par section, sans icône d'alarme.
- Erreur d'écriture : callout danger dans la carte concernée, taps conservés.
- Succès : rechargement frais (0002) + callout succès en tête, focus posé dessus.

## Layout
Colonne 65ch standard (.contenu) — des dossiers à lire, pas des grilles larges.
Header bande-lac identique aux pages sœurs, nav comité à trois entrées
(Demandes, Structures, À traiter). Web Awesome partout, tokens theme.css seulement.

## Copy (glossaire)
« À traiter », « Ajouter une intervention », « Libérer l'emplacement »,
« Écrire au membre ». Jamais : rappel, suivi (objet), conflit, relance (dans l'UI).
Adresse toujours « numeroAdresse rue ».
