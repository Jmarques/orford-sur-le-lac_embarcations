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
