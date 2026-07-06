# Brief design — Écran de tournée (issue 01, décision 0013)

## Audience et contexte
Un membre du comité (public aîné), debout devant une structure, téléphone à la
main, souvent en plein soleil, réseau de plage incertain. L'autre main pointe
les emplacements réels. La tâche : comparer ce qu'il voit au dernier état connu
et le confirmer d'un tap — ~80 % des cellules sont inchangées, la vitesse prime.

## Ton et vocabulaire
Calme, concret, rassurant. Copy exacte du glossaire : « Faire la tournée »,
« Terminer la tournée », « occupé » / « libre ». Jamais « inspection »,
« ronde », « relevé » comme nom d'une observation.

## Hiérarchie (du plus fort au plus faible)
1. **La grille** — l'objet du travail. Cellules-cibles larges (≥ 64 px),
   numéro + état **en toutes lettres** (la couleur ne porte jamais seule).
2. **« Terminer la tournée »** — seule action primaire (variant brand), sous la
   grille.
3. Titre (« Tournée de la structure S0X ») + consigne courte.
4. « Retour à la liste » — tertiaire (plain), avec garde si des relevés non
   envoyés seraient perdus.

## Encodage visuel (propre à la tournée — PAS les 5 statuts)
- **Fantôme** (dernier état observé, pas encore relevé) : cellule calme, mot
  d'état estompé et en italique — un souvenir, pas un fait.
- **Jamais observé** : cellule calme, tiret « — » à la place du mot.
- **Relevé occupé** : cellule remplie (brand loud + on-loud), coche + mot gras
  — une embarcation est là.
- **Relevé libre** : cellule claire cerclée de brand loud, coche + mot gras.
- Bordure d'épaisseur constante (width-m) pour éviter tout décalage au tap.

## Interaction
Un tap = cycle complet (fonctions pures `prochainEtatTournee`) : confirmer ce
qu'on voit → basculer → effacer. Aucun appui long, aucun geste caché. Taper une
cellule pendant l'envoi reste sans danger (le lot est figé au moment du tap sur
Terminer).

## États de l'écran
- **Vierge** : grille avec fantômes + consigne. Terminer avec zéro relevé =
  simple retour à la liste (rien à envoyer, rien n'est écrit).
- **Envoi** : bouton Terminer en `loading`, pas de double envoi.
- **Erreur d'envoi** : callout danger à côté des boutons (là où on regarde),
  taps conservés, bouton « Réessayer » fonctionnel.
- **Succès** : retour à la liste rechargée depuis la Sheet (0002), message
  succès existant, statuts recalculés, focus sur la carte de la structure.
- **Sortie avec relevés non envoyés** : dialogue de confirmation (pattern
  du dialogue d'abandon d'édition).
- **Session expirée** (`accesRefuse`) : écran de connexion, comme partout.

## Entrée
Bouton « Faire la tournée » (copy exacte) sur chaque carte de structure, à côté
de « Modifier » ; masqué si la grille est non parsable (rien à relever).

## Progression et changements (issue 02)
- **Compteur « 12/16 relevés »** : pastille libellée (jamais de nombre nu —
  0016), un seul foyer, collante (sticky) pour rester visible pendant tout le
  défilement de la grille ; `role="status"` pour les lecteurs d'écran. Mise à
  jour à chaque tap, y compris quand le troisième tap fait redescendre le
  compte.
- **Marqueur « a changé »** : le changement est l'information intéressante du
  comité. Puce libellée « a changé » DANS la cellule (troisième ligne), tons
  warning (`warning-fill-normal` + `on-normal`) — lisible sur la cellule
  occupée (fond brand loud) comme sur la libre (fond clair). Le mot porte le
  signal, la couleur le renforce (jamais seule). Une cellule sans fantôme
  confirmée n'a pas de marqueur : rien n'a « changé ».
- **Avertissement de fin partielle** : wa-dialog (pattern du dialogue de
  sortie), déclenché seulement si des cellules restent non relevées ET qu'il y
  a quelque chose à envoyer. Texte : « 3 emplacements non relevés — ils
  garderont leur dernière observation. » Terminer est l'action normale, pas
  destructrice : bouton confirmant en brand (« Terminer quand même »),
  « Continuer le relevé » en plain. Zéro relevé : fermeture directe, rien à
  envoyer, pas de dialogue.
- **Écran de résumé (après envoi réussi)** : même squelette que la tournée
  (titre + contenu + rangée de boutons, alignés à gauche). Un seul foyer : un
  wa-callout succès portant tout le bilan — phrase « 14 emplacements relevés,
  2 changements : » suivie de la liste « n° 43 — maintenant libre ». Cas sans
  changement : « 16 emplacements relevés, aucun changement. » Français simple,
  vocabulaire du glossaire (occupé/libre, emplacement, tournée).

## Enchaînement (issue 03)
- Le résumé propose « Structure suivante » (variant brand, flèche en fin) qui
  recharge l'inventaire (fantômes frais — 0002) puis ouvre la tournée de la
  structure suivante dans l'ordre de la liste.
- Dernière structure : le bouton suivante n'apparaît pas ; « Retour à la
  liste » devient l'action primaire (une seule action primaire par vue).
- « Retour à la liste » recharge aussi l'inventaire : les statuts reflètent la
  tournée envoyée ; focus sur la carte de la structure relevée. Pas de message
  succès en plus : le résumé EST la confirmation (0016).
