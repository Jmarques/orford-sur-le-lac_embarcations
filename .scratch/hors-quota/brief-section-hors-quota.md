# Design brief — Section « Hors quota » + fiche d'adresse (décision 0019)

## Audience et ton

Membres du comité, public majoritairement aîné, au bureau (desktop ou tablette,
parfois téléphone). La section parle de **membres de la communauté**, jamais de
« fautifs » : le ton est factuel et respectueux — la motivation est l'équité
envers ceux qui attendent une place, pas la chasse aux contrevenants. Français
simple, cibles larges, aucune couleur qui ne soit doublée d'un texte.

## Place dans la page

Première section de la page À traiter (avant « Attribué, libre » et
« À identifier ») : le quota est le dossier prioritaire. La hiérarchie visuelle
raconte pourtant l'inverse de l'alarme : pastille de compte **neutre** (les
deux autres sont warning/danger) — une règle de gestion, pas une urgence de
terrain. Même grammaire que les sections existantes : titre + pastille de
compte, description d'une ligne en quiet, état vide calme, liste de rangées.

## La rangée (registre = balayage, jamais le travail)

Réutilise la carte-galet `.rangee-cas` :

- **Titre (foyer principal)** : l'adresse « 234 Rue du Pré » — voix de titre
  Fraunces (`.rangee-numero`), l'identité du cas.
- **Signal (clé du tri)** : « 3 emplacements — le quota est de 2 » ou
  « 4 emplacements — exception accordée à 3 » : le fait qui justifie la
  présence ET le rang dans le tri, semi-gras comme « Libre depuis… ».
  (La pastille libellée décidée en session devient ce texte-signal : dans une
  rangée-carte existante, un wa-badge par rangée ferait un deuxième foyer —
  0016 ; le compte reste dit en toutes lettres, jamais un nombre nu.)
- **Méta (quiet)** : nom du membre (ou l'adresse est déjà le titre — pas de
  répétition), nombre de notes du cas : « Marie Gagnon · aucune note ».
- Chevron à droite, toute la rangée est le bouton — identique aux autres.

Tri : dépassement décroissant, puis nombre, puis adresse (dérivation T1).

## La fiche d'adresse (le travail)

Même patron que la fiche d'emplacement (0018) : drawer bas sur téléphone,
latéral sur grand écran ; tout vient de `donnees()`, textContent partout
(anti-XSS) ; un geste laisse la fiche ouverte, le feedback est le changement
visible (0016).

Hiérarchie du corps, de haut en bas :

1. **Callout de fait** (équivalent du callout-statut) : neutre,
   « Hors quota » + détail « 3 emplacements attribués — le quota est de 2. »
   (ou « … exception accordée à 3. »). Si le cas se referme pendant que la
   fiche est ouverte (libération) : variant brand, « Dans le quota » —
   la résolution se lit sous les yeux, la rangée derrière a disparu.
2. **Membre** : mêmes classes que la fiche (nom semi-gras, adresse quiet,
   tel/courriel en liens à cible large, « Aucun membre inscrit… » sinon).
3. **Les emplacements de l'adresse** : le choix décisif (« lequel libérer ? »).
   Une rangée-bouton par emplacement : numéro + position en titre, **statut en
   toutes lettres** coloré par sa pastille wa-badge (mêmes variants que la
   grille). Tap → fiche d'emplacement du numéro, avec retour.
4. **Journal du cas** (notes d'adresse + libérations des emplacements) :
   mêmes `.ligne-journal`, défilement interne calé au plus récent.
5. **Ajouter une note** : champ + bouton identiques à la fiche.
6. **Écrire au membre** : bouton outlined (jamais deux primaires) — `mailto:`
   pré-rempli listant les numéros et rappelant le quota, ton factuel.

Pas de « Libérer » au niveau adresse : libérer appartient à l'emplacement.

## Navigation fiche d'adresse ↔ fiche d'emplacement

Jamais deux drawers ouverts. Tap sur un emplacement : la fiche d'adresse se
ferme (sans animation perceptible : enchaîné), la fiche d'emplacement s'ouvre
avec un bouton retour « ← 234 Rue du Pré » en tête de corps. Retour (ou
fermeture X) : la fiche d'adresse se rouvre, re-rendue depuis l'état frais.
Le X du drawer emplacement revient aussi à la fiche d'adresse — dans ce
contexte, la fiche d'adresse EST la page d'origine.

## États

- **Vide** : « Aucune adresse hors quota. » — même motif `.section-vide`
  (coche verte + quiet), calme et positif.
- **Chargement** : le squelette existant de la page couvre la section (une
  rangée de plus en tête).
- **Erreur d'écriture (note)** : callout danger dans la fiche, texte conservé,
  jamais un état de page.
- **Succès** : aucun message — la note apparaît dans le journal, le champ se
  vide, la fiche reste ouverte (0016/0018).
- **Données illisibles** : quotaAccorde illisible → défaut 2 (dérivation) ;
  adresse sans membre → fiche complète avec mention calme ; jamais de plantage.

## Copy

- Titre de section : « Hors quota » ; description : « Des adresses qui ont
  plus d'emplacements que le quota n'en permet. »
- Pastille de compte : « N cas » (comme les autres sections).
- Fait : « N emplacements attribués — le quota est de 2. » /
  « — exception accordée à N. » / « Dans le quota » après résolution.
- Jamais : « en infraction », « fautif », « dépassement » (nom d'état),
  « dossier » (terme UI).
- mailto — objet : « Vos emplacements d'embarcation — Orford sur le Lac » ;
  corps : bonjour nommé, liste des numéros attribués à l'adresse, rappel
  factuel du quota, question ouverte (« souhaitez-vous en libérer un ? »),
  signature comité. Le membre du comité édite avant envoi (0003).
