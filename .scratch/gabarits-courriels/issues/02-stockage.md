# 02 — Stockage

Type: grilling
Status: resolved

## Question

Où vivent les gabarits édités, et où l'édition a-t-elle lieu : dans l'app, dans l'onglet `Config`, ou dans un onglet dédié ?

## Answer

**Onglet `Gabarits` dédié** (une ligne par courriel : `id`, `sujet`, `corps`), créé par `setup()`. **L'app est la seule surface d'édition** ; le Sheet n'est que le stockage (échappatoire manuelle pour Jeremy, jamais le chemin documenté).

Pourquoi pas `Config` (`apps-script/sheets.js:11-19`) :
1. Forme des données : un gabarit est une ligne à plusieurs champs avec un corps multi-lignes — en clé/valeur, une cellule de quinze lignes défonce la lisibilité de l'onglet, or la Sheet reste éditable à la main (0002).
2. Le mot de passe habite `Config` (0008) : toute action qui lit/écrit `Config` doit refaire la gymnastique d'exclusion de `lireConfig()` ; un onglet séparé ne s'en approche jamais.
3. `Config` n'est jamais écrit par l'app ; les gabarits le seront — mélanger les deux invite l'accident.
