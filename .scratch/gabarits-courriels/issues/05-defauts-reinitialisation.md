# 05 — Défauts et réinitialisation

Type: grilling
Status: resolved

## Question

Où vivent les textes par défaut, et comment revient-on en arrière ?

- Défauts dans le code (fallback si la ligne Sheet est vide/illisible — tolérance 0002) ou seed écrit dans la Sheet par `setup()` ? Les deux ?
- Un bouton « Revenir au texte d'origine » par gabarit ?
- Comportement à la lecture si l'onglet `Gabarits` est absent, vide, ou qu'une ligne est illisible.
- Seed des deux textes actuels (gradué du brouillard) : leur forme est fixée par [03](03-modele-edition-variables.md) — texte à jetons `{…}`, conditionnelles en jetons optionnels/calculés ; reste à décider où ils vivent et comment on y revient.

## Answer

1. **Le texte d'origine vit dans le code**, déclaré par le registre des courriels ([07](07-registre-courriels.md)) : id, jetons, sujet/corps par défaut.
2. **`setup()` sème l'onglet `Gabarits`** avec ces défauts — Sheet lisible et éditable à la main dès le départ (0002).
3. **Lecture tolérante** : ligne absente, vide ou illisible → repli silencieux sur le défaut du code. Le pire cas d'une Sheet abîmée est le texte d'origine, jamais un courriel cassé ni une page morte.
4. **« Revenir au texte d'origine »** re-remplit l'éditeur avec le défaut du code sans écrire ; rien n'est enregistré avant « Enregistrer le modèle ». Pas de confirmation, pas d'historique applicatif ni de trace au journal : écraser sa version personnalisée est accepté (Jeremy) — au pire, l'historique de versions de Google Sheets fait le rollback.
- Conséquence assumée : un changement futur du défaut dans le code ne touche pas les modèles déjà personnalisés (la ligne de la Sheet gagne).
