# 05 — Défauts et réinitialisation

Type: grilling
Status: open

## Question

Où vivent les textes par défaut, et comment revient-on en arrière ?

- Défauts dans le code (fallback si la ligne Sheet est vide/illisible — tolérance 0002) ou seed écrit dans la Sheet par `setup()` ? Les deux ?
- Un bouton « Revenir au texte d'origine » par gabarit ?
- Comportement à la lecture si l'onglet `Gabarits` est absent, vide, ou qu'une ligne est illisible.
- Seed des deux textes actuels (gradué du brouillard) : leur forme est fixée par [03](03-modele-edition-variables.md) — texte à jetons `{…}`, conditionnelles en jetons optionnels/calculés ; reste à décider où ils vivent et comment on y revient.
